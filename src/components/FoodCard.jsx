import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Clock3, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function FoodCard({ food, index = 0 }) {
  const navigate = useNavigate();

  function add() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const i = cart.findIndex(
      (x) =>
        x.id === food.id &&
        x.spice === "Normal" &&
        !x.extraChicken &&
        !x.extraRaita &&
        !x.instructions
    );

    if (i >= 0) {
      cart[i].quantity = (cart[i].quantity || 1) + 1;
    } else {
      cart.push({
        ...food,
        quantity: 1,
        spice: "Normal",
        extraChicken: false,
        extraRaita: false,
        instructions: ""
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
  }

  return (
    <motion.article
      className="food-card"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
    >
      <Link to={`/food/${food.id}`} className="food-visual">
        <img src={food.image} alt={food.name} />
        <span className="food-tag">{food.tag}</span>
        <span className="food-clock"><Clock3 size={13} /> {food.time} min</span>
        <span className="image-arrow"><ArrowUpRight size={17} /></span>
      </Link>

      <div className="food-body">
        <div className="overline">{food.category}</div>
        <Link to={`/food/${food.id}`}><h3>{food.name}</h3></Link>
        <p>{food.description}</p>
        <div className="food-footer">
          <strong>₹{food.price}</strong>
          <button onClick={add}><Plus size={18} /> Add</button>
        </div>
      </div>
    </motion.article>
  );
}