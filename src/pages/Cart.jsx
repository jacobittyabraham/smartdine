import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Minus,
  Plus,
  ReceiptText,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ADD_ONS = {
  raita: { name: "Extra Raita", price: 30 },
  egg: { name: "Boiled Egg", price: 25 },
  chicken: { name: "Extra Chicken", price: 70 },
};

const DEMO_TAX_RATE = 0.05;

function getUnitPrice(item) {
  if (typeof item.finalPrice === "number" && item.quantity === 1) {
    return item.finalPrice;
  }

  const addOnTotal = (item.addOns || []).reduce((sum, addOnId) => {
    return sum + (ADD_ONS[addOnId]?.price || 0);
  }, 0);

  return item.price + addOnTotal;
}

function getLineTotal(item) {
  return getUnitPrice(item) * (item.quantity || 1);
}
function getCurrentMenu() {
  try {
    const stored = JSON.parse(localStorage.getItem("smartdine_menu"));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}
export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("smartdine_cart")) || [];
    } catch {
      return [];
    }
  });

  const [placingOrder, setPlacingOrder] = useState(false);

  const tableNumber =
    localStorage.getItem("smartdine_table") || "Not selected";
    useEffect(() => {
  const refreshCart = () => {
    try {
      const storedCart = JSON.parse(
        localStorage.getItem("smartdine_cart")
      );

      if (Array.isArray(storedCart)) {
        setCart(storedCart);
      }
    } catch {
      // Keep the current cart if stored data is invalid.
    }
  };

  window.addEventListener("smartdine-cart-updated", refreshCart);
  window.addEventListener("storage", refreshCart);

  return () => {
    window.removeEventListener(
      "smartdine-cart-updated",
      refreshCart
    );
    window.removeEventListener("storage", refreshCart);
  };
}, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + getLineTotal(item), 0);
  }, [cart]);

  const tax = subtotal * DEMO_TAX_RATE;
  const total = subtotal + tax;

  const itemCount = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  function saveCart(updatedCart) {
    setCart(updatedCart);
    localStorage.setItem("smartdine_cart", JSON.stringify(updatedCart));
  }
  
  function increaseQuantity(index) {
    const updatedCart = [...cart];

    updatedCart[index] = {
      ...updatedCart[index],
      quantity: (updatedCart[index].quantity || 1) + 1,
      finalPrice: undefined,
    };

    saveCart(updatedCart);
  }

  function decreaseQuantity(index) {
    const updatedCart = [...cart];
    const currentQuantity = updatedCart[index].quantity || 1;

    if (currentQuantity <= 1) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index] = {
        ...updatedCart[index],
        quantity: currentQuantity - 1,
        finalPrice: undefined,
      };
    }

    saveCart(updatedCart);
  }

  function removeItem(index) {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    saveCart(updatedCart);
  }

  function clearCart() {
    saveCart([]);
  }

  function placeOrder() {
  if (cart.length === 0) return;

  const currentMenu = getCurrentMenu();

  // If staff has not created a managed menu yet,
  // allow the existing cart flow to continue.
  if (currentMenu.length > 0) {
    const unavailableItems = cart.filter((cartItem) => {
      const menuItem = currentMenu.find(
        (item) => String(item.id) === String(cartItem.id)
      );

      return !menuItem || menuItem.available === false;
    });

    if (unavailableItems.length > 0) {
      const names = unavailableItems
        .map((item) => item.name)
        .join(", ");

      alert(
        `${names} ${
          unavailableItems.length === 1 ? "is" : "are"
        } currently unavailable. Please remove ${
          unavailableItems.length === 1 ? "it" : "them"
        } from your cart before placing the order.`
      );

      return;
    }

    // Detect price changes made by staff after the item
    // was added to the customer's cart.
    const priceChangedItems = cart.filter((cartItem) => {
      const menuItem = currentMenu.find(
        (item) => String(item.id) === String(cartItem.id)
      );

      if (!menuItem) return false;

      return Number(menuItem.price) !== Number(cartItem.price);
    });

    if (priceChangedItems.length > 0) {
      const updatedCart = cart.map((cartItem) => {
        const menuItem = currentMenu.find(
          (item) => String(item.id) === String(cartItem.id)
        );

        if (!menuItem) return cartItem;

        return {
          ...cartItem,
          name: menuItem.name,
          price: Number(menuItem.price),
          category: menuItem.category,
          image: menuItem.image,
          time: menuItem.time,
          tag: menuItem.tag,
          description: menuItem.description,
          finalPrice: undefined,
        };
      });

      saveCart(updatedCart);

      alert(
        "One or more menu prices were updated by the restaurant. Your cart has been refreshed with the latest prices. Please review the new total and place the order again."
      );

      return;
    }
  }

  setPlacingOrder(true);

  const order = {
    id: `SD-${Date.now().toString().slice(-6)}`,
    table: tableNumber,
    items: cart,
    subtotal,
    tax,
    total,
    status: "Order Placed",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(
  "smartdine_current_order",
  JSON.stringify(order)
);

  window.dispatchEvent(
  new CustomEvent("smartdine-order-created")
);

window.dispatchEvent(
  new CustomEvent("smartdine-order-updated")
);

window.dispatchEvent(
  new CustomEvent("smartdine-order-created", {
    detail: order,
  })
);

window.dispatchEvent(
  new CustomEvent("smartdine-order-updated", {
    detail: order,
  })
);

setTimeout(() => {
  navigate("/tracking");
}, 700);
}

  return (
    <div className="sd-cart-page">
      {/* Ambient background */}
      <div className="sd-cart-orb sd-cart-orb-one" />
      <div className="sd-cart-orb sd-cart-orb-two" />

      {/* Navigation */}
      <nav className="sd-cart-nav">
        <button
          className="sd-cart-back"
          onClick={() => navigate("/menu")}
        >
          <ArrowLeft size={18} />
          <span>Menu</span>
        </button>

        <div className="sd-cart-brand">
          <div className="sd-cart-brand-mark">
            <UtensilsCrossed size={17} />
          </div>

          <div>
            <strong>SmartDine</strong>
            <span>Premium dining experience</span>
          </div>
        </div>

        <div className="sd-cart-table">
          <span>TABLE</span>
          <strong>
            {tableNumber === "Not selected"
              ? "—"
              : `T${tableNumber}`}
          </strong>
        </div>
      </nav>

      <main className="sd-cart-container">
        {/* Header */}
        <motion.div
          className="sd-cart-heading"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <span className="sd-cart-eyebrow">
              YOUR SELECTION
            </span>

            <h1>Your order.</h1>

            <p>
              Review your dishes and customizations before
              sending the order to our kitchen.
            </p>
          </div>

          {cart.length > 0 && (
            <div className="sd-cart-count">
              <ShoppingBag size={18} />
              <span>{itemCount} items</span>
            </div>
          )}
        </motion.div>

        {cart.length === 0 ? (
          /* Empty cart */
          <motion.div
            className="sd-cart-empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="sd-cart-empty-icon">
              <ShoppingBag size={34} />
            </div>

            <span className="sd-cart-eyebrow">
              NOTHING HERE YET
            </span>

            <h2>Your cart is waiting.</h2>

            <p>
              Explore our menu and add something delicious
              to your table.
            </p>

            <button
              className="sd-cart-primary-btn"
              onClick={() => navigate("/menu")}
            >
              Explore Menu
              <ArrowRight size={18} />
            </button>
          </motion.div>
        ) : (
          <div className="sd-cart-layout">
            {/* Cart items */}
            <section className="sd-cart-items">
              <div className="sd-cart-section-top">
                <div>
                  <span className="sd-cart-section-label">
                    ORDER ITEMS
                  </span>

                  <h2>
                    {itemCount}{" "}
                    {itemCount === 1 ? "item" : "items"}
                  </h2>
                </div>

                <button
                  className="sd-cart-clear"
                  onClick={clearCart}
                >
                  Clear all
                </button>
              </div>

              <div className="sd-cart-list">
                {cart.map((item, index) => (
                  <motion.article
                    className="sd-cart-item"
                    key={
                      item.cartId ||
                      `${item.id}-${index}`
                    }
                    layout
                  >
                    {/* Image */}
                    <div className="sd-cart-item-image">
                      <img
                        src={item.image}
                        alt={item.name}
                      />

                      {item.tag && (
                        <span>{item.tag}</span>
                      )}
                    </div>

                    {/* Information */}
                    <div className="sd-cart-item-info">
                      <div className="sd-cart-item-main">
                        <div>
                          <span className="sd-cart-item-category">
                            {item.category}
                          </span>

                          <h3>{item.name}</h3>
                        </div>

                        <strong>
                          ₹
                          {getLineTotal(item).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                      <div className="sd-cart-meta">
                        <span>
                          <Clock3 size={14} />
                          {item.time || 20} min
                        </span>

                        {item.spice && (
                          <span>
                            Spice: {item.spice}
                          </span>
                        )}
                      </div>

                      {/* Add-ons */}
                      {item.addOns?.length > 0 && (
                        <div className="sd-cart-customizations">
                          <span>ADD-ONS</span>

                          <div>
                            {item.addOns.map(
                              (addOnId) => (
                                <em key={addOnId}>
                                  <Check size={12} />
                                  {
                                    ADD_ONS[addOnId]?.name
                                  }
                                </em>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Instructions */}
                      {item.instructions && (
                        <div className="sd-cart-note">
                          <span>NOTE</span>
                          <p>{item.instructions}</p>
                        </div>
                      )}

                      {/* Bottom controls */}
                      <div className="sd-cart-item-bottom">
                        <div className="sd-cart-quantity">
                          <button
                            onClick={() =>
                              decreaseQuantity(index)
                            }
                          >
                            <Minus size={15} />
                          </button>

                          <span>
                            {item.quantity || 1}
                          </span>

                          <button
                            onClick={() =>
                              increaseQuantity(index)
                            }
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <button
                          className="sd-cart-remove"
                          onClick={() =>
                            removeItem(index)
                          }
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              <button
                className="sd-cart-continue"
                onClick={() => navigate("/menu")}
              >
                <ArrowLeft size={17} />
                Continue browsing
              </button>
            </section>

            {/* Summary */}
            <aside className="sd-cart-summary">
              <div className="sd-cart-summary-inner">
                <span className="sd-cart-section-label">
                  ORDER SUMMARY
                </span>

                <h2>Almost there.</h2>

                <div className="sd-cart-summary-table">
                  <div>
                    <span>Subtotal</span>
                    <strong>
                      ₹
                      {subtotal.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>

                  <div>
                    <span>
                      GST / tax
                      <small> Demo 5%</small>
                    </span>

                    <strong>
                      ₹
                      {tax.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>
                </div>

                <div className="sd-cart-summary-total">
                  <span>Total</span>

                  <strong>
                    ₹
                    {total.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>

                <div className="sd-cart-table-card">
                  <div className="sd-cart-table-icon">
                    <UtensilsCrossed size={18} />
                  </div>

                  <div>
                    <span>DINING TABLE</span>
                    <strong>
                      {tableNumber === "Not selected"
                        ? "Table not selected"
                        : `Table ${tableNumber}`}
                    </strong>
                  </div>
                </div>

                <div className="sd-cart-payment-note">
                  <ReceiptText size={16} />

                  <p>
                    Payment and digital receipt will be
                    available after the order is served.
                  </p>
                </div>

                <button
                  className="sd-cart-place-btn"
                  onClick={placeOrder}
                  disabled={placingOrder}
                >
                  {placingOrder ? (
                    <>
                      <span className="sd-cart-spinner" />
                      Sending to kitchen...
                    </>
                  ) : (
                    <>
                      Place order
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <small className="sd-cart-secure">
                  Your order will be sent to the kitchen
                  instantly.
                </small>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}