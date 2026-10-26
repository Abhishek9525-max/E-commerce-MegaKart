import React from "react";
import { RiDeleteBin3Line } from "react-icons/ri";
import { useDispatch } from "react-redux";
import {
  removeFromCart,
  updateCartItemQuantity,
} from "../../redux/slices/cartSlice";

const CartContents = ({ cart, userId, guestId }) => {
  const dispatch = useDispatch();

  // Handle adding or substracting to cart
  const handleAddToCart = (productId, delta, quantity, size, color) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      dispatch(
        updateCartItemQuantity({
          productId,
          quantity: newQuantity,
          guestId,
          userId,
          size,
          color,
        })
      );
    }
  };

  const handleRemoveFromCart = (productId, size, color) => {
    dispatch(removeFromCart({ productId, guestId, userId, size, color }));
  };

  return (
    <div>
      {cart.products.map((product, index) => (
        <div
          key={index}
          className="flex items-start justify-between border-b border-[#EAE6DF] py-5"
        >
          <div className="flex items-start">
            <div className="mr-4 h-24 w-20 shrink-0 overflow-hidden rounded bg-[#EAE4D9]">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-[#171714]">
                {product.name}
              </h3>
              <p className="font-sans text-xs font-light uppercase tracking-wide text-gray-500">
                SIZE: {product.size} | COLOR: {product.color}
              </p>
              <div className="mt-3 inline-flex h-9 items-center justify-between gap-1 rounded-md border border-[#D8D2C8] bg-white px-1 shadow-[0_1px_3px_rgba(23,23,20,0.06)]">
                <button
                  type="button"
                  onClick={() =>
                    handleAddToCart(
                      product.productId,
                      -1,
                      product.quantity,
                      product.size,
                      product.color
                    )
                  }
                  aria-label={`Decrease quantity of ${product.name}`}
                  className="flex h-7 w-7 items-center justify-center text-lg text-[#77746D] transition-colors hover:text-[#171714]"
                >
                  −
                </button>
                <span className="min-w-5 text-center font-sans text-sm font-semibold tabular-nums text-[#171714]">
                  {product.quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleAddToCart(
                      product.productId,
                      1,
                      product.quantity,
                      product.size,
                      product.color
                    )
                  }
                  aria-label={`Increase quantity of ${product.name}`}
                  className="flex h-7 w-7 items-center justify-center text-lg text-[#77746D] transition-colors hover:text-[#171714]"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div>
            <p className="font-sans">$ {product.price.toLocaleString()}</p>
            <button
              type="button"
              onClick={() =>
                handleRemoveFromCart(
                  product.productId,
                  product.size,
                  product.color
                )
              }
              className="mt-2 inline-flex items-center gap-1.5 font-sans text-sm text-[#A94F38] underline underline-offset-2 transition-colors hover:text-[#803A2A]"
            >
              <RiDeleteBin3Line className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartContents;
