const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

type Env = {
  OPENROUTER_API_KEY?: string;
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: "Missing OPENROUTER_API_KEY in environment." } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let payload: unknown;
  try {
    payload = await context.request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: { message: "Invalid JSON body." } }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
};
