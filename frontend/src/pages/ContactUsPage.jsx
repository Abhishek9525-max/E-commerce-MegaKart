import React from "react";
import { FiMail } from "react-icons/fi";
import { SUPPORT_EMAIL } from "../utils/support";

const ContactUsPage = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const orderNumber = formData.get("orderNumber");
    const message = formData.get("message");
    const subject = orderNumber
      ? `MegaKart support - order ${orderNumber}`
      : "MegaKart support request";
    const body = [
      `Name: ${name}`,
      `Reply email: ${email}`,
      orderNumber ? `Order number: ${orderNumber}` : null,
      "",
      message,
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="min-h-[65vh] bg-[#F5F2ED] px-5 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <p className="luxury-eyebrow mb-3 text-[#A94F38]">We’re here to help</p>
          <h1 className="text-5xl sm:text-6xl">Contact Us</h1>
          <p className="mt-4 leading-relaxed text-[#77746D]">
            Have a question about a piece or an order? Send us a note and our
            team will be happy to help.
          </p>
        </header>

        <div className="grid gap-8 rounded-md border border-[#D8D2C8] bg-[#FAF9F6] p-6 sm:p-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
          <aside className="flex flex-col justify-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0EDE7] text-[#414B36]">
              <FiMail aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="text-3xl">Email our team</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#77746D]">
              The quickest way to reach us is by email. For order questions,
              include your order number so we can help you faster.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-5 w-fit font-medium text-[#414B36] underline decoration-[#D8D2C8] underline-offset-4 transition-colors hover:text-[#A94F38]"
            >
              {SUPPORT_EMAIL}
            </a>
          </aside>

          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <label className="grid gap-2 text-sm font-medium text-[#33342E]">
              Your name
              <input
                autoComplete="name"
                className="border border-[#D8D2C8] bg-white px-4 py-3 text-[#171714]"
                name="name"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#33342E]">
              Your email
              <input
                autoComplete="email"
                className="border border-[#D8D2C8] bg-white px-4 py-3 text-[#171714]"
                name="email"
                type="email"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#33342E] sm:col-span-2">
              Order number <span className="font-normal text-[#77746D]">(optional)</span>
              <input
                className="border border-[#D8D2C8] bg-white px-4 py-3 text-[#171714]"
                name="orderNumber"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#33342E] sm:col-span-2">
              How can we help?
              <textarea
                className="min-h-36 resize-y border border-[#D8D2C8] bg-white px-4 py-3 text-[#171714]"
                name="message"
                required
                rows={5}
              />
            </label>
            <div className="sm:col-span-2">
              <button className="luxury-button" type="submit">
                Prepare email
              </button>
              <p className="mt-3 text-xs leading-relaxed text-[#77746D]">
                This opens your email app with your message addressed to{" "}
                {SUPPORT_EMAIL}.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUsPage;
