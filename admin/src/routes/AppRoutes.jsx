import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/auth/Login";
import SessionBridge from "../pages/auth/SessionBridge";
import Layout from "../components/layout/Layout";

// Dashboard
import Dashboard from "../pages/dashboard/Dashboard";

// Products
import ProductList from "../pages/products/ProductList";
import AddProduct from "../pages/products/AddProduct";
import EditProduct from "../pages/products/EditProduct";
import ProductDetail from "../pages/products/ProductDetail";

// Orders
import OrderList from "../pages/orders/OrderList";
import OrderDetail from "../pages/orders/OrderDetail";
import UpdateOrder from "../pages/orders/UpdateOrder";

// Customers
import CustomerList from "../pages/Customers/CustomerList";
import CustomerDetail from "../pages/Customers/CustomerDetail";
import EditCustomer from "../pages/Customers/EditCustomer";

// Categories
import CategoryList from "../pages/categories/CategoryList";
import AddCategory from "../pages/categories/AddCategory";
import EditCategory from "../pages/categories/EditCategory";

// Messages
import MessageList from "../pages/message/MessageList";

// Reports
import Report from "../pages/reports/report";

// Settings
import Settings from "../pages/settings/Settings";

function ProtectedRoute({ children }) {
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") ===
    "true";

  const role =
    localStorage.getItem("userRole");

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("currentUser") ||
        "null"
    );
  } catch {
    user = null;
  }

  if (
    !isLoggedIn ||
    role !== "admin" ||
    user?.role !== "admin"
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

function AppRoutes() {
  const adminLoggedIn =
    localStorage.getItem("isLoggedIn") ===
      "true" &&
    localStorage.getItem("userRole") ===
      "admin";

  return (
    <Routes>
      {/* Root */}
      <Route
        path="/"
        element={
          adminLoggedIn ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      {/* Session bridge */}
      <Route
        path="/auth/bridge"
        element={<SessionBridge />}
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          adminLoggedIn ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* Protected Admin Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Products */}
        <Route
          path="/products"
          element={<ProductList />}
        />

        <Route
          path="/products/add"
          element={<AddProduct />}
        />

        <Route
          path="/products/edit/:id"
          element={<EditProduct />}
        />

        <Route
          path="/products/:id"
          element={<ProductDetail />}
        />

        {/* Orders */}
        <Route
          path="/orders"
          element={<OrderList />}
        />

        <Route
          path="/orders/:id"
          element={<OrderDetail />}
        />

        <Route
          path="/orders/update/:id"
          element={<UpdateOrder />}
        />

        {/* Customers */}
        <Route
          path="/customers"
          element={<CustomerList />}
        />

        <Route
          path="/customers/:id"
          element={<CustomerDetail />}
        />

        <Route
          path="/customers/edit/:id"
          element={<EditCustomer />}
        />

        {/* Categories */}
        <Route
          path="/categories"
          element={<CategoryList />}
        />

        <Route
          path="/categories/add"
          element={<AddCategory />}
        />

        <Route
          path="/categories/edit/:id"
          element={<EditCategory />}
        />

        {/* Messages */}
        <Route
          path="/messages"
          element={<MessageList />}
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={<Report />}
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={<Settings />}
        />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;