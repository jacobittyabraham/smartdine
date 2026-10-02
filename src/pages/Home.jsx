import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Clock3,
  Flame,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const featuredDishes = [
  {
    name: "Classic Chicken Biriyani",
    category: "Signature",
    price: "₹220",
    image:
      "https://images.pexels.com/photos/12737817/pexels-photo-12737817.jpeg?auto=format&fit=crop&w=1200&q=88",
  },
  {
    name: "Truffle Mushroom Pizza",
    category: "Chef's choice",
    price: "₹449",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=88",
  },
  {
    name: "Smoky Chicken Burger",
    category: "Popular",
    price: "₹399",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=88",
  },
];

const categories = [
  "Biriyani",
  "Pizza",
  "Burgers",
  "Pasta",
  "Desserts",
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="sd-home">

      {/* =====================================================
          AMBIENT BACKGROUND
          ===================================================== */}

      <div className="sd-home-noise" />

      <div className="sd-home-orb sd-home-orb-one" />
      <div className="sd-home-orb sd-home-orb-two" />

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

      <nav className="sd-home-nav">

        <button
          className="sd-home-logo"
          onClick={() => navigate("/")}
        >
          <span className="sd-home-logo-icon">
            <UtensilsCrossed size={18} />
          </span>

          <span>SMARTDINE</span>
        </button>

        <div className="sd-home-nav-links">
          <button onClick={() => navigate("/")}>
            Home
          </button>

          <button onClick={() => navigate("/menu")}>
            Menu
          </button>

          <button onClick={() => navigate("/table")}>
            Table
          </button>
        </div>

        <button
          className="sd-home-nav-order"
          onClick={() => navigate("/table")}
        >
          <span>Start Dining</span>
          <ArrowRight size={16} />
        </button>

      </nav>

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="sd-home-hero">

        <div className="sd-home-hero-copy">

          <motion.div
            className="sd-home-pill"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles size={14} />

            <span>
              INTELLIGENT DINING EXPERIENCE
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
            }}
          >
            Dining,
            <br />

            <em>reimagined.</em>
          </motion.h1>

          <motion.p
            className="sd-home-hero-description"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
            }}
          >
            Discover a smarter way to dine. Explore the menu,
            customize your meal, track your order and connect
            with your restaurant — all from your table.
          </motion.p>

          <motion.div
            className="sd-home-hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.3,
            }}
          >
            <button
              className="sd-home-primary"
              onClick={() => navigate("/table")}
            >
              <span>Start Your Experience</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="sd-home-secondary"
              onClick={() => navigate("/menu")}
            >
              Explore Menu
            </button>
          </motion.div>

        </div>

        {/* =================================================
            HERO VISUAL
            ================================================= */}

        <motion.div
          className="sd-home-hero-visual"
          initial={{
            opacity: 0,
            scale: 0.9,
            rotate: 2,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          transition={{
            duration: 1,
            delay: 0.2,
          }}
        >

          <div className="sd-home-image-backdrop" />

          <div className="sd-home-main-dish">

            <img
              src="https://images.pexels.com/photos/12737817/pexels-photo-12737817.jpeg?auto=format&fit=crop&w=1400&q=90"
              alt="Chicken biriyani"
            />

            <div className="sd-home-image-overlay" />

          </div>

          {/* Floating information card */}

          <motion.div
            className="sd-home-floating-card sd-home-floating-top"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="sd-home-floating-icon">
              <Flame size={17} />
            </div>

            <div>
              <span>CHEF'S PICK</span>
              <strong>Chicken Biriyani</strong>
            </div>
          </motion.div>

          <motion.div
            className="sd-home-floating-card sd-home-floating-bottom"
            animate={{
              y: [0, 7, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Clock3 size={17} />

            <div>
              <span>EST. PREPARATION</span>
              <strong>20 minutes</strong>
            </div>
          </motion.div>

          <div className="sd-home-image-number">
            01
          </div>

        </motion.div>

      </section>

      {/* =====================================================
          SCROLL INDICATOR
          ===================================================== */}

      <motion.div
        className="sd-home-scroll"
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <ArrowDown size={16} />
        <span>DISCOVER</span>
      </motion.div>

      {/* =====================================================
          MARQUEE
          ===================================================== */}

      <section className="sd-home-marquee">

        <div className="sd-home-marquee-track">

          <span>SMARTER DINING</span>
          <i>✦</i>

          <span>REAL-TIME SERVICE</span>
          <i>✦</i>

          <span>PERSONALISED ORDERS</span>
          <i>✦</i>

          <span>SEAMLESS EXPERIENCE</span>
          <i>✦</i>

          <span>SMARTER DINING</span>
          <i>✦</i>

          <span>REAL-TIME SERVICE</span>
          <i>✦</i>

          <span>PERSONALISED ORDERS</span>
          <i>✦</i>

        </div>

      </section>

      {/* =====================================================
          FEATURED DISHES
          ===================================================== */}

      <section className="sd-home-featured">

        <div className="sd-home-section-heading">

          <div>
            <p>FROM OUR KITCHEN</p>

            <h2>
              Made to be
              <em> remembered.</em>
            </h2>
          </div>

          <button
            className="sd-home-view-menu"
            onClick={() => navigate("/menu")}
          >
            View full menu
            <ArrowRight size={17} />
          </button>

        </div>

        <div className="sd-home-dishes">

          {featuredDishes.map((dish, index) => (

            <motion.article
              className="sd-home-dish"
              key={dish.name}
              initial={{
                opacity: 0,
                y: 35,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.65,
                delay: index * 0.12,
              }}
              whileHover={{
                y: -8,
              }}
            >

              <div className="sd-home-dish-image">

                <img
                  src={dish.image}
                  alt={dish.name}
                />

                <span>
                  {dish.category}
                </span>

              </div>

              <div className="sd-home-dish-info">

                <div>
                  <h3>{dish.name}</h3>

                  <p>
                    Crafted for the SmartDine experience.
                  </p>
                </div>

                <strong>
                  {dish.price}
                </strong>

              </div>

            </motion.article>

          ))}

        </div>

      </section>

      {/* =====================================================
          EXPERIENCE SECTION
          ===================================================== */}

      <section className="sd-home-experience">

        <div className="sd-home-experience-number">
          02
        </div>

        <div className="sd-home-experience-content">

          <p className="sd-home-small-label">
            THE SMARTDINE DIFFERENCE
          </p>

          <h2>
            Your table.
            <br />
            Your rhythm.
            <br />
            <em>Your experience.</em>
          </h2>

          <p>
            No waiting for menus. No guessing when your food
            will arrive. SmartDine connects your table directly
            with the restaurant team.
          </p>

          <div className="sd-home-categories">

            {categories.map((category, index) => (

              <button
                key={category}
                onClick={() => navigate("/menu")}
              >
                <span>
                  0{index + 1}
                </span>

                {category}

                <ArrowRight size={15} />

              </button>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
          ===================================================== */}

      <section className="sd-home-cta">

        <div className="sd-home-cta-glow" />

        <Sparkles size={20} />

        <p>
          READY WHEN YOU ARE
        </p>

        <h2>
          Let's make
          <br />
          <em>your table unforgettable.</em>
        </h2>

        <button
          className="sd-home-primary sd-home-cta-button"
          onClick={() => navigate("/table")}
        >
          Start Dining
          <ArrowRight size={18} />
        </button>

      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="sd-home-footer">

        <div>
          <strong>SMARTDINE</strong>
          <span>
            Intelligent hospitality platform.
          </span>
        </div>

        <span>
          © 2026 SmartDine
        </span>

      </footer>

    </main>
  );
}