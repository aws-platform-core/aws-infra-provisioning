import { validateAwsS3Request, } from "./s3RequestValidator.js";
const templateValidatorMap = {
    "aws-s3-bucket": validateAwsS3Request,
};
export function runTemplateValidator(templateId, input) {
    const validator = templateValidatorMap[templateId];
    if (!validator) {
        return {
            valid: true,
            errors: [],
            normalizedParameters: input.parameters,
        };
    }
    return validator(input);
}
