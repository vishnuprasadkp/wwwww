import LogoMarquee from "./LogoMarquee";

export default function Hero() {
  return (
    <section className="flex min-h-[666px] flex-col md:min-h-[calc(100svh-26px)]">
      <div className="flex flex-1 items-center px-5 py-16 md:px-8">
        <div>
          <h1 className="font-serif text-[1.875rem] leading-[40px] md:text-[2.5rem] md:leading-[1.35]">I’m Vishnu.</h1>
          <p className="mt-2 max-w-[35rem] text-lg leading-[28px] md:text-xl md:leading-[1.5]">
            A Product Designer with over 5 years of experience. I design experiences for the complex systems that run real work.
          </p>
        </div>
      </div>
      <LogoMarquee />
    </section>
  );
}
