import api from "./axios";
import type { CreateRequestPayload, CreateRequestResponse, RequestRecord } from "../types/request";

export async function submitRequest(
  payload: CreateRequestPayload
): Promise<CreateRequestResponse> {
  const response = await api.post("/api/requests", payload);
  return response.data;
}

export async function getMyRequests(): Promise<RequestRecord[]> {
  const response = await api.get("/api/requests");
  return response.data;
}

export async function getRequestById(id: string): Promise<RequestRecord> {
  const response = await api.get(`/api/requests/${id}`);
  return response.data;
}