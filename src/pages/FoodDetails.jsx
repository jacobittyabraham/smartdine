import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const foods = [
  {
    id: 1,
    name: "Truffle Mushroom Pizza",
    category: "Pizza",
    price: 449,
    time: 20,
    tag: "Chef's choice",
    description:
      "Wood-fired sourdough, black truffle oil, wild mushrooms and aged mozzarella.",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1400&q=90",
  },
  {
    id: 2,
    name: "Margherita Classica",
    category: "Pizza",
    price: 349,
    time: 16,
    tag: "Vegetarian",
    description:
      "San Marzano tomato, fresh basil and buffalo mozzarella.",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1400&q=90",
  },
  {
    id: 3,
    name: "Smoky Chicken Burger",
    category: "Burgers",
    price: 399,
    time: 15,
    tag: "Popular",
    description:
      "Smoky chicken patty, aged cheddar, crisp shallots and brioche.",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1400&q=90",
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
      "https://images.pexels.com/photos/12737817/pexels-photo-12737817.jpeg?auto=format&fit=crop&w=1400&q=90",
  },
  {
    id: 5,
    name: "Masala Dosa",
    category: "Starters",
    price: 100,
    time: 10,
    tag: "Vegetarian",
    description:
      "Crisp dosa, potato masala, coconut chutney and sambar.",
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1400&q=90",
  },
  {
    id: 6,
    name: "Creamy Alfredo Pasta",
    category: "Pasta",
    price: 299,
    time: 14,
    tag: "New",
    description:
      "Silky parmesan cream sauce, herbs and freshly cooked pasta.",
    image:
      "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1400&q=90",
  },
  {
    id: 7,
    name: "Fresh Lime",
    category: "Beverages",
    price: 60,
    time: 5,
    tag: "Fresh",
    description:
      "Bright fresh lime, chilled and finished with mint.",
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1400&q=90",
  },
  {
    id: 8,
    name: "Vanilla Gelato",
    category: "Desserts",
    price: 80,
    time: 3,
    tag: "Sweet",
    description:
      "Silky vanilla gelato with a delicate creamy finish.",
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1400&q=90",
  },
];
function getStoredMenu() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("smartdine_menu")
    );

    return Array.isArray(stored) && stored.length > 0
      ? stored
      : foods;
  } catch {
    return foods;
  }
}

const spiceOptions = [
  "Mild",
  "Medium",
  "Spicy",
];

const addOns = [
  {
    id: "raita",
    name: "Extra Raita",
    price: 30,
  },
  {
    id: "egg",
    name: "Boiled Egg",
    price: 25,
  },
  {
    id: "chicken",
    name: "Extra Chicken",
    price: 70,
  },
];

export default function FoodDetails() {
  const navigate = useNavigate();
const { id } = useParams();

const [menu, setMenu] = useState(getStoredMenu);

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

const food = menu.find(
  (item) => String(item.id) === String(id)
);
  const [quantity, setQuantity] = useState(1);
  const [spice, setSpice] = useState("Medium");
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [added, setAdded] = useState(false);

  const tableNumber =
    localStorage.getItem("smartdine_table") || "—";

  const addOnTotal = useMemo(() => {
    return selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find(
        (item) => item.id === addOnId
      );

      return total + (addOn?.price || 0);
    }, 0);
  }, [selectedAddOns]);

  const total = (food?.price + addOnTotal) * quantity;

  const toggleAddOn = (addOnId) => {
    setSelectedAddOns((current) =>
      current.includes(addOnId)
        ? current.filter((id) => id !== addOnId)
        : [...current, addOnId]
    );
  };

  const handleAddToCart = () => {
    if (!food) return;

    const existingCart =
      JSON.parse(localStorage.getItem("smartdine_cart")) || [];

    const customizedItem = {
      ...food,
      cartId: `${food.id}-${Date.now()}`,
      quantity,
      spice,
      addOns: selectedAddOns,
      instructions: instructions.trim(),
      finalPrice: total,
    };

    existingCart.push(customizedItem);

    localStorage.setItem(
      "smartdine_cart",
      JSON.stringify(existingCart)
    );

    setAdded(true);

    setTimeout(() => {
      navigate("/cart");
    }, 700);
  };

  if (!food) {
    return (
      <main className="sd-food-not-found">
        <UtensilsCrossed size={30} />

        <h1>
          Dish not found.
        </h1>

        <button onClick={() => navigate("/menu")}>
          Back to Menu
        </button>
      </main>
    );
  }

  return (
    <main className="sd-food-page">

      {/* =====================================================
          TOP NAV
          ===================================================== */}

      <nav className="sd-food-nav">

        <button
          className="sd-food-back"
          onClick={() => navigate("/menu")}
        >
          <ArrowLeft size={17} />
          <span>Back to menu</span>
        </button>

        <button
          className="sd-food-brand"
          onClick={() => navigate("/")}
        >
          <span>
            <UtensilsCrossed size={16} />
          </span>

          SMARTDINE
        </button>

        <div className="sd-food-table">
          TABLE T{tableNumber}
        </div>

      </nav>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <section className="sd-food-main">

        {/* IMAGE */}

        <motion.div
          className="sd-food-visual"
          initial={{
            opacity: 0,
            scale: 0.94,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
          }}
        >

          <img
            src={food.image}
            alt={food.name}
          />

          <div className="sd-food-image-shade" />

          <span className="sd-food-tag">
            {food.tag}
          </span>

          <div className="sd-food-image-category">
            {food.category}
          </div>

          <div className="sd-food-image-number">
            {String(food.id).padStart(2, "0")}
          </div>

        </motion.div>

        {/* DETAILS */}

        <motion.div
          className="sd-food-details"
          initial={{
            opacity: 0,
            x: 35,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.75,
            delay: 0.1,
          }}
        >

          <div className="sd-food-heading">

            <p>
              {food.category}
            </p>

            <h1>
              {food.name}
            </h1>

            <div className="sd-food-meta">

              <strong>
                ₹{food.price}
              </strong>

              <span>
                <Clock3 size={14} />
                {food.time} min
              </span>

            </div>

            <div className="sd-food-description">
              {food.description}
            </div>

          </div>

          {/* SPICE */}

          <div className="sd-food-option">

            <div className="sd-food-option-heading">
              <div>
                <span>01</span>
                <strong>Spice level</strong>
              </div>

              <small>
                Choose your preference
              </small>
            </div>

            <div className="sd-food-choice-row">

              {spiceOptions.map((option) => (

                <button
                  key={option}
                  className={
                    spice === option
                      ? "sd-food-choice active"
                      : "sd-food-choice"
                  }
                  onClick={() => setSpice(option)}
                >
                  {spice === option && (
                    <Check size={13} />
                  )}

                  {option}
                </button>

              ))}

            </div>

          </div>

          {/* ADD ONS */}

          <div className="sd-food-option">

            <div className="sd-food-option-heading">
              <div>
                <span>02</span>
                <strong>Make it yours</strong>
              </div>

              <small>
                Optional extras
              </small>
            </div>

            <div className="sd-food-addons">

              {addOns.map((addOn) => {

                const selected =
                  selectedAddOns.includes(addOn.id);

                return (
                  <button
                    key={addOn.id}
                    className={
                      selected
                        ? "sd-food-addon selected"
                        : "sd-food-addon"
                    }
                    onClick={() =>
                      toggleAddOn(addOn.id)
                    }
                  >

                    <span className="sd-food-addon-check">
                      {selected && (
                        <Check size={13} />
                      )}
                    </span>

                    <span>
                      {addOn.name}
                    </span>

                    <strong>
                      +₹{addOn.price}
                    </strong>

                  </button>
                );
              })}

            </div>

          </div>

          {/* SPECIAL INSTRUCTIONS */}

          <div className="sd-food-option">

            <div className="sd-food-option-heading">
              <div>
                <span>03</span>
                <strong>Special instructions</strong>
              </div>

              <small>
                Optional
              </small>
            </div>

            <textarea
              value={instructions}
              onChange={(event) =>
                setInstructions(event.target.value)
              }
              placeholder="Anything our kitchen should know?"
              maxLength={180}
            />

            <div className="sd-food-character-count">
              {instructions.length}/180
            </div>

          </div>

          {/* BOTTOM ORDER */}

          <div className="sd-food-order">

            <div className="sd-food-quantity">

              <button
                onClick={() =>
                  setQuantity(
                    Math.max(1, quantity - 1)
                  )
                }
              >
                <Minus size={15} />
              </button>

              <strong>
                {quantity}
              </strong>

              <button
                onClick={() =>
                  setQuantity(quantity + 1)
                }
              >
                <Plus size={15} />
              </button>

            </div>

            <button
              className={
                added
                  ? "sd-food-add-button added"
                  : "sd-food-add-button"
              }
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  Added to cart
                  <Check size={18} />
                </>
              ) : (
                <>
                  Add to order
                  <span>₹{total}</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

          </div>

          <div className="sd-food-bottom-note">
            <Sparkles size={14} />
            Freshly prepared for table T{tableNumber}
          </div>

        </motion.div>

      </section>

      {/* =====================================================
          BOTTOM INFO
          ===================================================== */}

      <section className="sd-food-story">

        <div>
          <span>
            SMARTDINE
          </span>

          <strong>
            Made for your table.
          </strong>
        </div>

        <p>
          Customize your dish exactly the way you like it.
          Your preferences are sent directly with the order.
        </p>

      </section>

    </main>
  );
}