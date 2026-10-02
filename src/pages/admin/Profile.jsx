import { useEffect, useState } from "react";

const DEFAULT_PROFILE = {
  name: "Jacob Admin",
  email: "admin@smartdine.com",
  phone: "+91 98765 43210",
  role: "Administrator",
  avatarInitials: "JA",

  twoFactor: false,
  loginAlerts: true,
  sessionTimeout: 30,
};

const readProfile = () => {
  try {
    const raw = localStorage.getItem("smartdine_admin_profile");

    if (!raw) return DEFAULT_PROFILE;

    return {
      ...DEFAULT_PROFILE,
      ...JSON.parse(raw),
    };
  } catch {
    return DEFAULT_PROFILE;
  }
};

export default function Profile() {
  const [profile, setProfile] = useState(readProfile);
  const [saved, setSaved] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    const sync = () => {
      setProfile(readProfile());
    };

    window.addEventListener("storage", sync);
    window.addEventListener(
      "smartdine-admin-profile-updated",
      sync
    );

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(
        "smartdine-admin-profile-updated",
        sync
      );
    };
  }, []);

  const update = (key, value) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const saveProfile = () => {
    localStorage.setItem(
      "smartdine_admin_profile",
      JSON.stringify(profile)
    );

    window.dispatchEvent(
      new Event("smartdine-admin-profile-updated")
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const resetProfile = () => {
    const confirmed = window.confirm(
      "Reset the admin profile to the default demo account?"
    );

    if (!confirmed) return;

    setProfile(DEFAULT_PROFILE);

    localStorage.setItem(
      "smartdine_admin_profile",
      JSON.stringify(DEFAULT_PROFILE)
    );

    window.dispatchEvent(
      new Event("smartdine-admin-profile-updated")
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const updatePasswordField = (key, value) => {
    setPasswordForm((current) => ({
      ...current,
      [key]: value,
    }));

    setPasswordMessage("");
  };

  const changePassword = () => {
    if (
      !passwordForm.current ||
      !passwordForm.next ||
      !passwordForm.confirm
    ) {
      setPasswordMessage(
        "Please complete all password fields."
      );
      return;
    }

    if (passwordForm.next.length < 8) {
      setPasswordMessage(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage(
        "New password and confirmation do not match."
      );
      return;
    }

    setPasswordForm({
      current: "",
      next: "",
      confirm: "",
    });

    setPasswordMessage(
      "Password change request saved for the demo interface. Real password authentication will be connected to the backend."
    );
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
          maxWidth: 1250,
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
              Admin Profile
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#64748b",
                fontSize: 15,
              }}
            >
              Manage your administrator account and security
              preferences.
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
                ✓ Profile saved
              </span>
            )}

            <button
              onClick={resetProfile}
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
              onClick={saveProfile}
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
              "minmax(0,1.2fr) minmax(320px,.8fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <section
              style={{
                background: "rgba(255,255,255,.82)",
                border:
                  "1px solid rgba(255,255,255,.95)",
                borderRadius: 26,
                padding: 26,
                boxShadow:
                  "0 15px 45px rgba(15,23,42,.07)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  marginBottom: 25,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 24,
                    background:
                      "linear-gradient(145deg,#172033,#3a4b6a)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 23,
                    fontWeight: 900,
                    boxShadow:
                      "0 15px 30px rgba(23,32,51,.2)",
                  }}
                >
                  {profile.avatarInitials}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: ".13em",
                      textTransform: "uppercase",
                      color: "#94a3b8",
                    }}
                  >
                    Administrator Account
                  </div>

                  <h2
                    style={{
                      margin: "5px 0 4px",
                      fontSize: 23,
                      letterSpacing: "-.025em",
                    }}
                  >
                    {profile.name}
                  </h2>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: 13,
                    }}
                  >
                    {profile.role}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2,minmax(0,1fr))",
                  gap: 15,
                }}
              >
                <Field
                  label="Full Name"
                  value={profile.name}
                  onChange={(value) =>
                    update("name", value)
                  }
                />

                <Field
                  label="Role"
                  value={profile.role}
                  onChange={(value) =>
                    update("role", value)
                  }
                />

                <Field
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  onChange={(value) =>
                    update("email", value)
                  }
                />

                <Field
                  label="Phone Number"
                  value={profile.phone}
                  onChange={(value) =>
                    update("phone", value)
                  }
                />

                <Field
                  label="Avatar Initials"
                  value={profile.avatarInitials}
                  onChange={(value) =>
                    update(
                      "avatarInitials",
                      value.slice(0, 3).toUpperCase()
                    )
                  }
                />
              </div>
            </section>

            <section
              style={{
                background: "rgba(255,255,255,.82)",
                borderRadius: 26,
                padding: 26,
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
                Authentication
              </div>

              <h2
                style={{
                  margin: "7px 0 5px",
                  fontSize: 21,
                }}
              >
                Change Password
              </h2>

              <p
                style={{
                  margin: "0 0 20px",
                  color: "#64748b",
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                Update the administrator password. Actual
                password hashing and authentication will be
                handled by the backend.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                <PasswordField
                  label="Current Password"
                  value={passwordForm.current}
                  onChange={(value) =>
                    updatePasswordField(
                      "current",
                      value
                    )
                  }
                />

                <PasswordField
                  label="New Password"
                  value={passwordForm.next}
                  onChange={(value) =>
                    updatePasswordField(
                      "next",
                      value
                    )
                  }
                />

                <PasswordField
                  label="Confirm New Password"
                  value={passwordForm.confirm}
                  onChange={(value) =>
                    updatePasswordField(
                      "confirm",
                      value
                    )
                  }
                />

                {passwordMessage && (
                  <div
                    style={{
                      padding: 13,
                      borderRadius: 13,
                      background:
                        passwordMessage.includes(
                          "request saved"
                        )
                          ? "#ecfdf5"
                          : "#fff7ed",
                      color:
                        passwordMessage.includes(
                          "request saved"
                        )
                          ? "#047857"
                          : "#c2410c",
                      fontSize: 12,
                      lineHeight: 1.5,
                      fontWeight: 700,
                    }}
                  >
                    {passwordMessage}
                  </div>
                )}

                <button
                  onClick={changePassword}
                  style={{
                    justifySelf: "start",
                    border: 0,
                    background: "#172033",
                    color: "#fff",
                    padding: "12px 18px",
                    borderRadius: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Update Password
                </button>
              </div>
            </section>
          </div>

          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <section
              style={{
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
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: ".13em",
                  textTransform: "uppercase",
                  opacity: .65,
                }}
              >
                Account Status
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 18,
                }}
              >
                <span
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: "#34d399",
                    boxShadow:
                      "0 0 0 6px rgba(52,211,153,.12)",
                  }}
                />

                <div>
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 16,
                    }}
                  >
                    Active
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      color:
                        "rgba(255,255,255,.62)",
                      fontSize: 12,
                    }}
                  >
                    Administrator account is enabled.
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 25,
                  paddingTop: 18,
                  borderTop:
                    "1px solid rgba(255,255,255,.1)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    opacity: .55,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                  }}
                >
                  Access Level
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontWeight: 900,
                    fontSize: 19,
                  }}
                >
                  Full Administrator
                </div>
              </div>
            </section>

            <section
              style={{
                background: "rgba(255,255,255,.82)",
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
                Security
              </div>

              <h2
                style={{
                  margin: "7px 0 5px",
                  fontSize: 21,
                }}
              >
                Security Preferences
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: 3,
                  marginTop: 17,
                }}
              >
                <Toggle
                  label="Two-Factor Authentication"
                  description="Require an additional verification step during login."
                  checked={profile.twoFactor}
                  onChange={(value) =>
                    update("twoFactor", value)
                  }
                />

                <Toggle
                  label="Login Alerts"
                  description="Receive alerts when a new administrator login occurs."
                  checked={profile.loginAlerts}
                  onChange={(value) =>
                    update("loginAlerts", value)
                  }
                />
              </div>

              <div style={{ marginTop: 18 }}>
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
                    Session Timeout
                  </span>

                  <select
                    value={profile.sessionTimeout}
                    onChange={(e) =>
                      update(
                        "sessionTimeout",
                        Number(e.target.value)
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "12px 13px",
                      borderRadius: 12,
                      border:
                        "1px solid #dbe2ea",
                      background: "#fff",
                      color: "#172033",
                      fontWeight: 700,
                    }}
                  >
                    <option value={15}>
                      15 minutes
                    </option>
                    <option value={30}>
                      30 minutes
                    </option>
                    <option value={60}>
                      1 hour
                    </option>
                    <option value={120}>
                      2 hours
                    </option>
                  </select>
                </label>
              </div>
            </section>

            <section
              style={{
                background: "rgba(255,255,255,.82)",
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
                Session
              </div>

              <h2
                style={{
                  margin: "7px 0 5px",
                  fontSize: 21,
                }}
              >
                Current Session
              </h2>

              <div
                style={{
                  marginTop: 17,
                  display: "grid",
                  gap: 11,
                }}
              >
                <InfoRow
                  label="Session"
                  value="Administrator"
                />

                <InfoRow
                  label="Environment"
                  value="Frontend Demo"
                />

                <InfoRow
                  label="Persistence"
                  value="LocalStorage"
                />

                <InfoRow
                  label="Backend"
                  value="Not connected"
                />
              </div>
            </section>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 18,
            borderRadius: 20,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          <strong>Security note:</strong> password fields on
          this frontend are demonstration UI only. Never store
          real passwords in LocalStorage. Secure authentication,
          password hashing, sessions/JWT and role authorization
          will be implemented in the Java + Spring Boot backend.
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="minmax(0,1.2fr)"] {
            grid-template-columns: 1fr !important;
          }

          div[style*="repeat(2,minmax(0,1fr))"] {
            grid-template-columns: 1fr !important;
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

function PasswordField({
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
        type="password"
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

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 15,
        padding: "10px 0",
        borderBottom: "1px solid #edf0f4",
      }}
    >
      <span
        style={{
          color: "#64748b",
          fontSize: 12,
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