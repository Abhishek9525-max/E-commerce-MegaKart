import React, { useEffect } from "react";
import { FiArrowUpRight, FiBox, FiShoppingBag, FiTrendingUp } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAdminProducts } from "../redux/slices/adminProductSlice";
import { fetchAllOrders } from "../redux/slices/adminOrderSlice";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount ?? 0);

const statusClass = (status) => {
  const styles = {
    Processing: "bg-amber-50 text-amber-700",
    Shipped: "bg-sky-50 text-sky-700",
    Delivered: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-rose-50 text-rose-700",
  };
  return styles[status] ?? "bg-stone-100 text-stone-600";
};

const AdminHomePage = () => {
  const dispatch = useDispatch();
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state) => state.adminProducts);
  const {
    orders,
    totalOrders,
    totalSales,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const loading = productsLoading || ordersLoading;
  const error = productsError || ordersError;
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <header className="flex flex-col justify-between gap-4 border-b border-[#e7e4dc] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#85847c]">
            {currentDate}
          </p>
          <h1 className="text-3xl font-medium text-[#292b25] sm:text-4xl">
            Overview
          </h1>
          <p className="mt-2 text-sm text-[#77766e]">
            A considered view of your store’s performance.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 self-start border border-[#d9d6ce] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#414b36] transition-colors hover:border-[#414b36] sm:self-auto"
        >
          View storefront <FiArrowUpRight aria-hidden="true" />
        </Link>
      </header>

      {error ? (
        <p role="alert" className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Unable to load your store overview: {error}
        </p>
      ) : (
        <>
          <section aria-label="Store performance" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article
              id="revenue"
              className="scroll-mt-6 border border-[#414b36] bg-[#414b36] p-6 text-white shadow-[0_8px_24px_rgba(39,46,32,0.08)]"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">
                  Total revenue
                </span>
                <FiTrendingUp className="text-lg text-[#d5ddc8]" aria-hidden="true" />
              </div>
              <p className="mt-8 text-3xl font-medium tracking-tight">
                {loading ? "—" : formatCurrency(totalSales)}
              </p>
              <p className="mt-2 text-xs text-white/65">Across all orders</p>
            </article>

            <article className="border border-[#e7e4dc] bg-white p-6 shadow-[0_8px_24px_rgba(39,46,32,0.035)]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#85847c]">
                  Orders
                </span>
                <FiShoppingBag className="text-lg text-[#85847c]" aria-hidden="true" />
              </div>
              <p className="mt-8 text-3xl font-medium tracking-tight text-[#292b25]">
                {loading ? "—" : totalOrders.toLocaleString()}
              </p>
              <Link
                to="/admin/orders"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#59634c] hover:underline"
              >
                Manage orders <FiArrowUpRight aria-hidden="true" />
              </Link>
            </article>

            <article className="border border-[#e7e4dc] bg-white p-6 shadow-[0_8px_24px_rgba(39,46,32,0.035)]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#85847c]">
                  Products
                </span>
                <FiBox className="text-lg text-[#85847c]" aria-hidden="true" />
              </div>
              <p className="mt-8 text-3xl font-medium tracking-tight text-[#292b25]">
                {loading ? "—" : products.length.toLocaleString()}
              </p>
              <Link
                to="/admin/products"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#59634c] hover:underline"
              >
                Manage inventory <FiArrowUpRight aria-hidden="true" />
              </Link>
            </article>
          </section>

          <section className="overflow-hidden border border-[#e7e4dc] bg-white shadow-[0_8px_24px_rgba(39,46,32,0.035)]">
            <div className="flex flex-col justify-between gap-3 border-b border-[#eeece6] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#85847c]">
                  Store activity
                </p>
                <h2 className="mt-1 text-xl font-medium text-[#292b25]">
                  Recent orders
                </h2>
              </div>
              <Link
                to="/admin/orders"
                className="text-xs font-semibold uppercase tracking-[0.08em] text-[#59634c] hover:underline"
              >
                View all orders
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#faf9f6] text-[10px] uppercase tracking-[0.12em] text-[#85847c]">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold sm:px-6">Order</th>
                    <th className="px-5 py-3.5 font-semibold sm:px-6">Customer</th>
                    <th className="px-5 py-3.5 font-semibold sm:px-6">Total</th>
                    <th className="px-5 py-3.5 font-semibold sm:px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeece6] text-sm">
                  {orders.length > 0 ? (
                    orders.slice(0, 6).map((order) => (
                      <tr key={order._id} className="transition-colors hover:bg-[#fcfbf9]">
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-[#414b36] sm:px-6">
                          #{order._id}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-[#55564f] sm:px-6">
                          {order.user?.name ?? "Unknown customer"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-[#292b25] sm:px-6">
                          {formatCurrency(order.totalPrice)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#85847c]">
                        {loading ? "Loading recent orders…" : "No recent orders yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminHomePage;
