import React from "react";
import { FiHeart, FiMessageCircle, FiPackage, FiSearch, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL } from "../utils/support";

const features = [
  {
    title: "Find your next favorite",
    description:
      "Explore collections by category and gender, then use product filters to narrow down your search.",
    icon: <FiSearch aria-hidden="true" className="h-5 w-5" />,
  },
  {
    title: "Keep your favorites close",
    description:
      "Save pieces to your favorites and come back to them whenever you’re ready.",
    icon: <FiHeart aria-hidden="true" className="h-5 w-5" />,
    to: "/favorites",
  },
  {
    title: "A simpler order experience",
    description:
      "Review your order history and open individual order details from your account.",
    icon: <FiPackage aria-hidden="true" className="h-5 w-5" />,
    to: "/my-orders",
  },
  {
    title: "Reviews from customers",
    description:
      "Share your experience with products you’ve received and help other shoppers decide.",
    icon: <FiStar aria-hidden="true" className="h-5 w-5" />,
  },
];

const FeaturesPage = () => (
  <section className="min-h-[65vh] bg-[#F5F2ED] px-5 py-14 sm:py-20">
    <div className="mx-auto max-w-6xl">
      <header className="mx-auto mb-12 max-w-3xl text-center">
        <p className="luxury-eyebrow mb-3 text-[#A94F38]">Made for your wardrobe</p>
        <h1 className="text-5xl sm:text-6xl">The MegaKart Experience</h1>
        <p className="mt-4 leading-relaxed text-[#77746D]">
          Thoughtful ways to discover pieces, save the ones you love, and keep
          track of your shopping.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {features.map(({ title, description, icon, to }) => (
          <article
            key={title}
            className="border border-[#D8D2C8] bg-[#FAF9F6] p-6 sm:p-8"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#F0EDE7] text-[#414B36]">
              {icon}
            </div>
            <h2 className="text-3xl">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#77746D]">
              {description}
            </p>
            {to && (
              <Link
                className="mt-5 inline-block text-xs font-semibold uppercase tracking-wider text-[#414B36] underline underline-offset-4 hover:text-[#A94F38]"
                to={to}
              >
                Explore
              </Link>
            )}
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-5 border-t border-[#D8D2C8] pt-8 text-center sm:flex-row sm:text-left">
        <div>
          <h2 className="text-3xl">Need a hand?</h2>
          <p className="mt-1 text-sm text-[#77746D]">
            Our team is one email away at{" "}
            <a
              className="font-medium text-[#414B36] underline underline-offset-4 hover:text-[#A94F38]"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </div>
        <Link className="luxury-button" to="/contact-us">
          <FiMessageCircle aria-hidden="true" />
          Contact us
        </Link>
      </div>
    </div>
  </section>
);

export default FeaturesPage;
