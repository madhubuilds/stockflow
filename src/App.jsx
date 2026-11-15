import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Orders from "./pages/Orders/Orders";
import OrderDetails from "./pages/Orders/OrderDetails";
import Inventory from "./pages/Inventory/Inventory";
import Products from "./pages/Products/Products";
import Dispatch from "./pages/Dispatch/Dispatch";
import Stores from "./pages/Stores/Stores";
import Users from "./pages/Users/Users";
import Settings from "./pages/Settings/Settings";

import Login from "./pages/Login/Login";
import Unauthorized from "./pages/Unauthorized/Unauthorized";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected application routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/"
          element={
            <ProtectedRoute module="dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute module="orders">
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute module="orders">
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute module="products">
              <Products />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute module="inventory">
              <Inventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dispatch"
          element={
            <ProtectedRoute module="dispatch">
              <Dispatch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stores"
          element={
            <ProtectedRoute module="stores">
              <Stores />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute module="users">
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute module="settings">
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
