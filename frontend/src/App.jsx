import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import UserLayout from "./components/Layout/UserLayout";
import Home from "./pages/Home";
import NewArrivalsPage from "./pages/NewArrivalsPage";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CollectionPage from "./pages/CollectionPage";
import ProductDetails from "./components/Products/ProductDetails";
import Checkout from "./components/Cart/Checkout";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminHomePage from "./pages/AdminHomePage";
import UserManagement from "./components/Admin/UserManagement";
import ProductManagement from "./components/Admin/ProductManagement";
import EditProductPage from "./components/Admin/EditProductPage";
import OrderManagement from "./components/Admin/OrderManagement";
import AnalyticsPage from "./components/Admin/AnalyticsPage";
import CreateProductPage from "./components/Admin/CreateProductPage";

import { Provider } from "react-redux";
import store from "./redux/store";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import { FiAlertTriangle, FiCheck, FiInfo, FiX } from "react-icons/fi";

const notificationIcon = (Icon, backgroundColor) => (
  <span
    aria-hidden="true"
    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
    style={{ backgroundColor }}
  >
    <Icon className="h-3 w-3 text-white" strokeWidth={3} />
  </span>
);

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search]);

  return null;
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster
          position="top-right"
          theme="light"
          icons={{
            success: notificationIcon(FiCheck, "#414B36"),
            error: notificationIcon(FiX, "#A94F38"),
            warning: notificationIcon(FiAlertTriangle, "#B7792B"),
            info: notificationIcon(FiInfo, "#414B36"),
          }}
          toastOptions={{
            classNames: {
              toast: "!border-[#D8D2C8] !bg-[#F5F2ED] !text-[#171714]",
              title: "!text-[#171714]",
              description: "!text-[#77746D]",
            },
          }}
        />
        <Routes>
          <Route path="/" element={<UserLayout />}>
            {/* user layout */}
            <Route index element={<Home />} />
            <Route path="new-arrivals" element={<NewArrivalsPage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="profile" element={<Profile />} />
            <Route path="collection/:collection" element={<CollectionPage />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="checkout" element={<Checkout />} />
            <Route
              path="order-confirmation"
              element={<OrderConfirmationPage />}
            />
            <Route path="order/:id" element={<OrderDetailsPage />} />
            <Route path="my-orders" element={<MyOrdersPage />} />
          </Route>
          {/* Admin Layout  */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute role='admin'>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHomePage />} />{" "}
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/new" element={<CreateProductPage />} />
            <Route path="products/:id/edit" element={<EditProductPage />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
