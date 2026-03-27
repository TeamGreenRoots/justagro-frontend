"use client";

const logos = [
  { src: "/logos/interswitch-logo.svg", alt: "Interswitch",  width: "w-40" },
  { src: "/logos/enyata-logo.svg",      alt: "Enyata",        width: "w-32" },
  { src: "/logos/gemini.svg",           alt: "Google Gemini", width: "w-40" },
];

const sets = [0, 1, 2, 3];

export default function TrustBar() {
  return (
    <section className="py-12 bg-white border-b border-slate-100 overflow-hidden">
      <p className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-10">
        Powered by and integrated with
      </p>

      <div className="relative">
        {/* Left fade mask */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        {/* Right fade mask */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex marquee-track">
          {sets.map(setIdx => (
            <div key={setIdx} className="flex items-center gap-24 px-12 shrink-0">
              {logos.map((logo, i) => (
                <img
                  key={i}
                  src={logo.src}
                  alt={logo.alt}
                  className={`${logo.width} h-10 object-contain opacity-55 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

