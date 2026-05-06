import { client } from "./client";
import type {
  ApiSuccess,
  CreateOpportunityRequest,
  DashboardData,
  DashboardMeta,
  Opportunity,
  PaginatedMeta,
} from "../types/api";

export async function getDashboard(): Promise<{
  data: DashboardData;
  meta: DashboardMeta;
}> {
  const res = await client.get<
    ApiSuccess<DashboardData> & { meta: DashboardMeta }
  >("/v1/partner-portal/dashboard");
  return { data: res.data.data, meta: res.data.meta as DashboardMeta };
}

export async function getOpportunities(
  page = 1,
  pageSize = 50,
): Promise<{ data: Opportunity[]; meta: PaginatedMeta }> {
  const res = await client.get<
    ApiSuccess<Opportunity[]> & { meta: PaginatedMeta }
  >("/v1/partner-portal/opportunities", {
    params: { page, page_size: pageSize },
  });
  return { data: res.data.data, meta: res.data.meta as PaginatedMeta };
}

export async function createOpportunity(
  payload: CreateOpportunityRequest,
): Promise<Opportunity> {
  const res = await client.post<ApiSuccess<Opportunity>>(
    "/v1/partner-portal/opportunities",
    payload,
  );
  return res.data.data;
}

export async function deleteOpportunity(id: number): Promise<void> {
  await client.delete(`/v1/partner-portal/opportunities/${id}`);
}
