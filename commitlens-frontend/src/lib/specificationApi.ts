import { apiFetch } from "./api";
import type {
  ApiResponse,
  SpecificationCreateRequest,
  SpecificationResponse,
  SpecificationUpdateRequest,
} from "./types";

const BASE_PATH = "/api/specifications";

/** GET /api/specifications */
export function getSpecifications(): Promise<ApiResponse<SpecificationResponse[]>> {
  return apiFetch<SpecificationResponse[]>(BASE_PATH);
}

/** GET /api/specifications/{id} */
export function getSpecificationById(
  id: number
): Promise<ApiResponse<SpecificationResponse>> {
  return apiFetch<SpecificationResponse>(`${BASE_PATH}/${id}`);
}

/** POST /api/specifications */
export function createSpecification(
  data: SpecificationCreateRequest
): Promise<ApiResponse<SpecificationResponse>> {
  return apiFetch<SpecificationResponse>(BASE_PATH, { method: "POST", body: data });
}

/** PUT /api/specifications/{id} */
export function updateSpecification(
  id: number,
  data: SpecificationUpdateRequest
): Promise<ApiResponse<SpecificationResponse>> {
  return apiFetch<SpecificationResponse>(`${BASE_PATH}/${id}`, {
    method: "PUT",
    body: data,
  });
}

/** DELETE /api/specifications/{id} (204 No Content on success) */
export function deleteSpecification(id: number): Promise<ApiResponse<void>> {
  return apiFetch<void>(`${BASE_PATH}/${id}`, { method: "DELETE" });
}

export const specificationApi = {
  getSpecifications,
  getSpecificationById,
  createSpecification,
  updateSpecification,
  deleteSpecification,
};
