import { useState } from "react";
import { Link } from "react-router-dom";

const foods = [
  {
    id: 1,
    name: "Chicken Biriyani",
    price: 220,
    category: "Meals",
    time: 20,
    image: "🍛",
    description: "Delicious chicken biriyani with raita."
  },
  {
    id: 2,
    name: "Masala Dosa",
    price: 100,
    category: "Meals",
    time: 10,
    image: "🥞",
    description: "Crispy dosa served with chutney and sambar."
  },
  {
    id: 3,
    name: "Chicken Burger",
    price: 180,
    category: "Snacks",
    time: 15,
    image: "🍔",
    description: "Juicy chicken burger with fresh vegetables."
  },
  {
    id: 4,
    name: "Chicken 65",
    price: 160,
    category: "Snacks",
    time: 15,
    image: "🍗",
    description: "Spicy and crispy chicken starter."
  },
  {
    id: 5,
    name: "Fresh Lime",
    price: 60,
    category: "Drinks",
    time: 5,
    image: "🍹",
    description: "Refreshing fresh lime juice."
  },
  {
    id: 6,
    name: "Ice Cream",
    price: 80,
    category: "Desserts",
    time: 3,
    image: "🍨",
    description: "Cold and delicious vanilla ice cream."
  }
];

function Menu() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const tableNumber =
    localStorage.getItem("tableNumber") || "Not Selected";

  const categories = [
    "All",
    "Meals",
    "Snacks",
    "Drinks",
    "Desserts"
  ];

  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      category === "All" || food.category === category;

    const matchesSearch =
      food.name
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Navigation Bar */}

      <nav className="navbar">
        <Link to="/" className="logo">
          🍽️ SmartDine
        </Link>

        <div className="nav-links">
          <Link to="/menu">
            Menu
          </Link>

          <Link to="/cart">
            🛒 Cart
          </Link>
        </div>
      </nav>

      {/* Menu */}

      <main className="menu-page">

        {/* Table Number */}

        <div className="table-info">
          🪑 Table No:{" "}
          <strong>{tableNumber}</strong>
        </div>

        <h1>Our Menu</h1>

        <p className="subtitle">
          Choose your favourite food
        </p>

        {/* Search */}

        <input
          className="search"
          type="text"
          placeholder="🔍 Search food..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {/* Categories */}

        <div className="categories">

          {categories.map((item) => (
            <button
              key={item}
              className={
                category === item
                  ? "category active"
                  : "category"
              }
              onClick={() =>
                setCategory(item)
              }
            >
              {item}
            </button>
          ))}

        </div>

        {/* Food Cards */}

        <div className="food-grid">

          {filteredFoods.map((food) => (

            <div
              className="food-card"
              key={food.id}
            >

              <div className="food-image">
                {food.image}
              </div>

              <div className="food-info">

                <h3>{food.name}</h3>

                <p className="food-description">
                  {food.description}
                </p>

                <p className="time">
                  ⏱️ {food.time} minutes
                </p>

                <div className="food-bottom">

                  <strong>
                    ₹{food.price}
                  </strong>

                  <Link
                    to={`/food/${food.id}`}
                    className="add-button"
                  >
                    View
                  </Link>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* No Food Found */}

        {filteredFoods.length === 0 && (
          <div className="empty">
            <h2>
              No food found 😔
            </h2>

            <p>
              Try another search or category.
            </p>
          </div>
        )}

        {/* Service Buttons */}

        <div className="service-area">

          <Link
            to="/waiter"
            className="service-button"
          >
            🔔 Request Waiter
          </Link>

          <Link
            to="/bill"
            className="service-button"
          >
            🧾 Request Bill
          </Link>

        </div>

      </main>
    </>
  );
}

export default Menu;