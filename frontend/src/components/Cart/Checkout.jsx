import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PayPalButton from "./PayPalButton";
import { useDispatch, useSelector } from "react-redux";
import { createCheckout } from "../../redux/slices/checkoutSlice";
import axios from "axios";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [checkoutId, setCheckoutId] = useState(null);
  const [checkoutTotal, setCheckoutTotal] = useState(null);
  const [checkoutSubtotal, setCheckoutSubtotal] = useState(null);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [promotionCode, setPromotionCode] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState("");
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [orderConfirmationFailed, setOrderConfirmationFailed] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // Ensure cart is loaded before proceeding

  useEffect(() => {
    if (!cart || !cart.products || cart.products.length === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    setCheckoutNotice("");
    if (cart && cart.products.length > 0) {
      try {
        const checkout = await dispatch(
          createCheckout({
            checkoutItems: cart.products,
            shippingAddress,
            paymentMethod: "Paypal",
            totalPrice: cart.totalPrice,
            promotionCode,
          })
        ).unwrap();
        setCheckoutId(checkout._id);
        setCheckoutTotal(checkout.totalPrice);
        setCheckoutSubtotal(checkout.subtotalPrice);
        setCheckoutDiscount(checkout.discountAmount || 0);
      } catch (requestError) {
        const message =
          requestError?.message ||
          requestError?.payload?.message ||
          requestError?.data?.message ||
          requestError?.error?.message;
        const notice =
          message && message !== "Server Error"
            ? message
            : "Unable to prepare checkout. Please try again.";
        setCheckoutNotice(notice);
        toast.error(notice, { duration: 6000 });
      }
    }
  };

  const handlePaymentSuccess = async (details) => {
    setPaymentSucceeded(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
        { paymentStatus: "paid", paymentDetails: details });

      await handleFinalizeCheckout(checkoutId); // Finalize checkout if payment is success
    } catch (error) {
      console.error(error);
      setOrderConfirmationFailed(true);
      toast.warning(
        "Payment received, but we couldn't confirm your order. Please contact support."
      );
    }
  };

  const handleFinalizeCheckout = async (checkoutId) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/checkout/${checkoutId}/finalize`,
        {});
      if (response.data?.emailNotifications?.customer === false) {
        toast.warning("Your order is confirmed, but we could not send the confirmation email.");
      }
      navigate("/order-confirmation");
    } catch (error) {
      console.error(error);
      setOrderConfirmationFailed(true);
      toast.warning(
        "Payment received, but we couldn't confirm your order. Please contact support."
      );
    }
  };

  if (loading) return <p>Loading Cart...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <p>Your cart is empty</p>;
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-6 tracking-tighter sm:gap-8 sm:px-6 sm:py-10 lg:grid-cols-2">
      {/* Left Section */}
      <div className="min-w-0 rounded-lg bg-white p-4 sm:p-6">
        <h2 className="text-2xl uppercase mb-6">Checkout</h2>
        <form onSubmit={handleCreateCheckout}>
          <h3 className="text-lg mb-4">contact Details</h3>
          <div className="mb-4">
            <label className="block text-gray-700 ">Email</label>
            <input
              type="email"
              value={user ? user.email : " "}
              className="w-full p-2 border rounded"
              disabled
            />
          </div>
          <h3 className="text-lg mb-4">Delivery</h3>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-gray-700 ">First Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                required
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    firstName: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-gray-700 ">Last Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                required
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    lastName: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-gray-700 ">City</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                required
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-gray-700 ">Postal Code</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                required
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    postalCode: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Country</label>
            <input
              type="text"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone</label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  phone: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="checkout-promotion-code" className="mb-1 block text-gray-700">
              Promotion code
            </label>
            <input
              id="checkout-promotion-code"
              type="text"
              value={promotionCode}
              onChange={(event) => setPromotionCode(event.target.value)}
              placeholder="Enter MEGA15"
              autoComplete="off"
              disabled={Boolean(checkoutId)}
              className="w-full rounded border p-2 uppercase tracking-wider disabled:bg-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Apply MEGA15 for 15% off before the offer timer expires.
            </p>
            {checkoutNotice && (
              <p
                role="alert"
                className="mt-2 rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
              >
                {checkoutNotice}
              </p>
            )}
          </div>
          <div className="mt-6">
            {!checkoutId ? (
              <button
                type="submit"
                className="w-full bg-black text-white text-wrap py-3 rounded"
              >
                {" "}
                Continue to Payment
              </button>
            ) : (
              <div>
                <h3 className="text-lg mb-4">Pay with PayPal</h3>
                {paymentSucceeded ? (
                  <p className="text-sm text-gray-600" aria-live="polite">
                    {orderConfirmationFailed
                      ? "Your payment was received. Please check My Orders or contact support if your order is not listed."
                      : "Payment received. Confirming your order..."}
                  </p>
                ) : (
                  <PayPalButton
                    amount={checkoutTotal}
                    onSuccess={handlePaymentSuccess}
                    onError={() => toast.error("Payment failed. Please try again.")}
                  />
                )}
              </div>
            )}
          </div>
        </form>
      </div>
      {/* Right Section  */}
      <div className="min-w-0 rounded-lg bg-gray-50 p-4 sm:p-6">
        <h3 className="text-lg mb-4">Order Summary</h3>
        <div className="border-t py-4 mb-4">
          {cart.products.map((product, index) => (
            <div
              key={index}
              className="flex min-w-0 items-center justify-between gap-2 border-b py-2"
            >
              <div className="flex min-w-0 items-start">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-24 object-cover mr-4"
                />
                <div className="min-w-0">
                  <h3 className="break-words text-sm sm:text-base">{product.name}</h3>
                  <p className="text-gray-500">Size: {product.size}</p>
                  <p className="text-gray-500">Color: {product.color}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl text-[#A94F38]">
                  ${(Number(product.price) * product.quantity).toFixed(2)}
                </p>
                {Number(product.originalPrice) > Number(product.price) && (
                  <p className="text-sm text-[#99958c] line-through">
                    ${(Number(product.originalPrice) * product.quantity).toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-gray-500">Qty: {product.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center text-lg mb-4">
          <p>Subtotal</p>
          <p>
            ${Number(checkoutSubtotal ?? cart.totalPrice ?? 0).toFixed(2)}
          </p>
        </div>
        {checkoutDiscount > 0 && (
          <div className="mb-4 flex items-center justify-between gap-3 text-sm text-[#414B36]">
            <p>
              Promotion ({promotionCode.trim().toUpperCase() || "MEGA15"})
            </p>
            <p>−${Number(checkoutDiscount).toFixed(2)}</p>
          </div>
        )}
        <div className="flex justify-between items-center text-lg">
          <p>Shipping</p>
          <p>Free</p>
        </div>
        <div className="flex justify-between items-center text-lg mt-4 border-t pt-4">
          <p>Total</p>
          <p>${Number(checkoutTotal ?? cart.totalPrice ?? 0).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
