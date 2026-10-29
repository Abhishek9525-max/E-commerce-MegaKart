import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { fetchAllOrders, updateOrderStatus } from "../../redux/slices/adminOrderSlice";

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useSelector((state) => state.auth);
  const { orders, loading, error } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      dispatch(fetchAllOrders());
    }
  }, [dispatch, user, navigate]);

  const handleStatusChange = (orderId, status) => {
    dispatch(updateOrderStatus({ id: orderId, status }));
  };

  if(loading) return <p className="p-8 text-sm text-[#77766e]">Loading orders…</p>
  if(error) return <p role="alert" className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Unable to load orders: {error}</p>

  const statusStyles = {
    Processing: "bg-amber-50 text-amber-700",
    Shipped: "bg-sky-50 text-sky-700",
    Delivered: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-rose-50 text-rose-700",
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    if (!normalizedSearchQuery) return true;

    const searchableValues = [
      order._id,
      order.user?.name,
      order.user?.email,
      order.status,
      order.paymentStatus,
      order.paymentMethod,
      order.shippingAddress?.address,
      order.shippingAddress?.city,
      order.shippingAddress?.postalCode,
      order.shippingAddress?.country,
      ...(order.orderItems ?? []).map((item) => item.name),
    ];

    return searchableValues.some((value) =>
      String(value ?? "").toLowerCase().includes(normalizedSearchQuery)
    );
  });

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <header className="flex flex-col justify-between gap-4 border-b border-[#e7e4dc] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#85847c]">Fulfillment</p>
          <h1 className="text-3xl font-medium text-[#292b25] sm:text-4xl">Orders &amp; Fulfillment</h1>
          <p className="mt-2 text-sm text-[#77766e]">Track orders and keep each delivery moving.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#85847c]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search orders..."
              aria-label="Search orders"
              className="w-full border border-[#e7e4dc] bg-white py-2.5 pl-9 pr-3 text-sm text-[#292b25] outline-none transition focus:border-[#414b36] sm:w-64"
            />
          </label>
          <span className="self-start border border-[#e7e4dc] bg-white px-4 py-2.5 text-xs font-medium text-[#686961] sm:self-auto">
            {filteredOrders.length} of {orders.length}{" "}
            {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>
      </header>

      <div className="overflow-hidden border border-[#e7e4dc] bg-white shadow-[0_8px_24px_rgba(39,46,32,0.035)]">
        <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#faf9f6] text-[10px] uppercase tracking-[0.12em] text-[#85847c]">
            <tr>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Order</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Customer</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Products</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Total</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Status</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Actions</th>
            </tr>
          </thead>
        
        <tbody className="divide-y divide-[#eeece6] text-sm">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <React.Fragment key={order._id}>
              <tr
                className="transition-colors hover:bg-[#fcfbf9]"
              >
                <td className="whitespace-nowrap px-5 py-4 font-medium text-[#414b36] sm:px-6">
                  #{order._id}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-[#55564f] sm:px-6">{order.user?.name ?? "Unknown customer"}</td>
                <td className="px-5 py-4 sm:px-6">
                  {order.orderItems?.length ? (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {order.orderItems.slice(0, 3).map((item, index) =>
                          item.image ? (
                            <img
                              key={`${item.productId}-${index}`}
                              src={item.image}
                              alt={item.name}
                              title={item.name}
                              className="h-9 w-9 rounded-full border-2 border-white bg-[#f5f2ed] object-cover"
                            />
                          ) : (
                            <span
                              key={`${item.productId}-${index}`}
                              title={`${item.name} (image unavailable)`}
                              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#f5f2ed] text-[10px] text-[#85847c]"
                            >
                              N/A
                            </span>
                          )
                        )}
                      </div>
                      <span className="text-xs text-[#77766e]">
                        {order.orderItems.length}{" "}
                        {order.orderItems.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#85847c]">No items</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-[#292b25] sm:px-6">${Number(order.totalPrice).toFixed(2)}</td>
                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    aria-label={`Status for order ${order._id}`}
                    className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#414b36]/20 ${statusStyles[order.status] ?? "bg-stone-100 text-stone-600"}`}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                  <div className="flex flex-col items-start gap-2">
                    <button
                      type="button"
                      aria-expanded={expandedOrderId === order._id}
                      aria-controls={`order-details-${order._id}`}
                      onClick={() =>
                        setExpandedOrderId((currentId) =>
                          currentId === order._id ? null : order._id
                        )
                      }
                      className="text-xs font-semibold text-[#414b36] hover:underline"
                    >
                      {expandedOrderId === order._id ? "Hide details" : "Show details"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(order._id, "Delivered")}
                      className="text-xs font-semibold text-[#59634c] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={order.status === "Delivered"}
                    >
                      Mark as Delivered
                    </button>
                  </div>
                </td>
              </tr>
              {expandedOrderId === order._id && (
                <tr className="bg-[#faf9f6]">
                  <td
                    id={`order-details-${order._id}`}
                    colSpan={6}
                    className="px-5 py-5 sm:px-6"
                  >
                    <div className="grid gap-6 text-sm text-[#55564f] md:grid-cols-3">
                      <section>
                        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#85847c]">
                          Customer
                        </h2>
                        <p className="font-medium text-[#292b25]">
                          {order.user?.name ?? "Unknown customer"}
                        </p>
                        {order.user?.email && <p>{order.user.email}</p>}
                        <p className="mt-2 text-xs text-[#85847c]">
                          Placed{" "}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString()
                            : "date unavailable"}
                        </p>
                      </section>

                      <section>
                        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#85847c]">
                          Shipping
                        </h2>
                        <p>{order.shippingAddress?.address ?? "Address unavailable"}</p>
                        <p>
                          {[
                            order.shippingAddress?.city,
                            order.shippingAddress?.postalCode,
                            order.shippingAddress?.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Location unavailable"}
                        </p>
                      </section>

                      <section>
                        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#85847c]">
                          Payment
                        </h2>
                        <p>
                          Method: {order.paymentMethod ?? "Unavailable"}
                        </p>
                        <p>
                          Status:{" "}
                          {order.paymentStatus ??
                            (order.isPaid ? "Paid" : "Pending")}
                        </p>
                      </section>
                    </div>

                    <section className="mt-6">
                      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#85847c]">
                        Items ({order.orderItems?.length ?? 0})
                      </h2>
                      {order.orderItems?.length ? (
                        <ul className="divide-y divide-[#e7e4dc] border-y border-[#e7e4dc]">
                          {order.orderItems.map((item, index) => (
                            <li
                              key={`${item.productId}-${index}`}
                              className="flex flex-wrap items-center justify-between gap-4 py-3"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="h-12 w-12 shrink-0 object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-[#292b25]">
                                    {item.name}
                                  </p>
                                  {(item.size || item.color) && (
                                    <p className="text-xs text-[#85847c]">
                                      {[item.size, item.color]
                                        .filter(Boolean)
                                        .join(" / ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <p className="whitespace-nowrap">
                                {item.quantity} × $
                                {Number(item.price).toFixed(2)} = $
                                {(
                                  Number(item.price) * Number(item.quantity)
                                ).toFixed(2)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[#85847c]">No item details available.</p>
                      )}
                      <p className="mt-3 text-right font-semibold text-[#292b25]">
                        Order total: ${Number(order.totalPrice).toFixed(2)}
                      </p>
                    </section>
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#85847c]">
                {normalizedSearchQuery
                  ? "No orders match your search."
                  : "No orders found."}
              </td>
            </tr>
          )}
        </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
