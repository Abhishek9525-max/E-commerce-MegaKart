import React from "react";
import { FiAward, FiFeather, FiZap } from "react-icons/fi";

const trustPoints = [
  {
    label: "Over 40,000 satisfied global clients",
    icon: <FiAward aria-hidden="true" className="h-4 w-4 shrink-0 text-[#414B36]" />,
  },
  {
    label: "Handmade Italian wool & Irish linen",
    icon: <FiFeather aria-hidden="true" className="h-4 w-4 shrink-0 text-[#414B36]" />,
  },
  {
    label: "Priority dispatch within 24 hours",
    icon: <FiZap aria-hidden="true" className="h-4 w-4 shrink-0 text-[#414B36]" />,
  },
];

const TrustBar = () => {
  return (
    <section
      aria-label="Our promises"
      className="hidden border-y border-[#D8D2C8] bg-[#F0EDE7] px-4 py-4 sm:block sm:py-5"
    >
      <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {trustPoints.map(({ label, icon }) => (
          <li
            key={label}
            className="flex items-center justify-center gap-2 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-[#171714] sm:text-[9px] lg:text-[10px]"
          >
            {icon}
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TrustBar;
