import React from "react";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL } from "../utils/support";

const questions = [
  {
    question: "How do I place an order?",
    answer:
      "Browse a collection, choose a piece and add it to your bag. When you’re ready, open your bag and follow the checkout steps.",
  },
  {
    question: "Where can I check my order status?",
    answer:
      "Sign in to your account and visit My Orders to see your orders and open their details. If you need help with a specific order, email us with its order number.",
  },
  {
    question: "Can I change or cancel an order?",
    answer:
      "Email us as soon as possible with your order number and what you’d like to change. Our team will confirm what options are available for your order.",
  },
  {
    question: "Which payment methods can I use?",
    answer:
      "Available payment options are shown during checkout before you place your order.",
  },
  {
    question: "How do I save a product to my favorites?",
    answer:
      "Sign in to your account and use the favorite button on a product. You can find your saved pieces on the Favorites page.",
  },
  {
    question: "Who can leave a product review?",
    answer:
      "Reviews are available to signed-in customers who have received the product in an order marked Delivered.",
  },
  {
    question: "Where can I ask about delivery or returns?",
    answer:
      "Email our team with your question and order number, if you have one. We’ll confirm the details that apply to your order.",
  },
];

const FaqPage = () => (
  <section className="min-h-[65vh] bg-[#F5F2ED] px-5 py-14 sm:py-20">
    <div className="mx-auto max-w-4xl">
      <header className="mb-12 text-center">
        <p className="luxury-eyebrow mb-3 text-[#A94F38]">A little guidance</p>
        <h1 className="text-5xl sm:text-6xl">Frequently Asked Questions</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[#77746D]">
          Find answers about shopping, your account, and your orders.
        </p>
      </header>

      <div className="divide-y divide-[#D8D2C8] border-y border-[#D8D2C8] bg-[#FAF9F6] px-5 sm:px-8">
        {questions.map(({ question, answer }) => (
          <details key={question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg text-[#171714] marker:hidden">
              <span>{question}</span>
              <span
                aria-hidden="true"
                className="font-sans text-2xl font-light text-[#414B36] transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="max-w-3xl pt-3 text-sm leading-relaxed text-[#77746D]">
              {answer}
            </p>
          </details>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-[#77746D]">
        Still have a question?{" "}
        <Link
          className="font-medium text-[#414B36] underline underline-offset-4 hover:text-[#A94F38]"
          to="/contact-us"
        >
          Contact us
        </Link>{" "}
        or email{" "}
        <a
          className="font-medium text-[#414B36] underline underline-offset-4 hover:text-[#A94F38]"
          href={`mailto:${SUPPORT_EMAIL}`}
        >
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </div>
  </section>
);

export default FaqPage;
