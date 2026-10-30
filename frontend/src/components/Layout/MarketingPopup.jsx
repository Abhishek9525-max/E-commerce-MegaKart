import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FiArrowUpRight,
  FiCheck,
  FiCopy,
  FiMail,
  FiStar,
} from "react-icons/fi";
import { HiArrowRight, HiXMark } from "react-icons/hi2";
import { toast } from "sonner";
import womensCollectionImage from "../../assets/womens-collection.webp";

const MarketingPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promotion, setPromotion] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const closeButtonRef = useRef(null);

  const handleCopyCode = async () => {
    try {
      await window.navigator.clipboard.writeText(promotion.code);
      toast.success(`${promotion.code} copied. Apply it at checkout.`);
    } catch (error) {
      console.error("Unable to copy the promotion code:", error);
      toast.error("Unable to copy the code. Please enter it manually at checkout.");
    }
  };

  const handleSubscribe = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscribe`,
        { email }
      );
      toast.success(response.data.message);
      setEmail("");
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to subscribe right now. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let popupTimer;

    const loadPromotion = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/checkout/promotion`
        );
        if (!isMounted || !response.data.active) return;

        const campaign = response.data;
        const campaignExpiresAt =
          Date.now() + Number(campaign.remainingMilliseconds);
        setPromotion(campaign);
        setExpiresAt(campaignExpiresAt);
        setRemainingSeconds(
          Math.max(0, Math.ceil(Number(campaign.remainingMilliseconds) / 1000))
        );

        popupTimer = window.setTimeout(() => {
          if (!isMounted) return;
          setIsOpen(true);
        }, 700);
      } catch (error) {
        console.error("Unable to load the campaign promotion:", error);
      }
    };

    loadPromotion();
    return () => {
      isMounted = false;
      window.clearTimeout(popupTimer);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !expiresAt) return undefined;

    const updateCountdown = () => {
      setRemainingSeconds(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171714]/70 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-popup-title"
        aria-describedby="campaign-popup-description"
        className="relative grid max-h-[calc(100dvh-24px)] w-full max-w-6xl grid-cols-1 overflow-y-auto rounded-xl border border-[#C9C0AE] bg-[#FAF9F6] shadow-[0_24px_100px_rgba(0,0,0,0.42)] sm:max-h-[min(760px,calc(100dvh-40px))] sm:grid-cols-[0.88fr_1.12fr] sm:overflow-hidden"
      >
        <div className="relative min-h-[205px] overflow-hidden sm:min-h-[560px]">
          <img
            src={womensCollectionImage}
            alt="Discover the latest MegaKart fashion collection"
            className="absolute inset-0 h-full w-full object-cover object-[center_38%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#181911]/55 via-[#181911]/10 to-[#171714]/75" />
          <div className="absolute inset-0 flex flex-col justify-between p-5 text-[#F5F2ED] sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-3">
              <span className="luxury-eyebrow inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#171714]/35 px-3 py-2 text-[9px] tracking-[0.12em] text-white sm:px-4 sm:text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4B65C]" />
                Exclusive · MegaKart edit
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B28B35] font-display text-sm font-semibold italic text-white shadow-lg sm:h-11 sm:w-11 sm:text-base">
                MK
              </span>
            </div>
            <div className="py-6 text-center">
              <p className="font-display text-6xl font-medium italic leading-none tracking-[0.12em] text-white drop-shadow-md sm:text-8xl">
                MK
              </p>
              <p className="luxury-eyebrow mt-3 text-[9px] tracking-[0.3em] text-[#E2CB81] sm:text-[10px]">
                MEGAKART
              </p>
            </div>
            <div>
              <p className="luxury-eyebrow mb-2 flex items-center gap-2 text-[9px] text-[#E2CB81] sm:text-[10px]">
                <span className="h-px w-6 bg-[#E2CB81]" />
                A wardrobe, thoughtfully found
              </p>
              <p className="max-w-sm font-display text-lg italic leading-snug text-white sm:text-2xl">
                “Find the pieces that feel unmistakably you.”
              </p>
            </div>
          </div>
        </div>
        <div className="relative flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 lg:px-11 lg:py-10">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Dismiss promotion"
            className="absolute right-4 top-4 inline-flex min-h-10 items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-[#8B887F] transition-colors hover:text-[#171714] sm:right-6 sm:top-5"
          >
            Dismiss <HiXMark aria-hidden="true" className="h-4 w-4" />
          </button>

          <div className="mb-5 mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-[#E8D9AF] bg-[#F7F1E2] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E6D25] sm:mb-6 sm:mt-3 sm:px-4 sm:text-[10px]">
            <FiStar aria-hidden="true" className="h-3 w-3" />
            A private invitation
          </div>
          <h2
            id="campaign-popup-title"
            className="max-w-xl pr-2 font-display text-[34px] leading-[1.02] tracking-[-0.025em] text-[#292A21] sm:text-[42px] lg:text-[50px]"
          >
            A more considered
            <br className="hidden sm:block" /> wardrobe{" "}
            <span className="italic text-[#A94F38]">
              {promotion.discountPercent}% off starts here.
            </span>
          </h2>
          <p
            id="campaign-popup-description"
            className="mt-3 max-w-xl text-xs leading-relaxed text-[#6F6D65] sm:mt-4 sm:text-sm"
          >
            Enjoy {promotion.discountPercent}% off your order with our private
            passcode. Your invitation expires when this timer ends.
          </p>

          <div className="mt-5 border border-[#E9E5DD] bg-white/70 p-3.5 sm:mt-6 sm:p-4">
            <div className="flex items-center justify-between gap-3 border-b border-[#EEEAE3] pb-2.5">
              <span
                className={`inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.1em] sm:text-[10px] ${
                  remainingSeconds > 0 ? "text-[#52745C]" : "text-[#A94F38]"
                }`}
                aria-live="polite"
              >
                {remainingSeconds > 0 ? (
                  <FiCheck aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                  <HiXMark aria-hidden="true" className="h-3.5 w-3.5" />
                )}
                {remainingSeconds > 0 ? "Invitation active" : "Offer expired"}
              </span>
              <span className="text-[8px] uppercase tracking-[0.08em] text-[#9A978E] sm:text-[9px]">
                {remainingSeconds > 0 ? "Offer ends in" : "This offer has ended"}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3">
              {[
                ["Hours", Math.floor(remainingSeconds / 3600)],
                ["Minutes", Math.floor((remainingSeconds % 3600) / 60)],
                ["Seconds", remainingSeconds % 60],
              ].map(([label, value], index) => (
                <React.Fragment key={label}>
                  {index > 0 && (
                    <span aria-hidden="true" className="text-sm text-[#C2BDB3]">
                      :
                    </span>
                  )}
                  <div className="flex min-w-[58px] flex-col items-center border border-[#E9E5DD] bg-[#FAF9F6] px-2 py-2 sm:min-w-[70px] sm:py-2.5">
                    <span className="font-display text-2xl leading-none text-[#292A21] sm:text-3xl">
                      {String(value).padStart(2, "0")}
                    </span>
                    <span className="mt-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-[#8B887F] sm:text-[8px]">
                      {label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border border-[#E8D9AF] bg-[#F7F1E2] px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#414B36] text-[#E8D9AF]">
                  <FiStar aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#A28A57]">
                    Your private passcode
                  </p>
                  <p className="font-display text-lg font-semibold tracking-[0.12em] text-[#292A21]">
                    {promotion.code}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                disabled={remainingSeconds === 0}
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 border border-[#E4E0D9] bg-white px-2.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#5E5B54] transition-colors hover:border-[#414B36] hover:text-[#414B36] disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-[9px]"
              >
                <FiCopy aria-hidden="true" className="h-3.5 w-3.5" />
                Copy code
              </button>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="mt-4 sm:mt-5">
            <label
              htmlFor="campaign-email"
              className="mb-2 flex items-center justify-between gap-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#77746D] sm:text-[9px]"
            >
              Enter your email to join the edit
              <span className="normal-case tracking-normal text-[#8B887F]">
                Newsletter signup
              </span>
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="campaign-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                autoComplete="email"
                required
                className="min-h-11 min-w-0 flex-1 border border-[#E4E0D9] bg-white px-3 text-sm text-[#292A21] placeholder:text-[#AAA69D] focus:border-[#414B36] focus:outline-none sm:min-h-12"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="luxury-button min-h-11 min-w-[158px] px-4 text-[10px] disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-12"
              >
                {isSubmitting ? "Joining..." : "Join the edit"}
                {!isSubmitting && (
                  <HiArrowRight aria-hidden="true" className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#E9E5DD] pt-3 sm:mt-5 sm:pt-4">
            {["New arrivals", "Thoughtful edits", "Private offers"].map(
              (benefit) => (
                <div
                  key={benefit}
                  className="flex items-center justify-center gap-1.5 text-center text-[8px] leading-tight text-[#77746D] sm:text-[9px]"
                >
                  <FiCheck
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 text-[#52745C]"
                  />
                  {benefit}
                </div>
              )
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mx-auto mt-4 inline-flex min-h-10 items-center gap-1 border-b border-[#BDB9B0] text-[9px] text-[#88857D] transition-colors hover:border-[#414B36] hover:text-[#414B36]"
          >
            No thank you, I&apos;ll keep browsing
            <FiArrowUpRight aria-hidden="true" className="h-3 w-3" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default MarketingPopup;
