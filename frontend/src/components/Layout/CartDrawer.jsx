import React from "react";
import { IoMdClose } from "react-icons/io";
import CartContents from "../Cart/CartContents";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const CartDrawer = ({ drawerOpen, toggleCartDrawer }) => {
  const navigate = useNavigate();
  const { user, guestId } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const userId = user ? user._id : null;
  const itemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) || 0;
  const handleCheckout = () => {
    toggleCartDrawer();
    if (!user) {
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div
      className={`fixed right-0 top-0 z-50 flex h-full w-3/4 flex-col bg-[#F8F7F3] shadow-lg transition-transform duration-300 sm:w-1/2 md:w-[30rem]
      ${drawerOpen ? "translate-x-0" : "translate-x-full "}`}
    >
      <header className="flex items-start justify-between border-b border-[#D8D2C8] bg-white px-5 py-5 sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-display text-[27px] font-medium leading-tight text-[#171714] sm:text-[30px]">
              Your Shopping Bag
            </h2>
            {itemCount > 0 && (
              <span className="rounded-full bg-[#414B36] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-white">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <p className="mt-1 font-sans text-xs text-[#77746D]">
            Handcrafted Biella Wool &amp; Mediterranean Linen
          </p>
        </div>
        <button
          type="button"
          onClick={toggleCartDrawer}
          aria-label="Close shopping bag"
          className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EAE6DF] bg-[#FAF9F6] text-[#414B36] transition-colors hover:border-[#D8D2C8] hover:bg-white"
        >
          <IoMdClose className="h-5 w-5" />
        </button>
      </header>
      {/* Cart content with scrollable area */}
      <div className="flex-grow overflow-y-auto p-4">
        {/* Component for cart Contents */}
        {cart && cart?.products?.length > 0 ? (
          <CartContents cart={cart} userId={userId} guestId={guestId} />
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>
      {/* Checkout button fixed at bottom  */}
      <div className="sticky bottom-0 bg-[#F8F7F3] p-4">
        {cart && cart?.products?.length > 0 && (
          <>
            <button
              onClick={handleCheckout}
              className="w-full rounded-sm bg-[#414B36] py-3 font-semibold text-white transition hover:bg-[#30392A]"
            >
              Checkout
            </button>
            <p className="mt-2 text-center font-sans text-sm tracking-tighter text-gray-500">
              shipping,taxes, and discount codes calculated at checkout.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
