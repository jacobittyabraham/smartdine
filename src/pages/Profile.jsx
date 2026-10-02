import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Package,
  ReceiptText,
  RotateCcw,
  Settings,
  Sparkles,
  Star,
  UtensilsCrossed,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const DEMO_PROFILE = {
  name: "SmartDine Guest",
  email: "guest@smartdine.demo",
  phone: "+91 00000 00000",
};

const FAVORITES = [
  {
    id: 1,
    name: "Classic Chicken Biriyani",
    category: "Biriyani",
    price: 220,
    image:
      "https://images.pexels.com/photos/12737817/pexels-photo-12737817.jpeg?auto=format&fit=crop&w=900&q=88",
  },
  {
    id: 2,
    name: "Truffle Mushroom Pizza",
    category: "Pizza",
    price: 320,
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=88",
  },
  {
    id: 3,
    name: "Smoky Chicken Burger",
    category: "Burgers",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=88",
  },
];

function readOrderHistory() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("smartdine_order_history")
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function readFavorites() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("smartdine_favorites")
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("smartdine_profile")
        ) || DEMO_PROFILE
      );
    } catch {
      return DEMO_PROFILE;
    }
  });

  const [orders, setOrders] = useState(readOrderHistory);
const [favorites, setFavorites] = useState(readFavorites);
const [editing, setEditing] = useState(false);


 useEffect(() => {
  const refreshOrders = () => {
    setOrders(readOrderHistory());
  };

  window.addEventListener("smartdine-order-updated", refreshOrders);
  window.addEventListener("smartdine-order-created", refreshOrders);
  window.addEventListener("storage", refreshOrders);

  return () => {
    window.removeEventListener("smartdine-order-updated", refreshOrders);
    window.removeEventListener("smartdine-order-created", refreshOrders);
    window.removeEventListener("storage", refreshOrders);
  };
}, []);

useEffect(() => {
  const refreshFavorites = () => {
    setFavorites(readFavorites());
  };

  window.addEventListener("smartdine-favorites-updated", refreshFavorites);
  window.addEventListener("storage", refreshFavorites);

  return () => {
    window.removeEventListener("smartdine-favorites-updated", refreshFavorites);
    window.removeEventListener("storage", refreshFavorites);
  };
}, []);
  const tableNumber =
    localStorage.getItem("smartdine_table") ||
    "Not selected";

  const totalSpent = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );
  }, [orders]);

  const favoriteItems =
    favorites.length > 0 ? favorites : FAVORITES;

  function saveProfile() {
    localStorage.setItem(
      "smartdine_profile",
      JSON.stringify(profile)
    );

    setEditing(false);
  }

  function toggleFavorite(item) {
    const exists = favorites.some(
      (favorite) => favorite.id === item.id
    );

    const updated = exists
      ? favorites.filter(
          (favorite) => favorite.id !== item.id
        )
      : [...favorites, item];

    setFavorites(updated);
    localStorage.setItem(
      "smartdine_favorites",
      JSON.stringify(updated)
    );

    window.dispatchEvent(
      new CustomEvent("smartdine-favorites-updated")
    );
  }

  function reorder(order) {
    const cart = order.items || [];

    localStorage.setItem(
      "smartdine_cart",
      JSON.stringify(cart)
    );

    navigate("/cart");
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="sd-profile-page">
      <div className="sd-profile-orb sd-profile-orb-one" />
      <div className="sd-profile-orb sd-profile-orb-two" />

      {/* Navigation */}
      <nav className="sd-profile-nav">
        <button
          className="sd-profile-back"
          onClick={() => navigate("/menu")}
        >
          <ArrowLeft size={17} />
          Menu
        </button>

        <div className="sd-profile-brand">
          <div className="sd-profile-brand-icon">
            <UtensilsCrossed size={17} />
          </div>

          <div>
            <strong>SmartDine</strong>
            <span>Your dining profile</span>
          </div>
        </div>

        <button
          className="sd-profile-settings"
          onClick={() => setEditing(!editing)}
        >
          <Settings size={17} />
        </button>
      </nav>

      <main className="sd-profile-container">
        {/* Profile hero */}
        <motion.section
          className="sd-profile-hero"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="sd-profile-avatar">
            <User size={35} />
          </div>

          <div className="sd-profile-hero-info">
            <span className="sd-profile-eyebrow">
              WELCOME BACK
            </span>

            <h1>{profile.name}</h1>

            <p>
              Your SmartDine experience, all in one place.
            </p>

            <div className="sd-profile-contact">
              <span>
                <Mail size={13} />
                {profile.email}
              </span>

              <span>
                <MapPin size={13} />
                Table{" "}
                {tableNumber === "Not selected"
                  ? "—"
                  : tableNumber}
              </span>
            </div>
          </div>

          <div className="sd-profile-level">
            <Sparkles size={18} />

            <span>MEMBER</span>

            <strong>Gold</strong>
          </div>
        </motion.section>

        {/* Edit profile */}
        {editing && (
          <motion.section
            className="sd-profile-edit"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <div className="sd-profile-edit-field">
              <label>Name</label>

              <input
                value={profile.name}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    name: event.target.value,
                  })
                }
              />
            </div>

            <div className="sd-profile-edit-field">
              <label>Email</label>

              <input
                value={profile.email}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    email: event.target.value,
                  })
                }
              />
            </div>

            <div className="sd-profile-edit-field">
              <label>Phone</label>

              <input
                value={profile.phone}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    phone: event.target.value,
                  })
                }
              />
            </div>

            <button
              className="sd-profile-save"
              onClick={saveProfile}
            >
              <Check size={16} />
              Save changes
            </button>
          </motion.section>
        )}

        {/* Stats */}
        <section className="sd-profile-stats">
          <div className="sd-profile-stat">
            <Package size={18} />

            <span>ORDERS</span>

            <strong>{orders.length}</strong>
          </div>

          <div className="sd-profile-stat">
            <ReceiptText size={18} />

            <span>SPENT</span>

            <strong>
              ₹
              {totalSpent.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </strong>
          </div>

          <div className="sd-profile-stat">
            <Heart size={18} />

            <span>FAVORITES</span>

            <strong>{favorites.length}</strong>
          </div>

          <div className="sd-profile-stat">
            <Star size={18} />

            <span>POINTS</span>

            <strong>
              {orders.length * 50}
            </strong>
          </div>
        </section>

        {/* Main grid */}
        <div className="sd-profile-grid">
          {/* Order history */}
          <section className="sd-profile-section">
            <div className="sd-profile-section-heading">
              <div>
                <span className="sd-profile-eyebrow">
                  YOUR JOURNEY
                </span>

                <h2>Order history.</h2>
              </div>

              <span className="sd-profile-section-count">
                {orders.length} ORDERS
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="sd-profile-empty">
                <div>
                  <Clock3 size={24} />
                </div>

                <h3>Your dining history starts here.</h3>

                <p>
                  Once you complete an order, your
                  previous meals will appear here.
                </p>

                <button
                  onClick={() => navigate("/menu")}
                >
                  Explore menu
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="sd-profile-orders">
                {orders.map((order) => (
                  <motion.article
                    className="sd-profile-order"
                    key={order.id}
                    whileHover={{ y: -2 }}
                  >
                    <div className="sd-profile-order-icon">
                      <ReceiptText size={19} />
                    </div>

                    <div className="sd-profile-order-main">
                      <div>
                        <span>
                          {formatDate(order.createdAt)}
                          {" · "}
                          {formatTime(order.createdAt)}
                        </span>

                        <h3>{order.id}</h3>
                      </div>

                      <strong>
                        ₹
                        {Number(
                          order.total || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div className="sd-profile-order-bottom">
                      <span>
                        {order.items?.length || 0} items
                      </span>

                      <button
                        onClick={() =>
                          reorder(order)
                        }
                      >
                        <RotateCcw size={14} />
                        Reorder
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </section>

          {/* Favorites */}
          <section className="sd-profile-section">
            <div className="sd-profile-section-heading">
              <div>
                <span className="sd-profile-eyebrow">
                  CURATED FOR YOU
                </span>

                <h2>Favorites.</h2>
              </div>

              <Heart size={19} />
            </div>

            <div className="sd-profile-favorites">
              {favoriteItems.map((item) => {
                const isFavorite = favorites.some(
                  (favorite) =>
                    favorite.id === item.id
                );

                return (
                  <motion.article
                    className="sd-profile-favorite"
                    key={item.id}
                    whileHover={{ y: -3 }}
                  >
                    <div className="sd-profile-favorite-image">
                      <img
                        src={item.image}
                        alt={item.name}
                      />

                      <button
                        onClick={() =>
                          toggleFavorite(item)
                        }
                        className={
                          isFavorite
                            ? "active"
                            : ""
                        }
                      >
                        <Heart
                          size={15}
                          fill={
                            isFavorite
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    </div>

                    <div className="sd-profile-favorite-info">
                      <span>{item.category}</span>

                      <h3>{item.name}</h3>

                      <div>
                        <strong>
                          ₹
                          {item.price.toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <button
                          onClick={() => {
                            localStorage.setItem(
                              "smartdine_cart",
                              JSON.stringify([
                                {
                                  ...item,
                                  quantity: 1,
                                },
                              ])
                            );

                            navigate("/cart");
                          }}
                        >
                          Add
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        </div>

        {/* Rewards */}
        <section className="sd-profile-rewards">
          <div className="sd-profile-reward-icon">
            <Sparkles size={22} />
          </div>

          <div className="sd-profile-reward-content">
            <span>SMARTDINE REWARDS</span>

            <h2>
              You're{" "}
              <em>{50 - ((orders.length * 50) % 50)} points</em>{" "}
              away from your next reward.
            </h2>

            <div className="sd-profile-reward-bar">
              <div
                style={{
                  width: `${
                    Math.min(
                      ((orders.length * 50) % 500) / 500,
                      1
                    ) * 100
                  }%`,
                }}
              />
            </div>

            <p>
              Earn 50 points every time you complete a
              dining order.
            </p>
          </div>

          <button
            onClick={() => navigate("/menu")}
          >
            Earn points
            <ArrowRight size={16} />
          </button>
        </section>

        {/* Footer actions */}
        <div className="sd-profile-actions">
          <button onClick={() => navigate("/menu")}>
            <ArrowLeft size={16} />
            Continue dining
          </button>

          <button
            onClick={() => {
              localStorage.removeItem(
                "smartdine_profile"
              );
              navigate("/login");
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </main>
    </div>
    );
}