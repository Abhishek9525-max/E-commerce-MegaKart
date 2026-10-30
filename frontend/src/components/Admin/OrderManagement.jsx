import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { fetchAllOrders, updateOrderStatus } from "../../redux/slices/adminOrderSlice";

const ORDERS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 350;

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const {
    orders,
    loading,
    error,
    totalFilteredOrders,
    totalPages,
    currentSearch,
  } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      let request;
      const timeout = window.setTimeout(() => {
        request = dispatch(fetchAllOrders({ page, search: searchQuery.trim() }));
      }, searchQuery.trim() ? SEARCH_DEBOUNCE_MS : 0);
      return () => {
        window.clearTimeout(timeout);
        request?.abort();
      };
    }
  }, [dispatch, user, navigate, page, searchQuery]);

  const handleStatusChange = (orderId, status) => {
    dispatch(updateOrderStatus({ id: orderId, status }));
  };

  const statusStyles = {
    Processing: "bg-amber-50 text-amber-700",
    Shipped: "bg-sky-50 text-sky-700",
    Delivered: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-rose-50 text-rose-700",
  };
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const orderIdSuggestions =
    isSearchFocused &&
    /^[a-f\d]{1,24}$/i.test(normalizedSearch) &&
    currentSearch === searchQuery.trim()
      ? orders.filter((order) => order._id.toLowerCase().startsWith(normalizedSearch))
      : [];

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <header className="flex flex-col justify-between gap-4 border-b border-[#e7e4dc] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#85847c]">Fulfillment</p>
          <h1 className="text-3xl font-medium text-[#292b25] sm:text-4xl">Orders &amp; Fulfillment</h1>
          <p className="mt-2 text-sm text-[#77766e]">Track orders and keep each delivery moving.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="self-start border border-[#e7e4dc] bg-white px-4 py-2.5 text-xs font-medium text-[#686961] sm:self-auto">
            {totalFilteredOrders} matching{" "}
            {totalFilteredOrders === 1 ? "order" : "orders"}
          </span>
        </div>
      </header>

      <div className="overflow-hidden border border-[#e7e4dc] bg-white shadow-[0_8px_24px_rgba(39,46,32,0.035)]">
        <div className="border-b border-[#eeece6] p-4 sm:px-6">
          <label htmlFor="admin-order-search" className="sr-only">
            Search orders by number, customer, product, or status
          </label>
          <div className="relative max-w-lg">
            <div className="flex items-center gap-3 border border-[#dedbd3] bg-[#fcfbf9] px-3.5 py-2.5 transition focus-within:border-[#68725b] focus-within:ring-2 focus-within:ring-[#414b36]/10">
              <FiSearch className="shrink-0 text-[#85847c]" aria-hidden="true" />
              <input
                id="admin-order-search"
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={orderIdSuggestions.length > 0}
                aria-controls="admin-order-id-suggestions"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                  setExpandedOrderId(null);
                }}
                placeholder="Search by order, customer, product, or status"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#292b25] outline-none placeholder:text-[#a19f96]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                    setExpandedOrderId(null);
                    setIsSearchFocused(true);
                  }}
                  aria-label="Clear order search"
                  className="text-[#85847c] transition-colors hover:text-[#41443b]"
                >
                  <FiX aria-hidden="true" />
                </button>
              )}
            </div>
            {orderIdSuggestions.length > 0 && (
              <ul
                id="admin-order-id-suggestions"
                role="listbox"
                aria-label="Matching order IDs"
                className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto border border-[#dedbd3] bg-white py-1 shadow-lg"
              >
                {orderIdSuggestions.map((order) => (
                  <li key={order._id} role="option" aria-selected="false">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setSearchQuery(order._id);
                        setPage(1);
                        setExpandedOrderId(order._id);
                        setIsSearchFocused(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-[#f5f2ed]"
                    >
                      <span className="font-medium text-[#414b36]">{order._id}</span>
                      <span className="truncate text-[#85847c]">
                        {order.user?.name ?? "Unknown customer"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {loading && (
          <p
            role="status"
            aria-live="polite"
            className="border-b border-[#eeece6] px-4 py-2 text-xs text-[#77766e] sm:px-6"
          >
            {searchQuery.trim() ? "Searching orders…" : "Loading orders…"}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:px-6"
          >
            Unable to load orders: {error}
          </p>
        )}
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
        
        <tbody
          aria-busy={loading}
          className="divide-y divide-[#eeece6] text-sm"
        >
          {loading && orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#85847c]">
                Loading orders…
              </td>
            </tr>
          ) : orders.length > 0 ? (
            orders.map((order) => (
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
                {searchQuery.trim()
                  ? "No orders match your search."
                  : "No orders found."}
              </td>
            </tr>
          )}
        </tbody>
        </table>
        </div>
        {totalPages > 1 && (
          <nav
            aria-label="Order pages"
            className="flex flex-col gap-3 border-t border-[#eeece6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <p className="text-xs text-[#77766e]">
              Showing {(page - 1) * ORDERS_PER_PAGE + 1}–
              {Math.min(page * ORDERS_PER_PAGE, totalFilteredOrders)} of {totalFilteredOrders} orders
            </p>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setPage((currentPage) => Math.max(1, currentPage - 1));
                  setExpandedOrderId(null);
                }}
                disabled={page <= 1 || loading}
                className="border border-[#dedbd3] px-3 py-2 text-xs font-semibold text-[#59634c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-[#77766e]">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPage((currentPage) => Math.min(totalPages, currentPage + 1));
                  setExpandedOrderId(null);
                }}
                disabled={page >= totalPages || loading}
                className="border border-[#dedbd3] px-3 py-2 text-xs font-semibold text-[#59634c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
