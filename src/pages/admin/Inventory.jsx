import { useEffect, useMemo, useState } from "react";

const DEFAULT_INVENTORY = [
  {
    id: "INV-001",
    name: "Basmati Rice",
    category: "Grains",
    unit: "kg",
    quantity: 42,
    minimum: 15,
    supplier: "Premium Foods",
  },
  {
    id: "INV-002",
    name: "Chicken",
    category: "Meat",
    unit: "kg",
    quantity: 28,
    minimum: 10,
    supplier: "Fresh Farm",
  },
  {
    id: "INV-003",
    name: "Paneer",
    category: "Dairy",
    unit: "kg",
    quantity: 14,
    minimum: 8,
    supplier: "Daily Dairy",
  },
  {
    id: "INV-004",
    name: "Cooking Oil",
    category: "Essentials",
    unit: "L",
    quantity: 24,
    minimum: 10,
    supplier: "Premium Foods",
  },
  {
    id: "INV-005",
    name: "Onion",
    category: "Vegetables",
    unit: "kg",
    quantity: 18,
    minimum: 12,
    supplier: "Fresh Farm",
  },
  {
    id: "INV-006",
    name: "Tomato",
    category: "Vegetables",
    unit: "kg",
    quantity: 9,
    minimum: 10,
    supplier: "Fresh Farm",
  },
  {
    id: "INV-007",
    name: "Naan Flour",
    category: "Grains",
    unit: "kg",
    quantity: 31,
    minimum: 12,
    supplier: "Premium Foods",
  },
  {
    id: "INV-008",
    name: "Lime",
    category: "Vegetables",
    unit: "kg",
    quantity: 6,
    minimum: 8,
    supplier: "Fresh Farm",
  },
];

const emptyForm = {
  name: "",
  category: "General",
  unit: "kg",
  quantity: "",
  minimum: "",
  supplier: "",
};

function readInventory() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("smartdine_inventory")
    );

    if (Array.isArray(saved) && saved.length) {
      return saved;
    }

    return DEFAULT_INVENTORY;
  } catch {
    return DEFAULT_INVENTORY;
  }
}

function getStockState(item) {
  const quantity = Number(item?.quantity || 0);
  const minimum = Number(item?.minimum || 0);

  if (quantity <= 0) {
    return "Out of Stock";
  }

  if (quantity <= minimum) {
    return "Low Stock";
  }

  return "In Stock";
}

function getStockStyle(state) {
  if (state === "Out of Stock") {
    return {
      background: "rgba(239,68,68,0.12)",
      color: "#b91c1c",
    };
  }

  if (state === "Low Stock") {
    return {
      background: "rgba(245,158,11,0.14)",
      color: "#b45309",
    };
  }

  return {
    background: "rgba(16,185,129,0.12)",
    color: "#047857",
  };
}

export default function Inventory() {
  const [inventory, setInventory] = useState(readInventory);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [stockItem, setStockItem] = useState(null);
  const [stockAction, setStockAction] = useState("add");
  const [stockAmount, setStockAmount] = useState("");

  const refreshInventory = () => {
    setInventory(readInventory());
  };

  useEffect(() => {
    window.addEventListener(
      "smartdine-inventory-updated",
      refreshInventory
    );

    window.addEventListener("storage", refreshInventory);

    return () => {
      window.removeEventListener(
        "smartdine-inventory-updated",
        refreshInventory
      );

      window.removeEventListener(
        "storage",
        refreshInventory
      );
    };
  }, []);

  const saveInventory = (updatedInventory) => {
    setInventory(updatedInventory);

    localStorage.setItem(
      "smartdine_inventory",
      JSON.stringify(updatedInventory)
    );

    window.dispatchEvent(
      new CustomEvent("smartdine-inventory-updated")
    );
  };

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          inventory
            .map((item) => item?.category)
            .filter(Boolean)
        )
      ),
    ];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return inventory.filter((item) => {
      const state = getStockState(item);

      const matchesSearch =
        !query ||
        item?.name?.toLowerCase().includes(query) ||
        item?.category?.toLowerCase().includes(query) ||
        item?.supplier?.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        item?.category === categoryFilter;

      const matchesStock =
        stockFilter === "All" ||
        state === stockFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      );
    });
  }, [
    inventory,
    search,
    categoryFilter,
    stockFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: inventory.length,

      inStock: inventory.filter(
        (item) => getStockState(item) === "In Stock"
      ).length,

      lowStock: inventory.filter(
        (item) => getStockState(item) === "Low Stock"
      ).length,

      outOfStock: inventory.filter(
        (item) => getStockState(item) === "Out of Stock"
      ).length,
    };
  }, [inventory]);

  const openAdd = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);

    setForm({
      name: item?.name || "",
      category: item?.category || "General",
      unit: item?.unit || "kg",
      quantity:
        item?.quantity !== undefined
          ? String(item.quantity)
          : "",
      minimum:
        item?.minimum !== undefined
          ? String(item.minimum)
          : "",
      supplier: item?.supplier || "",
    });

    setShowModal(true);
  };

  const submitItem = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter an inventory item name.");
      return;
    }

    if (
      form.quantity === "" ||
      Number(form.quantity) < 0
    ) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (
      form.minimum === "" ||
      Number(form.minimum) < 0
    ) {
      alert("Please enter a valid minimum stock level.");
      return;
    }

    const itemData = {
      name: form.name.trim(),
      category: form.category.trim() || "General",
      unit: form.unit.trim() || "kg",
      quantity: Number(form.quantity),
      minimum: Number(form.minimum),
      supplier: form.supplier.trim(),
    };

    if (editingItem) {
      const updated = inventory.map((item) =>
        item?.id === editingItem?.id
          ? {
              ...item,
              ...itemData,
            }
          : item
      );

      saveInventory(updated);
    } else {
      const newItem = {
        id: `INV-${Date.now()}`,
        ...itemData,
      };

      saveInventory([...inventory, newItem]);
    }

    setShowModal(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const openStockModal = (item, action = "add") => {
    setStockItem(item);
    setStockAction(action);
    setStockAmount("");
  };

  const applyStockChange = () => {
    if (!stockItem) return;

    const amount = Number(stockAmount);

    if (!amount || amount <= 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    const updated = inventory.map((item) => {
      if (item?.id !== stockItem?.id) {
        return item;
      }

      const currentQuantity = Number(
        item?.quantity || 0
      );

      const nextQuantity =
        stockAction === "add"
          ? currentQuantity + amount
          : Math.max(0, currentQuantity - amount);

      return {
        ...item,
        quantity: nextQuantity,
        updatedAt: new Date().toISOString(),
      };
    });

    saveInventory(updated);

    setStockItem(null);
    setStockAmount("");
  };

  const deleteItem = (id) => {
    const item = inventory.find(
      (entry) => entry?.id === id
    );

    if (!item) return;

    const confirmed = window.confirm(
      `Delete "${item.name}" from inventory?`
    );

    if (!confirmed) return;

    saveInventory(
      inventory.filter(
        (entry) => entry?.id !== id
      )
    );
  };

  const resetInventory = () => {
    const confirmed = window.confirm(
      "Reset inventory to the default SmartDine inventory?"
    );

    if (!confirmed) return;

    saveInventory(DEFAULT_INVENTORY);
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
              Inventory Management
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#64748b",
                fontSize: 15,
              }}
            >
              Track stock levels, suppliers and low-stock items.
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
              onClick={resetInventory}
              style={secondaryButton}
            >
              Reset Inventory
            </button>

            <button
              onClick={openAdd}
              style={primaryButton}
            >
              + Add Inventory
            </button>
          </div>
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
            ["Total Items", stats.total],
            ["In Stock", stats.inStock],
            ["Low Stock", stats.lowStock],
            ["Out of Stock", stats.outOfStock],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: 22,
                borderRadius: 22,
                background:
                  "rgba(255,255,255,0.76)",
                backdropFilter: "blur(18px)",
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
            placeholder="Search item, category or supplier..."
            style={{
              flex: "1 1 320px",
              minWidth: 220,
              padding: "14px 16px",
              borderRadius: 14,
              border:
                "1px solid rgba(15,23,42,0.08)",
              background:
                "rgba(255,255,255,0.82)",
              outline: "none",
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            style={selectStyle}
          >
            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(event) =>
              setStockFilter(event.target.value)
            }
            style={selectStyle}
          >
            <option value="All">
              All Stock Status
            </option>
            <option value="In Stock">
              In Stock
            </option>
            <option value="Low Stock">
              Low Stock
            </option>
            <option value="Out of Stock">
              Out of Stock
            </option>
          </select>
        </div>

        {/* Inventory Table */}
        <div
          style={{
            overflow: "hidden",
            borderRadius: 24,
            background:
              "rgba(255,255,255,0.78)",
            backdropFilter: "blur(18px)",
            border:
              "1px solid rgba(255,255,255,0.9)",
            boxShadow:
              "0 20px 60px rgba(15,23,42,0.08)",
          }}
        >
          <div
            style={{
              padding: "20px 22px",
              borderBottom:
                "1px solid rgba(15,23,42,0.06)",
              fontWeight: 900,
              fontSize: 16,
            }}
          >
            Stock Overview
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1050,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    background:
                      "rgba(248,250,252,0.8)",
                  }}
                >
                  {[
                    "Item",
                    "Category",
                    "Stock",
                    "Minimum",
                    "Status",
                    "Supplier",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "14px 18px",
                        fontSize: 12,
                        color: "#64748b",
                        fontWeight: 800,
                        textTransform:
                          "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredInventory.map((item) => {
                  const state =
                    getStockState(item);

                  const stockStyle =
                    getStockStyle(state);

                  return (
                    <tr
                      key={item?.id}
                      style={{
                        borderTop:
                          "1px solid rgba(15,23,42,0.05)",
                      }}
                    >
                      <td
                        style={{
                          padding: "18px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 900,
                          }}
                        >
                          {item?.name}
                        </div>

                        <div
                          style={{
                            marginTop: 4,
                            color: "#94a3b8",
                            fontSize: 11,
                          }}
                        >
                          {item?.id}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: "18px",
                          color: "#475569",
                          fontSize: 13,
                        }}
                      >
                        {item?.category}
                      </td>

                      <td
                        style={{
                          padding: "18px",
                          fontWeight: 900,
                        }}
                      >
                        {Number(
                          item?.quantity || 0
                        ).toLocaleString("en-IN")}{" "}
                        {item?.unit}
                      </td>

                      <td
                        style={{
                          padding: "18px",
                          color: "#64748b",
                        }}
                      >
                        {Number(
                          item?.minimum || 0
                        ).toLocaleString("en-IN")}{" "}
                        {item?.unit}
                      </td>

                      <td
                        style={{
                          padding: "18px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            padding:
                              "7px 10px",
                            borderRadius: 999,
                            background:
                              stockStyle.background,
                            color:
                              stockStyle.color,
                            fontSize: 11,
                            fontWeight: 900,
                          }}
                        >
                          {state}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: "18px",
                          color: "#64748b",
                          fontSize: 13,
                        }}
                      >
                        {item?.supplier ||
                          "—"}
                      </td>

                      <td
                        style={{
                          padding: "18px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 7,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() =>
                              openStockModal(
                                item,
                                "add"
                              )
                            }
                            style={smallButton}
                          >
                            + Stock
                          </button>

                          <button
                            onClick={() =>
                              openStockModal(
                                item,
                                "remove"
                              )
                            }
                            style={{
                              ...smallButton,
                              background:
                                "#fff7ed",
                              color:
                                "#c2410c",
                            }}
                          >
                            − Stock
                          </button>

                          <button
                            onClick={() =>
                              openEdit(item)
                            }
                            style={smallButton}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteItem(
                                item.id
                              )
                            }
                            style={{
                              ...smallButton,
                              background:
                                "#fef2f2",
                              color:
                                "#b91c1c",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!filteredInventory.length && (
            <div
              style={{
                padding: 50,
                textAlign: "center",
                color: "#64748b",
              }}
            >
              No inventory items match the
              current filters.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={overlayStyle}
        >
          <form
            onSubmit={submitItem}
            onClick={(event) =>
              event.stopPropagation()
            }
            style={modalStyle}
          >
            <div style={modalHeader}>
              <div>
                <div style={eyebrowStyle}>
                  Inventory Item
                </div>

                <h2 style={modalTitle}>
                  {editingItem
                    ? "Edit Inventory"
                    : "Add Inventory"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                style={closeButton}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: 16,
              }}
            >
              <label>
                <div style={fieldLabel}>
                  Item Name
                </div>

                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Basmati Rice"
                  style={inputStyle}
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: 12,
                }}
              >
                <label>
                  <div style={fieldLabel}>
                    Category
                  </div>

                  <input
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category:
                          event.target.value,
                      })
                    }
                    placeholder="Grains"
                    style={inputStyle}
                  />
                </label>

                <label>
                  <div style={fieldLabel}>
                    Unit
                  </div>

                  <input
                    value={form.unit}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        unit: event.target.value,
                      })
                    }
                    placeholder="kg"
                    style={inputStyle}
                  />
                </label>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: 12,
                }}
              >
                <label>
                  <div style={fieldLabel}>
                    Current Quantity
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        quantity:
                          event.target.value,
                      })
                    }
                    placeholder="25"
                    style={inputStyle}
                  />
                </label>

                <label>
                  <div style={fieldLabel}>
                    Minimum Stock
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={form.minimum}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        minimum:
                          event.target.value,
                      })
                    }
                    placeholder="10"
                    style={inputStyle}
                  />
                </label>
              </div>

              <label>
                <div style={fieldLabel}>
                  Supplier
                </div>

                <input
                  value={form.supplier}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      supplier:
                        event.target.value,
                    })
                  }
                  placeholder="Fresh Farm"
                  style={inputStyle}
                />
              </label>

              <button
                type="submit"
                style={{
                  ...primaryButton,
                  marginTop: 4,
                }}
              >
                {editingItem
                  ? "Save Changes"
                  : "Create Inventory Item"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Modal */}
      {stockItem && (
        <div
          onClick={() => setStockItem(null)}
          style={overlayStyle}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={modalStyle}
          >
            <div style={modalHeader}>
              <div>
                <div style={eyebrowStyle}>
                  Stock Adjustment
                </div>

                <h2 style={modalTitle}>
                  {stockAction === "add"
                    ? "Add Stock"
                    : "Remove Stock"}
                </h2>
              </div>

              <button
                onClick={() =>
                  setStockItem(null)
                }
                style={closeButton}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 16,
                background: "#f8fafc",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                }}
              >
                {stockItem?.name}
              </div>

              <div
                style={{
                  marginTop: 5,
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                Current stock:{" "}
                {stockItem?.quantity || 0}{" "}
                {stockItem?.unit}
              </div>
            </div>

            <label>
              <div style={fieldLabel}>
                Quantity
              </div>

              <input
                type="number"
                min="1"
                value={stockAmount}
                onChange={(event) =>
                  setStockAmount(
                    event.target.value
                  )
                }
                placeholder="Enter quantity"
                style={inputStyle}
                autoFocus
              />
            </label>

            <button
              onClick={applyStockChange}
              style={{
                ...primaryButton,
                width: "100%",
                marginTop: 18,
              }}
            >
              {stockAction === "add"
                ? "Add Stock"
                : "Remove Stock"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const primaryButton = {
  border: "none",
  background: "#0f172a",
  color: "#fff",
  borderRadius: 14,
  padding: "12px 18px",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryButton = {
  border: "1px solid rgba(15,23,42,0.08)",
  background: "rgba(255,255,255,0.76)",
  borderRadius: 14,
  padding: "12px 16px",
  fontWeight: 800,
  cursor: "pointer",
};

const smallButton = {
  border: "none",
  background: "#f1f5f9",
  color: "#334155",
  borderRadius: 9,
  padding: "8px 10px",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
};

const selectStyle = {
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.08)",
  background: "rgba(255,255,255,0.82)",
  outline: "none",
  fontSize: 14,
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.1)",
  background: "#fff",
  outline: "none",
  fontSize: 14,
  color: "#0f172a",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(15,23,42,0.45)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const modalStyle = {
  width: "min(560px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: 28,
  borderRadius: 26,
  background: "rgba(255,255,255,0.97)",
  boxShadow: "0 30px 100px rgba(15,23,42,0.22)",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 20,
  marginBottom: 24,
};

const eyebrowStyle = {
  fontSize: 12,
  color: "#64748b",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const modalTitle = {
  margin: "6px 0 0",
  fontSize: 28,
  letterSpacing: "-0.03em",
};

const closeButton = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  border: "none",
  background: "#f1f5f9",
  cursor: "pointer",
  fontSize: 18,
};

const fieldLabel = {
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 7,
};