import { motion } from "framer-motion";

import {
  Activity,
  ArrowRight,
  Bell,
  Check,
  ChefHat,
  ChevronRight,
  Coffee,
  LayoutDashboard,
  LogOut,
  Package,
  RefreshCw,
  Settings,
  ShoppingBag,
  Table2,
  UserRound,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ORDER_STATUSES = [
  "Order Placed",
  "Kitchen Accepted",
  "Preparing",
  "Ready",
  "Served",
];

const SERVICE_META = {
  Requested: {
    className: "requested",
  },
  Accepted: {
    className: "accepted",
  },
  Completed: {
    className: "completed",
  },
};

const STATUS_META = {
  "Order Placed": {
    label: "New",
    className: "new",
  },
  "Kitchen Accepted": {
    label: "Accepted",
    className: "accepted",
  },
  Preparing: {
    label: "Preparing",
    className: "preparing",
  },
  Ready: {
    label: "Ready",
    className: "ready",
  },
  Served: {
    label: "Served",
    className: "served",
  },
};

const SERVICE_NAMES = {
  water: "Drinking Water",
  plates: "Extra Plates",
  cutlery: "Cutlery",
  tissues: "Tissues",
  waiter: "Call a Waiter",
  bill: "Request Bill",
};

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key)
    );

    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function getCurrentOrder() {
  return readStorage(
    "smartdine_current_order",
    null
  );
}

function getServiceRequests() {
  return readStorage(
    "smartdine_service_requests",
    []
  );
}

export default function Staff() {
  const navigate = useNavigate();

  const [currentOrder, setCurrentOrder] =
    useState(getCurrentOrder);

  const [serviceRequests, setServiceRequests] =
    useState(getServiceRequests);

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [notification, setNotification] =
    useState(null);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const tableNumber =
    localStorage.getItem(
      "smartdine_table"
    ) || "—";

  const sessionId =
    localStorage.getItem(
      "smartdine_session"
    ) || "No active session";

  const refreshData = () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setCurrentOrder(
        getCurrentOrder()
      );

      setServiceRequests(
        getServiceRequests()
      );

      setIsRefreshing(false);
    }, 350);
  };

  useEffect(() => {
    const handleStorage = () => {
      setCurrentOrder(
        getCurrentOrder()
      );

      setServiceRequests(
        getServiceRequests()
      );
    };

    const handleOrderUpdate = () => {
      setCurrentOrder(
        getCurrentOrder()
      );
    };

    const handleOrderCreated = () => {
      setCurrentOrder(
        getCurrentOrder()
      );
    };

    const handleOrderPlaced = () => {
      setCurrentOrder(
        getCurrentOrder()
      );
    };

    const handleServiceUpdate = () => {
      setServiceRequests(
        getServiceRequests()
      );
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "smartdine-order-updated",
      handleOrderUpdate
    );

    window.addEventListener(
      "smartdine-order-created",
      handleOrderCreated
    );

    window.addEventListener(
      "smartdine-order-placed",
      handleOrderPlaced
    );

    window.addEventListener(
      "smartdine-service-updated",
      handleServiceUpdate
    );

    const interval = setInterval(() => {
      setCurrentOrder(
        getCurrentOrder()
      );

      setServiceRequests(
        getServiceRequests()
      );
    }, 2000);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "smartdine-order-updated",
        handleOrderUpdate
      );

      window.removeEventListener(
        "smartdine-order-created",
        handleOrderCreated
      );

      window.removeEventListener(
        "smartdine-order-placed",
        handleOrderPlaced
      );

      window.removeEventListener(
        "smartdine-service-updated",
        handleServiceUpdate
      );

      clearInterval(interval);
    };
  }, []);

  const showNotification = (
    message,
    type = "success"
  ) => {
    setNotification({
      message,
      type,
    });

    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  const updateOrderStatus = (
    nextStatus
  ) => {
    if (!currentOrder) {
      showNotification(
        "No active order found.",
        "error"
      );

      return;
    }

    const updatedOrder = {
      ...currentOrder,
      status: nextStatus,
      updatedAt:
        new Date().toISOString(),
    };

    localStorage.setItem(
      "smartdine_current_order",
      JSON.stringify(updatedOrder)
    );

    setCurrentOrder(updatedOrder);

    window.dispatchEvent(
      new Event(
        "smartdine-order-updated"
      )
    );

    showNotification(
      `Order moved to ${nextStatus}.`
    );
  };

  const updateServiceRequest = (
    requestId,
    nextStatus
  ) => {
    const updatedRequests =
      serviceRequests.map(
        (request) => {
          if (
            request.id !== requestId
          ) {
            return request;
          }

          const now =
            new Date().toISOString();

          return {
            ...request,

            status: nextStatus,

            acceptedAt:
              nextStatus === "Accepted"
                ? request.acceptedAt ||
                  now
                : request.acceptedAt,

            completedAt:
              nextStatus ===
              "Completed"
                ? now
                : request.completedAt,
          };
        }
      );

    localStorage.setItem(
      "smartdine_service_requests",
      JSON.stringify(
        updatedRequests
      )
    );

    setServiceRequests(
      updatedRequests
    );

    window.dispatchEvent(
      new Event(
        "smartdine-service-updated"
      )
    );

    showNotification(
      `Service request marked ${nextStatus}.`
    );
  };

  const orderItems =
    currentOrder?.items || [];

  const orderValue = Number(
    currentOrder?.total || 0
  );

  const activeServiceRequests =
    serviceRequests.filter(
      (request) =>
        request.status !==
        "Completed"
    );

  const completedServiceRequests =
    serviceRequests.filter(
      (request) =>
        request.status ===
        "Completed"
    );

  const orderProgress = useMemo(() => {
    if (!currentOrder?.status) {
      return 0;
    }

    const index =
      ORDER_STATUSES.indexOf(
        currentOrder.status
      );

    if (index === -1) {
      return 0;
    }

    return (
      ((index + 1) /
        ORDER_STATUSES.length) *
      100
    );
  }, [currentOrder]);

  const currentOrderStatusIndex =
    currentOrder
      ? ORDER_STATUSES.indexOf(
          currentOrder.status
        )
      : -1;

  const nextOrderStatus =
    currentOrderStatusIndex >= 0 &&
    currentOrderStatusIndex <
      ORDER_STATUSES.length - 1
      ? ORDER_STATUSES[
          currentOrderStatusIndex + 1
        ]
      : null;

  const statCards = [
    {
      label: "Today's Revenue",
      value: currentOrder
        ? `₹${orderValue.toLocaleString()}`
        : "₹0",
      detail: currentOrder
        ? "Current active order"
        : "Waiting for orders",
      icon: Activity,
      className: "revenue",
    },

    {
      label: "Active Orders",
      value: currentOrder
        ? "01"
        : "00",
      detail:
        currentOrder?.status ||
        "No active order",
      icon: ShoppingBag,
      className: "orders",
    },

    {
      label: "Tables",
      value: currentOrder
        ? "01"
        : "00",
      detail: currentOrder
        ? `Table ${currentOrder.table}`
        : "No active table",
      icon: Table2,
      className: "tables",
    },

    {
      label: "Service Requests",
      value: String(
        activeServiceRequests.length
      ).padStart(2, "0"),
      detail:
        activeServiceRequests.length >
        0
          ? "Needs attention"
          : "All clear",
      icon: Bell,
      className: "requests",
    },
  ];

  const logout = () => {
    navigate("/login");
  };

  return (
    <div className="sd-staff-page">

      {/* Ambient background */}

      <div className="sd-staff-background">
        <div className="sd-staff-orb sd-staff-orb-one" />
        <div className="sd-staff-orb sd-staff-orb-two" />
        <div className="sd-staff-grid" />
      </div>

      {/* Notification */}

      {notification && (
        <motion.div
          className={`sd-staff-toast ${notification.type}`}
          initial={{
            opacity: 0,
            y: -20,
            x: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
            x: 0,
          }}
          exit={{
            opacity: 0,
            y: -20,
          }}
        >
          <div className="sd-staff-toast-icon">
            {notification.type ===
            "error" ? (
              <X size={16} />
            ) : (
              <Check size={16} />
            )}
          </div>

          <span>
            {notification.message}
          </span>
        </motion.div>
      )}

      <div className="sd-staff-layout">

        {/* SIDEBAR */}

        <aside className="sd-staff-sidebar">

          <div className="sd-staff-brand">

            <div className="sd-staff-brand-mark">
              <UtensilsCrossed
                size={19}
              />
            </div>

            <div>
              <strong>
                SmartDine
              </strong>

              <span>
                Operations
              </span>
            </div>

          </div>

          <div className="sd-staff-role">

            <div className="sd-staff-role-avatar">
              <ChefHat size={17} />
            </div>

            <div>
              <span>
                Signed in as
              </span>

              <strong>
                Staff Member
              </strong>
            </div>

            <div className="sd-staff-online" />

          </div>

          {/* STAFF NAVIGATION */}

          <nav className="sd-staff-nav">

            {/* Dashboard */}

            <button
              className={
                activeSection ===
                "dashboard"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection(
                  "dashboard"
                );

                navigate(
                  "/staff"
                );
              }}
            >
              <LayoutDashboard
                size={17}
              />

              Dashboard
            </button>

            {/* Orders */}

            <button
              className={
                activeSection ===
                "orders"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection(
                  "orders"
                );
              }}
            >
              <ShoppingBag
                size={17}
              />

              Orders

              {currentOrder && (
                <span className="sd-staff-nav-badge">
                  1
                </span>
              )}
            </button>

            {/* Kitchen */}

            <button
              className={
                activeSection ===
                "kitchen"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection(
                  "kitchen"
                );

                navigate(
                  "/staff/kitchen"
                );
              }}
            >
              <ChefHat size={17} />

              Kitchen
            </button>

            {/* Waiter */}

            <button
              className={
                activeSection ===
                "waiter"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection(
                  "waiter"
                );

                navigate(
                  "/staff/waiter"
                );
              }}
            >
              <UserRound
                size={17}
              />

              Waiter
            </button>

            {/* Service Requests */}

            <button
              className={
                activeSection ===
                "service"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection(
                  "service"
                );
              }}
            >
              <Bell size={17} />

              Service Requests

              {activeServiceRequests.length >
                0 && (
                <span className="sd-staff-nav-badge">
                  {
                    activeServiceRequests.length
                  }
                </span>
              )}
            </button>

            {/* Tables */}

            <button
              className={
                activeSection ===
                "tables"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection(
                  "tables"
                );

                navigate(
                  "/staff/tables"
                );
              }}
            >
              <Table2 size={17} />

              Tables
            </button>

            {/* Inventory */}

            <button
              className={
                activeSection ===
                "inventory"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection(
                  "inventory"
                );

                navigate(
                  "/staff/inventory"
                );
              }}
            >
              <Package size={17} />

              Inventory
            </button>

            {/* Analytics */}

            <button
              className={
                activeSection ===
                "analytics"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection(
                  "analytics"
                );

                navigate(
                  "/staff/analytics"
                );
              }}
            >
              <Activity size={17} />

              Analytics
            </button>

            {/* Menu Management */}

            <button
              className={
                activeSection ===
                "menu"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection(
                  "menu"
                );

                navigate(
                  "/staff/menu-management"
                );
              }}
            >
              <UtensilsCrossed
                size={17}
              />

              Menu Management
            </button>

          </nav>

          {/* SIDEBAR BOTTOM */}

          <div className="sd-staff-sidebar-bottom">

            <button>
              <Settings size={17} />
              Settings
            </button>

            <button
              onClick={logout}
            >
              <LogOut size={17} />
              Sign out
            </button>

          </div>

        </aside>

        {/* MAIN */}

        <main className="sd-staff-main">

          {/* TOPBAR */}

          <header className="sd-staff-topbar">

            <div>

              <div className="sd-staff-breadcrumb">

                SmartDine

                <ChevronRight
                  size={13}
                />

                Operations

              </div>

              <h1>
                Good morning,
                <span>
                  {" "}
                  team.
                </span>
              </h1>

              <p>
                Here's what's happening
                across your dining floor.
              </p>

            </div>

            <div className="sd-staff-top-actions">

              <div className="sd-staff-live">
                <span />
                Live
              </div>

              <button
                className="sd-staff-refresh"
                onClick={
                  refreshData
                }
                title="Refresh dashboard"
              >
                <RefreshCw
                  size={17}
                  className={
                    isRefreshing
                      ? "spin"
                      : ""
                  }
                />
              </button>

              <button
                className="sd-staff-view-customer"
                onClick={() =>
                  navigate("/menu")
                }
              >
                Customer view

                <ArrowRight
                  size={15}
                />
              </button>

            </div>

          </header>

          {/* STATS */}

          <section className="sd-staff-stats">

            {statCards.map(
              (stat, index) => {
                const Icon =
                  stat.icon;

                return (
                  <motion.div
                    key={
                      stat.label
                    }
                    className={`sd-staff-stat ${stat.className}`}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.45,
                      delay:
                        index *
                        0.07,
                    }}
                  >

                    <div className="sd-staff-stat-top">

                      <div className="sd-staff-stat-icon">
                        <Icon
                          size={18}
                        />
                      </div>

                      <span className="sd-staff-stat-label">
                        {
                          stat.label
                        }
                      </span>

                    </div>

                    <strong>
                      {stat.value}
                    </strong>

                    <div className="sd-staff-stat-detail">
                      <span>
                        {
                          stat.detail
                        }
                      </span>
                    </div>

                  </motion.div>
                );
              }
            )}

          </section>

          {/* DASHBOARD GRID */}

          <section className="sd-staff-dashboard-grid">

            {/* ORDER PANEL */}

            <motion.div
              className="sd-staff-panel sd-staff-order-panel"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15,
              }}
            >

              <div className="sd-staff-panel-header">

                <div>

                  <span className="sd-staff-panel-eyebrow">
                    LIVE ORDER QUEUE
                  </span>

                  <h2>
                    Kitchen orders
                  </h2>

                </div>

                <div className="sd-staff-live-label">
                  <span />
                  Real-time
                </div>

              </div>

              {!currentOrder ? (

                <div className="sd-staff-empty">

                  <div className="sd-staff-empty-icon">
                    <Coffee
                      size={24}
                    />
                  </div>

                  <h3>
                    No active orders
                  </h3>

                  <p>
                    New customer orders
                    will appear here
                    automatically.
                  </p>

                  <button
                    onClick={
                      refreshData
                    }
                  >
                    Refresh queue

                    <RefreshCw
                      size={14}
                    />
                  </button>

                </div>

              ) : (

                <div className="sd-staff-order">

                  <div className="sd-staff-order-top">

                    <div>

                      <div className="sd-staff-order-id">

                        <span>
                          ORDER
                        </span>

                        #
                        {
                          currentOrder.id
                        }

                      </div>

                      <div className="sd-staff-order-table">

                        <Table2
                          size={14}
                        />

                        Table{" "}
                        {
                          currentOrder.table
                        }

                        <span>
                          •
                        </span>

                        {
                          orderItems.length
                        }{" "}
                        item
                        {
                          orderItems.length !==
                          1
                            ? "s"
                            : ""
                        }

                      </div>

                    </div>

                    <div
                      className={`sd-staff-status ${
                        STATUS_META[
                          currentOrder
                            .status
                        ]?.className ||
                        ""
                      }`}
                    >
                      {
                        STATUS_META[
                          currentOrder
                            .status
                        ]?.label ||
                        currentOrder.status
                      }
                    </div>

                  </div>

                  {/* ORDER PROGRESS */}

                  <div className="sd-staff-order-progress">

                    <div className="sd-staff-progress-line">

                      <motion.div
                        className="sd-staff-progress-fill"
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${orderProgress}%`,
                        }}
                        transition={{
                          duration: 0.6,
                        }}
                      />

                    </div>

                    <div className="sd-staff-progress-steps">

                      {ORDER_STATUSES.map(
                        (
                          status,
                          index
                        ) => (

                          <div
                            key={
                              status
                            }
                            className={
                              index <=
                              currentOrderStatusIndex
                                ? "completed"
                                : ""
                            }
                          >

                            <span>

                              {index <=
                              currentOrderStatusIndex ? (
                                <Check
                                  size={
                                    10
                                  }
                                />
                              ) : (
                                index + 1
                              )}

                            </span>

                            <small>
                              {
                                status
                              }
                            </small>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  {/* ORDER ITEMS */}

                  <div className="sd-staff-order-items">

                    {orderItems.map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          className="sd-staff-order-item"
                          key={`${item.id}-${index}`}
                        >

                          <div className="sd-staff-item-number">
                            {
                              item.quantity ||
                              1
                            }×
                          </div>

                          <div className="sd-staff-item-info">

                            <strong>
                              {
                                item.name
                              }
                            </strong>

                            <span>

                              {item.spice &&
                                `${item.spice} spice`}

                              {item.addOns
                                ?.length >
                                0 &&
                                `${
                                  item.spice
                                    ? " • "
                                    : ""
                                }${
                                  item.addOns
                                    .length
                                } add-on${
                                  item.addOns
                                    .length >
                                  1
                                    ? "s"
                                    : ""
                                }`}

                            </span>

                            {item.instructions && (
                              <em>
                                Note:{" "}
                                {
                                  item.instructions
                                }
                              </em>
                            )}

                          </div>

                          <strong className="sd-staff-item-price">

                            ₹
                            {(
                              Number(
                                item.finalPrice
                              ) ||
                              Number(
                                item.price
                              ) *
                                Number(
                                  item.quantity ||
                                    1
                                )
                            ).toLocaleString()}

                          </strong>

                        </div>

                      )
                    )}

                  </div>

                  {/* ORDER FOOTER */}

                  <div className="sd-staff-order-footer">

                    <div>

                      <span>
                        Total
                      </span>

                      <strong>
                        ₹
                        {
                          orderValue.toLocaleString()
                        }
                      </strong>

                    </div>

                    {nextOrderStatus ? (

                      <button
                        className="sd-staff-primary-action"
                        onClick={() =>
                          updateOrderStatus(
                            nextOrderStatus
                          )
                        }
                      >

                        {nextOrderStatus ===
                          "Kitchen Accepted" && (
                          <ChefHat
                            size={15}
                          />
                        )}

                        {nextOrderStatus ===
                          "Preparing" && (
                          <Activity
                            size={15}
                          />
                        )}

                        {nextOrderStatus ===
                          "Ready" && (
                          <Check
                            size={15}
                          />
                        )}

                        {nextOrderStatus ===
                          "Served" && (
                          <UtensilsCrossed
                            size={15}
                          />
                        )}

                        Move to{" "}
                        {
                          nextOrderStatus
                        }

                        <ArrowRight
                          size={14}
                        />

                      </button>

                    ) : (

                      <div className="sd-staff-completed">

                        <Check
                          size={15}
                        />

                        Order completed

                      </div>

                    )}

                  </div>

                </div>
              )}

            </motion.div>

            {/* SERVICE REQUESTS */}

            <motion.div
              className="sd-staff-panel sd-staff-service-panel"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.23,
              }}
            >

              <div className="sd-staff-panel-header">

                <div>

                  <span className="sd-staff-panel-eyebrow">
                    GUEST SUPPORT
                  </span>

                  <h2>
                    Service requests
                  </h2>

                </div>

                <span className="sd-staff-request-count">
                  {
                    activeServiceRequests.length
                  }
                </span>

              </div>

              <div className="sd-staff-service-list">

                {serviceRequests.length ===
                0 ? (

                  <div className="sd-staff-small-empty">

                    <Bell
                      size={20}
                    />

                    <span>
                      No service requests
                      yet.
                    </span>

                  </div>

                ) : (

                  serviceRequests
                    .slice()
                    .reverse()
                    .map(
                      (
                        request
                      ) => (

                        <div
                          key={
                            request.id
                          }
                          className="sd-staff-service-item"
                        >

                          <div className="sd-staff-service-icon">

                            {request.serviceId ===
                              "water" && (
                              <Coffee
                                size={17}
                              />
                            )}

                            {request.serviceId ===
                              "plates" && (
                              <UtensilsCrossed
                                size={17}
                              />
                            )}

                            {request.serviceId ===
                              "cutlery" && (
                              <UtensilsCrossed
                                size={17}
                              />
                            )}

                            {request.serviceId ===
                              "tissues" && (
                              <Package
                                size={17}
                              />
                            )}

                            {request.serviceId ===
                              "waiter" && (
                              <UserRound
                                size={17}
                              />
                            )}

                            {request.serviceId ===
                              "bill" && (
                              <ShoppingBag
                                size={17}
                              />
                            )}

                          </div>

                          <div className="sd-staff-service-info">

                            <strong>
                              {
                                request.service ||
                                SERVICE_NAMES[
                                  request
                                    .serviceId
                                ] ||
                                "Service Request"
                              }
                            </strong>

                            <span>
                              Table{" "}
                              {
                                request.table
                              }{" "}
                              •{" "}
                              {
                                request.note ||
                                "No note added"
                              }
                            </span>

                          </div>

                          <div className="sd-staff-service-actions">

                            <span
                              className={`sd-staff-service-status ${
                                SERVICE_META[
                                  request
                                    .status
                                ]
                                  ?.className ||
                                ""
                              }`}
                            >
                              {
                                request.status
                              }
                            </span>

                            {request.status ===
                              "Requested" && (

                              <button
                                onClick={() =>
                                  updateServiceRequest(
                                    request.id,
                                    "Accepted"
                                  )
                                }
                              >
                                Accept
                              </button>

                            )}

                            {request.status ===
                              "Accepted" && (

                              <button
                                onClick={() =>
                                  updateServiceRequest(
                                    request.id,
                                    "Completed"
                                  )
                                }
                              >
                                Complete
                              </button>

                            )}

                            {request.status ===
                              "Completed" && (

                              <span className="sd-staff-done">
                                <Check
                                  size={13}
                                />
                              </span>

                            )}

                          </div>

                        </div>
                      )
                    )
                )}

              </div>

            </motion.div>

          </section>

          {/* BOTTOM ROW */}

          <section className="sd-staff-bottom-grid">

            {/* Kitchen */}

            <motion.div
              className="sd-staff-mini-panel"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
              }}
            >

              <div className="sd-staff-mini-header">

                <div className="sd-staff-mini-icon kitchen">
                  <ChefHat
                    size={18}
                  />
                </div>

                <div>

                  <span>
                    Kitchen
                  </span>

                  <strong>
                    Production status
                  </strong>

                </div>

                <div className="sd-staff-status-dot">

                  <span />

                  Online

                </div>

              </div>

              <div className="sd-staff-kitchen-metrics">

                <div>

                  <strong>
                    {currentOrder?.status ===
                    "Preparing"
                      ? "01"
                      : "00"}
                  </strong>

                  <span>
                    Preparing
                  </span>

                </div>

                <div>

                  <strong>
                    {currentOrder?.status ===
                    "Ready"
                      ? "01"
                      : "00"}
                  </strong>

                  <span>
                    Ready
                  </span>

                </div>

                <div>

                  <strong>
                    {currentOrder?.status ===
                    "Served"
                      ? "01"
                      : "00"}
                  </strong>

                  <span>
                    Served
                  </span>

                </div>

              </div>

              <button
                className="sd-staff-mini-link"
                onClick={() =>
                  navigate(
                    "/staff/kitchen"
                  )
                }
              >
                Open kitchen queue

                <ArrowRight
                  size={14}
                />
              </button>

            </motion.div>

            {/* Dining floor */}

            <motion.div
              className="sd-staff-mini-panel"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.36,
              }}
            >

              <div className="sd-staff-mini-header">

                <div className="sd-staff-mini-icon table">
                  <Table2
                    size={18}
                  />
                </div>

                <div>

                  <span>
                    Dining floor
                  </span>

                  <strong>
                    Current table
                  </strong>

                </div>

              </div>

              <div className="sd-staff-table-display">

                <div className="sd-staff-table-number">

                  {
                    currentOrder?.table ||
                    tableNumber
                  }

                </div>

                <div>

                  <span>
                    TABLE
                  </span>

                  <strong>
                    {currentOrder
                      ? "Active session"
                      : "Waiting for guest"}
                  </strong>

                </div>

              </div>

              <div className="sd-staff-table-session">

                <span>
                  Session
                </span>

                <strong>
                  {
                    currentOrder?.id ||
                    sessionId.slice(-12)
                  }
                </strong>

              </div>

              <button
                className="sd-staff-mini-link"
                onClick={() =>
                  navigate(
                    "/staff/tables"
                  )
                }
              >
                View dining floor

                <ArrowRight
                  size={14}
                />
              </button>

            </motion.div>

            {/* Activity */}

            <motion.div
              className="sd-staff-mini-panel"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.42,
              }}
            >

              <div className="sd-staff-mini-header">

                <div className="sd-staff-mini-icon activity">
                  <Activity
                    size={18}
                  />
                </div>

                <div>

                  <span>
                    Activity
                  </span>

                  <strong>
                    Session overview
                  </strong>

                </div>

              </div>

              <div className="sd-staff-activity-list">

                <div>

                  <span className="sd-staff-activity-dot green" />

                  <div>

                    <strong>
                      Kitchen connected
                    </strong>

                    <small>
                      Real-time queue active
                    </small>

                  </div>

                </div>

                <div>

                  <span className="sd-staff-activity-dot gold" />

                  <div>

                    <strong>

                      {
                        completedServiceRequests.length
                      }{" "}

                      service request
                      {
                        completedServiceRequests.length !==
                        1
                          ? "s"
                          : ""
                      }{" "}
                      completed

                    </strong>

                    <small>
                      During current
                      session
                    </small>

                  </div>

                </div>

                <div>

                  <span className="sd-staff-activity-dot dark" />

                  <div>

                    <strong>
                      Session monitored
                    </strong>

                    <small>
                      {currentOrder
                        ? `Table ${currentOrder.table}`
                        : "No active order"}
                    </small>

                  </div>

                </div>

              </div>

            </motion.div>

          </section>

          {/* FOOTER */}

          <footer className="sd-staff-footer">

            <div>

              <UtensilsCrossed
                size={15}
              />

              <span>
                SmartDine Operations
              </span>

            </div>

            <span>
              Hospitality intelligence,
              built for modern dining.
            </span>

          </footer>

        </main>

      </div>

    </div>
  );
}