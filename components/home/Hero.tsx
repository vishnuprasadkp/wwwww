import HeroBeetle from "./HeroBeetle";
import HeroInk from "./HeroInk";
import LogoMarquee from "./LogoMarquee";

export default function Hero() {
  return (
    <section className="flex min-h-[max(560px,calc(100svh-107px))] flex-col overflow-x-clip">
      <div className="flex flex-1 flex-col justify-end px-5 pb-10 pt-16 md:px-8">
        <div>
          <h1 className="font-serif text-[1.875rem] leading-[40px] md:text-[2.5rem] md:leading-[1.35]">I’m Vishnu.</h1>
          <p className="mt-2 max-w-[35rem] text-[17px] leading-[26px] md:text-lg md:leading-[1.5]">
            A Product Designer with over 5 years of experience. I design experiences for the complex systems that run real work.
          </p>
        </div>
      </div>
      <div className="relative" style={{ height: "clamp(320px, 36vw, 500px)", background: "rgba(110,106,100,0.12)" }}>
        <HeroInk />
        <HeroBeetle />
      </div>
      <LogoMarquee />
    </section>
  );
}
