const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

type Env = {
  OPENROUTER_API_KEY?: string;
  ASSETS: Fetcher;
};

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") {
        return jsonResponse({ error: { message: "Method Not Allowed" } }, 405);
      }

      if (!env.OPENROUTER_API_KEY) {
        return jsonResponse({ error: { message: "Missing OPENROUTER_API_KEY in environment." } }, 500);
      }

      let payload: unknown;
      try {
        payload = await request.json();
      } catch {
        return jsonResponse({ error: { message: "Invalid JSON body." } }, 400);
      }

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://ai-arena-app.com",
          "X-Title": "AI Arena",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const body = await response.text();
      return new Response(body, {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
