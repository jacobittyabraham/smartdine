import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import FoodDetails from "./pages/FoodDetails";
import Cart from "./pages/Cart";
import OrderTracking from "./pages/OrderTracking";
import Waiter from "./pages/Waiter";
import Bill from "./pages/Bill";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/menu" element={<Menu />} />

        <Route
          path="/food/:id"
          element={<FoodDetails />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/tracking"
          element={<OrderTracking />}
        />

        <Route
          path="/waiter"
          element={<Waiter />}
        />

        <Route
          path="/bill"
          element={<Bill />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;