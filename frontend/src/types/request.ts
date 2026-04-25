export type CreateRequestPayload = {
    template_id: string;
    parameters: Record<string, unknown>;
  };
  
  export type CreateRequestResponse = {
    request_id: string;
    status: string;
    pr_url: string;
    branch_name: string;
    requested_by: string;
  };
  
  export type RequestRecord = {
    request_id: string;
    requested_by: string;
    requested_by_sub: string;
    template_id: string;
    parameters: Record<string, unknown>;
    status: string;
    branch_name: string;
    pr_url: string;
    created_at: string;
    updated_at: string;
  };