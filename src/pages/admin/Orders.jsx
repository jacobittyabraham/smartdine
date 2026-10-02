import { useEffect, useMemo, useState } from "react";

const STATUS_OPTIONS = [
  "All",
  "Order Placed",
  "Kitchen Accepted",
  "Preparing",
  "Ready",
  "Served",
  "Paid",
];

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
  status: "Order Placed",
  createdAt: new Date().toISOString(),
};

function readOrders() {
  try {
    const savedHistory = JSON.parse(
      localStorage.getItem("smartdine_order_history")
    );

    const history = Array.isArray(savedHistory) ? savedHistory : [];

    const current = JSON.parse(
      localStorage.getItem("smartdine_current_order")
    );

    const combined = [...history];

    if (current?.id && !combined.some((order) => order?.id === current.id)) {
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

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

export default function Orders() {
  const [orders, setOrders] = useState(readOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const refreshOrders = () => {
    setOrders(readOrders());
  };

  useEffect(() => {
    window.addEventListener("smartdine-order-updated", refreshOrders);
    window.addEventListener("smartdine-order-created", refreshOrders);
    window.addEventListener("smartdine-order-placed", refreshOrders);
    window.addEventListener("storage", refreshOrders);

    const interval = setInterval(refreshOrders, 2000);

    return () => {
      window.removeEventListener("smartdine-order-updated", refreshOrders);
      window.removeEventListener("smartdine-order-created", refreshOrders);
      window.removeEventListener("smartdine-order-placed", refreshOrders);
      window.removeEventListener("storage", refreshOrders);
      clearInterval(interval);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...orders]
      .reverse()
      .filter((order) => {
        const matchesSearch =
          !query ||
          String(order?.id || "").toLowerCase().includes(query) ||
          String(order?.table || "").toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" || order?.status === statusFilter;

        return matchesSearch && matchesStatus;
      });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;

    const active = orders.filter(
      (order) =>
        !["Served", "Paid"].includes(order?.status)
    ).length;

    const completed = orders.filter((order) =>
      ["Served", "Paid"].includes(order?.status)
    ).length;

    const revenue = orders.reduce(
      (sum, order) => sum + Number(order?.total || 0),
      0
    );

    return {
      total,
      active,
      completed,
      revenue,
    };
  }, [orders]);

  const updateOrderStatus = (orderId, nextStatus) => {
    const updatedOrders = orders.map((order) =>
      order?.id === orderId
        ? {
            ...order,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          }
        : order
    );

    setOrders(updatedOrders);

    const updatedOrder = updatedOrders.find(
      (order) => order?.id === orderId
    );

    if (updatedOrder) {
      const currentOrder = JSON.parse(
        localStorage.getItem("smartdine_current_order")
      );

      if (currentOrder?.id === orderId) {
        localStorage.setItem(
          "smartdine_current_order",
          JSON.stringify(updatedOrder)
        );
      }

      const history = JSON.parse(
        localStorage.getItem("smartdine_order_history")
      );

      if (Array.isArray(history)) {
        const updatedHistory = history.map((order) =>
          order?.id === orderId ? updatedOrder : order
        );

        localStorage.setItem(
          "smartdine_order_history",
          JSON.stringify(updatedHistory)
        );
      }

      window.dispatchEvent(
        new CustomEvent("smartdine-order-updated")
      );
    }
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
            marginBottom: 28,
            flexWrap: "wrap",
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
                fontSize: "clamp(30px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
              }}
            >
              Order Management
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#64748b",
                fontSize: 15,
              }}
            >
              Monitor restaurant orders and control their live status.
            </p>
          </div>

          <button
            onClick={refreshOrders}
            style={{
              border: "1px solid rgba(15,23,42,0.08)",
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(18px)",
              borderRadius: 14,
              padding: "12px 18px",
              fontWeight: 800,
              color: "#0f172a",
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
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
            ["Total Orders", stats.total, "All recorded orders"],
            ["Active Orders", stats.active, "Currently in progress"],
            ["Completed", stats.completed, "Served or paid"],
            [
              "Order Value",
              `₹${stats.revenue.toLocaleString("en-IN")}`,
              "Combined order value",
            ],
          ].map(([label, value, caption]) => (
            <div
              key={label}
              style={{
                padding: 22,
                borderRadius: 22,
                background: "rgba(255,255,255,0.76)",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.85)",
                boxShadow: "0 18px 50px rgba(15,23,42,0.07)",
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
                  letterSpacing: "-0.04em",
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
          ))}
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order ID or table..."
            style={{
              flex: "1 1 280px",
              minWidth: 220,
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.08)",
              background: "rgba(255,255,255,0.8)",
              outline: "none",
              fontSize: 14,
              color: "#0f172a",
              boxSizing: "border-box",
            }}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.08)",
              background: "rgba(255,255,255,0.8)",
              outline: "none",
              fontSize: 14,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        <div
          style={{
            overflow: "hidden",
            borderRadius: 24,
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
          }}
        >
          <div
            style={{
              padding: "20px 22px",
              borderBottom: "1px solid rgba(15,23,42,0.06)",
              fontWeight: 900,
              fontSize: 16,
            }}
          >
            Live Orders
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 950,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    background: "rgba(248,250,252,0.8)",
                  }}
                >
                  {[
                    "Order",
                    "Table",
                    "Items",
                    "Amount",
                    "Status",
                    "Created",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "14px 18px",
                        fontSize: 12,
                        color: "#64748b",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const statusStyle = getStatusStyle(order?.status);

                  return (
                    <tr
                      key={order?.id}
                      style={{
                        borderTop:
                          "1px solid rgba(15,23,42,0.05)",
                      }}
                    >
                      <td
                        style={{
                          padding: "18px",
                          fontWeight: 900,
                        }}
                      >
                        #{order?.id || "—"}
                      </td>

                      <td
                        style={{
                          padding: "18px",
                          fontWeight: 700,
                        }}
                      >
                        {order?.table || "—"}
                      </td>

                      <td style={{ padding: "18px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#334155",
                          }}
                        >
                          {Array.isArray(order?.items)
                            ? order.items
                                .map(
                                  (item) =>
                                    `${item?.name || "Item"} × ${
                                      item?.quantity || 1
                                    }`
                                )
                                .join(", ")
                            : "No items"}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: "18px",
                          fontWeight: 900,
                        }}
                      >
                        ₹
                        {Number(order?.total || 0).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td style={{ padding: "18px" }}>
                        <select
                          value={order?.status || "Order Placed"}
                          onChange={(event) =>
                            updateOrderStatus(
                              order?.id,
                              event.target.value
                            )
                          }
                          style={{
                            border: "none",
                            borderRadius: 999,
                            padding: "8px 12px",
                            fontSize: 12,
                            fontWeight: 900,
                            background: statusStyle.background,
                            color: statusStyle.color,
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          {STATUS_OPTIONS.filter(
                            (status) => status !== "All"
                          ).map((status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td
                        style={{
                          padding: "18px",
                          color: "#64748b",
                          fontSize: 13,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(order?.createdAt)}
                      </td>

                      <td style={{ padding: "18px" }}>
                        <button
                          onClick={() =>
                            setSelectedOrder(order)
                          }
                          style={{
                            border: "1px solid rgba(15,23,42,0.08)",
                            background: "#0f172a",
                            color: "#fff",
                            borderRadius: 11,
                            padding: "9px 13px",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!filteredOrders.length && (
            <div
              style={{
                padding: 50,
                textAlign: "center",
                color: "#64748b",
              }}
            >
              No orders match the current filters.
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(620px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 26,
              padding: 26,
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 30px 100px rgba(15,23,42,0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                alignItems: "flex-start",
                marginBottom: 22,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Order Details
                </div>

                <h2
                  style={{
                    margin: "6px 0 0",
                    fontSize: 28,
                    letterSpacing: "-0.03em",
                  }}
                >
                  #{selectedOrder?.id}
                </h2>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "none",
                  background: "#f1f5f9",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12,
                marginBottom: 22,
              }}
            >
              {[
                ["Table", selectedOrder?.table || "—"],
                ["Status", selectedOrder?.status || "—"],
                [
                  "Total",
                  `₹${Number(
                    selectedOrder?.total || 0
                  ).toLocaleString("en-IN")}`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    background: "#f8fafc",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      marginBottom: 7,
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      fontWeight: 900,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                fontWeight: 900,
                marginBottom: 10,
              }}
            >
              Items
            </div>

            <div
              style={{
                border: "1px solid rgba(15,23,42,0.07)",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              {(selectedOrder?.items || []).map(
                (item, index) => (
                  <div
                    key={`${item?.name}-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "14px 16px",
                      borderBottom:
                        index <
                        (selectedOrder?.items?.length || 0) - 1
                          ? "1px solid rgba(15,23,42,0.06)"
                          : "none",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        {item?.name || "Item"}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          color: "#64748b",
                          fontSize: 13,
                        }}
                      >
                        Quantity: {item?.quantity || 1}
                      </div>
                    </div>

                    <div style={{ fontWeight: 900 }}>
                      ₹
                      {Number(
                        item?.finalPrice ||
                          item?.price ||
                          0
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                )
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 20,
                paddingTop: 18,
                borderTop:
                  "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <span
                style={{
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                Created
              </span>

              <strong>
                {formatDate(selectedOrder?.createdAt)}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}