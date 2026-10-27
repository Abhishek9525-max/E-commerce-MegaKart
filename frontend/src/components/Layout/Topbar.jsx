import React from "react";
import { FiGlobe, FiPhone } from "react-icons/fi";

const Topbar = () => {
  return (
    <div className="border-b border-[#E5E1DA] bg-[#FAF9F6] text-[#171714]">
      <div className="mx-auto flex min-h-9 max-w-[1440px] items-center justify-between gap-4 px-5 text-[9px] font-medium uppercase tracking-[0.12em] sm:px-10 sm:text-[10px]">
        <div className="flex items-center gap-2">
          <FiGlobe className="h-3 w-3" aria-hidden="true" />
          <span>We ship worldwide - Fast and reliable delivery</span>
        </div>
        <a
          href="tel:+919876543210"
          className="hidden shrink-0 items-center gap-2 transition-colors hover:text-[#77746D] sm:flex"
        >
          <FiPhone className="h-3 w-3" aria-hidden="true" />
          <span>+91 98765 43210</span>
        </a>
      </div>
    </div>
  );
};

export default Topbar;
