import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart =
      JSON.parse(localStorage.getItem("cart")) || [];

    setCart(savedCart);
  }, []);

  function increaseQuantity(id) {
    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          quantity: (item.quantity || 1) + 1
        };
      }

      return item;
    });

    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
  }

  function decreaseQuantity(id) {
    const updatedCart = cart
      .map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity: (item.quantity || 1) - 1
          };
        }

        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
  }

  function removeItem(id) {
    const updatedCart = cart.filter(
      (item) => item.id !== id
    );

    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * (item.quantity || 1),
    0
  );

  function placeOrder() {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    localStorage.setItem("orderTotal", total);

    localStorage.removeItem("cart");

    navigate("/tracking");
  }

  return (
    <>
      <Navbar />

      <main className="page">

        <Link to="/menu" className="back-link">
          ← Continue Shopping
        </Link>

        <h1>🛒 Your Cart</h1>

        <p className="cart-table">
          Table No: <strong>12</strong>
        </p>

        {cart.length === 0 ? (

          <div className="empty">

            <h2>Your cart is empty 😔</h2>

            <Link
              to="/menu"
              className="order-button"
            >
              Browse Menu
            </Link>

          </div>

        ) : (

          <>

            <div className="cart-list">

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={item.id}
                >

                  <div className="cart-food">

                    <span className="cart-image">
                      {item.image}
                    </span>

                    <div>

                      <h3>{item.name}</h3>

                      <p>
                        ₹{item.price} each
                      </p>

                    </div>

                  </div>

                  <div className="cart-actions">

                    <div className="quantity-control">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                      >
                        −
                      </button>

                      <strong>
                        {item.quantity || 1}
                      </strong>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                      >
                        +
                      </button>

                    </div>

                    <strong className="item-total">
                      ₹
                      {item.price *
                        (item.quantity || 1)}
                    </strong>

                    <button
                      className="remove-button"
                      onClick={() =>
                        removeItem(item.id)
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>

              ))}

            </div>

            <div className="cart-total">

              <h2>
                Total: ₹{total}
              </h2>

              <button
                className="order-button"
                onClick={placeOrder}
              >
                🍽️ Place Order
              </button>

            </div>

          </>

        )}

      </main>
    </>
  );
}

export default Cart;