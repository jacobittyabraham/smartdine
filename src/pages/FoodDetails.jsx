import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const foods = [
  {
    id: 1,
    name: "Chicken Biriyani",
    price: 220,
    time: 20,
    image: "🍛",
    description:
      "Delicious chicken biriyani prepared with aromatic spices and basmati rice."
  },
  {
    id: 2,
    name: "Masala Dosa",
    price: 100,
    time: 10,
    image: "🥞",
    description:
      "Crispy dosa served with delicious potato masala, chutney and sambar."
  },
  {
    id: 3,
    name: "Chicken Burger",
    price: 180,
    time: 15,
    image: "🍔",
    description:
      "Juicy chicken burger with fresh vegetables and tasty sauce."
  },
  {
    id: 4,
    name: "Chicken 65",
    price: 160,
    time: 15,
    image: "🍗",
    description:
      "Spicy and crispy chicken starter prepared with special spices."
  },
  {
    id: 5,
    name: "Fresh Lime",
    price: 60,
    time: 5,
    image: "🍹",
    description:
      "Refreshing fresh lime juice, perfect with your meal."
  },
  {
    id: 6,
    name: "Ice Cream",
    price: 80,
    time: 3,
    image: "🍨",
    description:
      "Cold and delicious vanilla ice cream."
  }
];

function FoodDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const food = foods.find((item) => item.id === Number(id));

  if (!food) {
    return (
      <main className="page">
        <h1>Food not found 😔</h1>
        <Link to="/menu">← Back to Menu</Link>
      </main>
    );
  }

  function addToCart() {
  const existingCart =
    JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = existingCart.find(
    (item) => item.id === food.id
  );

  let updatedCart;

  if (existingItem) {
    updatedCart = existingCart.map((item) =>
      item.id === food.id
        ? {
            ...item,
            quantity: (item.quantity || 1) + 1
          }
        : item
    );
  } else {
    updatedCart = [
      ...existingCart,
      {
        ...food,
        quantity: 1
      }
    ];
  }

  localStorage.setItem(
    "cart",
    JSON.stringify(updatedCart)
  );

  navigate("/cart");
}
    return (
  <>
    <Navbar />

    <main className="details-page">

      <Link to="/menu" className="back-link">
        ← Back to Menu
      </Link>

      <div className="details-card">

        <div className="large-food-image">
          {food.image}
        </div>

        <div className="details-content">

          <h1>{food.name}</h1>

          <p className="details-description">
            {food.description}
          </p>

          <p className="details-time">
            ⏱️ Preparation time:
            <strong> {food.time} minutes</strong>
          </p>

          <h2 className="details-price">
            ₹{food.price}
          </h2>

          <button
            className="order-button"
            onClick={addToCart}
          >
            🛒 Add to Cart
          </button>

        </div>

      </div>

       </main>
  </>
);
}

export default FoodDetails;