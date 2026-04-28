export function estimateTemplateCost(templateId, parameters) {
    switch (templateId) {
        case "aws-s3-bucket":
            return estimateS3Cost(parameters);
        case "aws-ec2-instance":
            return estimateEc2Cost(parameters);
        default:
            return {
                currency: "USD",
                monthly_estimate: 0,
                breakdown: [],
                assumptions: ["No cost model configured for this template yet."],
            };
    }
}
function estimateS3Cost(parameters) {
    const storageGb = typeof parameters.estimated_storage_gb === "number"
        ? parameters.estimated_storage_gb
        : 100;
    const putRequests = typeof parameters.estimated_monthly_put_requests === "number"
        ? parameters.estimated_monthly_put_requests
        : 100000;
    const getRequests = typeof parameters.estimated_monthly_get_requests === "number"
        ? parameters.estimated_monthly_get_requests
        : 1000000;
    // These are rough pricing assumptions only for demonstration purposes.
    const storageCost = storageGb * 0.023;
    const putCost = (putRequests / 1000) * 0.005;
    const getCost = (getRequests / 1000) * 0.0004;
    const breakdown = [
        { name: "S3 Standard Storage", monthly_cost: round(storageCost) },
        { name: "PUT/LIST Requests", monthly_cost: round(putCost) },
        { name: "GET Requests", monthly_cost: round(getCost) },
    ];
    const total = breakdown.reduce((sum, item) => sum + item.monthly_cost, 0);
    return {
        currency: "USD",
        monthly_estimate: round(total),
        breakdown,
        assumptions: [
            `${storageGb} GB stored in S3 Standard`,
            `${putRequests.toLocaleString()} PUT/LIST requests per month`,
            `${getRequests.toLocaleString()} GET requests per month`,
        ],
    };
}
function estimateEc2Cost(parameters) {
    const instanceType = typeof parameters.instance_type === "string"
        ? parameters.instance_type
        : "t3.small";
    const hourlyMap = {
        "t3.small": 0.0208,
        "t3.medium": 0.0416,
        "t3.large": 0.0832,
    };
    const hourly = hourlyMap[instanceType] ?? 0.0208;
    const monthly = hourly * 24 * 30;
    return {
        currency: "USD",
        monthly_estimate: round(monthly),
        breakdown: [
            { name: `EC2 ${instanceType}`, monthly_cost: round(monthly) },
        ],
        assumptions: [
            `${instanceType} running 24x7 for 30 days`,
        ],
    };
}
function round(value) {
    return Math.round(value * 100) / 100;
}
