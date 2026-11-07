import { Fragment } from "react";
import Link from "next/link";

const SITE = /^https?:\/\/(www\.)?vishnuprasad\.space/;

/** Renders Nyrro's answers: paragraphs, **bold**, _italic_ / *italic*, "- " bullets, "1." lists and [text](https://url) links (this site stays in the same tab; other sites open in a new one). */

const EMAIL = /([\w.+-]+@[\w-]+\.[\w.-]+[\w])/g;
const LINK = "underline underline-offset-4 hover:text-pigment-soft";

/** Plain text, with any email address turned into an underlined mailto link. */
function Plain({ text }: { text: string }) {
  return (
    <>
      {text.split(EMAIL).map((p, i) =>
        i % 2 ? (
          <a key={i} href={`mailto:${p}`} className={LINK}>
            {p}
          </a>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

const INLINE = /(\[[^\]]+\]\(https?:[^)\s]+\)|\*\*[^*]+\*\*|(?:^|(?<=[^*\w]))_[^_]+_(?![\w])|\*[^*]+\*)/g;

function Inline({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  return (
    <>
      {text.split(INLINE).map((p, i) => {
        if (!p) return null;
        const link = p.match(/^\[([^\]]+)\]\((https?:[^)\s]+)\)$/);
        // links to this site stay in the same tab, so the page changes beside the open panel
        if (link && SITE.test(link[2]))
          return (
            <Link key={i} href={link[2].replace(SITE, "") || "/"} onClick={onNavigate} className="underline underline-offset-4 hover:text-pigment-soft">
              {link[1]}
            </Link>
          );
        if (link)
          return (
            <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-pigment-soft">
              {link[1]}
            </a>
          );
        const bold = p.match(/^\*\*([^*]+)\*\*$/);
        if (bold) return <strong key={i}><Plain text={bold[1]} /></strong>;
        const em = p.match(/^_([^_]+)_$/) ?? p.match(/^\*([^*]+)\*$/);
        if (em) return <em key={i}>{em[1]}</em>;
        return <Plain key={i} text={p} />;
      })}
    </>
  );
}

type Block = { kind: "p" | "ul" | "ol"; items: string[] };

function blocks(text: string): Block[] {
  const out: Block[] = [];
  for (const raw of text.split("\n")) {
    const l = raw.trimEnd();
    const ul = l.match(/^\s*[-•]\s+(.*)/);
    const ol = l.match(/^\s*\d+\.\s+(.*)/);
    const kind = ul ? "ul" : ol ? "ol" : "p";
    if (!l.trim()) {
      continue;
    }
    const item = (ul ?? ol)?.[1] ?? l;
    const last = out[out.length - 1];
    if (kind !== "p" && last?.kind === kind) last.items.push(item);
    else out.push({ kind, items: [item] });
  }
  return out;
}

export default function NyrroMarkdown({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  return (
    <>
      {blocks(text).map((b, i) => {
        const gap = i ? "mt-3" : "";
        if (b.kind === "p")
          return (
            <p key={i} className={gap}>
              <Inline text={b.items[0]} onNavigate={onNavigate} />
            </p>
          );
        const Tag = b.kind;
        return (
          <Tag key={i} className={`${gap} ${b.kind === "ul" ? "list-disc" : "list-decimal"} space-y-1 pl-5`}>
            {b.items.map((it, j) => (
              <li key={j}>
                <Inline text={it} onNavigate={onNavigate} />
              </li>
            ))}
          </Tag>
        );
      })}
    </>
  );
}
