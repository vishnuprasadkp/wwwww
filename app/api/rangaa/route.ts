import { knowledge, localAnswer, systemPrompt } from "@/lib/rangaa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

// Tiny per-instance rate limit: 20 requests / minute / IP.
const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 20;
};

const enc = new TextEncoder();
const textStream = (run: (push: (s: string) => void) => Promise<void>) =>
  new Response(
    new ReadableStream({
      async start(controller) {
        try {
          await run((s) => controller.enqueue(enc.encode(s)));
        } catch {
          controller.enqueue(enc.encode("Sorry — I lost my train of thought. Please try again in a moment.\nNEXT: Where should I start? | What does Vishnu do? | Is he open to roles?"));
        }
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } },
  );

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return new Response("Too many questions — give me a minute.", { status: 429 });

  let messages: Msg[];
  try {
    const body = (await req.json()) as { messages?: Msg[] };
    messages = (body.messages ?? [])
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (!messages.length || messages[messages.length - 1].role !== "user") return new Response("Bad request", { status: 400 });

  const key = process.env.ANTHROPIC_API_KEY;

  // No key configured: answer from the site's own content so Rangaa still works.
  if (!key) {
    const answer = await localAnswer(messages[messages.length - 1].content);
    return textStream(async (push) => {
      for (const part of answer.match(/\S+\s*/g) ?? []) {
        push(part);
        await new Promise((r) => setTimeout(r, 18));
      }
    });
  }

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: process.env.RANGAA_MODEL ?? "claude-haiku-4-5-20251001",
      max_tokens: 500,
      stream: true,
      system: systemPrompt(await knowledge()),
      messages,
    }),
  });
  if (!upstream.ok || !upstream.body) {
    const answer = await localAnswer(messages[messages.length - 1].content);
    return textStream(async (push) => push(answer));
  }

  return textStream(async (push) => {
    const reader = upstream.body!.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const evt = JSON.parse(line.slice(6));
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") push(evt.delta.text);
        } catch {
          /* ignore keep-alives */
        }
      }
    }
  });
}
