import { useEffect, useMemo, useState } from "react";

const DEFAULT_ORDER = {
  id: "SD-DEMO01",
  table: "T-01",
  items: [
    {
      name: "Chicken Biriyani",
      quantity: 2,
      finalPrice: 220,
    },
  ],
  subtotal: 440,
  tax: 22,
  total: 462,
  status: "Paid",
  createdAt: new Date().toISOString(),
};

const RANGE_OPTIONS = ["Today", "Week", "Month", "All"];

function readOrders() {
  try {
    const history = JSON.parse(
      localStorage.getItem("smartdine_order_history")
    );

    const current = JSON.parse(
      localStorage.getItem("smartdine_current_order")
    );

    const combined = Array.isArray(history)
      ? [...history]
      : [];

    if (
      current?.id &&
      !combined.some(
        (order) => order?.id === current.id
      )
    ) {
      combined.push(current);
    }

    if (!combined.length) {
      return [DEFAULT_ORDER];
    }

    return combined;
  } catch {
    return [DEFAULT_ORDER];
  }
}

function getDate(value) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function isWithinRange(date, range) {
  if (!date) return false;

  if (range === "All") {
    return true;
  }

  const now = new Date();

  if (range === "Today") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  if (range === "Week") {
    const start = new Date(now);

    start.setDate(
      now.getDate() - now.getDay()
    );

    start.setHours(0, 0, 0, 0);

    return date >= start && date <= now;
  }

  if (range === "Month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  return true;
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;
}

function formatDate(value) {
  const date = getDate(value);

  if (!date) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status) {
  const styles = {
    "Order Placed": {
      background: "rgba(59,130,246,0.12)",
      color: "#2563eb",
    },
    "Kitchen Accepted": {
      background: "rgba(139,92,246,0.12)",
      color: "#7c3aed",
    },
    Preparing: {
      background: "rgba(245,158,11,0.14)",
      color: "#b45309",
    },
    Ready: {
      background: "rgba(16,185,129,0.13)",
      color: "#047857",
    },
    Served: {
      background: "rgba(14,165,233,0.13)",
      color: "#0369a1",
    },
    Paid: {
      background: "rgba(34,197,94,0.13)",
      color: "#15803d",
    },
  };

  return (
    styles[status] || {
      background: "rgba(100,116,139,0.12)",
      color: "#475569",
    }
  );
}

export default function Analytics() {
  const [orders, setOrders] = useState(readOrders);
  const [range, setRange] = useState("Today");

  const refreshOrders = () => {
    setOrders(readOrders());
  };

  useEffect(() => {
    window.addEventListener(
      "smartdine-order-updated",
      refreshOrders
    );

    window.addEventListener(
      "smartdine-order-created",
      refreshOrders
    );

    window.addEventListener(
      "smartdine-order-placed",
      refreshOrders
    );

    window.addEventListener(
      "smartdine-payment-updated",
      refreshOrders
    );

    window.addEventListener(
      "storage",
      refreshOrders
    );

    const interval = setInterval(
      refreshOrders,
      2000
    );

    return () => {
      window.removeEventListener(
        "smartdine-order-updated",
        refreshOrders
      );

      window.removeEventListener(
        "smartdine-order-created",
        refreshOrders
      );

      window.removeEventListener(
        "smartdine-order-placed",
        refreshOrders
      );

      window.removeEventListener(
        "smartdine-payment-updated",
        refreshOrders
      );

      window.removeEventListener(
        "storage",
        refreshOrders
      );

      clearInterval(interval);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      isWithinRange(
        getDate(
          order?.paidAt ||
            order?.createdAt
        ),
        range
      )
    );
  }, [orders, range]);

  const completedOrders = useMemo(() => {
    return filteredOrders.filter((order) =>
      ["Paid", "Served"].includes(
        order?.status
      )
    );
  }, [filteredOrders]);

  const metrics = useMemo(() => {
    const revenue = completedOrders.reduce(
      (sum, order) =>
        sum + Number(order?.total || 0),
      0
    );

    const orderCount =
      filteredOrders.length;

    const completedCount =
      completedOrders.length;

    const averageOrderValue =
      completedCount > 0
        ? revenue / completedCount
        : 0;

    return {
      revenue,
      orderCount,
      completedCount,
      averageOrderValue,
    };
  }, [
    filteredOrders,
    completedOrders,
  ]);

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
          order?.status === status
      ).length,
    }));
  }, [filteredOrders]);

  const topDishes = useMemo(() => {
    const dishMap = {};

    filteredOrders.forEach((order) => {
      if (!Array.isArray(order?.items)) {
        return;
      }

      order.items.forEach((item) => {
        const name =
          item?.name || "Unknown Item";

        if (!dishMap[name]) {
          dishMap[name] = {
            name,
            quantity: 0,
            revenue: 0,
          };
        }

        const quantity = Number(
          item?.quantity || 1
        );

        const price = Number(
          item?.finalPrice ||
            item?.price ||
            0
        );

        dishMap[name].quantity += quantity;
        dishMap[name].revenue +=
          price * quantity;
      });
    });

    return Object.values(dishMap)
      .sort(
        (a, b) =>
          b.quantity - a.quantity
      )
      .slice(0, 6);
  }, [filteredOrders]);

  const revenueTrend = useMemo(() => {
    const grouped = {};

    filteredOrders.forEach((order) => {
      const date = getDate(
        order?.paidAt ||
          order?.createdAt
      );

      if (!date) return;

      const key =
        range === "Today"
          ? `${date.getHours()
              .toString()
              .padStart(2, "0")}:00`
          : date.toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
              }
            );

      if (!grouped[key]) {
        grouped[key] = {
          label: key,
          revenue: 0,
        };
      }

      if (
        ["Paid", "Served"].includes(
          order?.status
        )
      ) {
        grouped[key].revenue += Number(
          order?.total || 0
        );
      }
    });

    return Object.values(grouped)
      .sort((a, b) =>
        a.label.localeCompare(
          b.label,
          undefined,
          { numeric: true }
        )
      )
      .slice(-8);
  }, [filteredOrders, range]);

  const maxTrendValue = Math.max(
    ...revenueTrend.map(
      (item) => item.revenue
    ),
    1
  );

  const exportCSV = () => {
    const headers = [
      "Order ID",
      "Table",
      "Status",
      "Total",
      "Created At",
    ];

    const rows = filteredOrders.map(
      (order) => [
        order?.id || "",
        order?.table || "",
        order?.status || "",
        Number(order?.total || 0),
        order?.createdAt || "",
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = `smartdine-admin-${range.toLowerCase()}-analytics.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2f7 50%, #f8fafc 100%)",
        color: "#0f172a",
        padding: "32px",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              SmartDine Administration
            </div>

            <h1
              style={{
                margin: 0,
                fontSize:
                  "clamp(30px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
              }}
            >
              Sales & Analytics
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#64748b",
                fontSize: 15,
              }}
            >
              Track revenue, orders and menu performance.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: 4,
                borderRadius: 14,
                background:
                  "rgba(255,255,255,0.78)",
                border:
                  "1px solid rgba(15,23,42,0.06)",
              }}
            >
              {RANGE_OPTIONS.map(
                (option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setRange(option)
                    }
                    style={{
                      border: "none",
                      borderRadius: 10,
                      padding:
                        "9px 13px",
                      background:
                        range === option
                          ? "#0f172a"
                          : "transparent",
                      color:
                        range === option
                          ? "#fff"
                          : "#64748b",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </button>
                )
              )}
            </div>

            <button
              onClick={exportCSV}
              style={{
                border:
                  "1px solid rgba(15,23,42,0.08)",
                background:
                  "rgba(255,255,255,0.78)",
                borderRadius: 14,
                padding: "11px 16px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ↓ Export CSV
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            [
              "Revenue",
              formatCurrency(
                metrics.revenue
              ),
              "Paid / served orders",
            ],
            [
              "Orders",
              metrics.orderCount,
              "Orders in selected range",
            ],
            [
              "Completed",
              metrics.completedCount,
              "Served or paid",
            ],
            [
              "Average Order",
              formatCurrency(
                metrics.averageOrderValue
              ),
              "Per completed order",
            ],
          ].map(
            ([label, value, caption]) => (
              <div
                key={label}
                style={{
                  padding: 22,
                  borderRadius: 22,
                  background:
                    "rgba(255,255,255,0.76)",
                  backdropFilter:
                    "blur(18px)",
                  border:
                    "1px solid rgba(255,255,255,0.85)",
                  boxShadow:
                    "0 18px 50px rgba(15,23,42,0.07)",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#64748b",
                    marginBottom: 10,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 900,
                    letterSpacing:
                      "-0.04em",
                  }}
                >
                  {value}
                </div>

                <div
                  style={{
                    marginTop: 7,
                    fontSize: 12,
                    color: "#94a3b8",
                  }}
                >
                  {caption}
                </div>
              </div>
            )
          )}
        </div>

        {/* Main Analytics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.5fr) minmax(320px, 0.8fr)",
            gap: 18,
            marginBottom: 18,
          }}
        >
          {/* Revenue Trend */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <h2 style={panelTitleStyle}>
                  Revenue Trend
                </h2>

                <div style={panelCaptionStyle}>
                  Completed order revenue
                </div>
              </div>

              <div
                style={{
                  fontWeight: 900,
                  fontSize: 20,
                }}
              >
                {formatCurrency(
                  metrics.revenue
                )}
              </div>
            </div>

            <div
              style={{
                height: 280,
                display: "flex",
                alignItems: "flex-end",
                gap: 12,
                padding:
                  "20px 4px 10px",
              }}
            >
              {revenueTrend.length ? (
                revenueTrend.map(
                  (item) => {
                    const height =
                      Math.max(
                        8,
                        (item.revenue /
                          maxTrendValue) *
                          220
                      );

                    return (
                      <div
                        key={item.label}
                        style={{
                          flex: 1,
                          minWidth: 25,
                          height: "100%",
                          display: "flex",
                          flexDirection:
                            "column",
                          justifyContent:
                            "flex-end",
                          alignItems:
                            "center",
                          gap: 7,
                        }}
                      >
                        <div
                          title={formatCurrency(
                            item.revenue
                          )}
                          style={{
                            width: "100%",
                            maxWidth: 54,
                            height,
                            borderRadius:
                              "10px 10px 4px 4px",
                            background:
                              "linear-gradient(180deg, #0f172a 0%, #334155 100%)",
                          }}
                        />

                        <span
                          style={{
                            fontSize: 10,
                            color:
                              "#64748b",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  }
                )
              ) : (
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  No revenue data for this range.
                </div>
              )}
            </div>
          </div>

          {/* Status Breakdown */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <h2 style={panelTitleStyle}>
                  Order Status
                </h2>

                <div style={panelCaptionStyle}>
                  Current distribution
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 13,
              }}
            >
              {statusData.map(
                (item) => {
                  const percentage =
                    filteredOrders.length
                      ? Math.round(
                          (item.count /
                            filteredOrders.length) *
                            100
                        )
                      : 0;

                  const style =
                    getStatusStyle(
                      item.status
                    );

                  return (
                    <div
                      key={item.status}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap: 10,
                          marginBottom:
                            7,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color:
                              "#475569",
                          }}
                        >
                          {item.status}
                        </span>

                        <strong
                          style={{
                            fontSize: 12,
                          }}
                        >
                          {item.count}
                        </strong>
                      </div>

                      <div
                        style={{
                          height: 7,
                          borderRadius:
                            999,
                          background:
                            "#f1f5f9",
                          overflow:
                            "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            borderRadius:
                              999,
                            background:
                              style.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Bottom Analytics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 18,
            marginBottom: 18,
          }}
        >
          {/* Top Dishes */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <h2 style={panelTitleStyle}>
                  Top Dishes
                </h2>

                <div style={panelCaptionStyle}>
                  Ranked by quantity sold
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              {topDishes.length ? (
                topDishes.map(
                  (dish, index) => (
                    <div
                      key={dish.name}
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 13,
                        padding:
                          "12px 0",
                        borderBottom:
                          index <
                          topDishes.length -
                            1
                            ? "1px solid rgba(15,23,42,0.06)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius:
                            "50%",
                          display:
                            "grid",
                          placeItems:
                            "center",
                          background:
                            "#f1f5f9",
                          fontWeight:
                            900,
                          fontSize: 13,
                        }}
                      >
                        {index + 1}
                      </div>

                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            fontWeight:
                              800,
                          }}
                        >
                          {dish.name}
                        </div>

                        <div
                          style={{
                            marginTop: 4,
                            color:
                              "#64748b",
                            fontSize: 12,
                          }}
                        >
                          {dish.quantity}{" "}
                          sold
                        </div>
                      </div>

                      <strong>
                        {formatCurrency(
                          dish.revenue
                        )}
                      </strong>
                    </div>
                  )
                )
              ) : (
                <div
                  style={{
                    padding: 30,
                    textAlign:
                      "center",
                    color:
                      "#94a3b8",
                  }}
                >
                  No dish data available.
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <h2 style={panelTitleStyle}>
                  Recent Orders
                </h2>

                <div style={panelCaptionStyle}>
                  Latest activity
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
              }}
            >
              {[...filteredOrders]
                .reverse()
                .slice(0, 6)
                .map((order) => {
                  const style =
                    getStatusStyle(
                      order?.status
                    );

                  return (
                    <div
                      key={order?.id}
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 12,
                        padding:
                          "11px 0",
                        borderBottom:
                          "1px solid rgba(15,23,42,0.06)",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            fontWeight:
                              800,
                            fontSize:
                              13,
                          }}
                        >
                          #{order?.id}
                        </div>

                        <div
                          style={{
                            marginTop: 4,
                            color:
                              "#94a3b8",
                            fontSize:
                              11,
                          }}
                        >
                          Table{" "}
                          {order?.table ||
                            "—"}{" "}
                          •{" "}
                          {formatDate(
                            order?.createdAt
                          )}
                        </div>
                      </div>

                      <span
                        style={{
                          padding:
                            "6px 8px",
                          borderRadius:
                            999,
                          background:
                            style.background,
                          color:
                            style.color,
                          fontSize:
                            10,
                          fontWeight:
                            900,
                        }}
                      >
                        {order?.status}
                      </span>

                      <strong
                        style={{
                          fontSize:
                            13,
                        }}
                      >
                        {formatCurrency(
                          order?.total
                        )}
                      </strong>
                    </div>
                  );
                })}

              {!filteredOrders.length && (
                <div
                  style={{
                    padding: 30,
                    textAlign:
                      "center",
                    color:
                      "#94a3b8",
                  }}
                >
                  No orders for this range.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Note */}
        <div
          style={{
            padding: 18,
            borderRadius: 18,
            background:
              "rgba(255,255,255,0.65)",
            border:
              "1px solid rgba(15,23,42,0.05)",
            color: "#64748b",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          Analytics currently use SmartDine's
          browser-stored order data. Revenue is
          calculated from orders marked
          <strong> Paid </strong>
          or
          <strong> Served</strong>.
          The Java + Spring Boot + MySQL backend
          will later provide persistent,
          multi-user analytics.
        </div>
      </div>
    </div>
  );
}

const panelStyle = {
  padding: 22,
  borderRadius: 24,
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: "0 18px 55px rgba(15,23,42,0.08)",
};

const panelHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 20,
};

const panelTitleStyle = {
  margin: 0,
  fontSize: 18,
  letterSpacing: "-0.025em",
};

const panelCaptionStyle = {
  marginTop: 5,
  color: "#94a3b8",
  fontSize: 12,
};