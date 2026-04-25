import api from "./axios";
import { Template } from "../types/template";

export const getTemplates = async (): Promise<Template[]> => {
  const response = await api.get("/api/templates");
  return response.data;
};

export const getTemplateById = async (id: string): Promise<Template> => {
  const response = await api.get(`/api/templates/${id}`);
  return response.data;
};