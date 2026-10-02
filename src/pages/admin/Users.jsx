import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Mail,
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserPlus,
  Users as UsersIcon,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DEFAULT_USERS = [
  {
    id: 1,
    name: "Jacob",
    email: "jacob@smartdine.demo",
    role: "Admin",
    status: "Active",
    joined: "02 Oct 2026",
  },
  {
    id: 2,
    name: "Leyon",
    email: "leyon@smartdine.demo",
    role: "Staff",
    status: "Active",
    joined: "02 Oct 2026",
  },
  {
    id: 3,
    name: "Krishnakumar",
    email: "krishna@smartdine.demo",
    role: "Staff",
    status: "Active",
    joined: "02 Oct 2026",
  },
  {
    id: 4,
    name: "Brahma",
    email: "brahma@smartdine.demo",
    role: "Staff",
    status: "Active",
    joined: "02 Oct 2026",
  },
  {
    id: 5,
    name: "SmartDine Guest",
    email: "guest@smartdine.demo",
    role: "Customer",
    status: "Active",
    joined: "02 Oct 2026",
  },
];

function readUsers() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("smartdine_users")
    );

    return Array.isArray(saved) ? saved : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

export default function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState(readUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Staff",
  });

  function saveUsers(updated) {
    setUsers(updated);

    localStorage.setItem(
      "smartdine_users",
      JSON.stringify(updated)
    );
  }

  function addUser(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      return;
    }

    const newUser = {
      id: Date.now(),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: "Active",
      joined: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    saveUsers([...users, newUser]);

    setForm({
      name: "",
      email: "",
      role: "Staff",
    });

    setShowModal(false);
  }

  function toggleStatus(id) {
    const updated = users.map((user) =>
      user.id === id
        ? {
            ...user,
            status:
              user.status === "Active"
                ? "Inactive"
                : "Active",
          }
        : user
    );

    saveUsers(updated);
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "All" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const customerCount = users.filter(
    (user) => user.role === "Customer"
  ).length;

  const staffCount = users.filter(
    (user) => user.role === "Staff"
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "Admin"
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f7f3ed, #e8e1d8)",
        color: "#171717",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "28px clamp(18px, 4vw, 52px)",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          marginBottom: 28,
        }}
      >
        <div>
          <button
            onClick={() => navigate("/admin")}
            style={{
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: 0,
              marginBottom: 16,
              cursor: "pointer",
              opacity: 0.55,
            }}
          >
            <ArrowLeft size={17} />
            Admin Dashboard
          </button>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(30px, 4vw, 46px)",
              letterSpacing: "-.045em",
            }}
          >
            Users & Staff
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              opacity: 0.55,
            }}
          >
            Manage customer, staff and administrator accounts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            border: "none",
            background: "#171717",
            color: "#fff",
            borderRadius: 15,
            padding: "13px 18px",
            display: "flex",
            alignItems: "center",
            gap: 9,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <UserPlus size={18} />
          Add User
        </button>
      </header>

      {/* Stats */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        {[
          ["Total Users", users.length, UsersIcon],
          ["Customers", customerCount, UsersIcon],
          ["Staff", staffCount, UtensilsCrossed],
          ["Admins", adminCount, ShieldCheck],
        ].map(([label, value, Icon]) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,.62)",
              border: "1px solid rgba(0,0,0,.07)",
              borderRadius: 22,
              padding: 20,
              backdropFilter: "blur(18px)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  opacity: 0.52,
                }}
              >
                {label}
              </span>

              <Icon size={18} style={{ opacity: 0.45 }} />
            </div>

            <strong
              style={{
                display: "block",
                marginTop: 15,
                fontSize: 29,
              }}
            >
              {value}
            </strong>
          </div>
        ))}
      </section>

      {/* Controls */}
      <section
        style={{
          background: "rgba(255,255,255,.58)",
          border: "1px solid rgba(0,0,0,.07)",
          borderRadius: 24,
          padding: 18,
          marginBottom: 16,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 240,
            position: "relative",
          }}
        >
          <Search
            size={17}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.4,
            }}
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search name or email..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid rgba(0,0,0,.08)",
              background: "rgba(255,255,255,.65)",
              borderRadius: 14,
              padding: "12px 14px 12px 42px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ position: "relative" }}>
          <ChevronDown
            size={15}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              opacity: 0.5,
            }}
          />

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            style={{
              appearance: "none",
              border: "1px solid rgba(0,0,0,.08)",
              background: "rgba(255,255,255,.65)",
              borderRadius: 14,
              padding: "12px 38px 12px 14px",
              outline: "none",
              minWidth: 150,
            }}
          >
            <option>All</option>
            <option>Customer</option>
            <option>Staff</option>
            <option>Admin</option>
          </select>
        </div>
      </section>

      {/* User table */}
      <section
        style={{
          background: "rgba(255,255,255,.62)",
          border: "1px solid rgba(0,0,0,.07)",
          borderRadius: 26,
          overflow: "hidden",
          backdropFilter: "blur(18px)",
        }}
      >
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid rgba(0,0,0,.07)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <strong>Accounts</strong>

          <span
            style={{
              fontSize: 12,
              opacity: 0.48,
            }}
          >
            {filteredUsers.length} displayed
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 760,
            }}
          >
            <thead>
              <tr>
                {[
                  "User",
                  "Role",
                  "Status",
                  "Joined",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "14px 20px",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                      opacity: 0.45,
                      fontWeight: 600,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderTop:
                      "1px solid rgba(0,0,0,.06)",
                  }}
                >
                  <td style={{ padding: "17px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 13,
                          display: "grid",
                          placeItems: "center",
                          background:
                            "rgba(0,0,0,.06)",
                          fontWeight: 700,
                        }}
                      >
                        {user.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong
                          style={{
                            display: "block",
                            fontSize: 14,
                          }}
                        >
                          {user.name}
                        </strong>

                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginTop: 3,
                            fontSize: 12,
                            opacity: 0.48,
                          }}
                        >
                          <Mail size={12} />
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "17px 20px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 10px",
                        borderRadius: 999,
                        background:
                          user.role === "Admin"
                            ? "rgba(0,0,0,.09)"
                            : "rgba(255,255,255,.7)",
                        fontSize: 12,
                      }}
                    >
                      {user.role === "Admin" && (
                        <ShieldCheck size={13} />
                      )}

                      {user.role}
                    </span>
                  </td>

                  <td style={{ padding: "17px 20px" }}>
                    <button
                      onClick={() =>
                        toggleStatus(user.id)
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        padding: 0,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            user.status === "Active"
                              ? "#222"
                              : "#aaa",
                        }}
                      />

                      <span
                        style={{
                          fontSize: 12,
                          opacity: 0.65,
                        }}
                      >
                        {user.status}
                      </span>
                    </button>
                  </td>

                  <td
                    style={{
                      padding: "17px 20px",
                      fontSize: 12,
                      opacity: 0.55,
                    }}
                  >
                    {user.joined}
                  </td>

                  <td style={{ padding: "17px 20px" }}>
                    <button
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        border:
                          "1px solid rgba(0,0,0,.07)",
                        background:
                          "rgba(255,255,255,.6)",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div
            style={{
              padding: 50,
              textAlign: "center",
              opacity: 0.5,
            }}
          >
            No users found.
          </div>
        )}
      </section>

      {/* Add User Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,.35)",
            backdropFilter: "blur(10px)",
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <form
            onSubmit={addUser}
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "min(480px, 100%)",
              background: "#f8f5ef",
              borderRadius: 28,
              padding: 28,
              boxShadow:
                "0 30px 90px rgba(0,0,0,.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 23,
                  }}
                >
                  Add User
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    opacity: 0.5,
                    fontSize: 13,
                  }}
                >
                  Create a new SmartDine account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: 14,
              }}
            >
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
                placeholder="Full name"
                style={{
                  border:
                    "1px solid rgba(0,0,0,.1)",
                  borderRadius: 14,
                  padding: 14,
                  background: "#fff",
                  outline: "none",
                }}
              />

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email: event.target.value,
                  })
                }
                placeholder="Email address"
                style={{
                  border:
                    "1px solid rgba(0,0,0,.1)",
                  borderRadius: 14,
                  padding: 14,
                  background: "#fff",
                  outline: "none",
                }}
              />

              <select
                value={form.role}
                onChange={(event) =>
                  setForm({
                    ...form,
                    role: event.target.value,
                  })
                }
                style={{
                  border:
                    "1px solid rgba(0,0,0,.1)",
                  borderRadius: 14,
                  padding: 14,
                  background: "#fff",
                  outline: "none",
                }}
              >
                <option>Staff</option>
                <option>Customer</option>
                <option>Admin</option>
              </select>

              <button
                type="submit"
                style={{
                  border: "none",
                  borderRadius: 15,
                  padding: 14,
                  background: "#171717",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 650,
                }}
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}