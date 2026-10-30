import React, { useEffect } from "react";
import { FiCheck, FiMapPin, FiPackage, FiTruck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";

const formatCurrency = (amount) =>
  `$${Number(amount || 0).toFixed(2)}`;

const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const { checkout } = useSelector((state) => state.checkout);

  useEffect(() => {
    if (checkout?._id) {
      dispatch(clearCart());
      localStorage.removeItem("cart");
    }
  }, [checkout, dispatch]);

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10);
    return orderDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!checkout?._id) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F5F2ED] px-4">
        <p className="text-sm text-[#77746D]">Taking you to your orders...</p>
      </div>
    );
  }

  const shippingAddress = checkout.shippingAddress;

  return (
    <div className="min-h-screen bg-[#F5F2ED] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-4xl">
        <section className="mb-8 rounded-md border border-[#EAE6DF] bg-white px-6 py-10 text-center shadow-[0_2px_12px_rgba(23,23,20,0.04)] sm:px-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF0E7] text-[#414B36]">
            <FiCheck aria-hidden="true" className="h-7 w-7" />
          </div>
          <p className="luxury-eyebrow mb-3 text-[#A94F38]">Order confirmed</p>
          <h1 className="text-4xl text-[#171714] sm:text-5xl">
            Thank you for your order
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#77746D] sm:text-base">
            Your order is in. We’ll take care of the details and get your pieces
            ready for delivery.
          </p>
        </section>

        <section className="overflow-hidden rounded-md border border-[#EAE6DF] bg-white shadow-[0_2px_12px_rgba(23,23,20,0.04)]">
          <div className="grid gap-5 border-b border-[#EAE6DF] bg-[#FAF8F5] p-5 sm:grid-cols-2 sm:p-6">
            <div className="min-w-0">
              <p className="luxury-eyebrow mb-2 text-[#77746D]">Order number</p>
              <p className="break-all font-sans text-sm font-normal leading-relaxed text-[#171714]">
                {checkout._id}
              </p>
              <p className="mt-2 text-xs text-[#77746D]">
                Placed{" "}
                {new Date(checkout.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-start gap-3 sm:justify-end">
              <FiTruck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#414B36]" />
              <div>
                <p className="luxury-eyebrow mb-2 text-[#77746D]">Estimated delivery</p>
                <p className="text-sm font-medium text-[#171714]">
                  {calculateEstimatedDelivery(checkout.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <FiPackage aria-hidden="true" className="h-4 w-4 text-[#414B36]" />
              <h2 className="text-2xl text-[#171714]">Order summary</h2>
            </div>

            <div className="divide-y divide-[#EAE6DF]">
              {checkout.checkoutItems.map((item, index) => (
                <div
                  key={item.productId || `${item.name}-${index}`}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-16 shrink-0 rounded-sm bg-[#F5F2ED] object-cover sm:h-24 sm:w-20"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base text-[#171714]">{item.name}</h3>
                    <p className="mt-1 text-xs text-[#77746D]">
                      {[item.color, item.size].filter(Boolean).join(" · ") || "Standard"}
                    </p>
                    <p className="mt-2 text-xs text-[#77746D]">Qty: {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-[#171714]">
                    {formatCurrency(Number(item.price) * Number(item.quantity))}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-[#EAE6DF] pt-5">
              {checkout.discountAmount > 0 && (
                <>
                  <div className="mb-2 flex justify-between gap-4 text-sm">
                    <span className="text-[#77746D]">Subtotal</span>
                    <span className="text-[#171714]">
                      {formatCurrency(checkout.subtotalPrice)}
                    </span>
                  </div>
                  <div className="mb-3 flex justify-between gap-4 text-sm text-[#414B36]">
                    <span>Promotion ({checkout.discountCode})</span>
                    <span>-{formatCurrency(checkout.discountAmount)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-[#77746D]">Total paid</span>
                <span className="font-semibold text-[#171714]">
                  {formatCurrency(checkout.totalPrice)}
                </span>
              </div>
              <p className="mt-2 text-right text-xs text-[#77746D]">
                Payment via {checkout.paymentMethod || "PayPal"}
              </p>
            </div>
          </div>

          <div className="grid gap-6 border-t border-[#EAE6DF] p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <FiMapPin aria-hidden="true" className="h-4 w-4 text-[#414B36]" />
                <h2 className="text-xl text-[#171714]">Delivery address</h2>
              </div>
              <address className="text-sm not-italic leading-relaxed text-[#77746D]">
                {shippingAddress?.address}
                <br />
                {[shippingAddress?.city, shippingAddress?.postalCode]
                  .filter(Boolean)
                  .join(", ")}
                <br />
                {shippingAddress?.country}
              </address>
            </div>
            <div>
              <p className="mb-3 text-xl text-[#171714]">Payment</p>
              <p className="text-sm text-[#77746D]">
                {checkout.paymentMethod || "PayPal"}
              </p>
              <span className="mt-2 inline-flex rounded-full bg-[#EAF0E7] px-3 py-1 text-xs font-medium text-[#414B36]">
                {checkout.isPaid ? "Paid" : "Payment received"}
              </span>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/my-orders" className="luxury-button min-w-52">
            View my orders
          </Link>
          <Link to="/" className="luxury-button luxury-button-secondary min-w-52">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
