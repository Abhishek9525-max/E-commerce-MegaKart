import React from "react";
import { FiFeather, FiUsers, FiZap } from "react-icons/fi";

const features = [
  {
    label: "Over 40,000 satisfied global clients",
    icon: <FiUsers aria-hidden="true" className="h-4 w-4 shrink-0 text-[#414B36]" />,
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

const FeaturesSection = () => {
  return (
    <section
      aria-label="MegaKart service promises"
      className="border-y border-[#D8D2C8] bg-[#F0EDE7] px-5"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 sm:grid-cols-3">
        {features.map(({ label, icon }) => (
          <div
            key={label}
            className="flex min-h-12 items-center justify-center gap-2.5 py-3 text-center text-[9px] font-medium uppercase tracking-[0.12em] text-[#171714] sm:px-4 sm:text-[10px]"
          >
            {icon}
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
