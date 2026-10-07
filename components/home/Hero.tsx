import LogoMarquee from "./LogoMarquee";

export default function Hero() {
  return (
    <section className="flex min-h-[calc(100svh-26px)] flex-col">
      <div className="flex flex-1 items-center px-5 py-16 md:px-8">
        <div>
          <h1 className="font-serif text-[2.5rem] leading-[1.35]">I’m Vishnu.</h1>
          <p className="mt-2 max-w-[35rem] text-xl leading-[1.5]">
            A Product Designer with over 5 years of experience. I design experiences for the complex systems that run real work.
          </p>
        </div>
      </div>
      <LogoMarquee />
    </section>
  );
}
