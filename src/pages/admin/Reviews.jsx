import { useEffect, useMemo, useState } from "react";

const DEFAULT_REVIEWS = [
  {
    id: "REV-001",
    customer: "SmartDine Guest",
    rating: 5,
    title: "Excellent dining experience",
    comment:
      "The ordering process was smooth and the food arrived quickly.",
    orderId: "SD-DEMO01",
    date: "2026-09-28T13:20:00",
    status: "Published",
    reviewed: true,
  },
  {
    id: "REV-002",
    customer: "Happy Customer",
    rating: 4,
    title: "Great food",
    comment:
      "The biriyani was delicious. The digital ordering experience was very convenient.",
    orderId: "SD-DEMO02",
    date: "2026-09-27T19:10:00",
    status: "Published",
    reviewed: false,
  },
  {
    id: "REV-003",
    customer: "Restaurant Guest",
    rating: 3,
    title: "Good overall",
    comment:
      "Food was good, but the waiting time could be improved.",
    orderId: "SD-DEMO03",
    date: "2026-09-25T14:45:00",
    status: "Published",
    reviewed: false,
  },
  {
    id: "REV-004",
    customer: "Dining Guest",
    rating: 2,
    title: "Long waiting time",
    comment:
      "The food quality was acceptable but the order took longer than expected.",
    orderId: "SD-DEMO04",
    date: "2026-09-23T20:15:00",
    status: "Hidden",
    reviewed: true,
  },
];

const RATING_OPTIONS = ["All", 5, 4, 3, 2, 1];

function readReviews() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("smartdine_reviews")
    );

    if (Array.isArray(saved) && saved.length) {
      return saved;
    }

    return DEFAULT_REVIEWS;
  } catch {
    return DEFAULT_REVIEWS;
  }
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRatingLabel(rating) {
  if (rating === 5) return "Excellent";
  if (rating === 4) return "Very Good";
  if (rating === 3) return "Good";
  if (rating === 2) return "Needs Attention";
  if (rating === 1) return "Poor";

  return "Unrated";
}

function getStatusStyle(status) {
  if (status === "Published") {
    return {
      background: "rgba(16,185,129,0.12)",
      color: "#047857",
    };
  }

  return {
    background: "rgba(100,116,139,0.12)",
    color: "#475569",
  };
}

function Stars({ rating, size = 15 }) {
  return (
    <span
      style={{
        display: "inline-flex",
        gap: 2,
        fontSize: size,
        letterSpacing: 1,
      }}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color:
              star <= rating ? "#f59e0b" : "#cbd5e1",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState(readReviews);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] =
    useState("All");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [selectedReview, setSelectedReview] =
    useState(null);

  const refreshReviews = () => {
    setReviews(readReviews());
  };

  useEffect(() => {
    window.addEventListener(
      "smartdine-reviews-updated",
      refreshReviews
    );

    window.addEventListener(
      "storage",
      refreshReviews
    );

    return () => {
      window.removeEventListener(
        "smartdine-reviews-updated",
        refreshReviews
      );

      window.removeEventListener(
        "storage",
        refreshReviews
      );
    };
  }, []);

  const saveReviews = (updatedReviews) => {
    setReviews(updatedReviews);

    localStorage.setItem(
      "smartdine_reviews",
      JSON.stringify(updatedReviews)
    );

    window.dispatchEvent(
      new CustomEvent("smartdine-reviews-updated")
    );
  };

  const stats = useMemo(() => {
    const total = reviews.length;

    const average =
      total > 0
        ? reviews.reduce(
            (sum, review) =>
              sum + Number(review?.rating || 0),
            0
          ) / total
        : 0;

    const published = reviews.filter(
      (review) => review?.status === "Published"
    ).length;

    const pending = reviews.filter(
      (review) => !review?.reviewed
    ).length;

    return {
      total,
      average,
      published,
      pending,
    };
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter(
        (review) =>
          Number(review?.rating) === rating
      ).length,
    }));
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews
      .filter((review) => {
        const matchesSearch =
          !query ||
          review?.customer
            ?.toLowerCase()
            .includes(query) ||
          review?.title
            ?.toLowerCase()
            .includes(query) ||
          review?.comment
            ?.toLowerCase()
            .includes(query) ||
          review?.orderId
            ?.toLowerCase()
            .includes(query);

        const matchesRating =
          ratingFilter === "All" ||
          Number(review?.rating) ===
            Number(ratingFilter);

        const matchesStatus =
          statusFilter === "All" ||
          review?.status === statusFilter;

        return (
          matchesSearch &&
          matchesRating &&
          matchesStatus
        );
      })
      .sort(
        (a, b) =>
          new Date(b?.date || 0) -
          new Date(a?.date || 0)
      );
  }, [
    reviews,
    search,
    ratingFilter,
    statusFilter,
  ]);

  const toggleReviewed = (id) => {
    const updated = reviews.map((review) =>
      review?.id === id
        ? {
            ...review,
            reviewed: !review.reviewed,
          }
        : review
    );

    saveReviews(updated);
  };

  const toggleVisibility = (id) => {
    const updated = reviews.map((review) =>
      review?.id === id
        ? {
            ...review,
            status:
              review?.status === "Published"
                ? "Hidden"
                : "Published",
          }
        : review
    );

    saveReviews(updated);
  };

  const deleteReview = (id) => {
    const review = reviews.find(
      (entry) => entry?.id === id
    );

    if (!review) return;

    const confirmed = window.confirm(
      `Delete the review from ${review.customer}?`
    );

    if (!confirmed) return;

    saveReviews(
      reviews.filter(
        (entry) => entry?.id !== id
      )
    );

    if (selectedReview?.id === id) {
      setSelectedReview(null);
    }
  };

  const resetReviews = () => {
    const confirmed = window.confirm(
      "Reset reviews to the default SmartDine demo reviews?"
    );

    if (!confirmed) return;

    saveReviews(DEFAULT_REVIEWS);
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
              Reviews & Feedback
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#64748b",
                fontSize: 15,
              }}
            >
              Monitor customer feedback and restaurant experience.
            </p>
          </div>

          <button
            onClick={resetReviews}
            style={{
              border:
                "1px solid rgba(15,23,42,0.08)",
              background:
                "rgba(255,255,255,0.76)",
              borderRadius: 14,
              padding: "12px 16px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Reset Reviews
          </button>
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
            ["Total Reviews", stats.total],
            [
              "Average Rating",
              `${stats.average.toFixed(1)} / 5`,
            ],
            ["Published", stats.published],
            ["Needs Review", stats.pending],
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

              {label === "Average Rating" && (
                <div
                  style={{
                    marginTop: 7,
                  }}
                >
                  <Stars
                    rating={Math.round(
                      stats.average
                    )}
                    size={13}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rating Distribution */}
        <div
          style={{
            padding: 22,
            borderRadius: 24,
            background:
              "rgba(255,255,255,0.78)",
            backdropFilter: "blur(18px)",
            border:
              "1px solid rgba(255,255,255,0.9)",
            boxShadow:
              "0 18px 55px rgba(15,23,42,0.08)",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: 17,
              marginBottom: 18,
            }}
          >
            Rating Distribution
          </div>

          <div
            style={{
              display: "grid",
              gap: 11,
            }}
          >
            {ratingDistribution.map(
              (item) => {
                const percentage =
                  stats.total > 0
                    ? Math.round(
                        (item.count /
                          stats.total) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={item.rating}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "70px 1fr 40px",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {item.rating}
                      <span
                        style={{
                          color: "#f59e0b",
                        }}
                      >
                        ★
                      </span>
                    </div>

                    <div
                      style={{
                        height: 8,
                        borderRadius: 999,
                        background: "#f1f5f9",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          borderRadius: 999,
                          background:
                            "#f59e0b",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                        color: "#64748b",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {item.count}
                    </div>
                  </div>
                );
              }
            )}
          </div>
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
            placeholder="Search customer, order or review..."
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
            value={ratingFilter}
            onChange={(event) =>
              setRatingFilter(
                event.target.value
              )
            }
            style={selectStyle}
          >
            {RATING_OPTIONS.map(
              (rating) => (
                <option
                  key={rating}
                  value={rating}
                >
                  {rating === "All"
                    ? "All Ratings"
                    : `${rating} Stars`}
                </option>
              )
            )}
          </select>

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
            <option value="Published">
              Published
            </option>
            <option value="Hidden">
              Hidden
            </option>
          </select>
        </div>

        {/* Reviews */}
        <div
          style={{
            display: "grid",
            gap: 14,
          }}
        >
          {filteredReviews.map(
            (review) => {
              const statusStyle =
                getStatusStyle(
                  review?.status
                );

              return (
                <div
                  key={review?.id}
                  style={{
                    padding: 22,
                    borderRadius: 22,
                    background:
                      "rgba(255,255,255,0.78)",
                    backdropFilter:
                      "blur(18px)",
                    border:
                      "1px solid rgba(255,255,255,0.9)",
                    boxShadow:
                      "0 15px 45px rgba(15,23,42,0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      gap: 20,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        minWidth: 240,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: 16,
                          }}
                        >
                          {review?.customer}
                        </strong>

                        <span
                          style={{
                            padding:
                              "6px 9px",
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
                          }}
                        >
                          {review?.status}
                        </span>

                        {!review?.reviewed && (
                          <span
                            style={{
                              padding:
                                "6px 9px",
                              borderRadius:
                                999,
                              background:
                                "#fff7ed",
                              color:
                                "#c2410c",
                              fontSize:
                                10,
                              fontWeight:
                                900,
                            }}
                          >
                            NEEDS REVIEW
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          alignItems:
                            "center",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <Stars
                          rating={Number(
                            review?.rating ||
                              0
                          )}
                        />

                        <span
                          style={{
                            color:
                              "#64748b",
                            fontSize:
                              12,
                            fontWeight:
                              700,
                          }}
                        >
                          {getRatingLabel(
                            Number(
                              review?.rating ||
                                0
                            )
                          )}
                        </span>
                      </div>

                      <h3
                        style={{
                          margin:
                            "12px 0 6px",
                          fontSize: 18,
                          letterSpacing:
                            "-0.025em",
                        }}
                      >
                        {review?.title}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color:
                            "#64748b",
                          fontSize:
                            13,
                          lineHeight:
                            1.6,
                        }}
                      >
                        {review?.comment}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: 14,
                          flexWrap: "wrap",
                          marginTop: 13,
                          color:
                            "#94a3b8",
                          fontSize: 11,
                        }}
                      >
                        <span>
                          Order:{" "}
                          {review?.orderId ||
                            "—"}
                        </span>

                        <span>
                          {formatDate(
                            review?.date
                          )}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        maxWidth: 340,
                        justifyContent:
                          "flex-end",
                      }}
                    >
                      <button
                        onClick={() =>
                          setSelectedReview(
                            review
                          )
                        }
                        style={smallButton}
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          toggleReviewed(
                            review.id
                          )
                        }
                        style={{
                          ...smallButton,
                          background:
                            review?.reviewed
                              ? "#ecfdf5"
                              : "#fff7ed",
                          color:
                            review?.reviewed
                              ? "#047857"
                              : "#c2410c",
                        }}
                      >
                        {review?.reviewed
                          ? "Reviewed"
                          : "Mark Reviewed"}
                      </button>

                      <button
                        onClick={() =>
                          toggleVisibility(
                            review.id
                          )
                        }
                        style={smallButton}
                      >
                        {review?.status ===
                        "Published"
                          ? "Hide"
                          : "Publish"}
                      </button>

                      <button
                        onClick={() =>
                          deleteReview(
                            review.id
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
                </div>
              );
            }
          )}
        </div>

        {!filteredReviews.length && (
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
            No reviews match the current filters.
          </div>
        )}
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div
          onClick={() =>
            setSelectedReview(null)
          }
          style={overlayStyle}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={modalStyle}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                gap: 20,
                marginBottom: 22,
              }}
            >
              <div>
                <div style={eyebrowStyle}>
                  Customer Feedback
                </div>

                <h2 style={modalTitle}>
                  Review Details
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedReview(null)
                }
                style={closeButton}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 18,
                background: "#f8fafc",
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
                }}
              >
                <div>
                  <strong>
                    {selectedReview.customer}
                  </strong>

                  <div
                    style={{
                      marginTop: 7,
                    }}
                  >
                    <Stars
                      rating={Number(
                        selectedReview.rating ||
                          0
                      )}
                      size={18}
                    />
                  </div>
                </div>

                <span
                  style={{
                    padding:
                      "7px 10px",
                    borderRadius:
                      999,
                    background:
                      getStatusStyle(
                        selectedReview.status
                      ).background,
                    color:
                      getStatusStyle(
                        selectedReview.status
                      ).color,
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  {selectedReview.status}
                </span>
              </div>

              <h3
                style={{
                  margin:
                    "18px 0 8px",
                  fontSize: 20,
                }}
              >
                {selectedReview.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#475569",
                  lineHeight: 1.7,
                  fontSize: 14,
                }}
              >
                {selectedReview.comment}
              </p>

              <div
                style={{
                  marginTop: 18,
                  paddingTop: 16,
                  borderTop:
                    "1px solid rgba(15,23,42,0.07)",
                  display: "grid",
                  gap: 8,
                  color: "#64748b",
                  fontSize: 12,
                }}
              >
                <div>
                  Order ID:{" "}
                  <strong>
                    {selectedReview.orderId ||
                      "—"}
                  </strong>
                </div>

                <div>
                  Submitted:{" "}
                  <strong>
                    {formatDate(
                      selectedReview.date
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

const smallButton = {
  border: "none",
  background: "#f1f5f9",
  color: "#334155",
  borderRadius: 10,
  padding: "9px 11px",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
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
  width: "min(620px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: 28,
  borderRadius: 26,
  background: "rgba(255,255,255,0.97)",
  boxShadow:
    "0 30px 100px rgba(15,23,42,0.22)",
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