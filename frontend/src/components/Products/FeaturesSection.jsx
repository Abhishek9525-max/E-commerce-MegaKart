import React from "react";
import { FiRefreshCw, FiShield, FiTruck } from "react-icons/fi";

const features = [
  {
    title: "Worldwide Express Courier",
    description:
      "Air-freight delivery to 140+ countries within 2 to 4 business days. Free shipping on all orders over $100.",
    icon: <FiTruck aria-hidden="true" className="h-5 w-5 text-[#414B36]" />,
  },
  {
    title: "45-Day Easy Returns",
    description:
      "Complimentary doorstep pickups and prompt exchanges ensure a pristine, uncompromising fit for every garment.",
    icon: <FiRefreshCw aria-hidden="true" className="h-5 w-5 text-[#414B36]" />,
  },
  {
    title: "100% Secure Checkout",
    description:
      "Encrypted payment gateways, trusted credit methods, and certified origin authentication on all designer textiles.",
    icon: <FiShield aria-hidden="true" className="h-5 w-5 text-[#414B36]" />,
  },
];

const FeaturesSection = () => {
  return (
    <section
      aria-label="MegaKart service promises"
      className="border-y border-[#D8D2C8] bg-[#FAF8F5] px-5 py-10 sm:py-12"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {features.map(({ title, description, icon }) => (
          <div
            key={title}
            className="flex min-h-[184px] flex-col items-center rounded-md border border-[#EEEAE4] bg-white px-6 py-5 text-center shadow-[0_2px_10px_rgba(23,23,20,0.025)]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0EDE7]">
              {icon}
            </div>
            <h2 className="mb-2 text-xl text-[#171714]">{title}</h2>
            <p className="max-w-sm text-xs leading-[1.55] text-[#77746D]">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
