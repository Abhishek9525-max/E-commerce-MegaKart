import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import register from "../assets/register.webp";
import { registerUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { mergeCart } from "../redux/slices/cartSlice";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId ,loading} = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  // Get redirect parameter and check if it's checkout or something
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

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser({ name, email, password }));
    // console.log('user registered',{name,email,password})
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)]">
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-8 md:w-1/2 md:p-12">
        <form className="w-full max-w-md border border-gray-200 bg-white p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <h2 className="font-display text-3xl uppercase tracking-wide">MegaKart</h2>
          </div>
          <h2 className="mb-3 text-center text-4xl">Create an account</h2>
          <p className="mb-7 text-center text-sm text-gray-600">
            Join MegaKart for a more considered shopping experience
          </p>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Name</label>
            <input
              type="email"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 bg-[#F5F2ED] p-3 text-sm"
              placeholder="Enter you Name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 bg-[#F5F2ED] p-3 text-sm"
              placeholder="Enter you email address"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 bg-[#F5F2ED] p-3 text-sm"
              placeholder="Enter your password"
            />
          </div>
          <button
            onClick={handleSubmit}
            type="submit"
            className="w-full bg-[#414B36] p-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[#30392A]"
          >
            {loading ? "loading..." : "Sign Up"}
          </button>
          <p className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="font-medium text-[#414B36] underline underline-offset-4"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="h-full flex flex-col justify-center items-center">
          <img
            src={register}
            alt="Login to Account"
            className="h-[750px] w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
