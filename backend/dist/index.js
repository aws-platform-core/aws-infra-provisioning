import dotenv from "dotenv";
import { runTemplateValidator } from "./validators/templateValidatorRegistry.js";
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { authMiddleware } from "./auth.js";
import { templates } from "./templates.js";
import { createRequest, getRequestById, listRequestsByUser, } from "./repositories/requestRepository.js";
import { provisionRequestViaPullRequest } from "./services/requestProvisioningService.js";
import { mapTemplateParametersToModuleInputs } from "./mappers/templateParameterMapper.js";
const app = express();
const port = Number(process.env.PORT || 8080);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = [
    "http://localhost:5173",
    "https://aip.odido.nl:5173",
].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS not allowed for origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));
app.options("*", cors());
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.get("/api/templates", authMiddleware, (_req, res) => {
    return res.json(templates);
});
app.get("/api/templates/:id", authMiddleware, (req, res) => {
    const template = templates.find((t) => t.id === req.params.id);
    if (!template) {
        return res.status(404).json({ message: "Template not found" });
    }
    return res.json(template);
});
app.post("/api/requests", authMiddleware, async (req, res) => {
    try {
        console.log("Incoming /api/requests body:", req.body);
        console.log("AWS_REGION:", process.env.AWS_REGION);
        console.log("DYNAMODB_REQUESTS_TABLE:", process.env.DYNAMODB_REQUESTS_TABLE);
        const { template_id, parameters } = req.body;
        const template = templates.find((t) => t.id === template_id);
        if (!template) {
            return res.status(400).json({ message: "Invalid template_id" });
        }
        for (const field of template.parameters) {
            if (field.required) {
                const value = parameters?.[field.name];
                if (value === undefined || value === null || value === "") {
                    return res.status(400).json({ message: `${field.label} is required` });
                }
            }
        }
        const requestId = `req-${Date.now()}`;
        const requestedBy = typeof req.user?.given_name === "string"
            ? req.user.given_name
            : typeof req.user?.email === "string"
                ? req.user.email
                : typeof req.user?.["cognito:username"] === "string"
                    ? req.user["cognito:username"]
                    : req.user?.sub || "unknown";
        const requestedBySub = typeof req.user?.sub === "string" ? req.user.sub : "unknown";
        const now = new Date().toISOString();
        let finalParameters = { ...(parameters ?? {}) };
        const validationResult = runTemplateValidator(template.id, {
            requestId,
            parameters: finalParameters,
        });
        if (!validationResult.valid) {
            return res.status(400).json({
                message: "Template request validation failed",
                errors: validationResult.errors,
            });
        }
        finalParameters = validationResult.normalizedParameters ?? finalParameters;
        const moduleInputs = mapTemplateParametersToModuleInputs(template.id, finalParameters);
        const provisionResult = await provisionRequestViaPullRequest({
            requestId,
            provider: template.provider,
            templateId: template.id,
            moduleSource: `../../modules/${template_id}`,
            parameters: moduleInputs,
            requestedBy,
            createdAt: now,
        });
        const record = {
            request_id: requestId,
            requested_by: requestedBy,
            requested_by_sub: requestedBySub,
            template_id: template_id,
            parameters: finalParameters ?? {},
            provider: template.provider,
            status: "PR_CREATED",
            pr_url: provisionResult.prUrl,
            branch_name: `feature/${requestId}-${template_id}`,
            pr_number: provisionResult.prNumber,
            created_at: now,
            updated_at: now
        };
        console.log("About to write record to DynamoDB:", JSON.stringify(record, null, 2));
        await createRequest(record);
        console.log("Successfully wrote record to DynamoDB");
        return res.status(201).json(record);
    }
    catch (error) {
        console.error("Failed to create request:", error);
        return res.status(500).json({
            message: "Failed to create request",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
app.get("/api/requests", authMiddleware, async (req, res) => {
    try {
        const requestedBySub = typeof req.user?.sub === "string" ? req.user.sub : undefined;
        if (!requestedBySub) {
            return res.status(400).json({ message: "User sub not found in token" });
        }
        const items = await listRequestsByUser(requestedBySub);
        return res.json(items);
    }
    catch (error) {
        console.error("Failed to fetch requests", error);
        return res.status(500).json({ message: "Failed to fetch requests" });
    }
});
app.get("/api/requests/:id", authMiddleware, async (req, res) => {
    try {
        const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!requestId) {
            return res.status(400).json({ message: "Request ID is required" });
        }
        const item = await getRequestById(requestId);
        if (!item) {
            return res.status(404).json({ message: "Request not found" });
        }
        const requestedBySub = typeof req.user?.sub === "string" ? req.user.sub : undefined;
        if (item.requested_by_sub !== requestedBySub) {
            return res.status(403).json({ message: "Forbidden" });
        }
        return res.json(item);
    }
    catch (error) {
        console.error("Failed to fetch request", error);
        return res.status(500).json({ message: "Failed to fetch request" });
    }
});
const certPath = process.env.HTTPS_CERT_PATH;
const keyPath = process.env.HTTPS_KEY_PATH;
if (!certPath || !keyPath) {
    throw new Error("Missing HTTPS_CERT_PATH or HTTPS_KEY_PATH");
}
const httpsOptions = {
    cert: fs.readFileSync(path.resolve(certPath)),
    key: fs.readFileSync(path.resolve(keyPath)),
};
https.createServer(httpsOptions, app).listen(port, "0.0.0.0", () => {
    console.log(`Backend listening on https://0.0.0.0:${port}`);
});
function normalizeS3BucketBaseName(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}
