import React, { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import login from "../assets/login.webp";
import { loginUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { mergeCart } from "../redux/slices/cartSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId, loading } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

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
    try {
      await dispatch(loginUser({ email: email.trim(), password })).unwrap();
      toast.success("Welcome back.");
    } catch (error) {
      toast.error(error?.message || "Unable to sign in. Please check your details.");
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-120px)] bg-[#F5F2ED] md:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-10 sm:px-8 sm:py-14 lg:px-14">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md border border-[#EAE6DF] bg-white p-7 shadow-[0_8px_30px_rgba(23,23,20,0.05)] sm:p-10"
        >
          <div className="mb-8 text-center">
            <p className="font-display text-xl uppercase tracking-[0.18em] text-[#414B36]">
              MegaKart
            </p>
            <p className="luxury-eyebrow mt-2 text-[#77746D]">Haute Couture</p>
          </div>
          <p className="luxury-eyebrow mb-2 text-center text-[#A94F38]">Welcome back</p>
          <h1 className="text-center text-4xl text-[#171714] sm:text-5xl">
            Sign in
          </h1>
          <p className="mb-8 mt-3 text-center text-sm leading-relaxed text-[#77746D]">
            Sign in to continue to your account and saved pieces.
          </p>

          <div className="mb-5">
            <label htmlFor="login-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#414B36]">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 text-sm text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mb-7">
            <label htmlFor="login-password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#414B36]">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-[#D8D2C8] bg-[#FAF9F6] px-4 py-3 pr-12 text-sm text-[#171714] outline-none transition focus:border-[#414B36] focus:ring-2 focus:ring-[#414B36]/10"
                placeholder="Enter your password"
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
          </div>
          <button
            type="submit"
            disabled={loading}
            className="luxury-button w-full disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="mt-7 text-center text-sm text-[#77746D]">
            New to MegaKart?{" "}
            <Link
              to={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="font-semibold text-[#414B36] underline underline-offset-4 hover:text-[#A94F38]"
            >
              Create an account
            </Link>
          </p>
        </form>
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

export default Login;
