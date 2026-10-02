import { useEffect, useState } from "react";

const DEFAULT_SETTINGS = {
  restaurantName: "SmartDine Restaurant",
  restaurantEmail: "admin@smartdine.com",
  restaurantPhone: "+91 98765 43210",
  address: "Kerala, India",

  currency: "INR",
  taxRate: 5,
  serviceCharge: 0,

  autoAcceptOrders: false,
  allowTableOrdering: true,
  allowWaiterRequests: true,
  allowCustomerFeedback: true,

  kitchenNotifications: true,
  waiterNotifications: true,
  adminNotifications: true,

  orderTimeout: 30,
  preparationBuffer: 10,

  maintenanceMode: false,
};

const readSettings = () => {
  try {
    const raw = localStorage.getItem("smartdine_settings");

    if (!raw) return DEFAULT_SETTINGS;

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(raw),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export default function Settings() {
  const [settings, setSettings] = useState(readSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => {
      setSettings(readSettings());
    };

    window.addEventListener("storage", sync);
    window.addEventListener("smartdine-settings-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("smartdine-settings-updated", sync);
    };
  }, []);

  const update = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      "smartdine_settings",
      JSON.stringify(settings)
    );

    window.dispatchEvent(
      new Event("smartdine-settings-updated")
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const resetSettings = () => {
    const confirmed = window.confirm(
      "Reset all SmartDine settings to their default values?"
    );

    if (!confirmed) return;

    setSettings(DEFAULT_SETTINGS);

    localStorage.setItem(
      "smartdine_settings",
      JSON.stringify(DEFAULT_SETTINGS)
    );

    window.dispatchEvent(
      new Event("smartdine-settings-updated")
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

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
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <header
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
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".16em",
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
                fontSize: "clamp(30px,4vw,46px)",
                letterSpacing: "-.04em",
              }}
            >
              System Settings
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#64748b",
                fontSize: 15,
              }}
            >
              Configure restaurant, ordering, notification and
              system preferences.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            {saved && (
              <span
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "#ecfdf5",
                  color: "#047857",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                ✓ Settings saved
              </span>
            )}

            <button
              onClick={resetSettings}
              style={{
                border: "1px solid #dbe2ea",
                background: "rgba(255,255,255,.8)",
                color: "#475569",
                padding: "12px 17px",
                borderRadius: 14,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Reset
            </button>

            <button
              onClick={saveSettings}
              style={{
                border: 0,
                background: "#172033",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: 14,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow:
                  "0 12px 30px rgba(23,32,51,.18)",
              }}
            >
              Save Changes
            </button>
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2,minmax(0,1fr))",
            gap: 18,
          }}
        >
          <SettingsCard
            eyebrow="Restaurant"
            title="Restaurant Information"
            description="Basic information displayed across the SmartDine system."
          >
            <Field
              label="Restaurant Name"
              value={settings.restaurantName}
              onChange={(value) =>
                update("restaurantName", value)
              }
            />

            <Field
              label="Restaurant Email"
              type="email"
              value={settings.restaurantEmail}
              onChange={(value) =>
                update("restaurantEmail", value)
              }
            />

            <Field
              label="Restaurant Phone"
              value={settings.restaurantPhone}
              onChange={(value) =>
                update("restaurantPhone", value)
              }
            />

            <Field
              label="Address"
              value={settings.address}
              onChange={(value) =>
                update("address", value)
              }
            />
          </SettingsCard>

          <SettingsCard
            eyebrow="Billing"
            title="Tax & Billing"
            description="Configure the values used by SmartDine billing."
          >
            <Field
              label="Currency"
              value={settings.currency}
              onChange={(value) =>
                update("currency", value)
              }
            />

            <NumberField
              label="GST / Tax Rate (%)"
              value={settings.taxRate}
              onChange={(value) =>
                update("taxRate", value)
              }
            />

            <NumberField
              label="Service Charge (%)"
              value={settings.serviceCharge}
              onChange={(value) =>
                update("serviceCharge", value)
              }
            />

            <div
              style={{
                marginTop: 15,
                padding: 14,
                borderRadius: 14,
                background: "#f8fafc",
                color: "#64748b",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              Current billing configuration:
              <strong
                style={{
                  display: "block",
                  color: "#172033",
                  marginTop: 3,
                }}
              >
                {settings.taxRate}% tax ·{" "}
                {settings.serviceCharge}% service charge
              </strong>
            </div>
          </SettingsCard>

          <SettingsCard
            eyebrow="Orders"
            title="Ordering Configuration"
            description="Control how customer orders are handled."
          >
            <Toggle
              label="Allow Table Ordering"
              description="Customers can place orders from their table."
              checked={settings.allowTableOrdering}
              onChange={(value) =>
                update("allowTableOrdering", value)
              }
            />

            <Toggle
              label="Auto Accept Orders"
              description="Automatically accept incoming customer orders."
              checked={settings.autoAcceptOrders}
              onChange={(value) =>
                update("autoAcceptOrders", value)
              }
            />

            <Toggle
              label="Allow Waiter Requests"
              description="Customers can request assistance from the waiter."
              checked={settings.allowWaiterRequests}
              onChange={(value) =>
                update("allowWaiterRequests", value)
              }
            />

            <Toggle
              label="Allow Customer Feedback"
              description="Customers can submit ratings and reviews."
              checked={settings.allowCustomerFeedback}
              onChange={(value) =>
                update("allowCustomerFeedback", value)
              }
            />

            <NumberField
              label="Order Timeout (minutes)"
              value={settings.orderTimeout}
              onChange={(value) =>
                update("orderTimeout", value)
              }
            />

            <NumberField
              label="Preparation Buffer (minutes)"
              value={settings.preparationBuffer}
              onChange={(value) =>
                update("preparationBuffer", value)
              }
            />
          </SettingsCard>

          <SettingsCard
            eyebrow="Notifications"
            title="Notification Preferences"
            description="Choose which operational notifications are enabled."
          >
            <Toggle
              label="Kitchen Notifications"
              description="Notify kitchen staff about incoming orders."
              checked={settings.kitchenNotifications}
              onChange={(value) =>
                update("kitchenNotifications", value)
              }
            />

            <Toggle
              label="Waiter Notifications"
              description="Notify waiters about service requests."
              checked={settings.waiterNotifications}
              onChange={(value) =>
                update("waiterNotifications", value)
              }
            />

            <Toggle
              label="Admin Notifications"
              description="Show important system notifications to admins."
              checked={settings.adminNotifications}
              onChange={(value) =>
                update("adminNotifications", value)
              }
            />
          </SettingsCard>

          <div
            style={{
              gridColumn: "1 / -1",
              background:
                "linear-gradient(145deg,#172033,#26344f)",
              color: "#fff",
              borderRadius: 26,
              padding: 26,
              boxShadow:
                "0 18px 50px rgba(23,32,51,.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    opacity: .65,
                  }}
                >
                  System Control
                </div>

                <h2
                  style={{
                    margin: "8px 0 6px",
                    fontSize: 23,
                  }}
                >
                  Maintenance Mode
                </h2>

                <p
                  style={{
                    margin: 0,
                    maxWidth: 680,
                    color: "rgba(255,255,255,.68)",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  Temporarily place the SmartDine customer
                  experience into maintenance mode. Backend
                  enforcement will be connected during the
                  Spring Boot phase.
                </p>
              </div>

              <button
                onClick={() =>
                  update(
                    "maintenanceMode",
                    !settings.maintenanceMode
                  )
                }
                style={{
                  border: "1px solid rgba(255,255,255,.18)",
                  background: settings.maintenanceMode
                    ? "#fff"
                    : "rgba(255,255,255,.08)",
                  color: settings.maintenanceMode
                    ? "#172033"
                    : "#fff",
                  borderRadius: 16,
                  padding: "13px 19px",
                  fontWeight: 900,
                  cursor: "pointer",
                  minWidth: 145,
                }}
              >
                {settings.maintenanceMode
                  ? "Enabled"
                  : "Disabled"}
              </button>
            </div>
          </div>

          <SettingsCard
            eyebrow="System"
            title="Current Configuration"
            description="Quick overview of the active SmartDine settings."
          >
            <ConfigRow
              label="Restaurant"
              value={settings.restaurantName}
            />

            <ConfigRow
              label="Currency"
              value={settings.currency}
            />

            <ConfigRow
              label="Tax"
              value={`${settings.taxRate}%`}
            />

            <ConfigRow
              label="Table Ordering"
              value={
                settings.allowTableOrdering
                  ? "Enabled"
                  : "Disabled"
              }
            />

            <ConfigRow
              label="Waiter Requests"
              value={
                settings.allowWaiterRequests
                  ? "Enabled"
                  : "Disabled"
              }
            />
          </SettingsCard>

          <SettingsCard
            eyebrow="Architecture"
            title="Backend Status"
            description="Current project architecture status."
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderRadius: 15,
                background: "#f8fafc",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#f59e0b",
                  boxShadow:
                    "0 0 0 5px rgba(245,158,11,.12)",
                }}
              />

              <div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 14,
                  }}
                >
                  Frontend Demo Storage
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: 12,
                    marginTop: 3,
                  }}
                >
                  LocalStorage synchronization is active.
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 15,
                background: "#f8fafc",
                color: "#64748b",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              Java + Spring Boot + MySQL backend integration
              will replace the demo persistence layer in the
              next major phase.
            </div>
          </SettingsCard>
        </div>
      </div>

      <style>{`
        @media (max-width: 850px) {
          div[style*="repeat(2,minmax(0,1fr))"] {
            grid-template-columns: 1fr !important;
          }

          div[style*="gridColumn: \"1 / -1\""] {
            grid-column: auto !important;
          }
        }

        @media (max-width: 600px) {
          body {
            overflow-x: hidden;
          }
        }
      `}</style>
    </div>
  );
}

function SettingsCard({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section
      style={{
        background: "rgba(255,255,255,.82)",
        border: "1px solid rgba(255,255,255,.95)",
        borderRadius: 26,
        padding: 24,
        boxShadow:
          "0 15px 45px rgba(15,23,42,.07)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: ".13em",
          textTransform: "uppercase",
          color: "#94a3b8",
        }}
      >
        {eyebrow}
      </div>

      <h2
        style={{
          margin: "7px 0 5px",
          fontSize: 21,
          letterSpacing: "-.025em",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: "0 0 20px",
          color: "#64748b",
          fontSize: 13,
          lineHeight: 1.55,
        }}
      >
        {description}
      </p>

      <div
        style={{
          display: "grid",
          gap: 14,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: 7,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#475569",
        }}
      >
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px 13px",
          borderRadius: 12,
          border: "1px solid #dbe2ea",
          background: "#fff",
          color: "#172033",
          outline: "none",
        }}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: 7,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#475569",
        }}
      >
        {label}
      </span>

      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px 13px",
          borderRadius: 12,
          border: "1px solid #dbe2ea",
          background: "#fff",
          color: "#172033",
          outline: "none",
        }}
      />
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 15,
        padding: "13px 0",
        borderBottom: "1px solid #edf0f4",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: 3,
            color: "#64748b",
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          {description}
        </div>
      </div>

      <button
        onClick={() => onChange(!checked)}
        aria-label={label}
        style={{
          flexShrink: 0,
          width: 50,
          height: 29,
          border: 0,
          borderRadius: 999,
          padding: 3,
          background: checked ? "#172033" : "#dbe2ea",
          cursor: "pointer",
          transition: "all .2s ease",
        }}
      >
        <span
          style={{
            display: "block",
            width: 23,
            height: 23,
            borderRadius: "50%",
            background: "#fff",
            transform: checked
              ? "translateX(21px)"
              : "translateX(0)",
            transition: "transform .2s ease",
            boxShadow:
              "0 2px 6px rgba(15,23,42,.16)",
          }}
        />
      </button>
    </div>
  );
}

function ConfigRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 15,
        padding: "12px 0",
        borderBottom: "1px solid #edf0f4",
      }}
    >
      <span
        style={{
          color: "#64748b",
          fontSize: 13,
        }}
      >
        {label}
      </span>

      <strong
        style={{
          fontSize: 13,
          textAlign: "right",
        }}
      >
        {value}
      </strong>
    </div>
  );
}