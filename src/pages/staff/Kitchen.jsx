import { motion } from "framer-motion";

import {
  Bell,
  Check,
  ChefHat,
  Clock3,
  Flame,
  PackageCheck,
  RefreshCw,
  Sparkles,
  Timer,
  UtensilsCrossed,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../lib/api";


const STATUS_ORDER = [
  "Order Placed",
  "Kitchen Accepted",
  "Preparing",
  "Ready",
  "Served",
];


const FILTERS = [
  "All",
  "New",
  "Accepted",
  "Preparing",
  "Ready",
];


function readOrder() {
  try {
    return JSON.parse(
      localStorage.getItem("smartdine_current_order")
    );
  } catch {
    return null;
  }
}

const BACKEND_STATUS_MAP = {
  PLACED: "Order Placed",
  ACCEPTED: "Kitchen Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
};

function toKitchenOrder(savedOrder) {
  const backendOrderId = Number(savedOrder?.id);
  if (!Number.isInteger(backendOrderId) || backendOrderId <= 0) {
    return null;
  }

  return {
    ...savedOrder,
    id: `SD-${String(backendOrderId).padStart(6, "0")}`,
    backendOrderId,
    table: savedOrder.table ?? savedOrder.tableNumber ?? "Not selected",
    status: BACKEND_STATUS_MAP[savedOrder.status] || savedOrder.status,
    items: savedOrder.items || [],
  };
}


function statusLabel(status) {
  const labels = {
    "Order Placed": "New",
    "Kitchen Accepted": "Accepted",
    Preparing: "Preparing",
    Ready: "Ready",
    Served: "Served",
  };

  return labels[status] || status;
}


function statusClass(status) {
  const classes = {
    "Order Placed": "new",
    "Kitchen Accepted": "accepted",
    Preparing: "preparing",
    Ready: "ready",
    Served: "served",
  };

  return classes[status] || "";
}


function formatTime(date) {
  if (!date) return "—";

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}


export default function Kitchen() {
  const navigate = useNavigate();

  const [order, setOrder] = useState(readOrder);
  const [filter, setFilter] = useState("All");
  const [now, setNow] = useState(Date.now());
  const [notification, setNotification] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);


  /*
    Clock + localStorage refresh.

    This keeps the Kitchen screen synchronized with
    the current SmartDine order.
  */
  useEffect(() => {
    const loadServerOrder = async () => {
      try {
        const response = await apiRequest("/orders");
        const orders = Array.isArray(response)
          ? response
          : Array.isArray(response?.orders)
            ? response.orders
            : [];
        const latestOrder = [...orders]
          .filter((candidate) => !["SERVED", "PAID"].includes(candidate?.status))
          .sort(
            (left, right) =>
              new Date(right?.createdAt || 0) -
              new Date(left?.createdAt || 0)
          )[0];
        const normalizedOrder = toKitchenOrder(latestOrder);

        if (normalizedOrder) {
          setOrder(normalizedOrder);
          localStorage.setItem(
            "smartdine_current_order",
            JSON.stringify(normalizedOrder)
          );
        }
      } catch (error) {
        console.error("Failed to load kitchen orders:", error);
      }
    };

    loadServerOrder();
    const interval = setInterval(() => {
      setNow(Date.now());

      try {
        const latest = JSON.parse(
          localStorage.getItem("smartdine_current_order")
        );

        setOrder(latest);
      } catch {
        setOrder(null);
      }
      loadServerOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  /*
    Cross-tab localStorage synchronization.
  */
  useEffect(() => {
    const handleStorage = () => {
      setOrder(readOrder());
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);


  /*
    STEP 18
    Listen for SmartDine order updates from other
    parts of the application.
  */
  useEffect(() => {
    const handleOrderUpdate = () => {
      setOrder(readOrder());
    };

    window.addEventListener(
  "smartdine-order-updated",
  handleOrderUpdate
);

    window.addEventListener(
      "smartdine-order-created",
      handleOrderUpdate
    );

    window.addEventListener(
      "smartdine-order-placed",
      handleOrderUpdate
    );

    return () => {
      window.removeEventListener(
        "smartdine-order-updated",
        handleOrderUpdate
      );

      window.removeEventListener(
        "smartdine-order-created",
        handleOrderUpdate
      );

      window.removeEventListener(
        "smartdine-order-placed",
        handleOrderUpdate
      );
    };
  }, []);


  const showNotification = (message) => {
    setNotification(message);

    setTimeout(() => {
      setNotification(null);
    }, 2400);
  };


  const refresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setOrder(readOrder());
      setRefreshing(false);
    }, 350);
  };


  /*
    Update the current order status.

    This is the main Kitchen → Customer connection.
  */
  const updateOrder = async (nextStatus) => {
    const backendOrderId = Number(
      order?.backendOrderId ||
        (typeof order?.id === "number" ? order.id : null) ||
        (typeof order?.id === "string" && /^\d+$/.test(order.id)
          ? order.id
          : null) ||
        (typeof order?.id === "string" && /^SD-\d+$/i.test(order.id)
          ? order.id.replace(/^SD-/i, "")
          : null)
    );

    if (!order || !Number.isInteger(backendOrderId) || backendOrderId <= 0) {
      showNotification("This order has no valid backend order ID.");
      return;
    }

    try {
      setUpdatingStatus(true);

      const savedOrder = await apiRequest(
        `/orders/${backendOrderId}/status?status=${encodeURIComponent(
          nextStatus === "Kitchen Accepted"
            ? "ACCEPTED"
            : nextStatus === "Preparing"
              ? "PREPARING"
              : nextStatus === "Ready"
                ? "READY"
                : "SERVED"
        )}`,
        { method: "PUT" }
      );

      const updated = {
        ...order,
        ...savedOrder,
        id: order.id,
        backendOrderId,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "smartdine_current_order",
        JSON.stringify(updated)
      );

      setOrder(updated);

      window.dispatchEvent(
        new Event("smartdine-order-updated")
      );

      showNotification(
        `Order #${order.id} moved to ${statusLabel(
          nextStatus
        )}`
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      showNotification(
        error.message || "Could not update the order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };


  const currentIndex = order
    ? STATUS_ORDER.indexOf(order.status)
    : -1;


  const nextStatus =
    currentIndex >= 0 &&
    currentIndex < STATUS_ORDER.length - 1
      ? STATUS_ORDER[currentIndex + 1]
      : null;


  const elapsedMinutes = useMemo(() => {
    if (!order?.createdAt) return 0;

    const created = new Date(
      order.createdAt
    ).getTime();

    return Math.max(
      0,
      Math.floor(
        (now - created) / 60000
      )
    );
  }, [order, now]);


  const estimatedMinutes = Math.max(
    0,
    Number(
      order?.items?.reduce(
        (total, item) =>
          total + Number(item.time || 15),
        0
      ) || 20
    )
  );


  const remainingMinutes = Math.max(
    0,
    estimatedMinutes - elapsedMinutes
  );


  const filtered =
    !order ||
    filter === "All" ||
    (filter === "New" &&
      order.status === "Order Placed") ||
    (filter === "Accepted" &&
      order.status === "Kitchen Accepted") ||
    (filter === "Preparing" &&
      order.status === "Preparing") ||
    (filter === "Ready" &&
      order.status === "Ready");


  const stats = [
    {
      label: "New",
      value:
        order?.status === "Order Placed"
          ? "01"
          : "00",
      icon: Bell,
      className: "new",
    },

    {
      label: "Preparing",
      value:
        order?.status === "Preparing"
          ? "01"
          : "00",
      icon: Flame,
      className: "preparing",
    },

    {
      label: "Ready",
      value:
        order?.status === "Ready"
          ? "01"
          : "00",
      icon: PackageCheck,
      className: "ready",
    },

    {
      label: "Avg. prep",
      value: "18m",
      icon: Timer,
      className: "time",
    },
  ];


  return (
    <div className="sd-kitchen-page">

      {/* Background */}

      <div className="sd-kitchen-background">

        <div className="sd-kitchen-orb one" />

        <div className="sd-kitchen-orb two" />

        <div className="sd-kitchen-grid" />

      </div>


      {/* Notification */}

      {notification && (
        <motion.div
          className="sd-kitchen-toast"
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <Check size={16} />

          {notification}
        </motion.div>
      )}


      {/* Top bar */}

      <header className="sd-kitchen-topbar">

        <div className="sd-kitchen-brand">

          <button
            className="sd-kitchen-brand-mark"
            onClick={() =>
              navigate("/staff")
            }
          >
            <UtensilsCrossed size={20} />
          </button>


          <div>

            <strong>
              SmartDine
            </strong>

            <span>
              Kitchen Display System
            </span>

          </div>

        </div>


        <div className="sd-kitchen-top-center">

          <div className="sd-kitchen-live">

            <span />

            Kitchen Online

          </div>


          <div className="sd-kitchen-clock">

            <Clock3 size={15} />

            {new Date(
              now
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}

          </div>

        </div>


        <div className="sd-kitchen-actions">

          <button
            className="sd-kitchen-refresh"
            onClick={refresh}
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

          </button>


          <button
            className="sd-kitchen-dashboard"
            onClick={() =>
              navigate("/staff")
            }
          >
            Staff dashboard
          </button>

        </div>

      </header>


      <main className="sd-kitchen-main">

        {/* Heading */}

        <section className="sd-kitchen-heading">

          <div>

            <div className="sd-kitchen-eyebrow">

              <ChefHat size={13} />

              BACK OF HOUSE

            </div>


            <h1>

              Kitchen

              <em>
                {" "}command.
              </em>

            </h1>


            <p>
              Every order, every item,
              every second — right where
              your team needs it.
            </p>

          </div>


          <div className="sd-kitchen-chef-card">

            <div className="sd-kitchen-chef-icon">

              <ChefHat size={20} />

            </div>


            <div>

              <span>
                Kitchen status
              </span>

              <strong>
                Operating normally
              </strong>

            </div>


            <div className="sd-kitchen-green-dot" />

          </div>

        </section>


        {/* Stats */}

        <section className="sd-kitchen-stats">

          {stats.map(
            (stat, index) => {

              const Icon =
                stat.icon;

              return (
                <motion.div
                  key={stat.label}
                  className={`sd-kitchen-stat ${stat.className}`}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.06,
                  }}
                >

                  <div className="sd-kitchen-stat-icon">

                    <Icon size={17} />

                  </div>


                  <div>

                    <span>
                      {stat.label}
                    </span>

                    <strong>
                      {stat.value}
                    </strong>

                  </div>

                </motion.div>
              );
            }
          )}

        </section>


        {/* Filters */}

        <section className="sd-kitchen-filters">

          <div className="sd-kitchen-filter-list">

            {FILTERS.map(
              (item) => (
                <button
                  key={item}
                  className={
                    filter === item
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter(item)
                  }
                >
                  {item}
                </button>
              )
            )}

          </div>


          <div className="sd-kitchen-order-count">

            {order
              ? "1 active order"
              : "No active orders"}

          </div>

        </section>


        {/* Order board */}

        <section className="sd-kitchen-board">

          {!order ? (

            <motion.div
              className="sd-kitchen-empty"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
            >

              <div className="sd-kitchen-empty-icon">

                <UtensilsCrossed
                  size={30}
                />

              </div>


              <h2>
                Kitchen is clear
              </h2>


              <p>
                New customer orders
                will automatically appear
                here.
              </p>


              <button
                onClick={refresh}
              >
                Check for new orders

                <RefreshCw
                  size={14}
                />
              </button>

            </motion.div>

          ) : !filtered ? (

            <div className="sd-kitchen-filter-empty">

              <Sparkles size={22} />

              <span>
                No{" "}
                {filter.toLowerCase()}
                {" "}orders right now.
              </span>

            </div>

          ) : (

            <motion.article
              className={`sd-kitchen-order-card ${statusClass(
                order.status
              )}`}
              initial={{
                opacity: 0,
                scale: 0.98,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
            >

              {/* Order header */}

              <div className="sd-kitchen-order-header">

                <div>

                  <span className="sd-kitchen-order-eyebrow">
                    ORDER TICKET
                  </span>


                  <h2>
                    #{order.id}
                  </h2>


                  <div className="sd-kitchen-order-meta">

                    <span>
                      Table {order.table}
                    </span>

                    <i>•</i>

                    <span>
                      Placed{" "}
                      {formatTime(
                        order.createdAt
                      )}
                    </span>

                    <i>•</i>

                    <span>
                      {order.items?.length ||
                        0}{" "}
                      items
                    </span>

                  </div>

                </div>


                <div
                  className={`sd-kitchen-status ${statusClass(
                    order.status
                  )}`}
                >

                  <span />

                  {statusLabel(
                    order.status
                  )}

                </div>

              </div>


              {/* Timer */}

              <div className="sd-kitchen-timer">

                <div className="sd-kitchen-timer-icon">

                  <Timer size={18} />

                </div>


                <div className="sd-kitchen-timer-copy">

                  <span>
                    Estimated preparation
                  </span>


                  <strong>

                    {remainingMinutes > 0
                      ? `${remainingMinutes} min remaining`
                      : "Ready for service"}

                  </strong>

                </div>


                <div className="sd-kitchen-timer-track">

                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        (
                          elapsedMinutes /
                          Math.max(
                            estimatedMinutes,
                            1
                          )
                        ) * 100
                      )}%`,
                    }}
                  />

                </div>


                <div className="sd-kitchen-elapsed">

                  {elapsedMinutes}m

                </div>

              </div>


              {/* Items */}

              <div className="sd-kitchen-items">

                <div className="sd-kitchen-items-heading">

                  <span>
                    ITEMS TO PREPARE
                  </span>

                  <span>
                    {order.items?.length ||
                      0}{" "}
                    line items
                  </span>

                </div>


                {order.items?.map(
                  (item, index) => (

                    <div
                      className="sd-kitchen-item"
                      key={`${item.id}-${index}`}
                    >

                      <div className="sd-kitchen-item-quantity">

                        {item.quantity ||
                          1}
                        ×

                      </div>


                      <div className="sd-kitchen-item-main">

                        <div className="sd-kitchen-item-name">

                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.category ||
                              "Menu item"}
                          </span>

                        </div>


                        <div className="sd-kitchen-item-options">

                          {item.spice && (
                            <span>

                              Spice:{" "}

                              <b>
                                {item.spice}
                              </b>

                            </span>
                          )}


                          {item.addOns?.length >
                            0 && (
                            <span>

                              Add-ons:{" "}

                              <b>

                                {item.addOns
                                  .map(
                                    (
                                      addon
                                    ) =>
                                      typeof addon ===
                                      "string"
                                        ? addon
                                        : addon.name
                                  )
                                  .join(
                                    ", "
                                  )}

                              </b>

                            </span>
                          )}


                          {item.instructions && (
                            <span className="instruction">

                              Note:{" "}

                              <b>
                                {item.instructions}
                              </b>

                            </span>
                          )}

                        </div>

                      </div>


                      <div className="sd-kitchen-item-time">

                        <Clock3 size={13} />

                        {item.time ||
                          15}
                        m

                      </div>

                    </div>

                  )
                )}

              </div>


              {/* Footer */}

              <div className="sd-kitchen-order-footer">

                <div className="sd-kitchen-total">

                  <span>
                    ORDER TOTAL
                  </span>

                  <strong>

                    ₹
                    {Number(
                      order.total || 0
                    ).toLocaleString()}

                  </strong>

                </div>


                <div className="sd-kitchen-actions-row">

                  {currentIndex > 0 && (

                    <button
                      className="sd-kitchen-secondary"
                      disabled={updatingStatus}
                      onClick={() =>
                        updateOrder(
                          STATUS_ORDER[
                            currentIndex - 1
                          ]
                        )
                      }
                    >
                      Back
                    </button>

                  )}


                  {nextStatus && (

                    <button
                      className="sd-kitchen-primary"
                      disabled={updatingStatus}
                      onClick={() =>
                        updateOrder(
                          nextStatus
                        )
                      }
                    >

                      {nextStatus ===
                        "Kitchen Accepted" && (
                        <>
                          <ChefHat size={15} />
                          Accept order
                        </>
                      )}


                      {nextStatus ===
                        "Preparing" && (
                        <>
                          <Flame size={15} />
                          Start preparing
                        </>
                      )}


                      {nextStatus ===
                        "Ready" && (
                        <>
                          <PackageCheck
                            size={15}
                          />
                          Mark ready
                        </>
                      )}


                      {nextStatus ===
                        "Served" && (
                        <>
                          <Check size={15} />
                          Mark served
                        </>
                      )}

                    </button>

                  )}

                </div>

              </div>

            </motion.article>

          )}

        </section>


        {/* Kitchen notes */}

        <section className="sd-kitchen-bottom">

          <div className="sd-kitchen-note">

            <div className="sd-kitchen-note-icon">

              <Flame size={17} />

            </div>


            <div>

              <span>
                Kitchen priority
              </span>

              <strong>
                Keep preparation flow moving
              </strong>

              <p>
                New orders should be
                accepted before moving
                into preparation.
              </p>

            </div>

          </div>


          <div className="sd-kitchen-note">

            <div className="sd-kitchen-note-icon">

              <Bell size={17} />

            </div>


            <div>

              <span>
                Guest experience
              </span>

              <strong>
                Follow customization notes
              </strong>

              <p>
                Special instructions
                entered by guests appear
                directly on each ticket.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}