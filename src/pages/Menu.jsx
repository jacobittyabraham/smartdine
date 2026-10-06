import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const foods = [
  {
    id: 1,
    name: "Malabar Chicken Biriyani",
    category: "Biriyani",
    price: 240,
    time: 22,
    tag: "Chef's Pick",
    description:
      "Fragrant basmati rice layered with tender chicken, caramelized onions and Malabar spices.",
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: 2,
    name: "Truffle Mushroom Pizza",
    category: "Pizza",
    price: 360,
    time: 18,
    tag: "Premium",
    description:
      "Wood-fired crust, wild mushrooms, mozzarella, parmesan and aromatic truffle oil.",
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: 3,
    name: "Smoky Chicken Burger",
    category: "Burgers",
    price: 280,
    time: 15,
    tag: "Popular",
    description:
      "Juicy grilled chicken, smoked cheese, caramelized onions and signature house sauce.",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: 4,
    name: "Classic Chicken Biriyani",
    category: "Biriyani",
    price: 220,
    time: 20,
    tag: "Signature",
    description:
      "Fragrant basmati rice, tender chicken, saffron and house spices.",
    image:
      "https://images.pexels.com/photos/12737817/pexels-photo-12737817.jpeg?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: 5,
    name: "Chicken 65",
    category: "Starters",
    price: 210,
    time: 14,
    tag: "Hot",
    description:
      "Crispy fried chicken tossed with curry leaves, chilli and South Indian spices.",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: 6,
    name: "Creamy Alfredo Pasta",
    category: "Pasta",
    price: 290,
    time: 17,
    tag: "Comfort",
    description:
      "Silky parmesan cream sauce with pasta, herbs and freshly cracked pepper.",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: 7,
    name: "Fresh Mango Cooler",
    category: "Beverages",
    price: 130,
    time: 6,
    tag: "Fresh",
    description:
      "Chilled Alphonso mango blended with citrus and a touch of mint.",
    image:
      "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1200&q=88",
  },
  {
    id: 8,
    name: "Chocolate Lava Cake",
    category: "Desserts",
    price: 190,
    time: 10,
    tag: "Sweet",
    description:
      "Warm chocolate cake with a molten center, served with vanilla cream.",
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=88",
  },
];

const IMAGE_FALLBACKS = {
  "chicken biriyani":
    "https://images.pexels.com/photos/12737817/pexels-photo-12737817.jpeg?auto=format&fit=crop&w=1200&q=88",
  "classic chicken biriyani":
    "https://images.pexels.com/photos/12737817/pexels-photo-12737817.jpeg?auto=format&fit=crop&w=1200&q=88",
  "malabar chicken biriyani":
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=88",
  "paneer butter masala":
    "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=1200&q=88",
  "butter naan":
    "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1200&q=88",
  "chicken 65":
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=88",
};

function normalizeMenuItem(item) {
  const name = String(item?.name || "").trim().toLowerCase();
  const legacyFallback =
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=88";
  const storedImage = item?.image || item?.imageUrl;
  const image =
    !storedImage || storedImage === legacyFallback
      ? IMAGE_FALLBACKS[name]
      : storedImage;

  return image ? { ...item, image } : item;
}


function getStoredCart() {
  try {
    return JSON.parse(localStorage.getItem("smartdine_cart")) || [];
  } catch {
    return [];
  }
}
function getStoredMenu() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("smartdine_menu")
    );

    return Array.isArray(stored)
      ? stored.map(normalizeMenuItem)
      : foods;
  } catch {
    return foods;
  }
}

export default function Menu() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] =
  useState("All");

const [search, setSearch] =
  useState("");

const [cart, setCart] =
  useState(getStoredCart);

const [addedId, setAddedId] =
  useState(null);

const [menu, setMenu] =
  useState(getStoredMenu);
  useEffect(() => {
  const refreshMenu = () => {
    setMenu(getStoredMenu());
  };

  window.addEventListener(
    "smartdine-menu-updated",
    refreshMenu
  );

  window.addEventListener(
    "storage",
    refreshMenu
  );

  return () => {
    window.removeEventListener(
      "smartdine-menu-updated",
      refreshMenu
    );

    window.removeEventListener(
      "storage",
      refreshMenu
    );
  };
}, []);

  const tableNumber =
    localStorage.getItem("smartdine_table") || "Not selected";

  const sessionId =
    localStorage.getItem("smartdine_session") || "No active session";
  const categories = useMemo(() => {
  const uniqueCategories = [
    ...new Set(
      menu
        .map((food) => food.category)
        .filter(Boolean)
    ),
  ];

  return ["All", ...uniqueCategories];
}, [menu]);

  const filteredFoods = useMemo(() => {
  const query = search.trim().toLowerCase();

  return menu.filter((food) => {
    if (food.available === false) {
      return false;
    }

    const categoryMatch =
      activeCategory === "All" ||
      food.category === activeCategory;

    const searchMatch =
      !query ||
      food.name.toLowerCase().includes(query) ||
      food.category.toLowerCase().includes(query) ||
      food.description.toLowerCase().includes(query);

    return categoryMatch && searchMatch;
  });
}, [menu, activeCategory, search]);

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  const addToCart = (food) => {
    const currentCart = getStoredCart();

    const existingIndex = currentCart.findIndex(
      (item) =>
        item.id === food.id &&
        !item.cartId &&
        !item.addOns?.length &&
        !item.instructions &&
        !item.spice
    );

    let updatedCart;

    if (existingIndex !== -1) {
      updatedCart = [...currentCart];

      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: Number(updatedCart[existingIndex].quantity || 1) + 1,
      };
    } else {
      updatedCart = [
        ...currentCart,
        {
          ...food,
          quantity: 1,
        },
      ];
    }

    localStorage.setItem("smartdine_cart", JSON.stringify(updatedCart));
    setCart(updatedCart);

    setAddedId(food.id);

    setTimeout(() => {
      setAddedId(null);
    }, 1200);
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="sd-menu-page">
      {/* Ambient background */}
      <div className="sd-menu-bg">
        <div className="sd-menu-orb sd-menu-orb-one" />
        <div className="sd-menu-orb sd-menu-orb-two" />
        <div className="sd-menu-grid" />
      </div>

      {/* Navbar */}
      <header className="sd-menu-nav">
        <button
          className="sd-menu-brand"
          onClick={() => navigate("/")}
          aria-label="SmartDine home"
        >
          <div className="sd-menu-brand-mark">
            <UtensilsCrossed size={19} />
          </div>

          <div>
            <div className="sd-menu-brand-name">SmartDine</div>
            <div className="sd-menu-brand-sub">Digital Dining</div>
          </div>
        </button>

        <div className="sd-menu-nav-actions">
          <div className="sd-menu-table-pill">
            <span className="sd-menu-live-dot" />
            Table {tableNumber}
          </div>

          <button
            className="sd-menu-profile-btn"
            onClick={() => navigate("/profile")}
          >
            <User size={17} />
            <span>Profile</span>
          </button>

          <button
            className="sd-menu-cart-btn"
            onClick={() => navigate("/cart")}
          >
            <ShoppingBag size={18} />

            <span>Cart</span>

            {cartCount > 0 && (
              <span className="sd-menu-cart-count">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="sd-menu-main">
        {/* Back */}
        <motion.button
          className="sd-menu-back"
          onClick={() => navigate("/")}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.97 }}
        >
          <ArrowLeft size={16} />
          Back to home
        </motion.button>

        {/* Hero */}
        <section className="sd-menu-hero">
          <div className="sd-menu-hero-copy">
            <div className="sd-menu-eyebrow">
              <Sparkles size={14} />
              Curated for your table
            </div>

            <h1>
              Choose your
              <span> craving.</span>
            </h1>

            <p>
              Explore our chef-curated menu, customize your meal and send it
              directly to the kitchen.
            </p>

            <div className="sd-menu-session">
              <div className="sd-menu-session-icon">
                <UtensilsCrossed size={17} />
              </div>

              <div>
                <span>Dining session</span>
                <strong>Table {tableNumber}</strong>
              </div>

              <div className="sd-menu-session-line" />

              <div>
                <span>Session ID</span>
                <strong>{sessionId.slice(-10)}</strong>
              </div>
            </div>
          </div>

          <div className="sd-menu-hero-card">
            <div className="sd-menu-hero-image-wrap">
              <img
                src="https://images.pexels.com/photos/12737817/pexels-photo-12737817.jpeg?auto=format&fit=crop&w=1400&q=90"
                alt="Chicken biriyani"
                className="sd-menu-hero-image"
              />

              <div className="sd-menu-hero-image-overlay" />

              <div className="sd-menu-floating-card">
                <Sparkles size={16} />
                <div>
                  <span>Chef's recommendation</span>
                  <strong>Classic Chicken Biriyani</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search + controls */}
        <section className="sd-menu-controls">
          <div className="sd-menu-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search dishes, ingredients or categories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button onClick={clearSearch} aria-label="Clear search">
                <X size={17} />
              </button>
            )}
          </div>

          <div className="sd-menu-result-count">
            <strong>{filteredFoods.length}</strong>
            <span>dishes available</span>
          </div>
        </section>

        {/* Categories */}
        <section className="sd-menu-categories">
          <div className="sd-menu-category-scroll">
            {categories.map((category) => (
              <button
                key={category}
                className={`sd-menu-category ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}

                {activeCategory === category && (
                  <motion.span
                    layoutId="menu-category-indicator"
                    className="sd-menu-category-indicator"
                  />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Food grid */}
        <section className="sd-menu-food-section">
          <div className="sd-menu-section-heading">
            <div>
              <span>THE MENU</span>
              <h2>
                Made to be
                <em> remembered.</em>
              </h2>
            </div>

            <div className="sd-menu-heading-line" />
          </div>

          {filteredFoods.length === 0 ? (
            <motion.div
              className="sd-menu-empty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="sd-menu-empty-icon">
                <Search size={25} />
              </div>

              <h3>No dishes found</h3>

              <p>
                Try another dish name or choose a different category.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
              >
                Reset filters
              </button>
            </motion.div>
          ) : (
            <div className="sd-menu-grid-food">
              {filteredFoods.map((food, index) => (
                <motion.article
                  key={food.id}
                  className="sd-menu-food-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                  }}
                  whileHover={{ y: -8 }}
                >
                  <button
                    className="sd-menu-food-image-button"
                    onClick={() => navigate(`/food/${food.id}`)}
                  >
                    <div className="sd-menu-food-image-wrap">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="sd-menu-food-image"
                        loading="lazy"
                      />

                      <div className="sd-menu-food-image-overlay" />

                      <span className="sd-menu-food-tag">
                        {food.tag}
                      </span>

                      <span className="sd-menu-food-time">
                        <Clock3 size={13} />
                        {food.time} min
                      </span>

                      <div className="sd-menu-view-dish">
                        View dish
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  </button>

                  <div className="sd-menu-food-content">
                    <div className="sd-menu-food-meta">
                      <span>{food.category}</span>
                      <span>•</span>
                      <span>{food.time} min</span>
                    </div>

                    <h3>{food.name}</h3>

                    <p>{food.description}</p>

                    <div className="sd-menu-food-bottom">
                      <div className="sd-menu-food-price">
                        <small>₹</small>
                        {food.price}
                      </div>

                      <motion.button
                        className={`sd-menu-add-btn ${
                          addedId === food.id ? "added" : ""
                        }`}
                        onClick={() => addToCart(food)}
                        whileTap={{ scale: 0.94 }}
                      >
                        {addedId === food.id ? (
                          <>
                            <span>Added</span>
                            <span className="sd-menu-check">✓</span>
                          </>
                        ) : (
                          <>
                            <span>Add</span>
                            <span className="sd-menu-plus">+</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* Premium bottom CTA */}
        <section className="sd-menu-bottom-cta">
          <div>
            <span>NEED SOMETHING ELSE?</span>
            <h2>
              Your table is
              <em> waiting.</em>
            </h2>
            <p>
              Ask our team for recommendations, water, cutlery, plates or
              anything else you need.
            </p>
          </div>

          <div className="sd-menu-bottom-actions">
            <button
              className="sd-menu-service-btn"
              onClick={() => navigate("/waiter")}
            >
              Request service
              <ArrowRight size={17} />
            </button>

            <button
              className="sd-menu-cart-outline"
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag size={17} />
              View cart
              {cartCount > 0 && <span>{cartCount}</span>}
            </button>
          </div>
        </section>
      </main>

      {/* Mobile cart bar */}
      {cartCount > 0 && (
        <motion.div
          className="sd-menu-mobile-cart"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          <div>
            <ShoppingBag size={18} />

            <div>
              <strong>{cartCount} items</strong>
              <span>Ready to order</span>
            </div>
          </div>

          <button onClick={() => navigate("/cart")}>
            View cart
            <ArrowRight size={16} />
          </button>
        </motion.div>
      )}
    </div>
  );
}