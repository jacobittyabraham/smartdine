import { useEffect, useMemo, useState } from "react";

const DEFAULT_MENU = [
  {
    id: "1",
    name: "Chicken Biriyani",
    category: "Main Course",
    price: 220,
    description: "Fragrant basmati rice with tender chicken and aromatic spices.",
    available: true,
    featured: true,
  },
  {
    id: "2",
    name: "Paneer Butter Masala",
    category: "Main Course",
    price: 190,
    description: "Creamy tomato gravy with soft paneer and Indian spices.",
    available: true,
    featured: false,
  },
  {
    id: "3",
    name: "Butter Naan",
    category: "Breads",
    price: 45,
    description: "Soft tandoor-baked naan finished with butter.",
    available: true,
    featured: false,
  },
  {
    id: "4",
    name: "Chicken 65",
    category: "Starters",
    price: 180,
    description: "Crispy spicy fried chicken with aromatic seasoning.",
    available: true,
    featured: true,
  },
  {
    id: "5",
    name: "Fresh Lime Soda",
    category: "Beverages",
    price: 70,
    description: "Refreshing lime soda served chilled.",
    available: true,
    featured: false,
  },
  {
    id: "6",
    name: "Gulab Jamun",
    category: "Desserts",
    price: 90,
    description: "Soft milk-solid dumplings soaked in sweet syrup.",
    available: true,
    featured: false,
  },
];

function readMenu() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("smartdine_menu")
    );

    if (Array.isArray(saved) && saved.length) {
      return saved;
    }

    return DEFAULT_MENU;
  } catch {
    return DEFAULT_MENU;
  }
}

const emptyForm = {
  name: "",
  category: "Main Course",
  price: "",
  description: "",
  available: true,
  featured: false,
};

export default function Menu() {
  const [menu, setMenu] = useState(readMenu);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(menu.map((item) => item?.category).filter(Boolean))
      ),
    ];
  }, [menu]);

  const refreshMenu = () => {
    setMenu(readMenu());
  };

  useEffect(() => {
    window.addEventListener("smartdine-menu-updated", refreshMenu);
    window.addEventListener("storage", refreshMenu);

    return () => {
      window.removeEventListener(
        "smartdine-menu-updated",
        refreshMenu
      );
      window.removeEventListener("storage", refreshMenu);
    };
  }, []);

  const saveMenu = (updatedMenu) => {
    setMenu(updatedMenu);

    localStorage.setItem(
      "smartdine_menu",
      JSON.stringify(updatedMenu)
    );

    window.dispatchEvent(
      new CustomEvent("smartdine-menu-updated")
    );
  };

  const filteredMenu = useMemo(() => {
    const query = search.trim().toLowerCase();

    return menu.filter((item) => {
      const matchesSearch =
        !query ||
        item?.name?.toLowerCase().includes(query) ||
        item?.category?.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        item?.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [menu, search, categoryFilter]);

  const stats = useMemo(() => {
    return {
      total: menu.length,
      available: menu.filter((item) => item?.available).length,
      featured: menu.filter((item) => item?.featured).length,
      unavailable: menu.filter((item) => !item?.available).length,
    };
  }, [menu]);

  const openAdd = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item?.name || "",
      category: item?.category || "Main Course",
      price: item?.price || "",
      description: item?.description || "",
      available: item?.available !== false,
      featured: Boolean(item?.featured),
    });
    setShowModal(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter a menu item name.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    const itemData = {
      name: form.name.trim(),
      category: form.category.trim() || "Main Course",
      price: Number(form.price),
      description: form.description.trim(),
      available: form.available,
      featured: form.featured,
    };

    if (editingItem) {
      const updated = menu.map((item) =>
        item?.id === editingItem?.id
          ? {
              ...item,
              ...itemData,
            }
          : item
      );

      saveMenu(updated);
    } else {
      const newItem = {
        id: `menu-${Date.now()}`,
        ...itemData,
      };

      saveMenu([...menu, newItem]);
    }

    setShowModal(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const toggleAvailability = (id) => {
    const updated = menu.map((item) =>
      item?.id === id
        ? {
            ...item,
            available: !item.available,
          }
        : item
    );

    saveMenu(updated);
  };

  const toggleFeatured = (id) => {
    const updated = menu.map((item) =>
      item?.id === id
        ? {
            ...item,
            featured: !item.featured,
          }
        : item
    );

    saveMenu(updated);
  };

  const deleteItem = (id) => {
    const item = menu.find((entry) => entry?.id === id);

    if (!item) return;

    const confirmed = window.confirm(
      `Delete "${item.name}" from the menu?`
    );

    if (!confirmed) return;

    saveMenu(menu.filter((entry) => entry?.id !== id));
  };

  const resetMenu = () => {
    const confirmed = window.confirm(
      "Reset the admin menu to the default SmartDine menu?"
    );

    if (!confirmed) return;

    saveMenu(DEFAULT_MENU);
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
              Menu Administration
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#64748b",
                fontSize: 15,
              }}
            >
              Manage dishes, pricing, availability and featured items.
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
              onClick={resetMenu}
              style={{
                border: "1px solid rgba(15,23,42,0.08)",
                background: "rgba(255,255,255,0.75)",
                borderRadius: 14,
                padding: "12px 16px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Reset Menu
            </button>

            <button
              onClick={openAdd}
              style={{
                border: "none",
                background: "#0f172a",
                color: "#fff",
                borderRadius: 14,
                padding: "12px 18px",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 12px 30px rgba(15,23,42,0.16)",
              }}
            >
              + Add Menu Item
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
            ["Available", stats.available],
            ["Featured", stats.featured],
            ["Unavailable", stats.unavailable],
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
            marginBottom: 18,
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search menu item..."
            style={{
              flex: "1 1 300px",
              minWidth: 220,
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.08)",
              background: "rgba(255,255,255,0.82)",
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
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.08)",
              background: "rgba(255,255,255,0.82)",
              outline: "none",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Menu Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(290px, 1fr))",
            gap: 18,
          }}
        >
          {filteredMenu.map((item) => (
            <div
              key={item?.id}
              style={{
                position: "relative",
                padding: 22,
                borderRadius: 24,
                background: "rgba(255,255,255,0.78)",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.9)",
                boxShadow:
                  "0 18px 55px rgba(15,23,42,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      padding: "5px 9px",
                      borderRadius: 999,
                      background: "#f1f5f9",
                      color: "#64748b",
                      fontSize: 11,
                      fontWeight: 900,
                      marginBottom: 9,
                    }}
                  >
                    {item?.category || "Main Course"}
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: 20,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {item?.name}
                  </h3>
                </div>

                {item?.featured && (
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: "#fff7ed",
                      color: "#ea580c",
                      fontSize: 16,
                    }}
                    title="Featured"
                  >
                    ★
                  </div>
                )}
              </div>

              <p
                style={{
                  minHeight: 48,
                  margin: "0 0 18px",
                  color: "#64748b",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {item?.description ||
                  "No description added yet."}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 23,
                    fontWeight: 900,
                  }}
                >
                  ₹
                  {Number(item?.price || 0).toLocaleString(
                    "en-IN"
                  )}
                </div>

                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: item?.available
                      ? "rgba(16,185,129,0.12)"
                      : "rgba(239,68,68,0.11)",
                    color: item?.available
                      ? "#047857"
                      : "#b91c1c",
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  {item?.available
                    ? "AVAILABLE"
                    : "UNAVAILABLE"}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <button
                  onClick={() => openEdit(item)}
                  style={{
                    border: "1px solid rgba(15,23,42,0.08)",
                    background: "#f8fafc",
                    borderRadius: 11,
                    padding: "10px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleAvailability(item.id)}
                  style={{
                    border: "none",
                    background: item?.available
                      ? "#fff7ed"
                      : "#ecfdf5",
                    color: item?.available
                      ? "#c2410c"
                      : "#047857",
                    borderRadius: 11,
                    padding: "10px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {item?.available
                    ? "Disable"
                    : "Enable"}
                </button>

                <button
                  onClick={() => toggleFeatured(item.id)}
                  style={{
                    border: "1px solid rgba(15,23,42,0.08)",
                    background: item?.featured
                      ? "#fff7ed"
                      : "#f8fafc",
                    color: item?.featured
                      ? "#c2410c"
                      : "#475569",
                    borderRadius: 11,
                    padding: "10px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {item?.featured
                    ? "Unfeature"
                    : "Feature"}
                </button>

                <button
                  onClick={() => deleteItem(item.id)}
                  style={{
                    border: "none",
                    background: "#fef2f2",
                    color: "#b91c1c",
                    borderRadius: 11,
                    padding: "10px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {!filteredMenu.length && (
          <div
            style={{
              padding: 50,
              textAlign: "center",
              color: "#64748b",
              background: "rgba(255,255,255,0.72)",
              borderRadius: 24,
              marginTop: 10,
            }}
          >
            No menu items match your search.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
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
          <form
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(560px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
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
                marginBottom: 24,
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
                  Menu Item
                </div>

                <h2
                  style={{
                    margin: "6px 0 0",
                    fontSize: 28,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {editingItem
                    ? "Edit Item"
                    : "Add New Item"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
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
                gap: 16,
              }}
            >
              <label>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 7,
                  }}
                >
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
                  placeholder="Chicken Biriyani"
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
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      marginBottom: 7,
                    }}
                  >
                    Category
                  </div>

                  <input
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value,
                      })
                    }
                    placeholder="Main Course"
                    style={inputStyle}
                  />
                </label>

                <label>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      marginBottom: 7,
                    }}
                  >
                    Price
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        price: event.target.value,
                      })
                    }
                    placeholder="220"
                    style={inputStyle}
                  />
                </label>
              </div>

              <label>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 7,
                  }}
                >
                  Description
                </div>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe the dish..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </label>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "12px 14px",
                    borderRadius: 13,
                    background: "#f8fafc",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        available:
                          event.target.checked,
                      })
                    }
                  />
                  Available
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "12px 14px",
                    borderRadius: 13,
                    background: "#f8fafc",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        featured:
                          event.target.checked,
                      })
                    }
                  />
                  Featured
                </label>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 4,
                  border: "none",
                  background: "#0f172a",
                  color: "#fff",
                  borderRadius: 14,
                  padding: "14px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {editingItem
                  ? "Save Changes"
                  : "Create Menu Item"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

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