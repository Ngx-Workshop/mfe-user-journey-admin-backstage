export function formatJson(value: unknown): string {
  if (value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
export function formatDocument(content: string): string {
  try {
    return formatJson(JSON.parse(content));
  } catch {
    return content;
  }
}
