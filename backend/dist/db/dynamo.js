import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
const region = process.env.AWS_REGION;
if (!region) {
    throw new Error("Missing AWS_REGION");
}
const client = new DynamoDBClient({
    region,
});
export const dynamo = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
    },
});
