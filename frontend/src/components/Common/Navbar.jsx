import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from "react-icons/hi2";
import SearchBar from "./SearchBar";
import CartDrawer from "../Layout/CartDrawer";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites } from "../../redux/slices/favoriteSlice";

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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { products: favoriteProducts, status: favoritesStatus, error: favoritesError } =
    useSelector((state) => state.favorites);
  const { pathname, search } = useLocation();
  const cartItemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) || 0;
  const gender = new URLSearchParams(search).get("gender")?.toLowerCase();
  const isCollectionRoute = pathname.startsWith("/collection/");

  useEffect(() => {
    if (user?._id) dispatch(fetchFavorites(user._id));
    setProfileMenuOpen(false);
  }, [dispatch, user?._id]);

  const isNavigationItemActive = (label) => {
    if (label === "Home") return pathname === "/";
    if (label === "Men") return isCollectionRoute && gender === "men";
    if (label === "Women") return isCollectionRoute && gender === "women";
    if (label === "Collections") return isCollectionRoute && !gender;
    if (label === "New Arrivals") return pathname === "/new-arrivals";
    return false;
  };

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
              <Link
                key={label}
                to={to}
                aria-current={isNavigationItemActive(label) ? "page" : undefined}
                className={`border-b pb-2 pt-2 text-[12px] font-medium uppercase tracking-[0.06em] transition-colors ${
                  isNavigationItemActive(label)
                    ? "border-[#414B36] text-[#171714]"
                    : "border-transparent text-[#33342E] hover:border-[#414B36] hover:text-[#171714]"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-3 lg:gap-5">
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
            <div
              className="group relative hidden sm:block"
              onMouseEnter={() => setProfileMenuOpen(true)}
              onMouseLeave={() => setProfileMenuOpen(false)}
              onFocus={() => setProfileMenuOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setProfileMenuOpen(false);
                }
              }}
            >
              <button
                type="button"
                aria-label={user ? `Go to your profile, ${user.name}` : "Sign in"}
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                onClick={() => navigate(user ? "/profile" : "/login")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#171714] transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#414B36]"
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt=""
                    className="h-8 w-8 rounded-full border border-[#D8D2C8] object-cover"
                  />
                ) : (
                  <HiOutlineUser className="h-[21px] w-[21px]" />
                )}
              </button>
              <div
                className={`absolute right-0 top-full z-50 w-80 origin-top-right pt-3 transition duration-150 ${
                  profileMenuOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-1 opacity-0"
                }`}
              >
                <div className="overflow-hidden rounded-md border border-[#EAE6DF] bg-white shadow-[0_12px_36px_rgba(23,23,20,0.16)]">
                  <div className="border-b border-[#EAE6DF] bg-[#FAF8F5] px-4 py-3">
                    <p className="luxury-eyebrow text-[#77746D]">
                      {user ? `Hello, ${user.name}` : "Your account"}
                    </p>
                    <Link
                      to={user ? "/profile" : "/login"}
                      onClick={() => setProfileMenuOpen(false)}
                      className="mt-1 inline-block text-xs font-semibold uppercase tracking-wide text-[#414B36] hover:text-[#A94F38]"
                    >
                      {user ? "My Account" : "Sign in"}
                    </Link>
                  </div>
                  <div className="px-4 py-3">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#171714]">
                        Favorite pieces
                      </p>
                      <Link
                        to={user ? "/favorites" : "/login"}
                        onClick={() => setProfileMenuOpen(false)}
                        className="text-[10px] font-semibold uppercase tracking-wide text-[#A94F38] hover:underline"
                      >
                        View all{favoriteProducts.length > 0 ? ` (${favoriteProducts.length})` : ""}
                      </Link>
                    </div>
                    {!user ? (
                      <p className="text-xs leading-relaxed text-[#77746D]">
                        Sign in to view and save your favorite products.
                      </p>
                    ) : favoritesStatus === "loading" ? (
                      <p className="text-xs text-[#77746D]" aria-live="polite">
                        Loading favorites...
                      </p>
                    ) : favoritesStatus === "failed" ? (
                      <p role="alert" className="text-xs text-[#A94F38]">
                        {favoritesError || "Unable to load favorites."}
                      </p>
                    ) : favoriteProducts.length > 0 ? (
                      <ul className="max-h-64 space-y-3 overflow-y-auto">
                        {favoriteProducts.slice(0, 4).map((product) => (
                          <li key={product._id}>
                            <Link
                              to={`/product/${product._id}`}
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-3"
                            >
                              {product.images?.[0]?.url ? (
                                <img
                                  src={product.images[0].url}
                                  alt=""
                                  className="h-14 w-11 shrink-0 bg-[#F0EDE7] object-cover"
                                />
                              ) : (
                                <span className="flex h-14 w-11 shrink-0 items-center justify-center bg-[#F0EDE7]">
                                  <HiOutlineUser
                                    aria-hidden="true"
                                    className="h-5 w-5 text-[#77746D]"
                                  />
                                </span>
                              )}
                              <span className="line-clamp-2 text-xs text-[#33342E] hover:text-[#A94F38]">
                                {product.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs leading-relaxed text-[#77746D]">
                        No favorites saved yet. Tap the heart on a product to add it here.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={`Open shopping bag${cartItemCount ? `, ${cartItemCount} items` : ""}`}
              className="relative flex h-9 w-9 items-center justify-center text-[#171714] transition-colors hover:text-[#77746D]"
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
              className="flex h-9 w-9 items-center justify-center text-[#171714] lg:hidden"
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
            <Link
              to="/favorites"
              onClick={closeNavDrawer}
              className="block border-b border-[#D8D2C8] py-4 text-xs font-medium uppercase tracking-[0.12em] text-[#33342E]"
            >
              My Favorites
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
