import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Boxes,
  Check,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  TrendingDown,
  Utensils,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_INVENTORY = [
  {
    id: 1,
    name: "Basmati Rice",
    category: "Grains",
    stock: 42,
    unit: "kg",
    minimum: 15,
  },
  {
    id: 2,
    name: "Chicken",
    category: "Meat",
    stock: 28,
    unit: "kg",
    minimum: 12,
  },
  {
    id: 3,
    name: "Mozzarella",
    category: "Dairy",
    stock: 9,
    unit: "kg",
    minimum: 8,
  },
  {
    id: 4,
    name: "Mushrooms",
    category: "Vegetables",
    stock: 5,
    unit: "kg",
    minimum: 7,
  },
  {
    id: 5,
    name: "Onion",
    category: "Vegetables",
    stock: 18,
    unit: "kg",
    minimum: 10,
  },
  {
    id: 6,
    name: "Tomato",
    category: "Vegetables",
    stock: 11,
    unit: "kg",
    minimum: 8,
  },
  {
    id: 7,
    name: "Cooking Oil",
    category: "Pantry",
    stock: 24,
    unit: "L",
    minimum: 10,
  },
  {
    id: 8,
    name: "Butter",
    category: "Dairy",
    stock: 6,
    unit: "kg",
    minimum: 7,
  },
  {
    id: 9,
    name: "Cream",
    category: "Dairy",
    stock: 13,
    unit: "L",
    minimum: 6,
  },
  {
    id: 10,
    name: "Chocolate",
    category: "Dessert",
    stock: 14,
    unit: "kg",
    minimum: 5,
  },
  {
    id: 11,
    name: "Mango",
    category: "Fruits",
    stock: 22,
    unit: "kg",
    minimum: 8,
  },
  {
    id: 12,
    name: "Mint",
    category: "Herbs",
    stock: 3,
    unit: "kg",
    minimum: 4,
  },
];

const CATEGORIES = [
  "All",
  "Grains",
  "Meat",
  "Dairy",
  "Vegetables",
  "Pantry",
  "Dessert",
  "Fruits",
  "Herbs",
];

function getInventory() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("smartdine_inventory")
    );

    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }

    localStorage.setItem(
      "smartdine_inventory",
      JSON.stringify(DEFAULT_INVENTORY)
    );

    return DEFAULT_INVENTORY;
  } catch {
    return DEFAULT_INVENTORY;
  }
}

function saveInventory(items) {
  localStorage.setItem(
    "smartdine_inventory",
    JSON.stringify(items)
  );

  window.dispatchEvent(
    new CustomEvent("smartdine-inventory-updated")
  );
}

function getStockStatus(item) {
  if (item.stock <= 0) {
    return "Out of stock";
  }

  if (item.stock <= item.minimum) {
    return "Low stock";
  }

  return "Healthy";
}

function getStatusClass(status) {
  if (status === "Out of stock") {
    return "out";
  }

  if (status === "Low stock") {
    return "low";
  }

  return "healthy";
}

export default function Inventory() {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState(getInventory);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Details modal state
  const [selectedItem, setSelectedItem] = useState(null);

  // Stock adjustment modal state
  const [stockItem, setStockItem] = useState(null);
  const [stockAmount, setStockAmount] = useState("");
  const [stockAction, setStockAction] = useState("add");

  const [toast, setToast] = useState("");

  const stats = useMemo(() => {
    return {
      total: inventory.length,

      healthy: inventory.filter(
        (item) => getStockStatus(item) === "Healthy"
      ).length,

      low: inventory.filter(
        (item) => getStockStatus(item) === "Low stock"
      ).length,

      out: inventory.filter(
        (item) => getStockStatus(item) === "Out of stock"
      ).length,
    };
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return inventory.filter((item) => {
      const matchesCategory =
        category === "All" ||
        item.category === category;

      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [inventory, search, category]);

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 1800);
  };

  const openStockModal = (item, action) => {
    setStockItem(item);
    setStockAction(action);
    setStockAmount("");
  };

  const closeStockModal = () => {
    setStockItem(null);
    setStockAmount("");
  };

  const updateStock = () => {
    const amount = Number(stockAmount);

    if (!amount || amount <= 0 || !stockItem) {
      showToast("Enter a valid stock amount.");
      return;
    }

    const current = getInventory();

    const updated = current.map((item) => {
      if (item.id !== stockItem.id) {
        return item;
      }

      const nextStock =
        stockAction === "add"
          ? item.stock + amount
          : Math.max(0, item.stock - amount);

      return {
        ...item,
        stock: Number(nextStock.toFixed(2)),
      };
    });

    saveInventory(updated);
    setInventory(updated);

    const changedItem = updated.find(
      (item) => item.id === stockItem.id
    );

    setSelectedItem(changedItem);

    showToast(
      stockAction === "add"
        ? `${stockItem.name} stock increased`
        : `${stockItem.name} stock reduced`
    );

    closeStockModal();
  };

  const resetInventory = () => {
    const confirmed = window.confirm(
      "Reset the inventory to the original demo data?"
    );

    if (!confirmed) {
      return;
    }

    saveInventory(DEFAULT_INVENTORY);
    setInventory(DEFAULT_INVENTORY);
    setSelectedItem(null);
    setStockItem(null);

    showToast("Inventory reset to demo data");
  };

  const closeDetailsModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="sd-inventory-page">
      <div className="sd-inventory-bg">
        <div className="sd-inventory-orb sd-inventory-orb-one" />
        <div className="sd-inventory-orb sd-inventory-orb-two" />
        <div className="sd-inventory-grid" />
      </div>

      <aside className="sd-inventory-sidebar">
        <button
          className="sd-inventory-brand"
          onClick={() => navigate("/")}
        >
          <div className="sd-inventory-brand-mark">
            <Utensils size={20} />
          </div>

          <div>
            <strong>SmartDine</strong>
            <span>Staff Console</span>
          </div>
        </button>

        <div className="sd-inventory-nav-section">
          <span>OPERATIONS</span>

          <button
            className="sd-inventory-nav-item"
            onClick={() => navigate("/staff")}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            className="sd-inventory-nav-item"
            onClick={() => navigate("/staff/kitchen")}
          >
            <Utensils size={18} />
            Kitchen
          </button>

          <button
            className="sd-inventory-nav-item"
            onClick={() => navigate("/staff/waiter")}
          >
            <Package size={18} />
            Service Requests
          </button>

          <button
            className="sd-inventory-nav-item"
            onClick={() => navigate("/staff/tables")}
          >
            <Boxes size={18} />
            Tables
          </button>

          <button className="sd-inventory-nav-item active">
            <Package size={18} />
            Inventory

            {stats.low + stats.out > 0 && (
              <span className="sd-inventory-nav-badge">
                {stats.low + stats.out}
              </span>
            )}
          </button>
        </div>

        <div className="sd-inventory-sidebar-bottom">
          <div className="sd-inventory-online">
            <span />

            <div>
              <strong>Inventory live</strong>
              <small>Stock monitoring active</small>
            </div>
          </div>

          <button
            className="sd-inventory-exit"
            onClick={() => navigate("/")}
          >
            <LogOut size={17} />
            Exit
          </button>
        </div>
      </aside>

      <main className="sd-inventory-main">
        <header className="sd-inventory-header">
          <div>
            <div className="sd-inventory-mobile-title">
              <button
                onClick={() => navigate("/staff")}
              >
                <LayoutDashboard size={18} />
              </button>

              Staff / Inventory
            </div>

            <span className="sd-inventory-kicker">
              STOCK CONTROL
            </span>

            <h1>Inventory</h1>

            <p>
              Keep ingredients visible, available and
              ready for service.
            </p>
          </div>

          <div className="sd-inventory-header-actions">
            <button
              className="sd-inventory-reset"
              onClick={resetInventory}
            >
              <RefreshCw size={16} />
              Reset demo
            </button>
          </div>
        </header>

        <section className="sd-inventory-stats">
          <motion.div
            className="sd-inventory-stat-card"
            whileHover={{ y: -4 }}
          >
            <div className="sd-inventory-stat-icon">
              <Boxes size={19} />
            </div>

            <div>
              <span>Total Items</span>
              <strong>{stats.total}</strong>
            </div>
          </motion.div>

          <motion.div
            className="sd-inventory-stat-card healthy"
            whileHover={{ y: -4 }}
          >
            <div className="sd-inventory-stat-icon">
              <Check size={19} />
            </div>

            <div>
              <span>Healthy Stock</span>
              <strong>{stats.healthy}</strong>
            </div>
          </motion.div>

          <motion.div
            className="sd-inventory-stat-card warning"
            whileHover={{ y: -4 }}
          >
            <div className="sd-inventory-stat-icon">
              <AlertTriangle size={19} />
            </div>

            <div>
              <span>Low Stock</span>
              <strong>{stats.low}</strong>
            </div>
          </motion.div>

          <motion.div
            className="sd-inventory-stat-card danger"
            whileHover={{ y: -4 }}
          >
            <div className="sd-inventory-stat-icon">
              <TrendingDown size={19} />
            </div>

            <div>
              <span>Out of Stock</span>
              <strong>{stats.out}</strong>
            </div>
          </motion.div>
        </section>

        <section className="sd-inventory-alert">
          <div className="sd-inventory-alert-icon">
            <AlertTriangle size={19} />
          </div>

          <div>
            <strong>
              {stats.low + stats.out} inventory alerts
            </strong>

            <p>
              Review ingredients below their minimum
              stock level before the next service.
            </p>
          </div>

          <button
            onClick={() => setCategory("All")}
          >
            Review
            <ArrowDown size={15} />
          </button>
        </section>

        <section className="sd-inventory-toolbar">
          <div className="sd-inventory-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search ingredients..."
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="sd-inventory-category">
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              {CATEGORIES.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            <ChevronDown size={15} />
          </div>
        </section>

        <section className="sd-inventory-table-wrap">
          <div className="sd-inventory-table-head">
            <span>ITEM</span>
            <span>CATEGORY</span>
            <span>STOCK</span>
            <span>MINIMUM</span>
            <span>STATUS</span>
            <span>ACTION</span>
          </div>

          {filteredInventory.map((item, index) => {
            const status = getStockStatus(item);
            const statusClass = getStatusClass(status);

            const percentage =
              item.minimum > 0
                ? Math.min(
                    100,
                    (item.stock /
                      (item.minimum * 3)) *
                      100
                  )
                : 100;

            return (
              <motion.div
                key={item.id}
                className="sd-inventory-row"
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.035,
                }}
              >
                <div className="sd-inventory-item-name">
                  <div className="sd-inventory-item-icon">
                    <Package size={17} />
                  </div>

                  <div>
                    <strong>{item.name}</strong>

                    <small>
                      Ingredient #
                      {String(item.id).padStart(3, "0")}
                    </small>
                  </div>
                </div>

                <div className="sd-inventory-category-label">
                  {item.category}
                </div>

                <div className="sd-inventory-stock">
                  <strong>{item.stock}</strong>

                  <span>{item.unit}</span>

                  <div className="sd-inventory-stock-bar">
                    <span
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="sd-inventory-minimum">
                  {item.minimum} {item.unit}
                </div>

                <div>
                  <span
                    className={`sd-inventory-status ${statusClass}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="sd-inventory-actions">
                  <button
                    title="Add stock"
                    onClick={() =>
                      openStockModal(item, "add")
                    }
                  >
                    <Plus size={15} />
                  </button>

                  <button
                    title="Reduce stock"
                    onClick={() =>
                      openStockModal(item, "remove")
                    }
                  >
                    <ArrowDown size={15} />
                  </button>

                  <button
                    title="Details"
                    onClick={() =>
                      setSelectedItem(item)
                    }
                  >
                    <Settings2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {filteredInventory.length === 0 && (
            <div className="sd-inventory-empty">
              <Search size={24} />

              <h3>No inventory items found</h3>

              <p>
                Try a different ingredient or
                category.
              </p>
            </div>
          )}
        </section>

        <section className="sd-inventory-footer">
          <div>
            <span>STOCK INTELLIGENCE</span>

            <h2>
              Never run out of
              <em> essentials.</em>
            </h2>

            <p>
              SmartDine can later connect inventory
              levels with menu orders and automatically
              generate low-stock alerts.
            </p>
          </div>

          <div className="sd-inventory-footer-icon">
            <TrendingDown size={26} />
          </div>
        </section>
      </main>

      {/* DETAILS MODAL */}
      {selectedItem && (
        <div
          className="sd-inventory-modal-backdrop"
          onClick={closeDetailsModal}
        >
          <motion.div
            className="sd-inventory-modal"
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
            <button
              className="sd-inventory-modal-close"
              onClick={closeDetailsModal}
            >
              <X size={18} />
            </button>

            <div className="sd-inventory-modal-icon">
              <Package size={23} />
            </div>

            <span>{selectedItem.category}</span>

            <h2>{selectedItem.name}</h2>

            <div className="sd-inventory-modal-grid">
              <div>
                <small>Current stock</small>

                <strong>
                  {selectedItem.stock}{" "}
                  {selectedItem.unit}
                </strong>
              </div>

              <div>
                <small>Minimum level</small>

                <strong>
                  {selectedItem.minimum}{" "}
                  {selectedItem.unit}
                </strong>
              </div>
            </div>

            <div className="sd-inventory-modal-status">
              <span
                className={`sd-inventory-status ${getStatusClass(
                  getStockStatus(selectedItem)
                )}`}
              >
                {getStockStatus(selectedItem)}
              </span>
            </div>

            <div className="sd-inventory-modal-actions">
              <button
                onClick={() => {
                  openStockModal(
                    selectedItem,
                    "add"
                  );
                  setSelectedItem(null);
                }}
              >
                <ArrowUp size={16} />
                Add stock
              </button>

              <button
                onClick={() => {
                  openStockModal(
                    selectedItem,
                    "remove"
                  );
                  setSelectedItem(null);
                }}
              >
                <ArrowDown size={16} />
                Reduce stock
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {stockItem && (
        <div
          className="sd-inventory-stock-backdrop"
          onClick={closeStockModal}
        >
          <motion.div
            className="sd-inventory-stock-modal"
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="sd-inventory-modal-close"
              onClick={closeStockModal}
            >
              <X size={18} />
            </button>

            <div className="sd-inventory-stock-modal-icon">
              {stockAction === "add" ? (
                <ArrowUp size={22} />
              ) : (
                <ArrowDown size={22} />
              )}
            </div>

            <span>
              {stockAction === "add"
                ? "ADD STOCK"
                : "REDUCE STOCK"}
            </span>

            <h2>{stockItem.name}</h2>

            <p>
              Current stock:{" "}
              <strong>
                {stockItem.stock} {stockItem.unit}
              </strong>
            </p>

            <input
              autoFocus
              type="number"
              min="0"
              step="0.1"
              value={stockAmount}
              onChange={(event) =>
                setStockAmount(
                  event.target.value
                )
              }
              placeholder={`Amount in ${stockItem.unit}`}
            />

            <button
              className="sd-inventory-confirm"
              onClick={updateStock}
            >
              Confirm
              <Check size={16} />
            </button>
          </motion.div>
        </div>
      )}

      {toast && (
        <motion.div
          className="sd-inventory-toast"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <Check size={17} />
          {toast}
        </motion.div>
      )}
    </div>
  );
}