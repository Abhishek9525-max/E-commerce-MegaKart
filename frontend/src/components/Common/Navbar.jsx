import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from "react-icons/hi2";
import SearchBar from "./SearchBar";
import CartDrawer from "../Layout/CartDrawer";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";

const navigationItems = [
  { label: "Home", to: "/" },
  { label: "Men", to: "/collection/all?gender=Men" },
  { label: "Women", to: "/collection/all?gender=Women" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Collections", to: "/collection/all" },
];

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const cartItemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) || 0;

  const closeNavDrawer = () => setNavDrawerOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-[#D8D2C8] bg-[#F0EDE7]">
        <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-6 px-5 py-3 lg:px-10">
          <Link to="/" className="shrink-0 leading-none text-[#171714]">
            <span className="block font-display text-[29px] uppercase tracking-[0.04em] sm:text-[32px]">
              MegaKart
            </span>
            <span className="mt-1 block text-[8px] uppercase tracking-[0.32em] text-[#77746D]">
              Haute Couture
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navigationItems.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `border-b pb-2 pt-2 text-[12px] font-medium uppercase tracking-[0.06em] transition-colors ${
                    isActive
                      ? "border-[#414B36] text-[#171714]"
                      : "border-transparent text-[#33342E] hover:border-[#414B36] hover:text-[#171714]"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden lg:block">
              <SearchBar />
            </div>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="hidden text-xs font-semibold uppercase tracking-wider text-[#414B36] sm:block"
              >
                Admin
              </Link>
            )}
            <Link
              to="/profile"
              aria-label="Your account"
              className="hidden text-[#171714] transition-colors hover:text-[#77746D] sm:block"
            >
              <HiOutlineUser className="h-[21px] w-[21px]" />
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={`Open shopping bag${cartItemCount ? `, ${cartItemCount} items` : ""}`}
              className="relative text-[#171714] transition-colors hover:text-[#77746D]"
            >
              <HiOutlineShoppingBag className="h-[22px] w-[22px]" />
              {cartItemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#A94F38] px-1 text-[10px] font-semibold text-white">
                  {cartItemCount}
                </span>
              )}
            </button>
            <div className="lg:hidden">
              <SearchBar />
            </div>
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={navDrawerOpen}
              onClick={() => setNavDrawerOpen(true)}
              className="text-[#171714] lg:hidden"
            >
              <HiBars3BottomRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      <CartDrawer
        drawerOpen={drawerOpen}
        toggleCartDrawer={() => setDrawerOpen(false)}
      />

      <div
        className={`fixed inset-0 z-50 bg-black/30 transition-opacity lg:hidden ${
          navDrawerOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={closeNavDrawer}
      >
        <aside
          className={`absolute right-0 top-0 h-full w-[min(82vw,360px)] bg-[#F5F2ED] p-6 shadow-xl transition-transform duration-300 ${
            navDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
          aria-label="Navigation menu"
        >
          <div className="mb-8 flex items-center justify-between border-b border-[#D8D2C8] pb-5">
            <span className="font-display text-2xl uppercase tracking-wide">
              MegaKart
            </span>
            <button
              type="button"
              onClick={closeNavDrawer}
              aria-label="Close navigation menu"
              className="text-[#77746D]"
            >
              <IoMdClose className="h-6 w-6" />
            </button>
          </div>
          <nav className="space-y-1">
            {navigationItems.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                onClick={closeNavDrawer}
                className="block border-b border-[#D8D2C8] py-4 text-xs font-medium uppercase tracking-[0.12em] text-[#33342E]"
              >
                {label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={closeNavDrawer}
              className="block border-b border-[#D8D2C8] py-4 text-xs font-medium uppercase tracking-[0.12em] text-[#33342E]"
            >
              My Account
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
