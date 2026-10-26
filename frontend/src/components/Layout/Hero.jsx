import React from "react";
import { HiArrowRight } from "react-icons/hi2";
import heroImg from "../../assets/rabbit-hero.webp";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative isolate flex min-h-[500px] items-center justify-center overflow-hidden sm:min-h-[560px] lg:min-h-[min(72vh,680px)]">
      <img
        src={heroImg}
        alt="A considered edit of timeless fashion"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-[#171714]/55" />
      <div className="mx-auto max-w-3xl px-6 py-20 text-center text-[#F5F2ED]">
        <span className="luxury-eyebrow inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-[10px] tracking-[0.14em]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#A94F38]" />
          Resort &amp; Sartorial 2025
        </span>
        <h1 className="mt-6 text-5xl font-medium uppercase leading-[0.95] tracking-[-0.025em] sm:text-7xl lg:text-[82px]">
          Escape in Style
        </h1>
        <p className="mx-auto mt-6 max-w-[620px] font-display text-xl leading-relaxed text-white/90 sm:text-2xl">
          Bespoke tailoring, pure Mediterranean linen, and lightweight Italian
          wool crafted for balmy getaways, seasonal retreats, and timeless
          elegance.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/collection/all"
            className="luxury-button min-w-[220px]"
          >
            Explore Collection <HiArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#best-seller"
            className="luxury-button luxury-button-secondary min-w-[190px]"
          >
            View Best Seller
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
