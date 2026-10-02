import { motion } from "framer-motion";

import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  Coffee,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Utensils,
  Users,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

const TABLE_COUNT = 20;

const TABLE_STATUS = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  ORDERING: "Ordering",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVICE: "Service",
};

/* =========================================================
   ORDER HELPERS
========================================================= */

function getOrders() {
  try {
    const currentOrder = JSON.parse(
      localStorage.getItem("smartdine_current_order") || "null"
    );

    const activeOrders = JSON.parse(
      localStorage.getItem("smartdine_active_orders") || "[]"
    );

    const allOrders = [
      ...(Array.isArray(activeOrders) ? activeOrders : []),
      ...(currentOrder ? [currentOrder] : []),
    ];

    const unique = new Map();

    allOrders.forEach((order) => {
      if (!order || order.table == null) {
        return;
      }

      const key = String(
        order.id ?? `table-${order.table}`
      );

      unique.set(key, order);
    });

    return Array.from(unique.values());
  } catch {
    return [];
  }
}

function getOrderForTable(tableNumber, orders) {
  const table = String(tableNumber);

  return (
    (orders || []).find(
      (order) =>
        order &&
        String(order.table) === table &&
        ![
          "Paid",
          "Completed",
          "Cancelled",
        ].includes(order.status)
    ) || null
  );
}

/* =========================================================
   SERVICE REQUEST HELPERS
========================================================= */

function getRequests() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(
          "smartdine_service_requests"
        )
      ) || []
    );
  } catch {
    return [];
  }
}

function getTableNumber() {
  return localStorage.getItem("smartdine_table");
}

/* =========================================================
   TABLE STATUS
========================================================= */

function getTableStatus(
  tableNumber,
  orders,
  requests
) {
  const table = String(tableNumber);

  const order = getOrderForTable(
    tableNumber,
    orders
  );

  const serviceRequest = requests.some(
    (request) =>
      String(request.table) === table &&
      request.status !== "Completed"
  );

  if (serviceRequest) {
    return TABLE_STATUS.SERVICE;
  }

  if (!order) {
    return TABLE_STATUS.AVAILABLE;
  }

  switch (order.status) {
    case "Order Placed":
      return TABLE_STATUS.ORDERING;

    case "Kitchen Accepted":
    case "Preparing":
      return TABLE_STATUS.PREPARING;

    case "Ready":
      return TABLE_STATUS.READY;

    case "Served":
      return TABLE_STATUS.OCCUPIED;

    default:
      return TABLE_STATUS.OCCUPIED;
  }
}

/* =========================================================
   TIME FORMATTER
========================================================= */

function formatTime(dateString) {
  if (!dateString) {
    return "--";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   STATUS ICON
========================================================= */

function getStatusIcon(status) {
  switch (status) {
    case TABLE_STATUS.AVAILABLE:
      return CheckCircle2;

    case TABLE_STATUS.SERVICE:
      return Bell;

    case TABLE_STATUS.PREPARING:
      return Utensils;

    case TABLE_STATUS.READY:
      return Sparkles;

    case TABLE_STATUS.ORDERING:
      return ShoppingBag;

    default:
      return Coffee;
  }
}

/* =========================================================
   TABLES PAGE
========================================================= */

export default function Tables() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState(
    getOrders
  );

  const [requests, setRequests] = useState(
    getRequests
  );

  const [activeFilter, setActiveFilter] =
    useState("All");

  const [selectedTable, setSelectedTable] =
    useState(null);

  /* =======================================================
     LIVE DATA REFRESH
  ======================================================= */

  useEffect(() => {
    const refresh = () => {
      setOrders(getOrders());
      setRequests(getRequests());
    };

    window.addEventListener(
      "smartdine-order-updated",
      refresh
    );

    window.addEventListener(
      "smartdine-order-created",
      refresh
    );

    window.addEventListener(
      "smartdine-order-placed",
      refresh
    );

    window.addEventListener(
      "smartdine-service-updated",
      refresh
    );

    window.addEventListener(
      "storage",
      refresh
    );

    const interval = setInterval(
      refresh,
      1000
    );

    return () => {
      window.removeEventListener(
        "smartdine-order-updated",
        refresh
      );

      window.removeEventListener(
        "smartdine-order-created",
        refresh
      );

      window.removeEventListener(
        "smartdine-order-placed",
        refresh
      );

      window.removeEventListener(
        "smartdine-service-updated",
        refresh
      );

      window.removeEventListener(
        "storage",
        refresh
      );

      clearInterval(interval);
    };
  }, []);

  /* =======================================================
     TABLE DATA
  ======================================================= */

  const tables = useMemo(() => {
    return Array.from(
      { length: TABLE_COUNT },
      (_, index) => {
        const number = index + 1;

        return {
          number,

          status: getTableStatus(
            number,
            orders,
            requests
          ),
        };
      }
    );
  }, [orders, requests]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    return {
      available: tables.filter(
        (table) =>
          table.status ===
          TABLE_STATUS.AVAILABLE
      ).length,

      occupied: tables.filter(
        (table) =>
          table.status ===
          TABLE_STATUS.OCCUPIED
      ).length,

      ordering: tables.filter(
        (table) =>
          table.status ===
          TABLE_STATUS.ORDERING
      ).length,

      preparing: tables.filter(
        (table) =>
          table.status ===
          TABLE_STATUS.PREPARING
      ).length,

      ready: tables.filter(
        (table) =>
          table.status ===
          TABLE_STATUS.READY
      ).length,

      service: tables.filter(
        (table) =>
          table.status ===
          TABLE_STATUS.SERVICE
      ).length,
    };
  }, [tables]);

  /* =======================================================
     FILTERED TABLES
  ======================================================= */

  const filteredTables = useMemo(() => {
    if (activeFilter === "All") {
      return tables;
    }

    return tables.filter(
      (table) =>
        table.status === activeFilter
    );
  }, [activeFilter, tables]);

  /* =======================================================
     SELECTED TABLE
  ======================================================= */

  const selectedStatus = selectedTable
    ? tables.find(
        (table) =>
          table.number === selectedTable
      )?.status
    : null;

  const selectedOrder = selectedTable
    ? getOrderForTable(
        selectedTable,
        orders
      )
    : null;

  const selectedRequests = selectedTable
    ? requests.filter(
        (request) =>
          String(request.table) ===
            String(selectedTable) &&
          request.status !== "Completed"
      )
    : [];

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="sd-tables-page">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="sd-tables-bg">

        <div className="sd-tables-orb sd-tables-orb-one" />

        <div className="sd-tables-orb sd-tables-orb-two" />

        <div className="sd-tables-grid" />

      </div>

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sd-tables-sidebar">

        <button
          className="sd-tables-brand"
          onClick={() =>
            navigate("/staff")
          }
        >

          <div className="sd-tables-brand-mark">
            <Utensils size={20} />
          </div>

          <div>
            <strong>
              SmartDine
            </strong>

            <span>
              Staff Console
            </span>
          </div>

        </button>

        <div className="sd-tables-nav-section">

          <span>
            OPERATIONS
          </span>

          <button
            className="sd-tables-nav-item"
            onClick={() =>
              navigate("/staff")
            }
          >

            <LayoutDashboard size={18} />

            Dashboard

          </button>

          <button
            className="sd-tables-nav-item"
            onClick={() =>
              navigate("/staff/kitchen")
            }
          >

            <Utensils size={18} />

            Kitchen

          </button>

          <button
            className="sd-tables-nav-item"
            onClick={() =>
              navigate("/staff/waiter")
            }
          >

            <Bell size={18} />

            Service Requests

            {stats.service > 0 && (
              <span className="sd-tables-nav-badge">
                {stats.service}
              </span>
            )}

          </button>

          <button className="sd-tables-nav-item active">

            <Coffee size={18} />

            Tables

          </button>

        </div>

        <div className="sd-tables-sidebar-bottom">

          <div className="sd-tables-online">

            <span />

            <div>

              <strong>
                Restaurant live
              </strong>

              <small>
                Table monitoring active
              </small>

            </div>

          </div>

          <button
            className="sd-tables-exit"
            onClick={() =>
              navigate("/login")
            }
          >

            <LogOut size={17} />

            Exit

          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="sd-tables-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="sd-tables-header">

          <div>

            <div className="sd-tables-mobile-title">

              <button
                onClick={() =>
                  navigate("/staff")
                }
              >
                <LayoutDashboard size={18} />
              </button>

              Staff / Tables

            </div>

            <span className="sd-tables-kicker">
              FLOOR MANAGEMENT
            </span>

            <h1>
              Table Overview
            </h1>

            <p>
              Monitor every table and
              understand the dining floor
              at a glance.
            </p>

          </div>

          <button
            className="sd-tables-refresh"
            onClick={() => {
              setOrders(getOrders());
              setRequests(getRequests());
            }}
          >

            <RefreshCw size={17} />

            Refresh floor

          </button>

        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="sd-tables-stats">

          <div className="sd-tables-stat">

            <span className="sd-table-stat-dot available" />

            <div>

              <small>
                Available
              </small>

              <strong>
                {stats.available}
              </strong>

            </div>

          </div>

          <div className="sd-tables-stat">

            <span className="sd-table-stat-dot occupied" />

            <div>

              <small>
                Occupied
              </small>

              <strong>
                {stats.occupied}
              </strong>

            </div>

          </div>

          <div className="sd-tables-stat">

            <span className="sd-table-stat-dot ordering" />

            <div>

              <small>
                Ordering
              </small>

              <strong>
                {stats.ordering}
              </strong>

            </div>

          </div>

          <div className="sd-tables-stat">

            <span className="sd-table-stat-dot preparing" />

            <div>

              <small>
                Preparing
              </small>

              <strong>
                {stats.preparing}
              </strong>

            </div>

          </div>

          <div className="sd-tables-stat">

            <span className="sd-table-stat-dot ready" />

            <div>

              <small>
                Ready
              </small>

              <strong>
                {stats.ready}
              </strong>

            </div>

          </div>

          <div className="sd-tables-stat">

            <span className="sd-table-stat-dot service" />

            <div>

              <small>
                Service
              </small>

              <strong>
                {stats.service}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="sd-tables-toolbar">

          <div className="sd-tables-filters">

            {[
              "All",
              TABLE_STATUS.AVAILABLE,
              TABLE_STATUS.OCCUPIED,
              TABLE_STATUS.ORDERING,
              TABLE_STATUS.PREPARING,
              TABLE_STATUS.READY,
              TABLE_STATUS.SERVICE,
            ].map((filter) => (

              <button
                key={filter}
                className={
                  activeFilter === filter
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveFilter(filter)
                }
              >
                {filter}
              </button>

            ))}

          </div>

          <div className="sd-tables-capacity">

            <Users size={15} />

            {TABLE_COUNT} tables

          </div>

        </section>

        {/* =================================================
            FLOOR
        ================================================= */}

        <section className="sd-tables-floor">

          {filteredTables.map(
            (table, index) => {

              const Icon =
                getStatusIcon(
                  table.status
                );

              const isCurrent =
                String(
                  getTableNumber()
                ) ===
                String(table.number);

              return (

                <motion.button
                  key={table.number}
                  className={`sd-table-card ${table.status
                    .toLowerCase()
                    .replace(" ", "-")} ${
                    isCurrent
                      ? "current"
                      : ""
                  }`}
                  initial={{
                    opacity: 0,
                    y: 18,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.025,
                  }}
                  whileHover={{
                    y: -5,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={() =>
                    setSelectedTable(
                      table.number
                    )
                  }
                >

                  <div className="sd-table-card-top">

                    <span>
                      TABLE
                    </span>

                    {isCurrent && (
                      <small>
                        ACTIVE SESSION
                      </small>
                    )}

                  </div>

                  <strong className="sd-table-number">

                    {String(
                      table.number
                    ).padStart(2, "0")}

                  </strong>

                  <div className="sd-table-status">

                    <span className="sd-table-status-icon">

                      <Icon size={14} />

                    </span>

                    {table.status}

                  </div>

                  <div className="sd-table-card-line" />

                </motion.button>

              );
            }
          )}

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <section className="sd-tables-footer">

          <div>

            <span>
              FLOOR STATUS
            </span>

            <h2>
              Your dining floor,
              <em>
                {" "}in real time.
              </em>
            </h2>

          </div>

          <div className="sd-tables-footer-actions">

            <button
              onClick={() =>
                navigate(
                  "/staff/kitchen"
                )
              }
            >

              Kitchen

              <ArrowRight size={16} />

            </button>

            <button
              onClick={() =>
                navigate(
                  "/staff/waiter"
                )
              }
            >

              Service desk

              <ArrowRight size={16} />

            </button>

          </div>

        </section>

      </main>

      {/* =================================================
          TABLE DETAILS MODAL
      ================================================= */}

      {selectedTable && (

        <div
          className="sd-tables-modal-backdrop"
          onClick={() =>
            setSelectedTable(null)
          }
        >

          <motion.div
            className="sd-tables-modal"
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* =================================================
                CLOSE BUTTON
            ================================================= */}

            <button
              className="sd-tables-modal-close"
              onClick={() =>
                setSelectedTable(null)
              }
            >

              <X size={18} />

            </button>

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="sd-tables-modal-head">

              <div>

                <span>
                  TABLE
                </span>

                <h2>

                  {String(
                    selectedTable
                  ).padStart(2, "0")}

                </h2>

              </div>

              <div
                className={`sd-tables-modal-status ${selectedStatus
                  ?.toLowerCase()
                  .replace(" ", "-")}`}
              >

                {selectedStatus}

              </div>

            </div>

            <div className="sd-tables-modal-divider" />

            {/* =================================================
                ACTIVE ORDER
            ================================================= */}

            {selectedOrder ? (

              <>

                <div className="sd-tables-order-summary">

                  <div>

                    <small>
                      ORDER
                    </small>

                    <strong>
                      #{selectedOrder.id}
                    </strong>

                  </div>

                  <div>

                    <small>
                      STATUS
                    </small>

                    <strong>
                      {selectedOrder.status}
                    </strong>

                  </div>

                  <div>

                    <small>
                      TIME
                    </small>

                    <strong>
                      {formatTime(
                        selectedOrder.createdAt
                      )}
                    </strong>

                  </div>

                  <div>

                    <small>
                      TOTAL
                    </small>

                    <strong>
                      ₹
                      {Number(
                        selectedOrder.total || 0
                      ).toFixed(0)}
                    </strong>

                  </div>

                </div>

                {/* =================================================
                    ORDER ITEMS
                ================================================= */}

                <div className="sd-tables-order-items">

                  <span>
                    ORDER ITEMS
                  </span>

                  {selectedOrder.items?.map(
                    (item, index) => {

                      const quantity =
                        Number(
                          item.quantity || 1
                        );

                      const price =
                        Number(
                          item.finalPrice ??
                            item.price ??
                            0
                        );

                      return (

                        <div
                          key={`${item.id}-${index}`}
                        >

                          <span>

                            {quantity} ×{" "}

                            {item.name}

                          </span>

                          <strong>

                            ₹
                            {(
                              price *
                              quantity
                            ).toFixed(0)}

                          </strong>

                        </div>

                      );
                    }
                  )}

                </div>

              </>

            ) : (

              /* =================================================
                 AVAILABLE TABLE
              ================================================= */

              <div className="sd-tables-available">

                <div>

                  <CheckCircle2 size={24} />

                </div>

                <h3>
                  Table is available
                </h3>

                <p>
                  No active order is
                  currently associated
                  with this table.
                </p>

              </div>

            )}

            {/* =================================================
                SERVICE REQUESTS
            ================================================= */}

            {selectedRequests.length > 0 && (

              <div className="sd-tables-service-alert">

                <div>

                  <Bell size={18} />

                </div>

                <section>

                  <strong>
                    Service requested
                  </strong>

                  {selectedRequests.map(
                    (request) => (

                      <p
                        key={request.id}
                      >
                        {request.service}
                      </p>

                    )
                  )}

                </section>

              </div>

            )}

            {/* =================================================
                MODAL ACTIONS
            ================================================= */}

            <div className="sd-tables-modal-actions">

              <button
                onClick={() =>
                  navigate(
                    "/staff/kitchen"
                  )
                }
              >

                Open kitchen

                <ArrowRight size={16} />

              </button>

              <button
                onClick={() =>
                  navigate(
                    "/staff/waiter"
                  )
                }
              >

                Service desk

                <ArrowRight size={16} />

              </button>

            </div>

          </motion.div>

        </div>

      )}

    </div>
  );
}