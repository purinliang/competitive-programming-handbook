import type { WorkerBindings } from "./env";

function assetRequest(key: string, method: string) {
  return new Request(`https://content.invalid/content/${key}`, { method });
}

export async function getPublishedContent(
  env: WorkerBindings,
  key: string,
  method = "GET",
) {
  const requestMethod = method === "HEAD" ? "HEAD" : "GET";
  if (env.CONTENT) {
    try {
      const object = await env.CONTENT.get(key);
      if (object) {
        const headers = new Headers();
        headers.set(
          "content-type",
          object.httpMetadata?.contentType
            ?? "application/json; charset=utf-8",
        );
        headers.set("etag", object.httpEtag);
        headers.set("x-handbook-content-source", "r2");
        return new Response(requestMethod === "HEAD" ? null : object.body, {
          headers,
        });
      }
    } catch (error) {
      console.error("R2 正文读取失败，回退到 Static Assets", error);
    }
  }

  const response = await env.ASSETS.fetch(assetRequest(key, requestMethod));
  if (!response.ok) return undefined;
  const headers = new Headers(response.headers);
  headers.set("x-handbook-content-source", "assets");
  return new Response(requestMethod === "HEAD" ? null : response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export async function readPublishedJson<T>(
  env: WorkerBindings,
  objectPath: string,
) {
  const prefix = "/content/";
  if (!objectPath.startsWith(prefix)) {
    throw new Error("正文对象路径无效");
  }
  const response = await getPublishedContent(
    env,
    objectPath.slice(prefix.length),
  );
  if (!response) {
    throw new Error(`正文对象不存在：${objectPath}`);
  }
  return await response.json() as T;
}
