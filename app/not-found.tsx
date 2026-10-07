import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-prose px-6 py-40">
      <p className="font-mono text-sm text-pigment-soft">./404</p>
      <h1 className="mt-4 font-serif text-4xl">This page isn't here.</h1>
      <p className="mt-4 text-lg">The link may be from the old site. Start from the case studies instead.</p>
      <Link href="/#cases" className="mt-8 inline-block font-mono text-sm underline underline-offset-4">Go to cases</Link>
    </div>
  );
}
