import HeroBeetle from "./HeroBeetle";
import LogoMarquee from "./LogoMarquee";

export default function Hero() {
  return (
    <section className="flex min-h-[max(560px,calc(100svh-107px))] flex-col overflow-x-clip">
      <div className="relative flex flex-1 flex-col px-5 py-16 max-md:justify-center md:flex-row md:items-center md:px-8">
        <div className="relative z-10">
          <h1 className="font-serif text-[1.875rem] leading-[40px] md:text-[2.5rem] md:leading-[1.35]">I’m Vishnu.</h1>
          <p className="mt-2 max-w-[35rem] text-[17px] leading-[26px] md:text-lg md:leading-[1.5]">
            A Product Designer with over 5 years of experience. I design experiences for the complex systems that run real work.
          </p>
        </div>
        <div className="-mx-5 mt-6 md:absolute md:right-0 md:top-1/2 md:mx-0 md:mt-0 md:w-[min(76vw,1100px)] md:-translate-y-1/2">
          <HeroBeetle />
        </div>
      </div>
      <LogoMarquee />
    </section>
  );
}
