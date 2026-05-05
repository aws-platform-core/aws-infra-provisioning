def round_cost(value: float) -> float:
    return round(value, 2)

def estimate_s3_cost(parameters: dict) -> dict:
    storage_gb = parameters.get("estimated_storage_gb", 100)
    put_requests = parameters.get("estimated_monthly_put_requests", 100000)
    get_requests = parameters.get("estimated_monthly_get_requests", 1000000)

    storage_cost = storage_gb * 0.023
    put_cost = (put_requests / 1000) * 0.005
    get_cost = (get_requests / 1000) * 0.0004

    breakdown = [
        {"name": "S3 Standard Storage", "monthly_cost": round_cost(storage_cost)},
        {"name": "PUT/LIST Requests", "monthly_cost": round_cost(put_cost)},
        {"name": "GET Requests", "monthly_cost": round_cost(get_cost)},
    ]

    total = sum(item["monthly_cost"] for item in breakdown)

    return {
        "currency": "USD",
        "monthly_estimate": round_cost(total),
        "breakdown": breakdown,
        "assumptions": [
            f"{storage_gb} GB stored in S3 Standard",
            f"{put_requests:,} PUT/LIST requests per month",
            f"{get_requests:,} GET requests per month",
        ],
    }

def estimate_ec2_cost(parameters: dict) -> dict:
    instance_type = parameters.get("instance_type", "t3.small")

    hourly_map = {
        "t3.small": 0.0208,
        "t3.medium": 0.0416,
        "t3.large": 0.0832,
    }

    hourly = hourly_map.get(instance_type, 0.0208)
    monthly = hourly * 24 * 30

    return {
        "currency": "USD",
        "monthly_estimate": round_cost(monthly),
        "breakdown": [
            {"name": f"EC2 {instance_type}", "monthly_cost": round_cost(monthly)}
        ],
        "assumptions": [
            f"{instance_type} running 24x7 for 30 days"
        ],
    }

def estimate_template_cost(template_id: str, parameters: dict) -> dict:
    if template_id == "aws-s3-bucket":
        return estimate_s3_cost(parameters)
    if template_id == "aws-ec2-instance":
        return estimate_ec2_cost(parameters)

    return {
        "currency": "USD",
        "monthly_estimate": 0,
        "breakdown": [],
        "assumptions": ["No cost model configured for this template yet."],
    }