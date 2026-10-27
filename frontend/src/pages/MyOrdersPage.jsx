import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserOrders } from "../redux/slices/orderSlice";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  if(loading) return <p className="p-8 text-sm text-[#77746D]">Loading your orders...</p>
  if(error) return <p role="alert" className="p-8 text-sm text-[#A94F38]">Error: {error}</p>

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-5">
        <p className="luxury-eyebrow mb-2 text-[#77746D]">Your purchases</p>
        <h2 className="text-3xl text-[#171714] sm:text-4xl">Order History</h2>
      </div>
      <div className="overflow-x-auto rounded-md border border-[#EAE6DF]">
        <table className="min-w-[760px] w-full text-left text-sm text-[#5C5A54]">
          <thead className="bg-[#FAF8F5] text-[10px] uppercase tracking-[0.1em] text-[#77746D]">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Shipping Address</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => handleRowClick(order._id)}
                  className="cursor-pointer border-b border-[#EAE6DF] transition-colors last:border-b-0 hover:bg-[#FAF8F5]"
                >
                  <td className="px-4 py-3">
                    <img
                      src={order.orderItems[0].image}
                      alt={order.orderItems[0].name}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-[#171714]">
                    #{order._id}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(order.createdAt).toLocaleDateString()}{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3">
                    {order.shippingAddress
                      ? `${order.shippingAddress.city}, ${order.shippingAddress.country}`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {order.orderItems.length}
                  </td>
                  <td className="px-4 py-3">
                    {order.totalPrice}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`
                      ${
                        order.isPaid
                          ? "bg-[#EAF0E7] text-[#414B36]"
                          : "bg-[#F8EAE6] text-[#A94F38]"
                      } rounded-full px-3 py-1.5 text-xs font-medium`}
                    >
                      {order.isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#77746D]">
                  You have no orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyOrdersPage;
