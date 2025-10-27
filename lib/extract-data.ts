export function extractData<T>(result: unknown): T[] {
  if (Array.isArray(result)) {
    return result;
  }
  if (result && typeof result === "object" && "data" in result) {
    return Array.isArray(result.data) ? result.data : [];
  }
  return [];
}
