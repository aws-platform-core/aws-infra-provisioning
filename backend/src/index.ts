import dotenv from "dotenv";
dotenv.config();

import express, { type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { authMiddleware } from "./auth.js";
import { templates } from "./templates.js";
import {
  createRequest,
  getRequestById,
  listRequestsByUser,
} from "./repositories/requestRepository.js";
import { provisionRequestViaPullRequest } from "./services/requestProvisioningService.js";

const app = express();
const port = Number(process.env.PORT || 8080);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api/templates", authMiddleware, (_req: Request, res: Response) => {
  return res.json(templates);
});

app.get("/api/templates/:id", authMiddleware, (req: Request, res: Response) => {
  const template = templates.find((t) => t.id === req.params.id);

  if (!template) {
    return res.status(404).json({ message: "Template not found" });
  }

  return res.json(template);
});

app.post("/api/requests", authMiddleware, async (req: Request, res: Response) => {
  try {
    console.log("Incoming /api/requests body:", req.body);
    console.log("AWS_REGION:", process.env.AWS_REGION);
    console.log("DYNAMODB_REQUESTS_TABLE:", process.env.DYNAMODB_REQUESTS_TABLE);

    const { template_id, parameters } = req.body as {
      template_id?: string;
      parameters?: Record<string, unknown>;
    };

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
    const requestedBy =
      typeof req.user?.given_name === "string"
        ? req.user.given_name
        : typeof req.user?.email === "string"
          ? req.user.email
          : typeof req.user?.["cognito:username"] === "string"
            ? req.user["cognito:username"]
            : req.user?.sub || "unknown";

    const requestedBySub =
      typeof req.user?.sub === "string" ? req.user.sub : "unknown";

    const now = new Date().toISOString();

    const finalParameters = { ...(parameters ?? {}) };

    if (template.id === "aws-s3-bucket") {
      const bucketName = finalParameters.bucket_name;

      if (typeof bucketName === "string") {
        const shortRequestId = requestId.replace("req-", "").slice(0, 8);
        finalParameters.bucket_name = `${bucketName}-${shortRequestId}`.toLowerCase();
      }
    }

    const provisionResult = await provisionRequestViaPullRequest({
      requestId,
      provider: template.provider,
      templateId: template_id!,
      moduleSource: `../../modules/${template_id}`,
      parameters: finalParameters ?? {},
      requestedBy,
      createdAt: now,
    });

    

    const record = {
      request_id: requestId,
      requested_by: requestedBy,
      requested_by_sub: requestedBySub,
      template_id: template_id!,
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
  } catch (error) {
    console.error("Failed to create request:", error);
    return res.status(500).json({
      message: "Failed to create request",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/api/requests", authMiddleware, async (req: Request, res: Response) => {
  try {
    const requestedBySub =
      typeof req.user?.sub === "string" ? req.user.sub : undefined;

    if (!requestedBySub) {
      return res.status(400).json({ message: "User sub not found in token" });
    }

    const items = await listRequestsByUser(requestedBySub);
    return res.json(items);
  } catch (error) {
    console.error("Failed to fetch requests", error);
    return res.status(500).json({ message: "Failed to fetch requests" });
  }
});

app.get("/api/requests/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await getRequestById(requestId);

    if (!item) {
      return res.status(404).json({ message: "Request not found" });
    }

    const requestedBySub =
      typeof req.user?.sub === "string" ? req.user.sub : undefined;

    if (item.requested_by_sub !== requestedBySub) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(item);
  } catch (error) {
    console.error("Failed to fetch request", error);
    return res.status(500).json({ message: "Failed to fetch request" });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});