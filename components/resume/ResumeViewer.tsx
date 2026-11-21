"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLink } from "@/components/ui/ArrowLink";

const FILE = "/Vishnu_Prasad_Resume_2026.pdf";
const STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

/** In-site PDF viewer: crisp canvas render, its text selectable and its links clickable, with zoom, print and download. */
export default function ResumeViewer() {
  const stage = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const holder = useRef<HTMLDivElement>(null);
  const doc = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Load the PDF once.
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/resume/pdf.worker.min.mjs";
        const d = await pdfjs.getDocument({ url: FILE }).promise;
        if (dead) return;
        doc.current = d;
        setPages(Array.from({ length: d.numPages }, () => document.createElement("canvas")));
        setReady(true);
      } catch {
        if (!dead) setFailed(true);
      }
    })();
    return () => {
      dead = true;
    };
  }, []);

  // Track the available width so "100%" means "fit the screen".
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // (Re)render every page whenever the zoom or width changes: the page drawn crisp on a canvas, its text laid over it
  // (invisible, but selectable and copyable) and its links over that (clickable)
  useEffect(() => {
    const d = doc.current;
    const host = holder.current;
    if (!ready || !d || !host || !width) return;
    let dead = false;
    let task: { cancel: () => void } | null = null;
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const fitWidth = Math.min(width - 40, 860);
      for (let n = 1; n <= d.numPages; n++) {
        const page = await d.getPage(n);
        if (dead) return;
        const base = page.getViewport({ scale: 1 });
        const cssW = fitWidth * zoom;
        const scale = cssW / base.width;
        const cssH = scale * base.height;
        const vp = page.getViewport({ scale: scale * dpr });
        const view = page.getViewport({ scale });
        const canvas = pages[n - 1];
        let sheet = canvas.parentElement as HTMLDivElement | null;
        if (!sheet) {
          sheet = document.createElement("div");
          sheet.className = "resume-sheet relative bg-white shadow-[0_0_0_1px_#b5a7a2]";
          sheet.appendChild(canvas);
          host.appendChild(sheet);
        }
        sheet.style.width = `${cssW}px`;
        sheet.style.height = `${cssH}px`;
        sheet.style.setProperty("--scale-factor", String(scale));
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
        canvas.className = "block";
        const ctx = canvas.getContext("2d");
        // drawn while the text and links are laid over it
        const job = ctx ? page.render({ canvasContext: ctx, viewport: vp, canvas }) : null;
        task = job;
        const drawn = job ? job.promise : Promise.resolve();

        // the text, for selecting and copying
        sheet.querySelector(".textLayer")?.remove();
        const text = document.createElement("div");
        text.className = "textLayer";
        sheet.appendChild(text);
        await new pdfjs.TextLayer({ textContentSource: await page.getTextContent(), container: text, viewport: view }).render();
        if (dead) return;
        // (while a selection is dragged, this stretches over the page so it runs smoothly between the lines)
        const end = document.createElement("div");
        end.className = "endOfContent";
        text.appendChild(end);
        text.addEventListener("pointerdown", () => {
          text.classList.add("selecting");
          window.addEventListener("pointerup", () => text.classList.remove("selecting"), { once: true });
        });

        // the links, for clicking
        sheet.querySelector(".resume-links")?.remove();
        const links = document.createElement("div");
        links.className = "resume-links pointer-events-none absolute inset-0";
        for (const a of await page.getAnnotations()) {
          const url: string | undefined = a.subtype === "Link" ? a.url || a.unsafeUrl : undefined;
          if (!url) continue;
          const [ax, ay] = view.convertToViewportPoint(a.rect[0], a.rect[1]);
          const [bx, by] = view.convertToViewportPoint(a.rect[2], a.rect[3]);
          const [x1, y1, x2, y2] = [Math.min(ax, bx), Math.min(ay, by), Math.max(ax, bx), Math.max(ay, by)];
          const el = document.createElement("a");
          el.href = url;
          if (!url.startsWith("mailto:") && !url.startsWith("tel:")) {
            el.target = "_blank";
            el.rel = "noopener noreferrer";
          }
          el.setAttribute("aria-label", url.replace(/^mailto:|^tel:/, ""));
          el.className = "pointer-events-auto absolute";
          el.style.cssText = `left:${x1}px;top:${y1}px;width:${x2 - x1}px;height:${y2 - y1}px`;
          links.appendChild(el);
        }
        // an email address or phone number in the text that the PDF itself does not link: linked here (mail, WhatsApp)
        const box = sheet.getBoundingClientRect();
        const linked = [...links.children].map((l) => {
          const st = (l as HTMLElement).style;
          const [x, y, w, h] = [st.left, st.top, st.width, st.height].map(parseFloat);
          return { left: box.left + x, top: box.top + y, right: box.left + x + w, bottom: box.top + y + h };
        });
        const FIND: [RegExp, (m: string) => string][] = [
          [/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, (m) => `mailto:${m}`],
          [/\+?\d[\d ]{9,15}\d/g, (m) => `https://wa.me/${m.replace(/\D/g, "").replace(/^(?!91)(\d{10})$/, "91$1")}`],
        ];
        for (const span of text.querySelectorAll("span")) {
          const node = span.firstChild;
          if (!node || node.nodeType !== Node.TEXT_NODE) continue;
          for (const [re, href] of FIND) {
            for (const m of (node.textContent ?? "").matchAll(re)) {
              const range = document.createRange();
              range.setStart(node, m.index!);
              range.setEnd(node, m.index! + m[0].length);
              const r = range.getBoundingClientRect();
              if (!r.width || linked.some((l) => r.left < l.right && r.right > l.left && r.top < l.bottom && r.bottom > l.top)) continue;
              const url = href(m[0]);
              const el = document.createElement("a");
              el.href = url;
              if (url.startsWith("http")) {
                el.target = "_blank";
                el.rel = "noopener noreferrer";
              }
              el.setAttribute("aria-label", m[0]);
              el.className = "pointer-events-auto absolute";
              el.style.cssText = `left:${r.left - box.left}px;top:${r.top - box.top}px;width:${r.width}px;height:${r.height}px`;
              links.appendChild(el);
            }
          }
        }
        sheet.appendChild(links);
        await drawn;
      }
    })().catch(() => {});
    return () => {
      dead = true;
      task?.cancel(); // (a new zoom draws the same canvas afresh)
    };
  }, [ready, zoom, width, pages]);

  const step = useCallback((dir: 1 | -1) => {
    setZoom((z) => {
      const i = STEPS.findIndex((s) => s >= z - 0.001);
      return STEPS[Math.min(STEPS.length - 1, Math.max(0, (i < 0 ? 2 : i) + dir))];
    });
  }, []);

  const print = () => {
    const f = document.createElement("iframe");
    f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    f.src = FILE;
    f.onload = () => {
      f.contentWindow?.focus();
      f.contentWindow?.print();
      setTimeout(() => f.remove(), 60_000);
    };
    document.body.appendChild(f);
  };

  const btn =
    "flex h-9 items-center gap-2 px-2 font-mono text-[15px] leading-[19px] text-pigment-soft transition-colors hover:text-brand disabled:pointer-events-none disabled:opacity-30";

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-rule px-5 py-[11px] md:mt-[80px] md:px-8 lg:mt-[130px]">
        <h1 className="font-serif text-[1.625rem] leading-[34px] md:text-4xl md:leading-[46px]">Resume</h1>
        <div className="flex items-center gap-6 md:gap-10">
          <div className="flex items-center">
            <button type="button" onClick={() => step(-1)} disabled={zoom <= STEPS[0]} aria-label="Zoom out" className={btn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4M8 11h6" /></svg>
            </button>
            <span className="w-12 text-center font-mono text-[15px] tabular-nums text-pigment" aria-live="polite">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => step(1)} disabled={zoom >= STEPS[STEPS.length - 1]} aria-label="Zoom in" className={btn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4M8 11h6M11 8v6" /></svg>
            </button>
          </div>
          <ArrowLink
            onClick={print}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" />
                <rect x="7" y="14" width="10" height="6" />
              </svg>
            }
          >
            Print
          </ArrowLink>
          <ArrowLink
            href={FILE}
            download="Vishnu_Prasad_Resume_2026.pdf"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
              </svg>
            }
          >
            Download
          </ArrowLink>
        </div>
      </div>

      <div ref={stage} className="overflow-x-auto px-5 pb-8 pt-5 md:px-8 md:pt-8">
        <div ref={holder} className="mx-auto flex w-max min-w-full flex-col items-center gap-6" />
        {!ready && !failed && <p className="py-24 text-center font-mono text-[15px] text-pigment-soft">Loading resume…</p>}
        {failed && (
          <p className="py-24 text-center font-mono text-[15px] text-pigment-soft">
            Couldn&apos;t display the resume here. <a href={FILE} className="underline underline-offset-4 hover:text-brand">Open the PDF</a>
          </p>
        )}
      </div>
    </>
  );
}
