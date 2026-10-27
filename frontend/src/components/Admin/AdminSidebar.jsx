import React from "react";
import {
  FaBoxOpen,
  FaChartLine,
  FaClipboardList,
  FaExternalLinkAlt,
  FaSignOutAlt,
  FaStore,
  FaThLarge,
  FaUsers,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import { clearCart } from "../../redux/slices/cartSlice";

const AdminSidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const productCount = useSelector((state) => state.adminProducts.products.length);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/");
    onNavigate?.();
  };

  const navClass = (active) =>
    `flex min-h-[50px] items-center gap-4 rounded-md px-3 text-sm transition-colors ${
      active
        ? "bg-[#414b36] font-medium text-[#f5f2ed]"
        : "text-[#4e5048] hover:bg-[#e9e6df]"
    }`;

  return (
    <aside className="flex min-h-screen flex-col bg-white px-6 pb-6 pt-8 text-[#41443b]">
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-2 text-[#414b36]"
      >
        <FaStore className="text-base" aria-hidden="true" />
        <span className="font-serif text-[22px] font-semibold tracking-[0.04em]">
          MEGAKART
        </span>
      </Link>

      <div className="mb-10 mt-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-[#85847c]">
          ATELIER COUTURE
        </span>
        <span className="bg-[#f4d8d1] px-2 py-2 text-[9px] font-semibold tracking-[0.08em] text-[#653c32]">
          ADMIN SUITE
        </span>
      </div>

      <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.08em] text-[#85847c]">
        CURATED NAVIGATION
      </p>

      <nav aria-label="Admin navigation" className="flex flex-col gap-1">
        <NavLink
          to="/admin"
          end
          onClick={onNavigate}
          className={({ isActive }) => navClass(isActive && !location.hash)}
        >
          <FaThLarge className="text-sm" aria-hidden="true" />
          <span>Overview</span>
        </NavLink>
        <NavLink
          to="/admin/orders"
          onClick={onNavigate}
          className={({ isActive }) => navClass(isActive)}
        >
          <FaClipboardList className="text-sm" aria-hidden="true" />
          <span className="flex-1">Orders &amp; Fulfillment</span>
          <span className="bg-[#e6e3de] px-2 py-1 text-[10px] text-[#686961]">
            Recent
          </span>
        </NavLink>
        <NavLink
          to="/admin/products"
          onClick={onNavigate}
          className={({ isActive }) => navClass(isActive)}
        >
          <FaBoxOpen className="text-sm" aria-hidden="true" />
          <span className="flex-1">Inventory &amp; Products</span>
          <span className="bg-[#e6e3de] px-2 py-1 text-[10px] text-[#686961]">
            {productCount}
          </span>
        </NavLink>
        <NavLink
          to="/admin/users"
          onClick={onNavigate}
          className={({ isActive }) => navClass(isActive)}
        >
          <FaUsers className="text-sm" aria-hidden="true" />
          <span>Customer Directory</span>
        </NavLink>
        <NavLink
          to="/admin/analytics"
          onClick={onNavigate}
          className={({ isActive }) => navClass(isActive)}
        >
          <FaChartLine className="text-sm" aria-hidden="true" />
          <span>Analytics &amp; Revenue</span>
        </NavLink>
        <NavLink
          to="/"
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            `${navClass(isActive)} mt-1`
          }
        >
          <FaStore className="text-sm" aria-hidden="true" />
          <span className="flex-1">Storefront</span>
          <FaExternalLinkAlt
            className="text-[10px] text-[#85847c]"
            aria-hidden="true"
          />
        </NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 border-t border-[#ded9cf] pt-5 text-sm text-[#686961] transition-colors hover:text-[#a94f38]"
      >
        <FaSignOutAlt aria-hidden="true" />
        <span>Log out</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
