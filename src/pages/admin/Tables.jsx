import { useEffect, useMemo, useState } from "react";

const DEFAULT_TABLES = [
  { id: "T-01", name: "Table 01", capacity: 2, status: "Available" },
  { id: "T-02", name: "Table 02", capacity: 2, status: "Available" },
  { id: "T-03", name: "Table 03", capacity: 4, status: "Available" },
  { id: "T-04", name: "Table 04", capacity: 4, status: "Available" },
  { id: "T-05", name: "Table 05", capacity: 4, status: "Available" },
  { id: "T-06", name: "Table 06", capacity: 6, status: "Available" },
  { id: "T-07", name: "Table 07", capacity: 6, status: "Available" },
  { id: "T-08", name: "Table 08", capacity: 2, status: "Available" },
  { id: "T-09", name: "Table 09", capacity: 4, status: "Available" },
  { id: "T-10", name: "Table 10", capacity: 6, status: "Available" },
  { id: "T-11", name: "Table 11", capacity: 4, status: "Available" },
  { id: "T-12", name: "Table 12", capacity: 2, status: "Available" },
];

const STATUS_OPTIONS = [
  "Available",
  "Occupied",
  "Reserved",
  "Cleaning",
];

function readTables() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("smartdine_admin_tables")
    );

    if (Array.isArray(saved) && saved.length) {
      return saved;
    }

    return DEFAULT_TABLES;
  } catch {
    return DEFAULT_TABLES;
  }
}

function readCurrentOrder() {
  try {
    return JSON.parse(
      localStorage.getItem("smartdine_current_order")
    );
  } catch {
    return null;
  }
}

function getTableId(value) {
  if (!value) return null;

  const text = String(value).trim().toLowerCase();

  if (text.startsWith("t-")) {
    return text.toUpperCase();
  }

  if (text.startsWith("table")) {
    const number = text.replace("table", "").trim();

    if (number) {
      return `T-${String(number).padStart(2, "0")}`;
    }
  }

  if (/^\d+$/.test(text)) {
    return `T-${String(text).padStart(2, "0")}`;
  }

  return String(value).toUpperCase();
}

function getStatusStyle(status) {
  const styles = {
    Available: {
      background: "rgba(16,185,129,0.12)",
      color: "#047857",
    },
    Occupied: {
      background: "rgba(239,68,68,0.12)",
      color: "#b91c1c",
    },
    Reserved: {
      background: "rgba(139,92,246,0.12)",
      color: "#7c3aed",
    },
    Cleaning: {
      background: "rgba(245,158,11,0.14)",
      color: "#b45309",
    },
  };

  return (
    styles[status] || {
      background: "rgba(100,116,139,0.12)",
      color: "#475569",
    }
  );
}

function getOrderForTable(tableId, order) {
  if (!order?.table) return null;

  return getTableId(order.table) === tableId ? order : null;
}

export default function Tables() {
  const [tables, setTables] = useState(readTables);
  const [currentOrder, setCurrentOrder] = useState(
    readCurrentOrder
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTable, setSelectedTable] = useState(null);

  const refresh = () => {
    setTables(readTables());
    setCurrentOrder(readCurrentOrder());
  };

  useEffect(() => {
    window.addEventListener("smartdine-order-updated", refresh);
    window.addEventListener("smartdine-order-created", refresh);
    window.addEventListener("smartdine-order-placed", refresh);
    window.addEventListener("storage", refresh);

    const interval = setInterval(refresh, 2000);

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
      window.removeEventListener("storage", refresh);
      clearInterval(interval);
    };
  }, []);

  const saveTables = (updatedTables) => {
    setTables(updatedTables);

    localStorage.setItem(
      "smartdine_admin_tables",
      JSON.stringify(updatedTables)
    );

    window.dispatchEvent(
      new CustomEvent("smartdine-tables-updated")
    );
  };

  const enrichedTables = useMemo(() => {
    return tables.map((table) => {
      const order = getOrderForTable(
        table?.id,
        currentOrder
      );

      const hasActiveOrder =
        order &&
        !["Paid", "Served"].includes(order?.status);

      return {
        ...table,
        order: hasActiveOrder ? order : null,
      };
    });
  }, [tables, currentOrder]);

  const filteredTables = useMemo(() => {
    const query = search.trim().toLowerCase();

    return enrichedTables.filter((table) => {
      const matchesSearch =
        !query ||
        table?.id?.toLowerCase().includes(query) ||
        table?.name?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        table?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enrichedTables, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: tables.length,
      available: tables.filter(
        (table) => table?.status === "Available"
      ).length,
      occupied: tables.filter(
        (table) => table?.status === "Occupied"
      ).length,
      reserved: tables.filter(
        (table) => table?.status === "Reserved"
      ).length,
    };
  }, [tables]);

  const updateStatus = (tableId, status) => {
    const updatedTables = tables.map((table) =>
      table?.id === tableId
        ? {
            ...table,
            status,
            updatedAt: new Date().toISOString(),
          }
        : table
    );

    saveTables(updatedTables);
  };

  const markTableOccupied = (tableId) => {
    updateStatus(tableId, "Occupied");
  };

  const markTableAvailable = (tableId) => {
    updateStatus(tableId, "Available");
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
                fontSize: "clamp(30px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
              }}
            >
              Tables & Floor
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#64748b",
                fontSize: 15,
              }}
            >
              Monitor dining tables and their live occupancy status.
            </p>
          </div>

          <button
            onClick={refresh}
            style={{
              border: "1px solid rgba(15,23,42,0.08)",
              background: "rgba(255,255,255,0.76)",
              backdropFilter: "blur(18px)",
              borderRadius: 14,
              padding: "12px 18px",
              fontWeight: 800,
              color: "#0f172a",
              cursor: "pointer",
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
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            ["Total Tables", stats.total],
            ["Available", stats.available],
            ["Occupied", stats.occupied],
            ["Reserved", stats.reserved],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: 22,
                borderRadius: 22,
                background: "rgba(255,255,255,0.76)",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.85)",
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
                  letterSpacing: "-0.04em",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search table..."
            style={{
              flex: "1 1 280px",
              minWidth: 220,
              padding: "14px 16px",
              borderRadius: 14,
              border:
                "1px solid rgba(15,23,42,0.08)",
              background: "rgba(255,255,255,0.82)",
              outline: "none",
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border:
                "1px solid rgba(15,23,42,0.08)",
              background: "rgba(255,255,255,0.82)",
              outline: "none",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <option value="All">All Statuses</option>

            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Floor Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(270px, 1fr))",
            gap: 18,
          }}
        >
          {filteredTables.map((table) => {
            const statusStyle = getStatusStyle(
              table?.status
            );

            return (
              <div
                key={table?.id}
                style={{
                  position: "relative",
                  padding: 22,
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.78)",
                  backdropFilter: "blur(18px)",
                  border:
                    "1px solid rgba(255,255,255,0.9)",
                  boxShadow:
                    "0 18px 55px rgba(15,23,42,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {table?.id}
                    </div>

                    <h3
                      style={{
                        margin: "5px 0 0",
                        fontSize: 22,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {table?.name}
                    </h3>
                  </div>

                  <div
                    style={{
                      padding: "7px 10px",
                      borderRadius: 999,
                      background:
                        statusStyle.background,
                      color: statusStyle.color,
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    {table?.status}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderTop:
                      "1px solid rgba(15,23,42,0.06)",
                    borderBottom:
                      "1px solid rgba(15,23,42,0.06)",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      fontSize: 13,
                    }}
                  >
                    Capacity
                  </span>

                  <strong>
                    {table?.capacity || 2} seats
                  </strong>
                </div>

                {table?.order ? (
                  <div
                    style={{
                      marginTop: 15,
                      padding: 14,
                      borderRadius: 16,
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#64748b",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      Active Order
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: 10,
                      }}
                    >
                      <strong>
                        #{table.order.id}
                      </strong>

                      <strong>
                        ₹
                        {Number(
                          table.order.total || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      {table.order.status}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: 15,
                      padding: 14,
                      borderRadius: 16,
                      background: "#f8fafc",
                      color: "#64748b",
                      fontSize: 13,
                    }}
                  >
                    No active order
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginTop: 16,
                  }}
                >
                  <button
                    onClick={() =>
                      setSelectedTable(table)
                    }
                    style={{
                      border:
                        "1px solid rgba(15,23,42,0.08)",
                      background: "#f8fafc",
                      borderRadius: 11,
                      padding: "10px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Details
                  </button>

                  <button
                    onClick={() =>
                      markTableOccupied(table.id)
                    }
                    style={{
                      border: "none",
                      background: "#fff1f2",
                      color: "#be123c",
                      borderRadius: 11,
                      padding: "10px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Occupy
                  </button>

                  <button
                    onClick={() =>
                      markTableAvailable(table.id)
                    }
                    style={{
                      border: "none",
                      background: "#ecfdf5",
                      color: "#047857",
                      borderRadius: 11,
                      padding: "10px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Available
                  </button>

                  <select
                    value={table?.status}
                    onChange={(event) =>
                      updateStatus(
                        table.id,
                        event.target.value
                      )
                    }
                    style={{
                      border:
                        "1px solid rgba(15,23,42,0.08)",
                      background: "#fff",
                      borderRadius: 11,
                      padding: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        {!filteredTables.length && (
          <div
            style={{
              padding: 50,
              textAlign: "center",
              color: "#64748b",
              background: "rgba(255,255,255,0.72)",
              borderRadius: 24,
            }}
          >
            No tables match the current filters.
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedTable && (
        <div
          onClick={() => setSelectedTable(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15,23,42,0.45)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "min(560px, 100%)",
              padding: 28,
              borderRadius: 26,
              background: "rgba(255,255,255,0.97)",
              boxShadow:
                "0 30px 100px rgba(15,23,42,0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 20,
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
                  Table Details
                </div>

                <h2
                  style={{
                    margin: "6px 0 0",
                    fontSize: 28,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {selectedTable.name}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedTable(null)
                }
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
                  "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: "#f8fafc",
                }}
              >
                <div style={detailLabel}>
                  Table ID
                </div>
                <strong>{selectedTable.id}</strong>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: "#f8fafc",
                }}
              >
                <div style={detailLabel}>
                  Capacity
                </div>
                <strong>
                  {selectedTable.capacity} seats
                </strong>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: "#f8fafc",
                }}
              >
                <div style={detailLabel}>
                  Status
                </div>
                <strong>
                  {selectedTable.status}
                </strong>
              </div>

              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: "#f8fafc",
                }}
              >
                <div style={detailLabel}>
                  Active Order
                </div>
                <strong>
                  {selectedTable.order
                    ? `#${selectedTable.order.id}`
                    : "None"}
                </strong>
              </div>
            </div>

            {selectedTable.order && (
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 16,
                  background: "#f8fafc",
                }}
              >
                <div style={detailLabel}>
                  Current Order
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginTop: 8,
                  }}
                >
                  <strong>
                    {selectedTable.order.status}
                  </strong>

                  <strong>
                    ₹
                    {Number(
                      selectedTable.order.total || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const detailLabel = {
  fontSize: 11,
  color: "#64748b",
  fontWeight: 800,
  textTransform: "uppercase",
  marginBottom: 7,
};