import {
    validateAwsS3Request,
    type TemplateValidationInput,
    type TemplateValidationResult,
  } from "./s3RequestValidator.js";
  
  export type TemplateValidator = (
    input: TemplateValidationInput
  ) => TemplateValidationResult;
  
  const templateValidatorMap: Record<string, TemplateValidator> = {
    "aws-s3-bucket": validateAwsS3Request,
  };
  
  export function runTemplateValidator(
    templateId: string,
    input: TemplateValidationInput
  ): TemplateValidationResult {
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