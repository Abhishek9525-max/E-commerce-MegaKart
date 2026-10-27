import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders, updateOrderStatus } from "../../redux/slices/adminOrderSlice";

const OrderManagement = () => {
  const dispatch =useDispatch();
  const navigate = useNavigate();

  const {user}= useSelector((state)=> state.auth)
  const {orders, loading, error} = useSelector((state)=>state.adminOrders);

  useEffect(()=>{
    if(!user || user.role !== "admin"){
      navigate("/")
    }else{
      dispatch(fetchAllOrders())
    }
  }, [dispatch, user, navigate])



  const handleStatusChange = (orderId, status) => {
    dispatch(updateOrderStatus({id: orderId, status}))
    // console.log({ id: orderId, status });
  };

  if(loading) return <p className="p-8 text-sm text-[#77766e]">Loading orders…</p>
  if(error) return <p role="alert" className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Unable to load orders: {error}</p>

  const statusStyles = {
    Processing: "bg-amber-50 text-amber-700",
    Shipped: "bg-sky-50 text-sky-700",
    Delivered: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <header className="flex flex-col justify-between gap-4 border-b border-[#e7e4dc] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#85847c]">Fulfillment</p>
          <h1 className="text-3xl font-medium text-[#292b25] sm:text-4xl">Orders &amp; Fulfillment</h1>
          <p className="mt-2 text-sm text-[#77766e]">Track orders and keep each delivery moving.</p>
        </div>
        <span className="self-start border border-[#e7e4dc] bg-white px-4 py-2.5 text-xs font-medium text-[#686961] sm:self-auto">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </span>
      </header>

      <div className="overflow-hidden border border-[#e7e4dc] bg-white shadow-[0_8px_24px_rgba(39,46,32,0.035)]">
        <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#faf9f6] text-[10px] uppercase tracking-[0.12em] text-[#85847c]">
            <tr>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Order</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Customer</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Total</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Status</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Action</th>
            </tr>
          </thead>
        
        <tbody className="divide-y divide-[#eeece6] text-sm">
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr
                key={order._id}
                className="transition-colors hover:bg-[#fcfbf9]"
              >
                <td className="whitespace-nowrap px-5 py-4 font-medium text-[#414b36] sm:px-6">
                  #{order._id}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-[#55564f] sm:px-6">{order.user?.name ?? "Unknown customer"}</td>
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
                  <button
                    onClick={() => handleStatusChange(order._id, "Delivered")}
                    className="text-xs font-semibold text-[#59634c] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={order.status === "Delivered"}
                  >Mark as Delivered</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#85847c]">No orders found.</td>
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
