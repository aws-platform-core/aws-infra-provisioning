import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../db/dynamo.js";

const tableName = process.env.DYNAMODB_REQUESTS_TABLE;

if (!tableName) {
  throw new Error("Missing DYNAMODB_REQUESTS_TABLE");
}

export type RequestRecord = {
  request_id: string;
  requested_by: string;
  requested_by_sub: string;
  provider: string;
  template_id: string;
  parameters: Record<string, unknown>;
  status: string;
  branch_name: string;
  pr_url: string;
  pr_number: number;
  created_at: string;
  updated_at: string;
};

export async function createRequest(record: RequestRecord): Promise<void> {
  await dynamo.send(
    new PutCommand({
      TableName: tableName,
      Item: record,
    })
  );
}

export async function getRequestById(
  requestId: string
): Promise<RequestRecord | undefined> {
  const result = await dynamo.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        request_id: requestId,
      },
    })
  );

  return result.Item as RequestRecord | undefined;
}

export async function listRequestsByUser(
  requestedBySub: string
): Promise<RequestRecord[]> {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: "requested_by_sub-created_at-index",
      KeyConditionExpression: "requested_by_sub = :requested_by_sub",
      ExpressionAttributeValues: {
        ":requested_by_sub": requestedBySub,
      },
      ScanIndexForward: false,
    })
  );

  return (result.Items ?? []) as RequestRecord[];
}

export async function updateRequestStatus(
  requestId: string,
  status: string
): Promise<void> {
  await dynamo.send(
    new UpdateCommand({
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
    })
  );
}