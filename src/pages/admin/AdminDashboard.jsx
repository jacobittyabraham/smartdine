import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    label: "Today's Revenue",
    value: "₹24,680",
    change: "+12.8%",
    icon: CircleDollarSign,
  },
  {
    label: "Orders Today",
    value: "186",
    change: "+8.4%",
    icon: ClipboardList,
  },
  {
    label: "Active Customers",
    value: "74",
    change: "+5.2%",
    icon: Users,
  },
  {
    label: "Menu Items",
    value: "42",
    change: "6 featured",
    icon: UtensilsCrossed,
  },
];

const quickActions = [
  {
    title: "Manage Users",
    description: "Customers and staff accounts",
    icon: Users,
    path: "/admin/users",
  },
  {
    title: "Manage Menu",
    description: "Food items and availability",
    icon: UtensilsCrossed,
    path: "/admin/menu",
  },
  {
    title: "View Orders",
    description: "Monitor restaurant orders",
    icon: ShoppingBag,
    path: "/admin/orders",
  },
  {
    title: "Inventory",
    description: "Stock and low-stock alerts",
    icon: Boxes,
    path: "/admin/inventory",
  },
];

const activity = [
  {
    title: "New order received",
    detail: "Table 14 · Order #SD-4821",
    time: "2 min ago",
  },
  {
    title: "Menu item updated",
    detail: "Classic Chicken Biriyani",
    time: "11 min ago",
  },
  {
    title: "Low stock alert",
    detail: "Chicken · 8 portions remaining",
    time: "18 min ago",
  },
  {
    title: "New staff account",
    detail: "Waiter account created",
    time: "31 min ago",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const sidebarItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      label: "Users & Staff",
      icon: Users,
      path: "/admin/users",
    },
    {
      label: "Orders",
      icon: ClipboardList,
      path: "/admin/orders",
    },
    {
      label: "Menu",
      icon: UtensilsCrossed,
      path: "/admin/menu",
    },
    {
      label: "Tables",
      icon: ShoppingBag,
      path: "/admin/tables",
    },
    {
      label: "Inventory",
      icon: Boxes,
      path: "/admin/inventory",
    },
    {
      label: "Analytics",
      icon: Activity,
      path: "/admin/analytics",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 15% 10%, rgba(255,255,255,.95), transparent 30%), linear-gradient(135deg, #f7f3ed 0%, #eee9e1 48%, #e7e0d7 100%)",
        color: "#171717",
        display: "flex",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 250,
          minHeight: "100vh",
          padding: 24,
          borderRight: "1px solid rgba(0,0,0,.08)",
          background: "rgba(255,255,255,.52)",
          backdropFilter: "blur(24px)",
          position: "sticky",
          top: 0,
          alignSelf: "flex-start",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 34,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              background: "#171717",
              color: "#fff",
            }}
          >
            <UtensilsCrossed size={20} />
          </div>

          <div>
            <strong style={{ fontSize: 17 }}>SmartDine</strong>
            <div
              style={{
                fontSize: 11,
                opacity: 0.52,
                letterSpacing: ".14em",
                textTransform: "uppercase",
              }}
            >
              Admin
            </div>
          </div>
        </div>

        <nav style={{ display: "grid", gap: 7 }}>
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 14,
                  background:
                    index === 0
                      ? "rgba(23,23,23,.08)"
                      : "transparent",
                  color: "#171717",
                  textAlign: "left",
                  fontSize: 14,
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => navigate("/login")}
          style={{
            marginTop: 30,
            width: "100%",
            border: "1px solid rgba(0,0,0,.08)",
            background: "rgba(255,255,255,.6)",
            borderRadius: 14,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <LogOut size={17} />
          Sign out
        </button>
      </aside>

      {/* Main */}
      <main
        style={{
          flex: 1,
          padding: "34px clamp(20px, 4vw, 52px)",
          maxWidth: 1500,
        }}
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            marginBottom: 34,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                opacity: 0.48,
                marginBottom: 8,
              }}
            >
              Administration
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(30px, 4vw, 48px)",
                letterSpacing: "-.045em",
              }}
            >
              Good evening, Admin.
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                opacity: 0.58,
                fontSize: 15,
              }}
            >
              Here's what's happening across SmartDine today.
            </p>
          </div>

          <button
            style={{
              width: 46,
              height: 46,
              borderRadius: 15,
              border: "1px solid rgba(0,0,0,.08)",
              background: "rgba(255,255,255,.65)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Bell size={19} />
          </button>
        </motion.header>

        {/* Stats */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                style={{
                  padding: 22,
                  borderRadius: 24,
                  border: "1px solid rgba(0,0,0,.07)",
                  background: "rgba(255,255,255,.62)",
                  backdropFilter: "blur(18px)",
                  boxShadow: "0 18px 50px rgba(0,0,0,.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 13, opacity: 0.52 }}>
                    {stat.label}
                  </span>

                  <Icon size={19} style={{ opacity: 0.55 }} />
                </div>

                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    marginTop: 18,
                    letterSpacing: "-.04em",
                  }}
                >
                  {stat.value}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    opacity: 0.58,
                  }}
                >
                  {stat.change}
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Main grid */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.45fr) minmax(300px, .8fr)",
            gap: 20,
          }}
        >
          {/* Quick actions */}
          <div
            style={{
              padding: 26,
              borderRadius: 28,
              border: "1px solid rgba(0,0,0,.07)",
              background: "rgba(255,255,255,.58)",
              backdropFilter: "blur(18px)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    letterSpacing: "-.025em",
                  }}
                >
                  Quick Management
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 13,
                    opacity: 0.5,
                  }}
                >
                  Frequently used administration tools
                </p>
              </div>

              <Menu size={20} style={{ opacity: 0.4 }} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 12,
              }}
            >
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.title}
                    onClick={() => navigate(action.path)}
                    style={{
                      border: "1px solid rgba(0,0,0,.07)",
                      background: "rgba(255,255,255,.55)",
                      borderRadius: 20,
                      padding: 18,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <Icon size={20} />

                    <div
                      style={{
                        marginTop: 18,
                        fontWeight: 650,
                      }}
                    >
                      {action.title}
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        opacity: 0.52,
                      }}
                    >
                      {action.description}
                    </div>

                    <ChevronRight
                      size={17}
                      style={{
                        marginTop: 16,
                        opacity: 0.45,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity */}
          <div
            style={{
              padding: 26,
              borderRadius: 28,
              border: "1px solid rgba(0,0,0,.07)",
              background: "rgba(255,255,255,.58)",
              backdropFilter: "blur(18px)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                  }}
                >
                  Recent Activity
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 13,
                    opacity: 0.5,
                  }}
                >
                  Latest system events
                </p>
              </div>

              <ArrowUpRight size={19} style={{ opacity: 0.4 }} />
            </div>

            <div style={{ display: "grid", gap: 17 }}>
              {activity.map((item) => (
                <div
                  key={`${item.title}-${item.time}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "10px 1fr",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      marginTop: 5,
                      borderRadius: "50%",
                      background: "#171717",
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 650,
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.5,
                        marginTop: 3,
                      }}
                    >
                      {item.detail}
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        opacity: 0.38,
                        marginTop: 4,
                      }}
                    >
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}