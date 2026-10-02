import { motion } from "framer-motion";
import {
  Bell,
  Check,
  Clock3,
  Droplets,
  FileText,
  HandPlatter,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  RefreshCw,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVICE_ICONS = {
  water: Droplets,
  plates: Utensils,
  cutlery: HandPlatter,
  tissues: FileText,
  waiter: Bell,
  bill: FileText,
};

const STATUS_CONFIG = {
  Requested: {
    label: "New Request",
    className: "requested",
  },
  Accepted: {
    label: "Accepted",
    className: "accepted",
  },
  Completed: {
    label: "Completed",
    className: "completed",
  },
};

function getRequests() {
  try {
    return (
      JSON.parse(
        localStorage.getItem("smartdine_service_requests")
      ) || []
    );
  } catch {
    return [];
  }
}

function saveRequests(requests) {
  localStorage.setItem(
    "smartdine_service_requests",
    JSON.stringify(requests)
  );

  window.dispatchEvent(
    new CustomEvent("smartdine-service-updated")
  );
}

function formatTime(dateString) {
  if (!dateString) return "--";

  const date = new Date(dateString);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WaiterDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState(getRequests);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const refreshRequests = () => {
      setRequests(getRequests());
    };

    window.addEventListener(
      "smartdine-service-updated",
      refreshRequests
    );

    window.addEventListener("storage", refreshRequests);

    const interval = setInterval(refreshRequests, 1000);

    return () => {
      window.removeEventListener(
        "smartdine-service-updated",
        refreshRequests
      );

      window.removeEventListener("storage", refreshRequests);

      clearInterval(interval);
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      requested: requests.filter(
        (item) => item.status === "Requested"
      ).length,
      accepted: requests.filter(
        (item) => item.status === "Accepted"
      ).length,
      completed: requests.filter(
        (item) => item.status === "Completed"
      ).length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (activeFilter === "All") {
      return requests;
    }

    return requests.filter(
      (item) => item.status === activeFilter
    );
  }, [requests, activeFilter]);

  const updateRequestStatus = (requestId, status) => {
    const currentRequests = getRequests();

    const updatedRequests = currentRequests.map((request) => {
      if (request.id !== requestId) {
        return request;
      }

      return {
        ...request,
        status,
        acceptedAt:
          status === "Accepted"
            ? new Date().toISOString()
            : request.acceptedAt || null,
        completedAt:
          status === "Completed"
            ? new Date().toISOString()
            : request.completedAt || null,
      };
    });

    saveRequests(updatedRequests);
    setRequests(updatedRequests);

    const updatedRequest = updatedRequests.find(
      (item) => item.id === requestId
    );

    if (updatedRequest) {
      setSelectedRequest(updatedRequest);
    }

    setToast(
      status === "Accepted"
        ? "Request accepted"
        : "Request marked as completed"
    );

    setTimeout(() => {
      setToast("");
    }, 1800);
  };

  const clearCompleted = () => {
    const currentRequests = getRequests();

    const remaining = currentRequests.filter(
      (request) => request.status !== "Completed"
    );

    saveRequests(remaining);
    setRequests(remaining);

    setToast("Completed requests cleared");

    setTimeout(() => {
      setToast("");
    }, 1800);
  };

  return (
    <div className="sd-waiter-dashboard">
      <div className="sd-waiter-bg">
        <div className="sd-waiter-orb sd-waiter-orb-one" />
        <div className="sd-waiter-orb sd-waiter-orb-two" />
        <div className="sd-waiter-grid" />
      </div>

      <aside className="sd-waiter-sidebar">
        <button
          className="sd-waiter-brand"
          onClick={() => navigate("/")}
        >
          <div className="sd-waiter-brand-mark">
            <Utensils size={20} />
          </div>

          <div>
            <strong>SmartDine</strong>
            <span>Staff Console</span>
          </div>
        </button>

        <div className="sd-waiter-sidebar-section">
          <span>OPERATIONS</span>

          <button
            className="sd-waiter-side-item"
            onClick={() => navigate("/staff")}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            className="sd-waiter-side-item"
            onClick={() => navigate("/staff/kitchen")}
          >
            <Utensils size={18} />
            Kitchen
          </button>

          <button className="sd-waiter-side-item active">
            <Bell size={18} />
            Service Requests

            {stats.requested > 0 && (
              <span className="sd-waiter-side-badge">
                {stats.requested}
              </span>
            )}
          </button>
        </div>

        <div className="sd-waiter-sidebar-bottom">
          <div className="sd-waiter-online">
            <span />
            <div>
              <strong>Waiter desk online</strong>
              <small>Receiving requests</small>
            </div>
          </div>

          <button
            className="sd-waiter-logout"
            onClick={() => navigate("/")}
          >
            <LogOut size={17} />
            Exit
          </button>
        </div>
      </aside>

      <main className="sd-waiter-main">
        <header className="sd-waiter-header">
          <div>
            <div className="sd-waiter-mobile-title">
              <button
                onClick={() => navigate("/staff")}
                aria-label="Back"
              >
                <Menu size={20} />
              </button>

              <span>Service Desk</span>
            </div>

            <span className="sd-waiter-kicker">
              TABLE SERVICE
            </span>

            <h1>Service Requests</h1>

            <p>
              Keep every table comfortable, attended and informed.
            </p>
          </div>

          <div className="sd-waiter-header-actions">
            <button
              className="sd-waiter-refresh"
              onClick={() => setRequests(getRequests())}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="sd-waiter-clear"
              onClick={clearCompleted}
              disabled={stats.completed === 0}
            >
              Clear completed
            </button>
          </div>
        </header>

        <section className="sd-waiter-stats">
          <motion.div
            className="sd-waiter-stat-card"
            whileHover={{ y: -4 }}
          >
            <div className="sd-waiter-stat-icon">
              <MessageSquare size={19} />
            </div>

            <div>
              <span>Total Requests</span>
              <strong>{stats.total}</strong>
            </div>
          </motion.div>

          <motion.div
            className="sd-waiter-stat-card highlight"
            whileHover={{ y: -4 }}
          >
            <div className="sd-waiter-stat-icon">
              <Bell size={19} />
            </div>

            <div>
              <span>New Requests</span>
              <strong>{stats.requested}</strong>
            </div>
          </motion.div>

          <motion.div
            className="sd-waiter-stat-card"
            whileHover={{ y: -4 }}
          >
            <div className="sd-waiter-stat-icon">
              <Clock3 size={19} />
            </div>

            <div>
              <span>Accepted</span>
              <strong>{stats.accepted}</strong>
            </div>
          </motion.div>

          <motion.div
            className="sd-waiter-stat-card"
            whileHover={{ y: -4 }}
          >
            <div className="sd-waiter-stat-icon">
              <Check size={19} />
            </div>

            <div>
              <span>Completed</span>
              <strong>{stats.completed}</strong>
            </div>
          </motion.div>
        </section>

        <section className="sd-waiter-toolbar">
          <div className="sd-waiter-filters">
            {["All", "Requested", "Accepted", "Completed"].map(
              (filter) => (
                <button
                  key={filter}
                  className={
                    activeFilter === filter ? "active" : ""
                  }
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}

                  <span>
                    {filter === "All"
                      ? stats.total
                      : filter === "Requested"
                      ? stats.requested
                      : filter === "Accepted"
                      ? stats.accepted
                      : stats.completed}
                  </span>
                </button>
              )
            )}
          </div>

          <div className="sd-waiter-live-indicator">
            <span />
            Live request feed
          </div>
        </section>

        <section className="sd-waiter-request-area">
          {filteredRequests.length === 0 ? (
            <motion.div
              className="sd-waiter-empty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="sd-waiter-empty-icon">
                <Bell size={28} />
              </div>

              <h2>No service requests</h2>

              <p>
                New table requests will appear here automatically.
              </p>

              <button
                onClick={() => setRequests(getRequests())}
              >
                <RefreshCw size={16} />
                Check again
              </button>
            </motion.div>
          ) : (
            <div className="sd-waiter-request-grid">
              {filteredRequests.map((request, index) => {
                const Icon =
                  SERVICE_ICONS[request.serviceId] || Bell;

                const status =
                  STATUS_CONFIG[request.status] ||
                  STATUS_CONFIG.Requested;

                return (
                  <motion.article
                    key={request.id}
                    className={`sd-waiter-request-card ${status.className}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.04,
                    }}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="sd-waiter-request-top">
                      <div className="sd-waiter-request-icon">
                        <Icon size={21} />
                      </div>

                      <span
                        className={`sd-waiter-status ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="sd-waiter-request-body">
                      <span className="sd-waiter-request-label">
                        TABLE {request.table}
                      </span>

                      <h3>{request.service}</h3>

                      {request.note && (
                        <p className="sd-waiter-request-note">
                          “{request.note}”
                        </p>
                      )}
                    </div>

                    <div className="sd-waiter-request-footer">
                      <div>
                        <Clock3 size={14} />
                        {formatTime(request.createdAt)}
                      </div>

                      <span>
                        {request.sessionId
                          ? request.sessionId.slice(-8)
                          : "Session"}
                      </span>
                    </div>

                    <div className="sd-waiter-card-actions">
                      {request.status === "Requested" && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            updateRequestStatus(
                              request.id,
                              "Accepted"
                            );
                          }}
                        >
                          Accept request
                          <Check size={15} />
                        </button>
                      )}

                      {request.status === "Accepted" && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            updateRequestStatus(
                              request.id,
                              "Completed"
                            );
                          }}
                        >
                          Mark completed
                          <Check size={15} />
                        </button>
                      )}

                      {request.status === "Completed" && (
                        <span className="sd-waiter-completed-label">
                          Service completed
                        </span>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {selectedRequest && (
        <div
          className="sd-waiter-modal-backdrop"
          onClick={() => setSelectedRequest(null)}
        >
          <motion.div
            className="sd-waiter-modal"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="sd-waiter-modal-close"
              onClick={() => setSelectedRequest(null)}
            >
              <X size={18} />
            </button>

            <div className="sd-waiter-modal-icon">
              <Bell size={23} />
            </div>

            <span>TABLE {selectedRequest.table}</span>

            <h2>{selectedRequest.service}</h2>

            <div className="sd-waiter-modal-info">
              <div>
                <small>Requested</small>
                <strong>
                  {formatTime(selectedRequest.createdAt)}
                </strong>
              </div>

              <div>
                <small>Status</small>
                <strong>{selectedRequest.status}</strong>
              </div>
            </div>

            {selectedRequest.note && (
              <div className="sd-waiter-modal-note">
                <small>Customer note</small>
                <p>{selectedRequest.note}</p>
              </div>
            )}

            {selectedRequest.status === "Requested" && (
              <button
                className="sd-waiter-modal-action"
                onClick={() =>
                  updateRequestStatus(
                    selectedRequest.id,
                    "Accepted"
                  )
                }
              >
                Accept request
                <Check size={17} />
              </button>
            )}

            {selectedRequest.status === "Accepted" && (
              <button
                className="sd-waiter-modal-action"
                onClick={() =>
                  updateRequestStatus(
                    selectedRequest.id,
                    "Completed"
                  )
                }
              >
                Mark as completed
                <Check size={17} />
              </button>
            )}
          </motion.div>
        </div>
      )}

      {toast && (
        <motion.div
          className="sd-waiter-toast"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <Check size={17} />
          {toast}
        </motion.div>
      )}
    </div>
  );
}