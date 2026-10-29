import React, { useEffect, useState } from "react";
import { FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import register from "../assets/register.webp";
import {
  registerUser,
  requestRegistrationOtp,
} from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { mergeCart } from "../redux/slices/cartSlice";

const passwordRequirements = [
  { label: "At least 8 characters", test: (password) => password.length >= 8 },
  { label: "One uppercase letter", test: (password) => /[A-Z]/.test(password) },
  { label: "One lowercase letter", test: (password) => /[a-z]/.test(password) },
  { label: "One number", test: (password) => /\d/.test(password) },
];

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId, loading } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");
  const passwordChecks = passwordRequirements.map(({ label, test }) => ({
    label,
    passed: test(password),
  }));
  const isPasswordStrong = passwordChecks.every(({ passed }) => passed);

  useEffect(() => {
    if (user) {
      if (cart?.products.length > 0 && guestId) {
        dispatch(mergeCart({ guestId, user })).then(() => {
          navigate(isCheckoutRedirect ? "/checkout" : "/");
        });
      } else {
        navigate(isCheckoutRedirect ? "/checkout" : "/");
      }
    }
  }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isPasswordStrong) {
      toast.error("Please strengthen your password using the requirements below.");
      return;
    }

    try {
      if (!otpSent) {
        await dispatch(
          requestRegistrationOtp({
            name: name.trim(),
            email: email.trim(),
            password,
          })
        ).unwrap();
        setOtpSent(true);
        toast.success("A verification code was sent to your email.");
        return;
      }

      await dispatch(
        registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
          otp: otp.trim(),
        })
      ).unwrap();
      toast.success("Your email is verified. Welcome to MegaKart.");
    } catch (error) {
      toast.error(error?.message || "Unable to complete registration. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    try {
      await dispatch(
        requestRegistrationOtp({
          name: name.trim(),
          email: email.trim(),
          password,
        })
      ).unwrap();
      setOtp("");
      toast.success("A new verification code was sent to your email.");
    } catch (error) {
      toast.error(error?.message || "Unable to send a verification code.");
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-120px)] bg-[#F5F2ED] md:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md border border-[#EAE6DF] bg-white p-7 shadow-[0_8px_30px_rgba(23,23,20,0.05)] sm:p-10"
        >
          <div className="mb-7 text-center">
            <p className="font-display text-xl uppercase tracking-[0.18em] text-[#414B36]">
              MegaKart
            </p>
            <p className="luxury-eyebrow mt-2 text-[#77746D]">Haute Couture</p>
          </div>
          <p className="luxury-eyebrow mb-2 text-center text-[#A94F38]">Join the edit</p>
          <h1 className="text-center text-4xl text-[#171714] sm:text-5xl">
            Create an account
          </h1>
          <p className="mb-7 mt-3 text-center text-sm leading-relaxed text-[#77746D]">
            Enjoy a more considered shopping experience.
          </p>

          <div className="mb-4">
            <label htmlFor="register-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#414B36]">
              Full name
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 text-sm text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10"
              placeholder="Your name"
              required
              minLength={2}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="register-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#414B36]">
              Email address
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setOtpSent(false);
                setOtp("");
              }}
              className="w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 text-sm text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mb-5">
            <label htmlFor="register-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#414B36]">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 pr-12 text-sm text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#77746D] hover:text-[#171714]"
              >
                {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2" aria-live="polite">
              {passwordChecks.map(({ label, passed }) => (
                <p
                  key={label}
                  className={`flex items-center gap-1.5 text-[11px] ${
                    passed ? "text-[#414B36]" : "text-[#77746D]"
                  }`}
                >
                  <FiCheck
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 shrink-0 ${
                      passed ? "opacity-100" : "opacity-35"
                    }`}
                  />
                  {label}
                </p>
              ))}
            </div>
            {password && !isPasswordStrong && (
              <p className="mt-2 text-xs text-[#A94F38]">
                Add the missing requirements to strengthen your password.
              </p>
            )}
          </div>
          {otpSent && (
            <div className="mb-5">
              <label htmlFor="register-otp" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#414B36]">
                Email verification code
              </label>
              <input
                id="register-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 text-sm tracking-[0.3em] text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10"
                placeholder="000000"
                required
              />
              <p className="mt-2 text-xs text-[#77746D]">
                Enter the 6-digit code sent to {email}. It expires in 10 minutes.
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="mt-2 text-xs font-semibold text-[#414B36] underline underline-offset-4 disabled:cursor-wait disabled:opacity-60"
              >
                Resend code
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={loading || (otpSent && otp.length !== 6)}
            className="luxury-button w-full disabled:cursor-wait disabled:opacity-70"
          >
            {loading
              ? otpSent
                ? "Verifying code..."
                : "Sending code..."
              : otpSent
                ? "Verify code & create account"
                : "Continue with email"}
          </button>
          <p className="mt-6 text-center text-sm text-[#77746D]">
            Already have an account?{" "}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="font-semibold text-[#414B36] underline underline-offset-4 hover:text-[#A94F38]"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
      <div className="relative hidden min-h-[640px] overflow-hidden md:block">
        <img
          src={register}
          alt="Discover the latest MegaKart fashion"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171714]/55 via-transparent to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-md text-white lg:bottom-14 lg:left-14">
          <p className="luxury-eyebrow mb-3 text-white/80">Made for your everyday life</p>
          <p className="font-display text-4xl leading-tight lg:text-5xl">
            Find the pieces that feel like you.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;
