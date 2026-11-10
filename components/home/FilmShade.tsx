/** A light veil laid over a whole beetle film (wash and beetle alike), so the grey reads soft and even, never black. */
export default function FilmShade() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "rgba(0,0,0,0.1)" }} />;
}
