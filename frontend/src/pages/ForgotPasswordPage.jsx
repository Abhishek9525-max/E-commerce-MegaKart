import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import login from "../assets/login.webp";
import { getPostAuthDestination } from "../utils/authRedirect";

const passwordRequirements = [
  { label: "At least 8 characters", test: (password) => password.length >= 8 },
  { label: "One uppercase letter", test: (password) => /[A-Z]/.test(password) },
  { label: "One lowercase letter", test: (password) => /[a-z]/.test(password) },
  { label: "One number", test: (password) => /\d/.test(password) },
];

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({
    new: false,
    confirm: false,
  });
  const [step, setStep] = useState("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const redirect = getPostAuthDestination(
    new URLSearchParams(location.search).get("redirect")
  );
  const loginUrl = `/login?redirect=${encodeURIComponent(redirect)}`;
  const passwordIsStrong = passwordRequirements.every(({ test }) =>
    test(password)
  );

  const handleRequestCode = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/forgot-password`,
        { email: email.trim() }
      );
      setStep("reset");
      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to send a reset code. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (!passwordIsStrong) {
      toast.error("Please strengthen your password using the requirements below.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Your passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/forgot-password/reset`,
        { email: email.trim(), otp, password }
      );
      setStep("success");
      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to reset your password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-120px)] bg-[#F5F2ED] md:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
        <section className="w-full max-w-md border border-[#EAE6DF] bg-white p-7 shadow-[0_8px_30px_rgba(23,23,20,0.05)] sm:p-10">
          <div className="mb-8 text-center">
            <p className="font-display text-xl uppercase tracking-[0.18em] text-[#414B36]">
              MegaKart
            </p>
            <p className="luxury-eyebrow mt-2 text-[#77746D]">Haute Couture</p>
          </div>

          {step === "email" && (
            <>
              <p className="luxury-eyebrow mb-2 text-center text-[#A94F38]">
                Account recovery
              </p>
              <h1 className="text-center text-4xl text-[#171714] sm:text-5xl">
                Forgot password?
              </h1>
              <p className="mb-8 mt-3 text-center text-sm leading-relaxed text-[#77746D]">
                Enter the email address linked to your account and we’ll send
                you a reset code.
              </p>
              <form onSubmit={handleRequestCode}>
                <label
                  htmlFor="reset-email"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#414B36]"
                >
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mb-5 w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 text-sm text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10"
                  placeholder="you@example.com"
                  required
                />
                <button
                  className="luxury-button w-full disabled:cursor-wait disabled:opacity-70"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending code..." : "Send reset code"}
                </button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <p className="luxury-eyebrow mb-2 text-center text-[#A94F38]">
                Check your inbox
              </p>
              <h1 className="text-center text-4xl text-[#171714] sm:text-5xl">
                Reset password
              </h1>
              <p className="mb-7 mt-3 text-center text-sm leading-relaxed text-[#77746D]">
                If an account exists for <strong>{email}</strong>, a six-digit
                code is on its way. The code expires in 10 minutes.
              </p>
              <form onSubmit={handleResetPassword}>
                <label
                  htmlFor="reset-otp"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#414B36]"
                >
                  Email reset code
                </label>
                <input
                  id="reset-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="mb-5 w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 text-sm tracking-[0.3em] text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10"
                  placeholder="000000"
                  required
                />
                <label
                  htmlFor="reset-password"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#414B36]"
                >
                  New password
                </label>
                <span className="relative mb-4 block">
                  <input
                    id="reset-password"
                    type={visiblePasswords.new ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 pr-12 text-sm text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setVisiblePasswords((visible) => ({
                        ...visible,
                        new: !visible.new,
                      }))
                    }
                    aria-label={visiblePasswords.new ? "Hide new password" : "Show new password"}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#77746D] hover:text-[#171714]"
                  >
                    {visiblePasswords.new ? (
                      <FiEyeOff aria-hidden="true" />
                    ) : (
                      <FiEye aria-hidden="true" />
                    )}
                  </button>
                </span>
                <label
                  htmlFor="reset-confirm-password"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#414B36]"
                >
                  Confirm new password
                </label>
                <span className="relative mb-4 block">
                  <input
                    id="reset-confirm-password"
                    type={visiblePasswords.confirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 pr-12 text-sm text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10"
                    placeholder="Enter your password again"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setVisiblePasswords((visible) => ({
                        ...visible,
                        confirm: !visible.confirm,
                      }))
                    }
                    aria-label={visiblePasswords.confirm ? "Hide confirmed password" : "Show confirmed password"}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#77746D] hover:text-[#171714]"
                  >
                    {visiblePasswords.confirm ? (
                      <FiEyeOff aria-hidden="true" />
                    ) : (
                      <FiEye aria-hidden="true" />
                    )}
                  </button>
                </span>
                <div className="mb-6 grid grid-cols-2 gap-x-3 gap-y-2" aria-live="polite">
                  {passwordRequirements.map(({ label, test }) => {
                    const passed = test(password);
                    return (
                      <p
                        key={label}
                        className={`text-[11px] ${
                          passed ? "text-[#414B36]" : "text-[#77746D]"
                        }`}
                      >
                        {passed ? "✓" : "○"} {label}
                      </p>
                    );
                  })}
                </div>
                <button
                  className="luxury-button w-full disabled:cursor-wait disabled:opacity-70"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Resetting password..." : "Reset password"}
                </button>
              </form>
              <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                  }}
                  className="font-medium text-[#414B36] underline underline-offset-4 hover:text-[#A94F38]"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleRequestCode}
                  disabled={isSubmitting}
                  className="font-medium text-[#414B36] underline underline-offset-4 hover:text-[#A94F38] disabled:opacity-60"
                >
                  Resend code
                </button>
              </div>
            </>
          )}

          {step === "success" && (
            <div className="py-5 text-center">
              <p className="luxury-eyebrow mb-2 text-[#A94F38]">All set</p>
              <h1 className="text-4xl text-[#171714] sm:text-5xl">
                Password updated
              </h1>
              <p className="mb-7 mt-3 text-sm leading-relaxed text-[#77746D]">
                Your password has been changed. Sign in with your new password
                to continue.
              </p>
              <Link className="luxury-button w-full" to={loginUrl}>
                Back to sign in
              </Link>
            </div>
          )}

          {step !== "success" && (
            <p className="mt-7 text-center text-sm text-[#77746D]">
              Remembered it?{" "}
              <Link
                to={loginUrl}
                className="font-semibold text-[#414B36] underline underline-offset-4 hover:text-[#A94F38]"
              >
                Back to sign in
              </Link>
            </p>
          )}
        </section>
      </div>
      <div className="relative hidden min-h-[640px] overflow-hidden md:block">
        <img
          src={login}
          alt="A customer browsing fashion on their phone"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171714]/55 via-transparent to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-md text-white lg:bottom-14 lg:left-14">
          <p className="luxury-eyebrow mb-3 text-white/80">A more considered wardrobe</p>
          <p className="font-display text-4xl leading-tight lg:text-5xl">
            Pieces worth coming back for.
          </p>
        </div>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
