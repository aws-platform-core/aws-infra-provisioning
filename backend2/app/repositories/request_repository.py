from app.config import settings
from app.db.dynamo import dynamodb

if not settings.DYNAMODB_REQUESTS_TABLE:
    raise RuntimeError("Missing DYNAMODB_REQUESTS_TABLE")

table = dynamodb.Table(settings.DYNAMODB_REQUESTS_TABLE)

def create_request(record: dict) -> None:
    table.put_item(Item=record)

def get_request_by_id(request_id: str) -> dict | None:
    response = table.get_item(Key={"request_id": request_id})
    return response.get("Item")

def list_requests_by_user(requested_by_sub: str) -> list[dict]:
    response = table.query(
        IndexName="requested_by_sub-created_at-index",
        KeyConditionExpression="requested_by_sub = :requested_by_sub",
        ExpressionAttributeValues={
            ":requested_by_sub": requested_by_sub
        },
        ScanIndexForward=False
    )
    return response.get("Items", [])

def update_request_status(request_id: str, status: str) -> None:
    from datetime import datetime, timezone

    table.update_item(
        Key={"request_id": request_id},
        UpdateExpression="SET #status = :status, updated_at = :updated_at",
        ExpressionAttributeNames={"#status": "status"},
        ExpressionAttributeValues={
            ":status": status,
            ":updated_at": datetime.now(timezone.utc).isoformat()
        },
    )