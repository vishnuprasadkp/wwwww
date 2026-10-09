"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLink } from "@/components/ui/ArrowLink";

const FILE = "/resume/Vishnu_Prasad_Resume.pdf";
const STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

/** In-site PDF viewer: crisp canvas render with zoom, print and download. */
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

  // (Re)render every page whenever the zoom or width changes.
  useEffect(() => {
    const d = doc.current;
    const host = holder.current;
    if (!ready || !d || !host || !width) return;
    let dead = false;
    (async () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const fitWidth = Math.min(width - 40, 860);
      for (let n = 1; n <= d.numPages; n++) {
        const page = await d.getPage(n);
        if (dead) return;
        const base = page.getViewport({ scale: 1 });
        const cssW = fitWidth * zoom;
        const scale = cssW / base.width;
        const vp = page.getViewport({ scale: scale * dpr });
        const canvas = pages[n - 1];
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${(cssW / base.width) * base.height}px`;
        canvas.className = "block bg-white shadow-[0_0_0_1px_#cfcfcf]";
        if (!canvas.parentElement) host.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
      }
    })();
    return () => {
      dead = true;
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
    "flex h-9 items-center gap-2 px-2 font-mono text-base leading-[19px] text-pigment-soft transition-colors hover:text-[#C44419] disabled:pointer-events-none disabled:opacity-30";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-rule px-5 py-[11px] md:px-8">
        <h1 className="font-serif text-[1.625rem] leading-[34px] md:text-4xl md:leading-[46px]">Resume</h1>
        <div className="flex items-center gap-6 md:gap-10">
          <div className="flex items-center">
            <button type="button" onClick={() => step(-1)} disabled={zoom <= STEPS[0]} aria-label="Zoom out" className={btn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4M8 11h6" /></svg>
            </button>
            <span className="w-12 text-center font-mono text-base tabular-nums text-pigment" aria-live="polite">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => step(1)} disabled={zoom >= STEPS[STEPS.length - 1]} aria-label="Zoom in" className={btn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4M8 11h6M11 8v6" /></svg>
            </button>
          </div>
          <ArrowLink
            onClick={print}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" />
                <rect x="7" y="14" width="10" height="6" />
              </svg>
            }
          >
            Print
          </ArrowLink>
          <ArrowLink
            href={FILE}
            download="Vishnu_Prasad_Resume.pdf"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        {!ready && !failed && <p className="py-24 text-center font-mono text-base text-pigment-soft">Loading resume…</p>}
        {failed && (
          <p className="py-24 text-center font-mono text-base text-pigment-soft">
            Couldn&apos;t display the resume here. <a href={FILE} className="underline underline-offset-4 hover:text-[#C44419]">Open the PDF</a>
          </p>
        )}
      </div>
    </>
  );
}
