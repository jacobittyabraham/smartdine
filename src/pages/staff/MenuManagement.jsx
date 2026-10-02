import { useEffect, useMemo, useState } from "react";

import {
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Plus,
  Search,
  Star,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/*
|--------------------------------------------------------------------------
| DEFAULT MENU
|--------------------------------------------------------------------------
*/

const DEFAULT_MENU = [
  {
    id: "biriyani",
    name: "Classic Chicken Biriyani",
    category: "Biriyani",
    price: 220,
    description:
      "Fragrant basmati rice layered with tender chicken, caramelized onions and aromatic spices.",
    image:
      "https://images.pexels.com/photos/12737817/pexels-photo-12737817.jpeg?auto=format&fit=crop&w=1200&q=88",
    time: 22,
    tag: "Chef's Pick",
    available: true,
    featured: true,
  },

  {
    id: "pizza",
    name: "Truffle Mushroom Pizza",
    category: "Pizza",
    price: 340,
    description:
      "Wood-fired pizza with creamy mozzarella, mushrooms and a delicate truffle finish.",
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=88",
    time: 18,
    tag: "Premium",
    available: true,
    featured: true,
  },

  {
    id: "burger",
    name: "Smoked Chicken Burger",
    category: "Burgers",
    price: 280,
    description:
      "Smoked chicken patty, melted cheese, crisp lettuce and house sauce in a toasted brioche bun.",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=88",
    time: 15,
    tag: "Popular",
    available: true,
    featured: false,
  },

  {
    id: "paneer",
    name: "Tandoori Paneer",
    category: "Starters",
    price: 240,
    description:
      "Charred cottage cheese marinated with yogurt, herbs and traditional tandoori spices.",
    image:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=1200&q=88",
    time: 16,
    tag: "Vegetarian",
    available: true,
    featured: false,
  },

  {
    id: "pasta",
    name: "Creamy Alfredo Pasta",
    category: "Pasta",
    price: 260,
    description:
      "Silky parmesan cream sauce tossed with pasta, herbs and roasted vegetables.",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=88",
    time: 14,
    tag: "Comfort",
    available: true,
    featured: false,
  },

  {
    id: "mojito",
    name: "Classic Mojito",
    category: "Beverages",
    price: 150,
    description:
      "Fresh mint, lime, sparkling soda and a touch of sweetness served over ice.",
    image:
      "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=1200&q=88",
    time: 5,
    tag: "Refreshing",
    available: true,
    featured: false,
  },

  {
    id: "brownie",
    name: "Dark Chocolate Brownie",
    category: "Desserts",
    price: 180,
    description:
      "Rich chocolate brownie with a soft center and deep cocoa finish.",
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=88",
    time: 8,
    tag: "Sweet",
    available: true,
    featured: true,
  },

  {
    id: "fries",
    name: "Truffle Parmesan Fries",
    category: "Starters",
    price: 190,
    description:
      "Crispy golden fries finished with parmesan, herbs and truffle aroma.",
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=88",
    time: 10,
    tag: "Crispy",
    available: true,
    featured: false,
  },
];

/*
|--------------------------------------------------------------------------
| EMPTY FORM
|--------------------------------------------------------------------------
*/

const EMPTY_FORM = {
  name: "",
  category: "Biriyani",
  price: "",
  description: "",
  image: "",
  time: "",
  tag: "",
  available: true,
  featured: false,
};

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

const CATEGORIES = [
  "All",
  "Biriyani",
  "Pizza",
  "Burgers",
  "Starters",
  "Pasta",
  "Beverages",
  "Desserts",
];

/*
|--------------------------------------------------------------------------
| READ MENU
|--------------------------------------------------------------------------
*/

function getStoredMenu() {
  try {
    const saved =
      localStorage.getItem("smartdine_menu");

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.length > 0
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(
      "Could not read SmartDine menu:",
      error
    );
  }

  const freshMenu = DEFAULT_MENU.map(
    (item) => ({ ...item })
  );

  try {
    localStorage.setItem(
      "smartdine_menu",
      JSON.stringify(freshMenu)
    );
  } catch {
    // Continue even if localStorage is unavailable.
  }

  return freshMenu;
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function MenuManagement() {
  const navigate = useNavigate();

  const [menu, setMenu] =
    useState(getStoredMenu);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [toast, setToast] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | SAVE MENU + BROADCAST UPDATE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    try {
      localStorage.setItem(
        "smartdine_menu",
        JSON.stringify(menu)
      );
    } catch (error) {
      console.error(
        "Could not save SmartDine menu:",
        error
      );
    }

    window.dispatchEvent(
      new CustomEvent(
        "smartdine-menu-updated"
      )
    );
  }, [menu]);

  /*
  |--------------------------------------------------------------------------
  | LIVE SYNC
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const syncMenu = () => {
      try {
        const saved =
          localStorage.getItem(
            "smartdine_menu"
          );

        if (!saved) return;

        const parsed = JSON.parse(saved);

        if (
          Array.isArray(parsed) &&
          parsed.length > 0
        ) {
          setMenu(parsed);
        }
      } catch {
        // Ignore malformed external updates.
      }
    };

    window.addEventListener(
      "storage",
      syncMenu
    );

    window.addEventListener(
      "smartdine-menu-updated",
      syncMenu
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncMenu
      );

      window.removeEventListener(
        "smartdine-menu-updated",
        syncMenu
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | TOAST
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 2600);

    return () => clearTimeout(timer);
  }, [toast]);

  /*
  |--------------------------------------------------------------------------
  | FILTERED MENU
  |--------------------------------------------------------------------------
  */

  const filteredMenu = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return menu.filter((item) => {
      const name =
        String(item.name || "")
          .toLowerCase();

      const itemCategory =
        String(item.category || "")
          .toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        itemCategory.includes(query);

      const matchesCategory =
        category === "All" ||
        item.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [menu, search, category]);

  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const availableCount = menu.filter(
    (item) => item.available
  ).length;

  const featuredCount = menu.filter(
    (item) => item.featured
  ).length;

  const hiddenCount = menu.filter(
    (item) => !item.available
  ).length;

  /*
  |--------------------------------------------------------------------------
  | MODAL
  |--------------------------------------------------------------------------
  */

  function openAddModal() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
    });
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingId(item.id);

    setForm({
      name: item.name || "",
      category:
        item.category || "Biriyani",
      price: item.price ?? "",
      description:
        item.description || "",
      image: item.image || "",
      time: item.time ?? "",
      tag: item.tag || "",
      available:
        item.available !== false,
      featured:
        item.featured === true,
    });

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
    });
  }

  function updateForm(
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE DISH
  |--------------------------------------------------------------------------
  */

  function saveDish(event) {
    event.preventDefault();

    const name =
      form.name.trim();

    const description =
      form.description.trim();

    const price =
      Number(form.price);

    const time =
      Number(form.time);

    if (!name) {
      setToast(
        "Please enter a dish name."
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setToast(
        "Please enter a valid price."
      );
      return;
    }

    if (
      !Number.isFinite(time) ||
      time <= 0
    ) {
      setToast(
        "Please enter preparation time."
      );
      return;
    }

    if (editingId) {
      setMenu((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...form,
                name,
                description,
                price,
                time,
              }
            : item
        )
      );

      setToast(
        "Dish updated successfully."
      );
    } else {
      const newDish = {
        id: `dish-${Date.now()}`,
        name,
        category:
          form.category || "Biriyani",
        price,
        description,
        image:
          form.image.trim(),
        time,
        tag:
          form.tag.trim(),
        available:
          Boolean(form.available),
        featured:
          Boolean(form.featured),
      };

      setMenu((current) => [
        newDish,
        ...current,
      ]);

      setToast(
        "New dish added to the menu."
      );
    }

    closeModal();
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  function deleteDish(id) {
    const item = menu.find(
      (dish) => dish.id === id
    );

    if (!item) return;

    const confirmed =
      window.confirm(
        `Delete "${item.name}" from the menu?`
      );

    if (!confirmed) return;

    setMenu((current) =>
      current.filter(
        (dish) => dish.id !== id
      )
    );

    setToast(
      "Dish removed from the menu."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | AVAILABILITY
  |--------------------------------------------------------------------------
  */

  function toggleAvailability(id) {
    setMenu((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              available:
                !item.available,
            }
          : item
      )
    );

    setToast(
      "Dish availability updated."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | FEATURED
  |--------------------------------------------------------------------------
  */

  function toggleFeatured(id) {
    setMenu((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              featured:
                !item.featured,
            }
          : item
      )
    );

    setToast(
      "Featured status updated."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RESET MENU
  |--------------------------------------------------------------------------
  */

  function resetMenu() {
    const confirmed =
      window.confirm(
        "Reset the menu to the SmartDine demo menu?"
      );

    if (!confirmed) return;

    const resetData =
      DEFAULT_MENU.map(
        (item) => ({ ...item })
      );

    setMenu(resetData);

    setToast(
      "Menu reset to demo data."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  */

  function go(path) {
    navigate(path);
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="sd-menu-admin">

      {/* SIDEBAR */}

      <aside className="sd-menu-admin-sidebar">

        <div className="sd-menu-admin-brand">

          <div className="sd-menu-admin-brand-mark">
            <Utensils size={19} />
          </div>

          <div>
            <strong>
              SMARTDINE
            </strong>

            <span>
              STAFF OS
            </span>
          </div>

        </div>

        <div className="sd-menu-admin-nav-label">
          MANAGEMENT
        </div>

        <button
          className="sd-menu-admin-nav"
          onClick={() =>
            go("/staff")
          }
          type="button"
        >
          <LayoutDashboard
            size={18}
          />
          Overview
        </button>

        <button
          className="sd-menu-admin-nav"
          onClick={() =>
            go("/staff/kitchen")
          }
          type="button"
        >
          <Utensils size={18} />
          Kitchen
        </button>

        <button
          className="sd-menu-admin-nav"
          onClick={() =>
            go("/staff/waiter")
          }
          type="button"
        >
          <MenuIcon size={18} />
          Service Desk
        </button>

        <button
          className="sd-menu-admin-nav"
          onClick={() =>
            go("/staff/tables")
          }
          type="button"
        >
          <MenuIcon size={18} />
          Tables
        </button>

        <button
          className="sd-menu-admin-nav"
          onClick={() =>
            go("/staff/inventory")
          }
          type="button"
        >
          <MenuIcon size={18} />
          Inventory
        </button>

        <button
          className="sd-menu-admin-nav"
          onClick={() =>
            go("/staff/analytics")
          }
          type="button"
        >
          <MenuIcon size={18} />
          Analytics
        </button>

        <button
          className="sd-menu-admin-nav active"
          type="button"
        >
          <MenuIcon size={18} />
          Menu
        </button>

        <div className="sd-menu-admin-sidebar-bottom">

          <div className="sd-menu-admin-live">
            <span />
            System operational
          </div>

          <button
            className="sd-menu-admin-logout"
            onClick={() =>
              go("/login")
            }
            type="button"
          >
            <LogOut size={17} />
            Sign out
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="sd-menu-admin-main">

        {/* HEADER */}

        <header className="sd-menu-admin-header">

          <div>

            <div className="sd-menu-admin-eyebrow">
              MENU MANAGEMENT
            </div>

            <h1>
              Control the
              <span> menu.</span>
            </h1>

            <p>
              Manage dishes, pricing,
              availability and
              presentation from one place.
            </p>

          </div>

          <button
            className="sd-menu-admin-add"
            onClick={openAddModal}
            type="button"
          >
            <Plus size={18} />
            Add new dish
          </button>

        </header>

        {/* STATS */}

        <section className="sd-menu-admin-stats">

          <div className="sd-menu-admin-stat">
            <span>
              Total dishes
            </span>

            <strong>
              {menu.length}
            </strong>

            <small>
              Across all categories
            </small>
          </div>

          <div className="sd-menu-admin-stat">
            <span>
              Available
            </span>

            <strong>
              {availableCount}
            </strong>

            <small>
              Visible to customers
            </small>
          </div>

          <div className="sd-menu-admin-stat">
            <span>
              Featured
            </span>

            <strong>
              {featuredCount}
            </strong>

            <small>
              Highlighted dishes
            </small>
          </div>

          <div className="sd-menu-admin-stat">
            <span>
              Hidden
            </span>

            <strong>
              {hiddenCount}
            </strong>

            <small>
              Currently unavailable
            </small>
          </div>

        </section>

        {/* TOOLBAR */}

        <section className="sd-menu-admin-toolbar">

          <div className="sd-menu-admin-search">

            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search dishes..."
            />

          </div>

          <div className="sd-menu-admin-filters">

            {CATEGORIES.map(
              (item) => (
                <button
                  key={item}
                  className={
                    category === item
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setCategory(item)
                  }
                  type="button"
                >
                  {item}
                </button>
              )
            )}

          </div>

          <button
            className="sd-menu-admin-reset"
            onClick={resetMenu}
            type="button"
          >
            Reset demo
          </button>

        </section>

        {/* MENU GRID */}

        <section className="sd-menu-admin-grid">

          {filteredMenu.map(
            (item) => (

              <article
                className={`sd-menu-admin-card ${
                  !item.available
                    ? "is-hidden"
                    : ""
                }`}
                key={item.id}
              >

                <div className="sd-menu-admin-image">

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="sd-menu-admin-image-empty">
                      <ImagePlus
                        size={26}
                      />
                      No image
                    </div>
                  )}

                  <div className="sd-menu-admin-image-overlay">

                    <span>
                      {item.category}
                    </span>

                    {item.featured && (
                      <span className="featured">
                        <Star
                          size={12}
                          fill="currentColor"
                        />
                        Featured
                      </span>
                    )}

                  </div>

                  {!item.available && (
                    <div className="sd-menu-admin-hidden">
                      UNAVAILABLE
                    </div>
                  )}

                </div>

                <div className="sd-menu-admin-card-body">

                  <div className="sd-menu-admin-card-top">

                    <div>

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        {item.description}
                      </p>

                    </div>

                    <strong>
                      ₹
                      {Number(
                        item.price || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  <div className="sd-menu-admin-meta">

                    <span>
                      <Clock3
                        size={14}
                      />
                      {item.time} min
                    </span>

                    {item.tag && (
                      <span className="tag">
                        {item.tag}
                      </span>
                    )}

                  </div>

                  <div className="sd-menu-admin-actions">

                    <button
                      className={
                        item.available
                          ? "availability active"
                          : "availability"
                      }
                      onClick={() =>
                        toggleAvailability(
                          item.id
                        )
                      }
                      type="button"
                    >
                      <span className="toggle-dot" />

                      {item.available
                        ? "Available"
                        : "Hidden"}
                    </button>

                    <button
                      className={
                        item.featured
                          ? "icon-action featured"
                          : "icon-action"
                      }
                      title="Toggle featured"
                      onClick={() =>
                        toggleFeatured(
                          item.id
                        )
                      }
                      type="button"
                    >
                      <Star
                        size={16}
                        fill={
                          item.featured
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                    <button
                      className="icon-action"
                      title="Edit dish"
                      onClick={() =>
                        openEditModal(
                          item
                        )
                      }
                      type="button"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      className="icon-action danger"
                      title="Delete dish"
                      onClick={() =>
                        deleteDish(
                          item.id
                        )
                      }
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

              </article>
            )
          )}

        </section>

        {filteredMenu.length === 0 && (
          <div className="sd-menu-admin-empty">

            <Search size={30} />

            <h3>
              No dishes found
            </h3>

            <p>
              Try another search or
              category.
            </p>

          </div>
        )}

      </main>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div
          className="sd-menu-admin-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="sd-menu-admin-modal">

            <div className="sd-menu-admin-modal-head">

              <div>

                <span>
                  {editingId
                    ? "EDIT DISH"
                    : "NEW DISH"}
                </span>

                <h2>
                  {editingId
                    ? "Update menu item"
                    : "Create a new dish"}
                </h2>

              </div>

              <button
                onClick={closeModal}
                type="button"
                aria-label="Close"
              >
                <X size={19} />
              </button>

            </div>

            <form onSubmit={saveDish}>

              <div className="sd-menu-admin-form-grid">

                <label>
                  Dish name

                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateForm(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Butter Chicken"
                  />
                </label>

                <label>
                  Category

                  <div className="sd-menu-admin-select">

                    <select
                      value={form.category}
                      onChange={(event) =>
                        updateForm(
                          "category",
                          event.target.value
                        )
                      }
                    >
                      {CATEGORIES.filter(
                        (item) =>
                          item !== "All"
                      ).map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={16}
                    />

                  </div>
                </label>

                <label>
                  Price

                  <input
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={(event) =>
                      updateForm(
                        "price",
                        event.target.value
                      )
                    }
                    placeholder="₹ 250"
                  />
                </label>

                <label>
                  Preparation time

                  <input
                    type="number"
                    min="1"
                    value={form.time}
                    onChange={(event) =>
                      updateForm(
                        "time",
                        event.target.value
                      )
                    }
                    placeholder="20 minutes"
                  />
                </label>

                <label className="full">
                  Image URL

                  <input
                    value={form.image}
                    onChange={(event) =>
                      updateForm(
                        "image",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                  />
                </label>

                <label className="full">
                  Description

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Describe the dish..."
                    rows="4"
                  />
                </label>

                <label>
                  Tag

                  <input
                    value={form.tag}
                    onChange={(event) =>
                      updateForm(
                        "tag",
                        event.target.value
                      )
                    }
                    placeholder="Chef's Pick"
                  />
                </label>

                <div className="sd-menu-admin-checks">

                  <button
                    type="button"
                    className={
                      form.available
                        ? "check active"
                        : "check"
                    }
                    onClick={() =>
                      updateForm(
                        "available",
                        !form.available
                      )
                    }
                  >
                    <span>
                      {form.available && (
                        <Check size={13} />
                      )}
                    </span>

                    Available to customers
                  </button>

                  <button
                    type="button"
                    className={
                      form.featured
                        ? "check active"
                        : "check"
                    }
                    onClick={() =>
                      updateForm(
                        "featured",
                        !form.featured
                      )
                    }
                  >
                    <span>
                      {form.featured && (
                        <Check size={13} />
                      )}
                    </span>

                    Featured dish
                  </button>

                </div>

              </div>

              <div className="sd-menu-admin-modal-footer">

                <button
                  type="button"
                  className="cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save"
                >
                  <Check size={17} />

                  {editingId
                    ? "Save changes"
                    : "Add dish"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className="sd-menu-admin-toast">

          <div>
            <Check size={15} />
          </div>

          {toast}

        </div>
      )}

    </div>
  );
}