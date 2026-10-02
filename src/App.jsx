import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import TableSession from "./pages/TableSession";
import Menu from "./pages/Menu";
import FoodDetails from "./pages/FoodDetails";
import Cart from "./pages/Cart";
import OrderTracking from "./pages/OrderTracking";
import Waiter from "./pages/Waiter";
import Bill from "./pages/Bill";
import Profile from "./pages/Profile";

import Staff from "./pages/Staff";
import Kitchen from "./pages/staff/Kitchen";
import WaiterDashboard from "./pages/staff/WaiterDashboard";
import Tables from "./pages/staff/Tables";
import Inventory from "./pages/staff/Inventory";
import Analytics from "./pages/staff/Analytics";
import MenuManagement from "./pages/staff/MenuManagement";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Orders from "./pages/admin/Orders";
import MenuAdmin from "./pages/admin/Menu";
import AdminTables from "./pages/admin/Tables";
import AdminInventory from "./pages/admin/Inventory";
import AdminAnalytics from "./pages/admin/Analytics";
import Offers from "./pages/admin/Offers";
import Reviews from "./pages/admin/Reviews";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import AdminProfile from "./pages/admin/Profile";
import AdminLayout from "./pages/admin/AdminLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            CUSTOMER
        ========================== */}

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/table" element={<TableSession />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/food/:id" element={<FoodDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/tracking" element={<OrderTracking />} />
        <Route path="/waiter" element={<Waiter />} />
        <Route path="/bill" element={<Bill />} />
        <Route path="/profile" element={<Profile />} />

        {/* =========================
            STAFF
        ========================== */}

        <Route
          path="/staff"
          element={<Staff />}
        />

        <Route
          path="/staff/kitchen"
          element={<Kitchen />}
        />

        <Route
          path="/staff/waiter"
          element={<WaiterDashboard />}
        />

        <Route
          path="/staff/tables"
          element={<Tables />}
        />

        <Route
          path="/staff/inventory"
          element={<Inventory />}
        />

        <Route
          path="/staff/analytics"
          element={<Analytics />}
        />

        <Route
          path="/staff/menu"
          element={<MenuManagement />}
        />
        <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu" element={<MenuAdmin />} />
        <Route path="tables" element={<AdminTables />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="offers" element={<Offers />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}