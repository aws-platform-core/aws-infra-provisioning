import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../db/dynamo.js";
const tableName = process.env.DYNAMODB_REQUESTS_TABLE;
if (!tableName) {
    throw new Error("Missing DYNAMODB_REQUESTS_TABLE");
}
export async function createRequest(record) {
    await dynamo.send(new PutCommand({
        TableName: tableName,
        Item: record,
    }));
}
export async function getRequestById(requestId) {
    const result = await dynamo.send(new GetCommand({
        TableName: tableName,
        Key: {
            request_id: requestId,
        },
    }));
    return result.Item;
}
export async function listRequestsByUser(requestedBySub) {
    const result = await dynamo.send(new QueryCommand({
        TableName: tableName,
        IndexName: "requested_by_sub-created_at-index",
        KeyConditionExpression: "requested_by_sub = :requested_by_sub",
        ExpressionAttributeValues: {
            ":requested_by_sub": requestedBySub,
        },
        ScanIndexForward: false,
    }));
    return (result.Items ?? []);
}
export async function updateRequestStatus(requestId, status) {
    await dynamo.send(new UpdateCommand({
        TableName: tableName,
        Key: {
            request_id: requestId,
        },
        UpdateExpression: "SET #status = :status, updated_at = :updated_at",
        ExpressionAttributeNames: {
            "#status": "status",
        },
        ExpressionAttributeValues: {
            ":status": status,
            ":updated_at": new Date().toISOString(),
        },
    }));
}
