import { useEffect, useMemo, useState } from "react";

const REPORT_TYPES = [
  "Sales Report",
  "Orders Report",
  "Customer Report",
  "Inventory Report",
];

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const endOfDay = (date) => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

const csvEscape = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadCSV = (filename, rows) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const csv = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) =>
      headers.map((header) => csvEscape(row[header])).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
};

const getOrders = () => {
  const history = readJSON("smartdine_order_history", []);
  const current = readJSON("smartdine_current_order", null);

  const all = Array.isArray(history) ? [...history] : [];

  if (
    current &&
    current.id &&
    !all.some((order) => order.id === current.id)
  ) {
    all.push(current);
  }

  return all;
};

export default function Reports() {
  const [reportType, setReportType] = useState("Sales Report");

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [fromDate, setFromDate] = useState(
    thirtyDaysAgo.toISOString().slice(0, 10)
  );
  const [toDate, setToDate] = useState(today.toISOString().slice(0, 10));

  const [orders, setOrders] = useState(() => getOrders());
  const [inventory, setInventory] = useState(() =>
    readJSON("smartdine_inventory", [])
  );
  const [users, setUsers] = useState(() =>
    readJSON("smartdine_users", [])
  );

  useEffect(() => {
    const sync = () => {
      setOrders(getOrders());
      setInventory(readJSON("smartdine_inventory", []));
      setUsers(readJSON("smartdine_users", []));
    };

    window.addEventListener("storage", sync);
    window.addEventListener("smartdine-order-updated", sync);
    window.addEventListener("smartdine-order-created", sync);
    window.addEventListener("smartdine-inventory-updated", sync);
    window.addEventListener("smartdine-users-updated", sync);

    const interval = setInterval(sync, 2000);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("smartdine-order-updated", sync);
      window.removeEventListener("smartdine-order-created", sync);
      window.removeEventListener("smartdine-inventory-updated", sync);
      window.removeEventListener("smartdine-users-updated", sync);
      clearInterval(interval);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const from = startOfDay(`${fromDate}T00:00:00`);
    const to = endOfDay(`${toDate}T00:00:00`);

    return orders.filter((order) => {
      const created = getDate(order.createdAt || order.paidAt);

      if (!created) return false;

      return created >= from && created <= to;
    });
  }, [orders, fromDate, toDate]);

  const completedOrders = filteredOrders.filter(
    (order) =>
      order.status === "Paid" ||
      order.status === "Served" ||
      order.paidAt
  );

  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const totalOrderValue = filteredOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const averageOrder =
    filteredOrders.length > 0
      ? totalOrderValue / filteredOrders.length
      : 0;

  const customers = users.filter(
    (user) =>
      String(user.role || "").toLowerCase() === "customer"
  );

  const topDishes = useMemo(() => {
    const map = {};

    filteredOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.name || "Unknown Item";

        if (!map[name]) {
          map[name] = {
            name,
            quantity: 0,
            revenue: 0,
          };
        }

        map[name].quantity += Number(item.quantity || 1);
        map[name].revenue +=
          Number(item.finalPrice || item.price || 0) *
          Number(item.quantity || 1);
      });
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filteredOrders]);

  const exportReport = () => {
    if (reportType === "Sales Report") {
      const rows = filteredOrders.map((order) => ({
        Order_ID: order.id,
        Table: order.table || "—",
        Status: order.status || "—",
        Subtotal: Number(order.subtotal || 0).toFixed(2),
        Tax: Number(order.tax || 0).toFixed(2),
        Total: Number(order.total || 0).toFixed(2),
        Created_At: order.createdAt || "",
        Paid_At: order.paidAt || "",
      }));

      downloadCSV(
        `smartdine-sales-report-${fromDate}-to-${toDate}.csv`,
        rows
      );

      return;
    }

    if (reportType === "Orders Report") {
      const rows = filteredOrders.map((order) => ({
        Order_ID: order.id,
        Table: order.table || "—",
        Items: (order.items || [])
          .map((item) => `${item.name} x${item.quantity || 1}`)
          .join(" | "),
        Status: order.status || "—",
        Total: Number(order.total || 0).toFixed(2),
        Created_At: order.createdAt || "",
      }));

      downloadCSV(
        `smartdine-orders-report-${fromDate}-to-${toDate}.csv`,
        rows
      );

      return;
    }

    if (reportType === "Customer Report") {
      const rows = customers.map((user) => ({
        Name: user.name || "—",
        Email: user.email || "—",
        Role: user.role || "—",
        Status: user.status || "Active",
        Created_At: user.createdAt || "—",
      }));

      downloadCSV("smartdine-customer-report.csv", rows);

      return;
    }

    if (reportType === "Inventory Report") {
      const rows = inventory.map((item) => ({
        Item: item.name || "—",
        Category: item.category || "—",
        Quantity: Number(item.quantity || 0),
        Unit: item.unit || "units",
        Minimum_Stock: Number(item.minimumStock || 0),
        Status: item.status || "—",
      }));

      downloadCSV("smartdine-inventory-report.csv", rows);
    }
  };

  const printReport = () => {
    window.print();
  };

  const reportRows = useMemo(() => {
    if (reportType === "Sales Report") {
      return filteredOrders.slice(0, 10);
    }

    if (reportType === "Orders Report") {
      return filteredOrders.slice(0, 10);
    }

    if (reportType === "Customer Report") {
      return customers.slice(0, 10);
    }

    return inventory.slice(0, 10);
  }, [reportType, filteredOrders, customers, inventory]);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "34px",
        background:
          "linear-gradient(135deg,#f8fafc 0%,#eef2f7 48%,#e8edf4 100%)",
        color: "#172033",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1450,
          margin: "0 auto",
        }}
      >
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
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              SmartDine Admin
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(30px,4vw,48px)",
                letterSpacing: "-0.04em",
              }}
            >
              Reports & Data Export
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#64748b",
                fontSize: 15,
              }}
            >
              Generate operational reports and export SmartDine data.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={printReport}
              style={{
                border: "1px solid #dbe2ea",
                background: "rgba(255,255,255,.8)",
                borderRadius: 14,
                padding: "12px 18px",
                fontWeight: 800,
                cursor: "pointer",
                color: "#334155",
              }}
            >
              Print Report
            </button>

            <button
              onClick={exportReport}
              style={{
                border: 0,
                background: "#172033",
                color: "#fff",
                borderRadius: 14,
                padding: "12px 20px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 12px 30px rgba(23,32,51,.18)",
              }}
            >
              Export CSV
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(240px,1.2fr) repeat(2,minmax(180px,.8fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,.78)",
              border: "1px solid rgba(255,255,255,.9)",
              borderRadius: 22,
              padding: 20,
              boxShadow: "0 15px 45px rgba(15,23,42,.07)",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 800,
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              REPORT TYPE
            </label>

            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{
                width: "100%",
                padding: "13px 14px",
                borderRadius: 12,
                border: "1px solid #dbe2ea",
                background: "#fff",
                fontWeight: 700,
                color: "#172033",
              }}
            >
              {REPORT_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.78)",
              borderRadius: 22,
              padding: 20,
              boxShadow: "0 15px 45px rgba(15,23,42,.07)",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 800,
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              FROM
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px",
                borderRadius: 12,
                border: "1px solid #dbe2ea",
                background: "#fff",
                color: "#172033",
                fontWeight: 700,
              }}
            />
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.78)",
              borderRadius: 22,
              padding: 20,
              boxShadow: "0 15px 45px rgba(15,23,42,.07)",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 800,
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              TO
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px",
                borderRadius: 12,
                border: "1px solid #dbe2ea",
                background: "#fff",
                color: "#172033",
                fontWeight: 700,
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4,minmax(170px,1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          {[
            ["Orders", filteredOrders.length],
            ["Revenue", money(totalRevenue)],
            ["Order Value", money(totalOrderValue)],
            ["Average Order", money(averageOrder)],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,.82)",
                border: "1px solid rgba(255,255,255,.95)",
                borderRadius: 22,
                padding: 22,
                boxShadow: "0 15px 45px rgba(15,23,42,.07)",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                }}
              >
                {label}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: "-.03em",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0,1.35fr) minmax(300px,.65fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,.82)",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 15px 45px rgba(15,23,42,.07)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 15,
                alignItems: "center",
                marginBottom: 18,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 21,
                  }}
                >
                  {reportType}
                </h2>

                <div
                  style={{
                    marginTop: 5,
                    color: "#64748b",
                    fontSize: 13,
                  }}
                >
                  Showing data from {fromDate} to {toDate}
                </div>
              </div>

              <span
                style={{
                  padding: "8px 11px",
                  borderRadius: 999,
                  background: "#f1f5f9",
                  color: "#475569",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {reportRows.length} records
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              {reportType === "Sales Report" && (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 700,
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "Order",
                        "Table",
                        "Status",
                        "Subtotal",
                        "Tax",
                        "Total",
                      ].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            textAlign: "left",
                            padding: "12px 10px",
                            borderBottom: "1px solid #e5e7eb",
                            fontSize: 11,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.slice(0, 10).map((order) => (
                      <tr key={order.id}>
                        <td style={cellStyle}>{order.id}</td>
                        <td style={cellStyle}>
                          Table {order.table || "—"}
                        </td>
                        <td style={cellStyle}>
                          <StatusPill status={order.status} />
                        </td>
                        <td style={cellStyle}>
                          {money(order.subtotal)}
                        </td>
                        <td style={cellStyle}>{money(order.tax)}</td>
                        <td
                          style={{
                            ...cellStyle,
                            fontWeight: 900,
                          }}
                        >
                          {money(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportType === "Orders Report" && (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 700,
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "Order",
                        "Table",
                        "Items",
                        "Status",
                        "Total",
                      ].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            textAlign: "left",
                            padding: "12px 10px",
                            borderBottom: "1px solid #e5e7eb",
                            fontSize: 11,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.slice(0, 10).map((order) => (
                      <tr key={order.id}>
                        <td style={cellStyle}>{order.id}</td>
                        <td style={cellStyle}>
                          Table {order.table || "—"}
                        </td>
                        <td style={cellStyle}>
                          {(order.items || [])
                            .map(
                              (item) =>
                                `${item.name} ×${item.quantity || 1}`
                            )
                            .join(", ")}
                        </td>
                        <td style={cellStyle}>
                          <StatusPill status={order.status} />
                        </td>
                        <td
                          style={{
                            ...cellStyle,
                            fontWeight: 900,
                          }}
                        >
                          {money(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportType === "Customer Report" && (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 650,
                  }}
                >
                  <thead>
                    <tr>
                      {["Name", "Email", "Role", "Status"].map(
                        (heading) => (
                          <th
                            key={heading}
                            style={{
                              textAlign: "left",
                              padding: "12px 10px",
                              borderBottom: "1px solid #e5e7eb",
                              fontSize: 11,
                              color: "#64748b",
                              textTransform: "uppercase",
                              letterSpacing: ".06em",
                            }}
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {customers.slice(0, 10).map((user, index) => (
                      <tr key={user.id || index}>
                        <td style={cellStyle}>{user.name || "—"}</td>
                        <td style={cellStyle}>{user.email || "—"}</td>
                        <td style={cellStyle}>{user.role || "—"}</td>
                        <td style={cellStyle}>
                          <StatusPill
                            status={user.status || "Active"}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportType === "Inventory Report" && (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 650,
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "Item",
                        "Category",
                        "Quantity",
                        "Unit",
                        "Minimum",
                        "Status",
                      ].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            textAlign: "left",
                            padding: "12px 10px",
                            borderBottom: "1px solid #e5e7eb",
                            fontSize: 11,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {inventory.slice(0, 10).map((item, index) => (
                      <tr key={item.id || index}>
                        <td style={cellStyle}>
                          {item.name || "—"}
                        </td>
                        <td style={cellStyle}>
                          {item.category || "—"}
                        </td>
                        <td style={cellStyle}>
                          {Number(item.quantity || 0)}
                        </td>
                        <td style={cellStyle}>
                          {item.unit || "units"}
                        </td>
                        <td style={cellStyle}>
                          {Number(item.minimumStock || 0)}
                        </td>
                        <td style={cellStyle}>
                          <StatusPill
                            status={item.status || "In Stock"}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportRows.length === 0 && (
                <div
                  style={{
                    padding: "55px 20px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  No data available for the selected period.
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,.82)",
                borderRadius: 24,
                padding: 24,
                boxShadow: "0 15px 45px rgba(15,23,42,.07)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                }}
              >
                Top Dishes
              </h2>

              <p
                style={{
                  color: "#64748b",
                  fontSize: 13,
                  margin: "6px 0 18px",
                }}
              >
                Based on the selected date range.
              </p>

              <div style={{ display: "grid", gap: 12 }}>
                {topDishes.length > 0 ? (
                  topDishes.map((dish, index) => (
                    <div
                      key={dish.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        padding: "12px 0",
                        borderBottom:
                          index === topDishes.length - 1
                            ? "none"
                            : "1px solid #edf0f4",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 14,
                          }}
                        >
                          {dish.name}
                        </div>

                        <div
                          style={{
                            marginTop: 3,
                            fontSize: 12,
                            color: "#64748b",
                          }}
                        >
                          {dish.quantity} sold
                        </div>
                      </div>

                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {money(dish.revenue)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "25px 0",
                      color: "#64748b",
                      fontSize: 13,
                    }}
                  >
                    No dish data available.
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                background:
                  "linear-gradient(145deg,#172033,#26344f)",
                color: "#fff",
                borderRadius: 24,
                padding: 24,
                boxShadow: "0 18px 50px rgba(23,32,51,.18)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  opacity: 0.7,
                }}
              >
                Report Snapshot
              </div>

              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  marginTop: 10,
                }}
              >
                {completedOrders.length}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  opacity: 0.72,
                }}
              >
                completed / paid orders
              </div>

              <div
                style={{
                  marginTop: 22,
                  display: "grid",
                  gap: 11,
                }}
              >
                <SnapshotRow
                  label="Customers"
                  value={customers.length}
                />
                <SnapshotRow
                  label="Inventory Items"
                  value={inventory.length}
                />
                <SnapshotRow
                  label="Report Period"
                  value={`${fromDate} → ${toDate}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          div[style*="repeat(4,minmax(170px,1fr))"] {
            grid-template-columns: repeat(2, minmax(170px, 1fr)) !important;
          }

          div[style*="minmax(0,1.35fr)"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 680px) {
          body {
            overflow-x: hidden;
          }

          div[style*="repeat(4,minmax(170px,1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media print {
          body {
            background: white !important;
          }

          button,
          select,
          input {
            display: none !important;
          }

          * {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

const cellStyle = {
  padding: "14px 10px",
  borderBottom: "1px solid #edf0f4",
  fontSize: 13,
  color: "#334155",
};

function StatusPill({ status }) {
  const value = String(status || "Unknown");

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 9px",
        borderRadius: 999,
        background: "#f1f5f9",
        color: "#475569",
        fontSize: 11,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 15,
        paddingBottom: 10,
        borderBottom: "1px solid rgba(255,255,255,.1)",
      }}
    >
      <span
        style={{
          fontSize: 12,
          opacity: 0.65,
        }}
      >
        {label}
      </span>

      <strong
        style={{
          fontSize: 12,
          textAlign: "right",
        }}
      >
        {value}
      </strong>
    </div>
  );
}