import { motion } from "framer-motion";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock3,
  DollarSign,
  Download,
  LayoutDashboard,
  LogOut,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const SAMPLE_ORDERS = [
  {
    id: "SD-1048",
    table: 4,
    total: 920,
    status: "Paid",
    createdAt: new Date(
      Date.now() - 1000 * 60 * 35
    ).toISOString(),
    items: [
      {
        name: "Classic Chicken Biriyani",
        quantity: 2,
        price: 220,
      },
      {
        name: "Mango Cooler",
        quantity: 2,
        price: 130,
      },
    ],
  },
  {
    id: "SD-1047",
    table: 8,
    total: 1280,
    status: "Paid",
    createdAt: new Date(
      Date.now() - 1000 * 60 * 70
    ).toISOString(),
    items: [
      {
        name: "Truffle Mushroom Pizza",
        quantity: 2,
        price: 360,
      },
      {
        name: "Chocolate Lava Cake",
        quantity: 2,
        price: 190,
      },
    ],
  },
  {
    id: "SD-1046",
    table: 3,
    total: 740,
    status: "Paid",
    createdAt: new Date(
      Date.now() - 1000 * 60 * 115
    ).toISOString(),
    items: [
      {
        name: "Smoky Chicken Burger",
        quantity: 2,
        price: 280,
      },
      {
        name: "Fresh Mango Cooler",
        quantity: 1,
        price: 130,
      },
    ],
  },
  {
    id: "SD-1045",
    table: 12,
    total: 510,
    status: "Paid",
    createdAt: new Date(
      Date.now() - 1000 * 60 * 160
    ).toISOString(),
    items: [
      {
        name: "Samosa",
        quantity: 1,
        price: 210,
      },
      {
        name: "Creamy Alfredo Pasta",
        quantity: 1,
        price: 290,
      },
    ],
  },
  {
    id: "SD-1044",
    table: 7,
    total: 680,
    status: "Paid",
    createdAt: new Date(
      Date.now() - 1000 * 60 * 220
    ).toISOString(),
    items: [
      {
        name: "Classic Chicken Biriyani",
        quantity: 2,
        price: 220,
      },
      {
        name: "Samosa",
        quantity: 1,
        price: 210,
      },
    ],
  },
];

const POPULAR_DISHES = [
  {
    name: "Classic Chicken Biriyani",
    category: "Biriyani",
    orders: 48,
    revenue: 10560,
  },
  {
    name: "Truffle Mushroom Pizza",
    category: "Pizza",
    orders: 36,
    revenue: 12960,
  },
  {
    name: "Smoky Chicken Burger",
    category: "Burgers",
    orders: 31,
    revenue: 8680,
  },
  {
    name: "Samosa",
    category: "Starters",
    orders: 27,
    revenue: 5670,
  },
  {
    name: "Fresh Mango Cooler",
    category: "Beverages",
    orders: 24,
    revenue: 3120,
  },
];

const HOURS = [
  { label: "11 AM", value: 28 },
  { label: "12 PM", value: 42 },
  { label: "1 PM", value: 64 },
  { label: "2 PM", value: 48 },
  { label: "3 PM", value: 31 },
  { label: "6 PM", value: 44 },
  { label: "7 PM", value: 71 },
  { label: "8 PM", value: 92 },
  { label: "9 PM", value: 77 },
  { label: "10 PM", value: 53 },
];

function readStoredOrders() {
  try {
    const history =
      JSON.parse(
        localStorage.getItem(
          "smartdine_order_history"
        )
      ) || [];

    return Array.isArray(history)
      ? history
      : [];
  } catch {
    return [];
  }
}

function readCurrentOrder() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "smartdine_current_order"
      )
    );
  } catch {
    return null;
  }
}

function readInventory() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(
          "smartdine_inventory"
        )
      ) || []
    );
  } catch {
    return [];
  }
}

function readRequests() {
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

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;
}

function formatTime(dateString) {
  if (!dateString) return "--";

  return new Date(
    dateString
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Analytics() {
  const navigate = useNavigate();

  const [range, setRange] = useState("Today");
  const [storedOrders, setStoredOrders] =
    useState(readStoredOrders);
  const [currentOrder, setCurrentOrder] =
    useState(readCurrentOrder);
  const [inventory, setInventory] =
    useState(readInventory);
  const [requests, setRequests] =
    useState(readRequests);

  useEffect(() => {
    const refresh = () => {
      setStoredOrders(readStoredOrders());
      setCurrentOrder(readCurrentOrder());
      setInventory(readInventory());
      setRequests(readRequests());
    };

    window.addEventListener(
      "smartdine-order-updated",
      refresh
    );

    window.addEventListener(
      "smartdine-inventory-updated",
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
      1500
    );

    return () => {
      window.removeEventListener(
        "smartdine-order-updated",
        refresh
      );

      window.removeEventListener(
        "smartdine-inventory-updated",
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

  const orders = useMemo(() => {
    const combined = [
      ...storedOrders,
      ...(currentOrder
        ? [currentOrder]
        : []),
    ];

    const unique = new Map();

    combined.forEach((order) => {
      if (order?.id) {
        unique.set(order.id, order);
      }
    });

    const realOrders = Array.from(
      unique.values()
    );

    return [
      ...SAMPLE_ORDERS,
      ...realOrders,
    ];
  }, [storedOrders, currentOrder]);

    const filteredOrders = useMemo(() => {
    const now = new Date();

    let startDate;

    if (range === "Today") {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
    } else if (range === "Week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    }

    return orders.filter((order) => {
      if (!order?.createdAt) return false;

      const orderDate = new Date(order.createdAt);

      return (
        !Number.isNaN(orderDate.getTime()) &&
        orderDate >= startDate &&
        orderDate <= now
      );
    });
  }, [orders, range]);

  const metrics = useMemo(() => {
    const paidOrders = filteredOrders.filter(
      (order) =>
        order.status === "Paid" ||
        order.status === "Served" ||
        order.status === "Ready"
    );

    const revenue = paidOrders.reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );

    const orderCount = filteredOrders.length;

    const average =
      orderCount > 0
        ? revenue / orderCount
        : 0;

    const lowStock = inventory.filter(
      (item) =>
        Number(item.stock) <=
        Number(item.minimum)
    ).length;

    const pendingRequests = requests.filter(
      (request) =>
        request.status !== "Completed"
    ).length;

    return {
      revenue,
      orderCount,
      average,
      lowStock,
      pendingRequests,
    };
  }, [
    filteredOrders,
    inventory,
    requests,
  ]);

    const dishRanking = useMemo(() => {
    const counts = {};

    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!item?.name) return;

        if (!counts[item.name]) {
          counts[item.name] = {
            name: item.name,
            orders: 0,
            revenue: 0,
          };
        }

        const quantity = Number(
          item.quantity || 1
        );

        const unitPrice = Number(
          item.finalPrice ??
            item.price ??
            0
        );

        counts[item.name].orders += quantity;

        counts[item.name].revenue +=
          unitPrice * quantity;
      });
    });

    const realRanking = Object.values(
      counts
    ).sort(
      (a, b) => b.orders - a.orders
    );

    if (realRanking.length > 0) {
      return realRanking.slice(0, 5);
    }

    return POPULAR_DISHES;
  }, [filteredOrders]);

    const statusData = useMemo(() => {
    const statuses = [
      "Order Placed",
      "Kitchen Accepted",
      "Preparing",
      "Ready",
      "Served",
      "Paid",
    ];

    return statuses.map((status) => ({
      status,
      count: filteredOrders.filter(
        (order) =>
          order.status === status
      ).length,
    }));
  }, [filteredOrders]);

  const maxStatus =
    Math.max(
      ...statusData.map(
        (item) => item.count
      ),
      1
    );

  const maxDishOrders =
    Math.max(
      ...dishRanking.map(
        (item) => item.orders
      ),
      1
    );

  return (
    <div className="sd-analytics-page">
      <div className="sd-analytics-bg">
        <div className="sd-analytics-orb sd-analytics-orb-one" />
        <div className="sd-analytics-orb sd-analytics-orb-two" />
        <div className="sd-analytics-grid" />
      </div>

      <aside className="sd-analytics-sidebar">
        <button
          className="sd-analytics-brand"
          onClick={() => navigate("/")}
        >
          <div className="sd-analytics-brand-mark">
            <Utensils size={20} />
          </div>

          <div>
            <strong>SmartDine</strong>
            <span>Staff Console</span>
          </div>
        </button>

        <div className="sd-analytics-nav-section">
          <span>OPERATIONS</span>

          <button
            className="sd-analytics-nav-item"
            onClick={() =>
              navigate("/staff")
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            className="sd-analytics-nav-item"
            onClick={() =>
              navigate("/staff/kitchen")
            }
          >
            <Utensils size={18} />
            Kitchen
          </button>

          <button
            className="sd-analytics-nav-item"
            onClick={() =>
              navigate("/staff/waiter")
            }
          >
            <Package size={18} />
            Service Requests
          </button>

          <button
            className="sd-analytics-nav-item"
            onClick={() =>
              navigate("/staff/tables")
            }
          >
            <Boxes size={18} />
            Tables
          </button>

          <button
            className="sd-analytics-nav-item"
            onClick={() =>
              navigate("/staff/inventory")
            }
          >
            <Package size={18} />
            Inventory
          </button>

          <button className="sd-analytics-nav-item active">
            <BarChart3 size={18} />
            Analytics
          </button>
        </div>

        <div className="sd-analytics-sidebar-bottom">
          <div className="sd-analytics-online">
            <span />
            <div>
              <strong>Analytics live</strong>
              <small>Monitoring restaurant data</small>
            </div>
          </div>

          <button
            className="sd-analytics-exit"
            onClick={() => navigate("/")}
          >
            <LogOut size={17} />
            Exit
          </button>
        </div>
      </aside>

      <main className="sd-analytics-main">
        <header className="sd-analytics-header">
          <div>
            <div className="sd-analytics-mobile-title">
              <button
                onClick={() =>
                  navigate("/staff")
                }
              >
                <LayoutDashboard size={18} />
              </button>

              Staff / Analytics
            </div>

            <span className="sd-analytics-kicker">
              BUSINESS INTELLIGENCE
            </span>

            <h1>Analytics</h1>

            <p>
              Understand what is happening across
              your dining operation.
            </p>
          </div>

          <div className="sd-analytics-header-actions">
            <div className="sd-analytics-range">
              {["Today", "Week", "Month"].map(
                (item) => (
                  <button
                    key={item}
                    className={
                      range === item
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setRange(item)
                    }
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <button
  className="sd-analytics-export"
  onClick={() => {
    const rows = filteredOrders.map((order) => ({
      Order_ID: order.id || "",
      Table: order.table || "",
      Status: order.status || "",
      Total: Number(order.total || 0),
      Created_At: order.createdAt || "",
    }));

    const headers = [
      "Order_ID",
      "Table",
      "Status",
      "Total",
      "Created_At",
    ];

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header] ?? "";
            const safeValue = String(value)
              .replace(/"/g, '""');

            return `"${safeValue}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `smartdine-${range.toLowerCase()}-analytics.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }}
>
  <Download size={15} />
  Export
</button>
          </div>
        </header>

        <section className="sd-analytics-metrics">
          <motion.div
            className="sd-analytics-metric"
            whileHover={{ y: -4 }}
          >
            <div className="sd-analytics-metric-top">
              <span>Revenue</span>
              <div>
                <DollarSign size={17} />
              </div>
            </div>

            <strong>
              {formatCurrency(
                metrics.revenue
              )}
            </strong>

            <small>
              <ArrowUp size={12} />
              12.4% from previous period
            </small>
          </motion.div>

          <motion.div
            className="sd-analytics-metric"
            whileHover={{ y: -4 }}
          >
            <div className="sd-analytics-metric-top">
              <span>Orders</span>
              <div>
                <ShoppingBag size={17} />
              </div>
            </div>

            <strong>
              {metrics.orderCount}
            </strong>

            <small>
              <ArrowUp size={12} />
              8.7% from previous period
            </small>
          </motion.div>

          <motion.div
            className="sd-analytics-metric"
            whileHover={{ y: -4 }}
          >
            <div className="sd-analytics-metric-top">
              <span>Average Order</span>
              <div>
                <TrendingUp size={17} />
              </div>
            </div>

            <strong>
              {formatCurrency(
                metrics.average
              )}
            </strong>

            <small>
              <ArrowUp size={12} />
              4.2% from previous period
            </small>
          </motion.div>

          <motion.div
            className="sd-analytics-metric warning"
            whileHover={{ y: -4 }}
          >
            <div className="sd-analytics-metric-top">
              <span>Alerts</span>
              <div>
                <Activity size={17} />
              </div>
            </div>

            <strong>
              {metrics.lowStock +
                metrics.pendingRequests}
            </strong>

            <small>
              <ArrowDown size={12} />
              Requires attention
            </small>
          </motion.div>
        </section>

        <section className="sd-analytics-chart-grid">
          <div className="sd-analytics-panel revenue-panel">
            <div className="sd-analytics-panel-header">
              <div>
                <span>ORDER ACTIVITY</span>
                <h2>
                  Service rhythm
                </h2>
              </div>

              <div className="sd-analytics-live">
                <span />
                Live
              </div>
            </div>

            <div className="sd-analytics-bar-chart">
              {HOURS.map(
                (hour, index) => (
                  <div
                    className="sd-analytics-bar-column"
                    key={hour.label}
                  >
                    <div className="sd-analytics-bar-value">
                      {hour.value}
                    </div>

                    <div className="sd-analytics-bar-track">
                      <motion.div
                        className="sd-analytics-bar"
                        initial={{
                          height: 0,
                        }}
                        animate={{
                          height: `${hour.value}%`,
                        }}
                        transition={{
                          duration: .8,
                          delay:
                            index * .05,
                        }}
                      />
                    </div>

                    <span>
                      {hour.label}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="sd-analytics-panel status-panel">
            <div className="sd-analytics-panel-header">
              <div>
                <span>ORDER PIPELINE</span>
                <h2>
                  Order status
                </h2>
              </div>
            </div>

            <div className="sd-analytics-status-list">
              {statusData.map(
                (item) => (
                  <div
                    className="sd-analytics-status-row"
                    key={item.status}
                  >
                    <div>
                      <span>
                        {item.status}
                      </span>

                      <strong>
                        {item.count}
                      </strong>
                    </div>

                    <div className="sd-analytics-status-track">
                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${
                            (item.count /
                              maxStatus) *
                            100
                          }%`,
                        }}
                        transition={{
                          duration: .7,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="sd-analytics-bottom-grid">
          <div className="sd-analytics-panel">
            <div className="sd-analytics-panel-header">
              <div>
                <span>MENU PERFORMANCE</span>
                <h2>
                  Popular dishes
                </h2>
              </div>

              <Utensils size={18} />
            </div>

            <div className="sd-analytics-dishes">
              {dishRanking.map(
                (dish, index) => (
                  <div
                    className="sd-analytics-dish"
                    key={dish.name}
                  >
                    <div className="sd-analytics-rank">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </div>

                    <div className="sd-analytics-dish-info">
                      <strong>
                        {dish.name}
                      </strong>

                      <span>
                        {dish.orders} orders
                      </span>
                    </div>

                    <div className="sd-analytics-dish-chart">
                      <span
                        style={{
                          width: `${
                            (dish.orders /
                              maxDishOrders) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    <strong className="sd-analytics-dish-revenue">
                      {formatCurrency(
                        dish.revenue
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="sd-analytics-panel">
            <div className="sd-analytics-panel-header">
              <div>
                <span>OPERATIONAL HEALTH</span>
                <h2>
                  Attention required
                </h2>
              </div>

              <Activity size={18} />
            </div>

            <div className="sd-analytics-health-list">
              <div>
                <div className="sd-analytics-health-icon inventory">
                  <Package size={17} />
                </div>

                <section>
                  <strong>
                    Inventory
                  </strong>

                  <span>
                    {metrics.lowStock} items
                    below minimum
                  </span>
                </section>

                <b>
                  {metrics.lowStock > 0
                    ? "Review"
                    : "Healthy"}
                </b>
              </div>

              <div>
                <div className="sd-analytics-health-icon service">
                  <Users size={17} />
                </div>

                <section>
                  <strong>
                    Table Service
                  </strong>

                  <span>
                    {metrics.pendingRequests} pending
                    requests
                  </span>
                </section>

                <b>
                  {metrics.pendingRequests > 0
                    ? "Active"
                    : "Clear"}
                </b>
              </div>

              <div>
                <div className="sd-analytics-health-icon kitchen">
                  <Utensils size={17} />
                </div>

                <section>
                  <strong>
                    Kitchen
                  </strong>

                  <span>
                    Order processing
                    operational
                  </span>
                </section>

                <b>
                  Online
                </b>
              </div>

              <div>
                <div className="sd-analytics-health-icon tables">
                  <Users size={17} />
                </div>

                <section>
                  <strong>
                    Dining Floor
                  </strong>

                  <span>
                    Table monitoring
                    active
                  </span>
                </section>

                <b>
                  Live
                </b>
              </div>
            </div>
          </div>
        </section>

        <section className="sd-analytics-recent">
          <div className="sd-analytics-panel-header">
            <div>
              <span>RECENT ACTIVITY</span>
              <h2>
                Latest orders
              </h2>
            </div>

            <button
              onClick={() =>
                window.location.reload()
              }
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <div className="sd-analytics-orders">
            {filteredOrders
              .slice()
              .sort(
                (a, b) =>
                  new Date(
                    b.createdAt
                  ) -
                  new Date(
                    a.createdAt
                  )
              )
              .slice(0, 6)
              .map((order) => (
                <div
                  className="sd-analytics-order"
                  key={order.id}
                >
                  <div className="sd-analytics-order-icon">
                    <ShoppingBag size={16} />
                  </div>

                  <div>
                    <strong>
                      #{order.id}
                    </strong>

                    <span>
                      Table {order.table}
                    </span>
                  </div>

                  <div className="sd-analytics-order-status">
                    <CheckCircle2 size={14} />
                    {order.status}
                  </div>

                  <div className="sd-analytics-order-time">
                    <Clock3 size={13} />
                    {formatTime(
                      order.createdAt
                    )}
                  </div>

                  <strong>
                    {formatCurrency(
                      order.total
                    )}
                  </strong>
                </div>
              ))}
          </div>
        </section>

        <section className="sd-analytics-footer">
          <div>
            <span>SMARTDINE INTELLIGENCE</span>

            <h2>
              Data that helps
              <em> restaurants grow.</em>
            </h2>

            <p>
              The next backend phase will replace
              demo analytics with real MySQL data,
              historical reports and automated
              business intelligence.
            </p>
          </div>

          <div className="sd-analytics-footer-icon">
            <BarChart3 size={27} />
          </div>
        </section>
      </main>
    </div>
  );
}