/** A dark veil laid over a whole beetle film (wash and beetle alike), so every film on the site reads deeper and richer. */
export default function FilmShade() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} />;
}
