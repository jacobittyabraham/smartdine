import { useEffect, useMemo, useState } from "react";

const DEFAULT_OFFERS = [
  {
    id: "OFF-001",
    code: "WELCOME10",
    title: "Welcome Offer",
    description: "10% off for new customers.",
    type: "Percentage",
    value: 10,
    minimumOrder: 300,
    maximumDiscount: 100,
    usageLimit: 100,
    usedCount: 18,
    expiry: "2026-12-31",
    active: true,
  },
  {
    id: "OFF-002",
    code: "SMART50",
    title: "SmartDine Special",
    description: "Flat ₹50 discount on eligible orders.",
    type: "Fixed",
    value: 50,
    minimumOrder: 500,
    maximumDiscount: 50,
    usageLimit: 75,
    usedCount: 24,
    expiry: "2026-11-30",
    active: true,
  },
  {
    id: "OFF-003",
    code: "FESTIVE15",
    title: "Festive Dining",
    description: "15% discount during the festive period.",
    type: "Percentage",
    value: 15,
    minimumOrder: 700,
    maximumDiscount: 200,
    usageLimit: 50,
    usedCount: 50,
    expiry: "2026-10-31",
    active: false,
  },
];

const emptyForm = {
  code: "",
  title: "",
  description: "",
  type: "Percentage",
  value: "",
  minimumOrder: "",
  maximumDiscount: "",
  usageLimit: "",
  expiry: "",
  active: true,
};

function readOffers() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("smartdine_offers")
    );

    if (Array.isArray(saved) && saved.length) {
      return saved;
    }

    return DEFAULT_OFFERS;
  } catch {
    return DEFAULT_OFFERS;
  }
}

function isExpired(expiry) {
  if (!expiry) return false;

  const end = new Date(`${expiry}T23:59:59`);

  return end < new Date();
}

function getOfferStatus(offer) {
  if (!offer?.active) {
    return "Disabled";
  }

  if (isExpired(offer?.expiry)) {
    return "Expired";
  }

  if (
    Number(offer?.usageLimit || 0) > 0 &&
    Number(offer?.usedCount || 0) >=
      Number(offer?.usageLimit || 0)
  ) {
    return "Limit Reached";
  }

  return "Active";
}

function getStatusStyle(status) {
  if (status === "Active") {
    return {
      background: "rgba(16,185,129,0.12)",
      color: "#047857",
    };
  }

  if (status === "Expired") {
    return {
      background: "rgba(239,68,68,0.12)",
      color: "#b91c1c",
    };
  }

  if (status === "Limit Reached") {
    return {
      background: "rgba(245,158,11,0.14)",
      color: "#b45309",
    };
  }

  return {
    background: "rgba(100,116,139,0.12)",
    color: "#475569",
  };
}

function formatDiscount(offer) {
  if (offer?.type === "Percentage") {
    return `${offer?.value || 0}%`;
  }

  return `₹${Number(
    offer?.value || 0
  ).toLocaleString("en-IN")}`;
}

export default function Offers() {
  const [offers, setOffers] = useState(readOffers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] =
    useState(null);
  const [form, setForm] = useState(emptyForm);

  const refreshOffers = () => {
    setOffers(readOffers());
  };

  useEffect(() => {
    window.addEventListener(
      "smartdine-offers-updated",
      refreshOffers
    );

    window.addEventListener(
      "storage",
      refreshOffers
    );

    return () => {
      window.removeEventListener(
        "smartdine-offers-updated",
        refreshOffers
      );

      window.removeEventListener(
        "storage",
        refreshOffers
      );
    };
  }, []);

  const saveOffers = (updatedOffers) => {
    setOffers(updatedOffers);

    localStorage.setItem(
      "smartdine_offers",
      JSON.stringify(updatedOffers)
    );

    window.dispatchEvent(
      new CustomEvent(
        "smartdine-offers-updated"
      )
    );
  };

  const stats = useMemo(() => {
    return {
      total: offers.length,

      active: offers.filter(
        (offer) =>
          getOfferStatus(offer) === "Active"
      ).length,

      expired: offers.filter(
        (offer) =>
          getOfferStatus(offer) === "Expired"
      ).length,

      usage: offers.reduce(
        (sum, offer) =>
          sum + Number(offer?.usedCount || 0),
        0
      ),
    };
  }, [offers]);

  const filteredOffers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return offers.filter((offer) => {
      const status =
        getOfferStatus(offer);

      const matchesSearch =
        !query ||
        offer?.code
          ?.toLowerCase()
          .includes(query) ||
        offer?.title
          ?.toLowerCase()
          .includes(query) ||
        offer?.description
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        offer?.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    offers,
    search,
    statusFilter,
    typeFilter,
  ]);

  const openAdd = () => {
    setEditingOffer(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (offer) => {
    setEditingOffer(offer);

    setForm({
      code: offer?.code || "",
      title: offer?.title || "",
      description:
        offer?.description || "",
      type:
        offer?.type || "Percentage",
      value:
        offer?.value !== undefined
          ? String(offer.value)
          : "",
      minimumOrder:
        offer?.minimumOrder !== undefined
          ? String(offer.minimumOrder)
          : "",
      maximumDiscount:
        offer?.maximumDiscount !== undefined
          ? String(offer.maximumDiscount)
          : "",
      usageLimit:
        offer?.usageLimit !== undefined
          ? String(offer.usageLimit)
          : "",
      expiry: offer?.expiry || "",
      active: offer?.active !== false,
    });

    setShowModal(true);
  };

  const submitOffer = (event) => {
    event.preventDefault();

    const code = form.code
      .trim()
      .toUpperCase();

    if (!code) {
      alert("Please enter a coupon code.");
      return;
    }

    if (!form.title.trim()) {
      alert("Please enter an offer title.");
      return;
    }

    if (
      form.value === "" ||
      Number(form.value) <= 0
    ) {
      alert("Please enter a valid discount value.");
      return;
    }

    if (
      form.type === "Percentage" &&
      Number(form.value) > 100
    ) {
      alert(
        "Percentage discount cannot exceed 100%."
      );
      return;
    }

    if (
      form.minimumOrder === "" ||
      Number(form.minimumOrder) < 0
    ) {
      alert(
        "Please enter a valid minimum order amount."
      );
      return;
    }

    if (!form.expiry) {
      alert("Please select an expiry date.");
      return;
    }

    const duplicateCode = offers.some(
      (offer) =>
        offer?.code?.toUpperCase() === code &&
        offer?.id !== editingOffer?.id
    );

    if (duplicateCode) {
      alert(
        "A coupon with this code already exists."
      );
      return;
    }

    const offerData = {
      code,
      title: form.title.trim(),
      description:
        form.description.trim(),
      type: form.type,
      value: Number(form.value),
      minimumOrder: Number(
        form.minimumOrder
      ),
      maximumDiscount:
        form.maximumDiscount === ""
          ? Number(form.value)
          : Number(form.maximumDiscount),
      usageLimit:
        form.usageLimit === ""
          ? 0
          : Number(form.usageLimit),
      expiry: form.expiry,
      active: form.active,
    };

    if (editingOffer) {
      const updated = offers.map(
        (offer) =>
          offer?.id === editingOffer?.id
            ? {
                ...offer,
                ...offerData,
              }
            : offer
      );

      saveOffers(updated);
    } else {
      const newOffer = {
        id: `OFF-${Date.now()}`,
        ...offerData,
        usedCount: 0,
      };

      saveOffers([
        ...offers,
        newOffer,
      ]);
    }

    setShowModal(false);
    setEditingOffer(null);
    setForm(emptyForm);
  };

  const toggleOffer = (id) => {
    const updated = offers.map(
      (offer) =>
        offer?.id === id
          ? {
              ...offer,
              active: !offer.active,
            }
          : offer
    );

    saveOffers(updated);
  };

  const deleteOffer = (id) => {
    const offer = offers.find(
      (entry) => entry?.id === id
    );

    if (!offer) return;

    const confirmed = window.confirm(
      `Delete coupon "${offer.code}"?`
    );

    if (!confirmed) return;

    saveOffers(
      offers.filter(
        (entry) => entry?.id !== id
      )
    );
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      alert(
        `Coupon ${code} copied to clipboard.`
      );
    } catch {
      alert(`Coupon code: ${code}`);
    }
  };

  const resetOffers = () => {
    const confirmed = window.confirm(
      "Reset offers and coupons to the SmartDine defaults?"
    );

    if (!confirmed) return;

    saveOffers(DEFAULT_OFFERS);
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
                fontSize:
                  "clamp(30px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
              }}
            >
              Offers & Coupons
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#64748b",
                fontSize: 15,
              }}
            >
              Create and manage promotional campaigns.
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
              onClick={resetOffers}
              style={secondaryButton}
            >
              Reset Offers
            </button>

            <button
              onClick={openAdd}
              style={primaryButton}
            >
              + Create Coupon
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
            ["Total Coupons", stats.total],
            ["Active", stats.active],
            ["Expired", stats.expired],
            ["Total Uses", stats.usage],
          ].map(([label, value]) => (
            <div
              key={label}
              style={statCard}
            >
              <div style={statLabel}>
                {label}
              </div>

              <div style={statValue}>
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
            placeholder="Search coupon or offer..."
            style={{
              flex: "1 1 300px",
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
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            style={selectStyle}
          >
            <option value="All">
              All Statuses
            </option>
            <option value="Active">
              Active
            </option>
            <option value="Disabled">
              Disabled
            </option>
            <option value="Expired">
              Expired
            </option>
            <option value="Limit Reached">
              Limit Reached
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
            style={selectStyle}
          >
            <option value="All">
              All Types
            </option>
            <option value="Percentage">
              Percentage
            </option>
            <option value="Fixed">
              Fixed ₹
            </option>
          </select>
        </div>

        {/* Coupon Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(330px, 1fr))",
            gap: 18,
          }}
        >
          {filteredOffers.map((offer) => {
            const status =
              getOfferStatus(offer);

            const statusStyle =
              getStatusStyle(status);

            const usageLimit = Number(
              offer?.usageLimit || 0
            );

            const usedCount = Number(
              offer?.usedCount || 0
            );

            const usagePercentage =
              usageLimit > 0
                ? Math.min(
                    100,
                    Math.round(
                      (usedCount /
                        usageLimit) *
                        100
                    )
                  )
                : 0;

            return (
              <div
                key={offer?.id}
                style={{
                  position: "relative",
                  padding: 22,
                  borderRadius: 24,
                  background:
                    "rgba(255,255,255,0.78)",
                  backdropFilter:
                    "blur(18px)",
                  border:
                    "1px solid rgba(255,255,255,0.9)",
                  boxShadow:
                    "0 18px 55px rgba(15,23,42,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: 15,
                    alignItems:
                      "flex-start",
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: 7,
                        padding:
                          "7px 10px",
                        borderRadius: 10,
                        background:
                          "#0f172a",
                        color:
                          "#fff",
                        fontSize:
                          12,
                        fontWeight:
                          900,
                        letterSpacing:
                          "0.06em",
                      }}
                    >
                      {offer?.code}
                    </div>

                    <h3
                      style={{
                        margin:
                          "13px 0 0",
                        fontSize:
                          20,
                        letterSpacing:
                          "-0.025em",
                      }}
                    >
                      {offer?.title}
                    </h3>
                  </div>

                  <span
                    style={{
                      padding:
                        "7px 10px",
                      borderRadius:
                        999,
                      background:
                        statusStyle.background,
                      color:
                        statusStyle.color,
                      fontSize:
                        10,
                      fontWeight:
                        900,
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {status}
                  </span>
                </div>

                <p
                  style={{
                    minHeight: 42,
                    margin:
                      "0 0 18px",
                    color:
                      "#64748b",
                    fontSize:
                      13,
                    lineHeight:
                      1.55,
                  }}
                >
                  {offer?.description ||
                    "No description provided."}
                </p>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 10,
                    marginBottom:
                      16,
                  }}
                >
                  <div
                    style={infoBox}
                  >
                    <div
                      style={infoLabel}
                    >
                      Discount
                    </div>

                    <strong
                      style={{
                        fontSize: 19,
                      }}
                    >
                      {formatDiscount(
                        offer
                      )}
                    </strong>
                  </div>

                  <div
                    style={infoBox}
                  >
                    <div
                      style={infoLabel}
                    >
                      Min Order
                    </div>

                    <strong>
                      ₹
                      {Number(
                        offer?.minimumOrder ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div
                    style={infoBox}
                  >
                    <div
                      style={infoLabel}
                    >
                      Max Discount
                    </div>

                    <strong>
                      ₹
                      {Number(
                        offer?.maximumDiscount ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div
                    style={infoBox}
                  >
                    <div
                      style={infoLabel}
                    >
                      Expires
                    </div>

                    <strong>
                      {offer?.expiry ||
                        "—"}
                    </strong>
                  </div>
                </div>

                {usageLimit > 0 && (
                  <div
                    style={{
                      marginBottom:
                        17,
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        marginBottom:
                          7,
                        fontSize:
                          11,
                        color:
                          "#64748b",
                        fontWeight:
                          700,
                      }}
                    >
                      <span>
                        Usage
                      </span>

                      <span>
                        {usedCount} /{" "}
                        {usageLimit}
                      </span>
                    </div>

                    <div
                      style={{
                        height: 7,
                        borderRadius:
                          999,
                        background:
                          "#f1f5f9",
                        overflow:
                          "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${usagePercentage}%`,
                          height:
                            "100%",
                          borderRadius:
                            999,
                          background:
                            "#0f172a",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <button
                    onClick={() =>
                      copyCode(
                        offer.code
                      )
                    }
                    style={smallButton}
                  >
                    Copy Code
                  </button>

                  <button
                    onClick={() =>
                      openEdit(offer)
                    }
                    style={smallButton}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      toggleOffer(
                        offer.id
                      )
                    }
                    style={{
                      ...smallButton,
                      background:
                        offer?.active
                          ? "#fff7ed"
                          : "#ecfdf5",
                      color:
                        offer?.active
                          ? "#c2410c"
                          : "#047857",
                    }}
                  >
                    {offer?.active
                      ? "Disable"
                      : "Enable"}
                  </button>

                  <button
                    onClick={() =>
                      deleteOffer(
                        offer.id
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
              </div>
            );
          })}
        </div>

        {!filteredOffers.length && (
          <div
            style={{
              padding: 50,
              textAlign: "center",
              color: "#64748b",
              background:
                "rgba(255,255,255,0.72)",
              borderRadius: 24,
            }}
          >
            No offers match the current filters.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          onClick={() =>
            setShowModal(false)
          }
          style={overlayStyle}
        >
          <form
            onSubmit={submitOffer}
            onClick={(event) =>
              event.stopPropagation()
            }
            style={modalStyle}
          >
            <div style={modalHeader}>
              <div>
                <div style={eyebrowStyle}>
                  Promotion
                </div>

                <h2 style={modalTitle}>
                  {editingOffer
                    ? "Edit Coupon"
                    : "Create Coupon"}
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
                gap: 15,
              }}
            >
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
                    Coupon Code
                  </div>

                  <input
                    value={form.code}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        code: event.target.value,
                      })
                    }
                    placeholder="WELCOME20"
                    style={inputStyle}
                  />
                </label>

                <label>
                  <div style={fieldLabel}>
                    Offer Title
                  </div>

                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        title:
                          event.target.value,
                      })
                    }
                    placeholder="Welcome Offer"
                    style={inputStyle}
                  />
                </label>
              </div>

              <label>
                <div style={fieldLabel}>
                  Description
                </div>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="Describe this promotion..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily:
                      "inherit",
                  }}
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
                    Discount Type
                  </div>

                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        type:
                          event.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="Percentage">
                      Percentage
                    </option>

                    <option value="Fixed">
                      Fixed ₹
                    </option>
                  </select>
                </label>

                <label>
                  <div style={fieldLabel}>
                    Discount Value
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={form.value}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        value:
                          event.target.value,
                      })
                    }
                    placeholder={
                      form.type ===
                      "Percentage"
                        ? "10"
                        : "50"
                    }
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
                    Minimum Order
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.minimumOrder
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        minimumOrder:
                          event.target.value,
                      })
                    }
                    placeholder="500"
                    style={inputStyle}
                  />
                </label>

                <label>
                  <div style={fieldLabel}>
                    Maximum Discount
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.maximumDiscount
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        maximumDiscount:
                          event.target.value,
                      })
                    }
                    placeholder="200"
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
                    Usage Limit
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.usageLimit
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        usageLimit:
                          event.target.value,
                      })
                    }
                    placeholder="100"
                    style={inputStyle}
                  />

                  <div
                    style={{
                      marginTop: 5,
                      color: "#94a3b8",
                      fontSize: 10,
                    }}
                  >
                    Use 0 for unlimited.
                  </div>
                </label>

                <label>
                  <div style={fieldLabel}>
                    Expiry Date
                  </div>

                  <input
                    type="date"
                    value={form.expiry}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        expiry:
                          event.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                </label>
              </div>

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
                  checked={form.active}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      active:
                        event.target.checked,
                    })
                  }
                />

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  Coupon is active
                </span>
              </label>

              <button
                type="submit"
                style={{
                  ...primaryButton,
                  marginTop: 3,
                }}
              >
                {editingOffer
                  ? "Save Changes"
                  : "Create Coupon"}
              </button>
            </div>
          </form>
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
  border:
    "1px solid rgba(15,23,42,0.08)",
  background:
    "rgba(255,255,255,0.76)",
  borderRadius: 14,
  padding: "12px 16px",
  fontWeight: 800,
  cursor: "pointer",
};

const statCard = {
  padding: 22,
  borderRadius: 22,
  background:
    "rgba(255,255,255,0.76)",
  backdropFilter: "blur(18px)",
  border:
    "1px solid rgba(255,255,255,0.85)",
  boxShadow:
    "0 18px 50px rgba(15,23,42,0.07)",
};

const statLabel = {
  fontSize: 13,
  fontWeight: 700,
  color: "#64748b",
  marginBottom: 10,
};

const statValue = {
  fontSize: 30,
  fontWeight: 900,
  letterSpacing: "-0.04em",
};

const selectStyle = {
  padding: "14px 16px",
  borderRadius: 14,
  border:
    "1px solid rgba(15,23,42,0.08)",
  background:
    "rgba(255,255,255,0.82)",
  outline: "none",
  fontSize: 14,
  fontWeight: 700,
};

const infoBox = {
  padding: 13,
  borderRadius: 14,
  background: "#f8fafc",
};

const infoLabel = {
  fontSize: 10,
  color: "#94a3b8",
  fontWeight: 800,
  textTransform: "uppercase",
  marginBottom: 5,
};

const smallButton = {
  border: "none",
  background: "#f1f5f9",
  color: "#334155",
  borderRadius: 10,
  padding: "9px 10px",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background:
    "rgba(15,23,42,0.45)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const modalStyle = {
  width: "min(620px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: 28,
  borderRadius: 26,
  background:
    "rgba(255,255,255,0.97)",
  boxShadow:
    "0 30px 100px rgba(15,23,42,0.22)",
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

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 12,
  border:
    "1px solid rgba(15,23,42,0.1)",
  background: "#fff",
  outline: "none",
  fontSize: 14,
  color: "#0f172a",
};