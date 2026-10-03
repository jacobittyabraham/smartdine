import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChefHat,
  Clock3,
  Home,
  PackageCheck,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";

const STATUS_STEPS = [
  {
    id: "Order Placed",
    title: "Order placed",
    description: "Your order has been received.",
    icon: PackageCheck,
  },
  {
    id: "Kitchen Accepted",
    title: "Kitchen accepted",
    description: "The kitchen has started processing your order.",
    icon: ChefHat,
  },
  {
    id: "Preparing",
    title: "Preparing",
    description: "Your dishes are being freshly prepared.",
    icon: UtensilsCrossed,
  },
  {
    id: "Ready",
    title: "Ready",
    description: "Your order is ready to be served.",
    icon: Sparkles,
  },
  {
    id: "Served",
    title: "Served",
    description: "Enjoy your meal.",
    icon: Check,
  },
];

export default function OrderTracking() {
  const navigate = useNavigate();

  const [order, setOrder] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("smartdine_current_order")
      );
    } catch {
      return null;
    }
  });

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
  if (!order?.backendOrderId) return;

  const loadBackendStatus = async () => {
    try {
      const latestOrder = await apiRequest(
        `/orders/${order.backendOrderId}`
      );

      const backendStatusMap = {
        PLACED: "Order Placed",
        ACCEPTED: "Kitchen Accepted",
        PREPARING: "Preparing",
        READY: "Ready",
        SERVED: "Served",
      };

      const displayStatus =
        backendStatusMap[latestOrder.status] || "Order Placed";

      setOrder((currentOrder) => ({
        ...currentOrder,
        status: displayStatus,
      }));

      const index = STATUS_STEPS.findIndex(
        (step) => step.id === displayStatus
      );

      setActiveStep(index >= 0 ? index : 0);
    } catch (error) {
      console.error("Failed to load order status:", error);
    }
  };

  loadBackendStatus();

  const interval = setInterval(() => {
    loadBackendStatus();
  }, 5000);

  return () => clearInterval(interval);
}, [order?.backendOrderId]);

  /*
    Demo simulation.

    Later this will be replaced with Socket.IO events
    coming from the kitchen/backend.
  */

  const estimatedTime = useMemo(() => {
    const times = [18, 12, 7, 2, 0];
    return times[activeStep] ?? 0;
  }, [activeStep]);

  if (!order) {
    return (
      <div className="sd-tracking-page">
        <div className="sd-tracking-empty">
          <div className="sd-tracking-empty-icon">
            <PackageCheck size={32} />
          </div>

          <span className="sd-tracking-eyebrow">
            NO ACTIVE ORDER
          </span>

          <h1>No order to track.</h1>

          <p>
            Once you place an order, its live kitchen status
            will appear here.
          </p>

          <button
            className="sd-tracking-primary-btn"
            onClick={() => navigate("/menu")}
          >
            Explore menu
          </button>
        </div>
      </div>
    );
  }

  const progress =
    (activeStep / (STATUS_STEPS.length - 1)) * 100;

  const currentStatus =
    STATUS_STEPS[activeStep]?.title || "Order placed";

  return (
    <div className="sd-tracking-page">
      {/* Ambient background */}
      <div className="sd-tracking-orb sd-tracking-orb-one" />
      <div className="sd-tracking-orb sd-tracking-orb-two" />

      {/* Navigation */}
      <nav className="sd-tracking-nav">
        <button
          className="sd-tracking-back"
          onClick={() => navigate("/menu")}
        >
          <ArrowLeft size={17} />
          Menu
        </button>

        <div className="sd-tracking-brand">
          <div className="sd-tracking-brand-icon">
            <UtensilsCrossed size={17} />
          </div>

          <div>
            <strong>SmartDine</strong>
            <span>Live dining experience</span>
          </div>
        </div>

        <div className="sd-tracking-table">
          <span>TABLE</span>
          <strong>
            {order.table === "Not selected"
              ? "—"
              : `T${order.table}`}
          </strong>
        </div>
      </nav>

      <main className="sd-tracking-container">
        {/* Heading */}
        <motion.section
          className="sd-tracking-heading"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="sd-tracking-eyebrow">
            ORDER {order.id}
          </span>

          <h1>
            We're preparing
            <br />
            <em>something good.</em>
          </h1>

          <p>
            Follow your order from our kitchen to your
            table in real time.
          </p>
        </motion.section>

        {/* Main tracking card */}
        <motion.section
          className="sd-tracking-main-card"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Current status */}
          <div className="sd-tracking-current">
            <div className="sd-tracking-current-icon">
              {(() => {
                const Icon =
                  STATUS_STEPS[activeStep].icon;

                return <Icon size={28} />;
              })()}
            </div>

            <div>
              <span>NOW</span>

              <h2>{currentStatus}</h2>

              <p>
                {STATUS_STEPS[activeStep].description}
              </p>
            </div>

            <div className="sd-tracking-time">
              <Clock3 size={17} />

              <div>
                <span>ESTIMATED</span>

                <strong>
                  {estimatedTime > 0
                    ? `${estimatedTime} min`
                    : "Enjoy!"}
                </strong>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="sd-tracking-progress-wrap">
            <div className="sd-tracking-progress">
              <motion.div
                className="sd-tracking-progress-fill"
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="sd-tracking-timeline">
            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;

              const completed = index < activeStep;
              const current = index === activeStep;

              return (
                <div
                  className={`sd-tracking-step ${
                    completed ? "completed" : ""
                  } ${current ? "current" : ""}`}
                  key={step.id}
                >
                  <div className="sd-tracking-step-icon">
                    {completed ? (
                      <Check size={16} />
                    ) : (
                      <Icon size={17} />
                    )}
                  </div>

                  <div className="sd-tracking-step-content">
                    <span>
                      {index === activeStep
                        ? "CURRENT"
                        : index < activeStep
                          ? "COMPLETED"
                          : `STEP ${index + 1}`}
                    </span>

                    <h3>{step.title}</h3>

                    <p>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Bottom information */}
        <div className="sd-tracking-bottom-grid">
          {/* Order details */}
          <motion.section
            className="sd-tracking-info-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="sd-tracking-card-label">
              ORDER DETAILS
            </div>

            <div className="sd-tracking-info-header">
              <div>
                <span>ORDER NUMBER</span>
                <strong>{order.id}</strong>
              </div>

              <div>
                <span>TABLE</span>
                <strong>
                  {order.table === "Not selected"
                    ? "—"
                    : `T${order.table}`}
                </strong>
              </div>
            </div>

            <div className="sd-tracking-order-items">
              {order.items?.map((item, index) => (
                <div
                  className="sd-tracking-order-item"
                  key={`${item.id}-${index}`}
                >
                  <div>
                    <strong>
                      {item.quantity || 1} × {item.name}
                    </strong>

                    {item.spice && (
                      <span>
                        {item.spice} spice
                      </span>
                    )}
                  </div>

                  <strong>
                    ₹
                    {(
                      item.finalPrice ??
                      item.price * (item.quantity || 1)
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              ))}
            </div>

            <div className="sd-tracking-total">
              <span>Total</span>

              <strong>
                ₹
                {Number(order.total || 0).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>
          </motion.section>

          {/* Dining information */}
          <motion.section
            className="sd-tracking-info-card sd-tracking-service-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="sd-tracking-card-label">
              WHILE YOU WAIT
            </div>

            <h2>Need something?</h2>

            <p>
              Request assistance from our service team
              without leaving your table.
            </p>

            <button
              onClick={() => navigate("/waiter")}
              className="sd-tracking-service-btn"
            >
              Request a waiter
              <ArrowLeft
                size={16}
                style={{ transform: "rotate(180deg)" }}
              />
            </button>

            <button
              onClick={() => navigate("/menu")}
              className="sd-tracking-secondary-btn"
            >
              Order something else
            </button>
          </motion.section>
        </div>

        {/* Completed message */}
        {activeStep === STATUS_STEPS.length - 1 && (
          <motion.div
            className="sd-tracking-complete"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div>
              <Check size={20} />
            </div>

            <section>
              <span>ORDER COMPLETE</span>

              <h2>
                Your table is ready to enjoy the meal.
              </h2>

              <p>
                Thank you for choosing SmartDine.
              </p>
            </section>

            <button onClick={() => navigate("/bill")}>
              View bill
              <ArrowLeft
                size={16}
                style={{ transform: "rotate(180deg)" }}
              />
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}