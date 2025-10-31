import { BaseResponse, ExtractableResponse } from "@/types/applicationTypes";

export function extractData<T>(response: ExtractableResponse<T>): T {
  if (!Array.isArray(response) && (typeof response !== "object" || response === null)) {
    return response;
  }

  if (typeof response === "object" && response !== null && "data" in response) {
    const data = (response as BaseResponse<T>).data;
    if (data !== undefined && data !== null) {
      return data;
    }
  }
  
  return response as T;
}
