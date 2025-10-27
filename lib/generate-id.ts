export function generateId() {
  return crypto.randomUUID().replace(/-/g, "");
}