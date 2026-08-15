import { HTTPException } from "hono/http-exception";

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new HTTPException(403, { message: "请求来源无效" });
  }
}

export async function readObject(request: Request) {
  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (contentLength > 16 * 1024) {
    throw new HTTPException(413, { message: "请求内容过大" });
  }

  try {
    const value = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error();
    }
    return value as Record<string, unknown>;
  } catch {
    throw new HTTPException(400, { message: "请求格式无效" });
  }
}

export function requiredString(
  body: Record<string, unknown>,
  key: string,
  maximumLength: number,
) {
  const value = typeof body[key] === "string" ? body[key].trim() : "";
  if (!value || value.length > maximumLength) {
    throw new HTTPException(400, { message: `${key} 无效` });
  }
  return value;
}
