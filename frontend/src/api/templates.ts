import api from "./axios";
import { Template } from "../types/template";

export type CostEstimate = {
  currency: string;
  monthly_estimate: number;
  breakdown: Array<{
    name: string;
    monthly_cost: number;
  }>;
  assumptions: string[];
};

export const getTemplates = async (): Promise<Template[]> => {
  const response = await api.get("/api/templates");
  return response.data;
};

export const getTemplateById = async (id: string): Promise<Template> => {
  const response = await api.get(`/api/templates/${id}`);
  return response.data;
};

export async function getTemplateCostEstimate(
  id: string,
  parameters: Record<string, unknown>
): Promise<CostEstimate> {
  const response = await api.post(`/api/templates/${id}/cost-estimate`, {
    parameters,
  });
  return response.data;
}