import { NavLink, Outlet, useNavigate } from "react-router-dom";

const NAVIGATION = [
  {
    label: "Overview",
    items: [
      {
        path: "/admin",
        label: "Dashboard",
        icon: "⌂",
        end: true,
      },
      {
        path: "/admin/analytics",
        label: "Analytics",
        icon: "◈",
      },
      {
        path: "/admin/reports",
        label: "Reports",
        icon: "▤",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        path: "/admin/orders",
        label: "Orders",
        icon: "◉",
      },
      {
        path: "/admin/tables",
        label: "Tables",
        icon: "▦",
      },
      {
        path: "/admin/inventory",
        label: "Inventory",
        icon: "◇",
      },
      {
        path: "/admin/menu",
        label: "Menu",
        icon: "☷",
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        path: "/admin/users",
        label: "Users & Staff",
        icon: "◎",
      },
      {
        path: "/admin/offers",
        label: "Offers & Coupons",
        icon: "◇",
      },
      {
        path: "/admin/reviews",
        label: "Reviews",
        icon: "☆",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        path: "/admin/settings",
        label: "Settings",
        icon: "⚙",
      },
      {
        path: "/admin/profile",
        label: "Admin Profile",
        icon: "●",
      },
    ],
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave the admin panel?"
    );

    if (!confirmed) return;

    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#f8fafc 0%,#eef2f7 48%,#e8edf4 100%)",
        color: "#172033",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "270px minmax(0,1fr)",
          minHeight: "100vh",
        }}
      >
        <aside
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            boxSizing: "border-box",
            padding: 18,
            background:
              "rgba(255,255,255,.72)",
            borderRight:
              "1px solid rgba(148,163,184,.18)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "10px 10px 20px",
              borderBottom:
                "1px solid rgba(148,163,184,.15)",
              marginBottom: 17,
            }}
          >
            <button
              onClick={() => navigate("/admin")}
              style={{
                border: 0,
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                color: "#172033",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background:
                      "linear-gradient(145deg,#172033,#40516f)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    fontSize: 15,
                    boxShadow:
                      "0 10px 25px rgba(23,32,51,.18)",
                  }}
                >
                  SD
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 16,
                      letterSpacing: "-.02em",
                    }}
                  >
                    SmartDine
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: 11,
                      marginTop: 2,
                      fontWeight: 700,
                    }}
                  >
                    ADMIN CONSOLE
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gap: 20,
            }}
          >
            {NAVIGATION.map((section) => (
              <div key={section.label}>
                <div
                  style={{
                    padding: "0 10px 8px",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                  }}
                >
                  {section.label}
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 4,
                  }}
                >
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      style={({ isActive }) => ({
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        padding: "10px 11px",
                        borderRadius: 13,
                        textDecoration: "none",
                        color: isActive
                          ? "#172033"
                          : "#64748b",
                        background: isActive
                          ? "rgba(23,32,51,.08)"
                          : "transparent",
                        fontWeight: isActive
                          ? 900
                          : 700,
                        fontSize: 13,
                        transition:
                          "all .18s ease",
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            style={{
                              width: 27,
                              height: 27,
                              borderRadius: 9,
                              display: "grid",
                              placeItems: "center",
                              background: isActive
                                ? "#172033"
                                : "rgba(148,163,184,.12)",
                              color: isActive
                                ? "#fff"
                                : "#64748b",
                              fontSize: 13,
                              flexShrink: 0,
                            }}
                          >
                            {item.icon}
                          </span>

                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop:
                "1px solid rgba(148,163,184,.15)",
            }}
          >
            <div
              style={{
                padding: 12,
                borderRadius: 17,
                background:
                  "linear-gradient(145deg,#172033,#2c3a55)",
                color: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 12,
                    background:
                      "rgba(255,255,255,.12)",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  JA
                </div>

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 12,
                    }}
                  >
                    Jacob Admin
                  </div>

                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 10,
                      opacity: .6,
                    }}
                  >
                    Administrator
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "9px 10px",
                  borderRadius: 11,
                  border:
                    "1px solid rgba(255,255,255,.12)",
                  background:
                    "rgba(255,255,255,.07)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: 11,
                }}
              >
                Exit Admin
              </button>
            </div>
          </div>
        </aside>

        <main
          style={{
            minWidth: 0,
            minHeight: "100vh",
          }}
        >
          <div
            style={{
              minHeight: "100vh",
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: \"270px minmax(0,1fr)\""] {
            grid-template-columns: 1fr !important;
          }

          aside {
            position: relative !important;
            height: auto !important;
            max-height: none !important;
            border-right: 0 !important;
            border-bottom: 1px solid rgba(148,163,184,.18);
          }

          aside > div:nth-child(2) {
            display: flex !important;
            gap: 18px !important;
            overflow-x: auto !important;
            padding-bottom: 4px !important;
          }

          aside > div:nth-child(2) > div {
            min-width: max-content !important;
          }

          aside > div:nth-child(2) > div > div:nth-child(2) {
            display: flex !important;
            gap: 4px !important;
          }

          aside > div:nth-child(2) > div > div:nth-child(2) a {
            white-space: nowrap !important;
          }
        }

        @media (max-width: 600px) {
          aside {
            padding: 12px !important;
          }

          main > div > div {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }
        }
      `}</style>
    </div>
  );
}