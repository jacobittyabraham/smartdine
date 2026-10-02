import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  Check,
  CheckCheck,
  ChefHat,
  Clock3,
  Droplets,
  GlassWater,
  HandPlatter,
  MessageCircle,
  ReceiptText,
  Send,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVICES = [
  {
    id: "water",
    title: "Drinking water",
    description: "A fresh refill for your table.",
    icon: Droplets,
    category: "Essentials",
  },
  {
    id: "plates",
    title: "Extra plates",
    description: "Additional plates for sharing.",
    icon: HandPlatter,
    category: "Essentials",
  },
  {
    id: "cutlery",
    title: "Cutlery",
    description: "Spoons, forks or other utensils.",
    icon: UtensilsCrossed,
    category: "Essentials",
  },
  {
    id: "tissues",
    title: "Tissues",
    description: "Fresh napkins for your table.",
    icon: GlassWater,
    category: "Essentials",
  },
  {
    id: "waiter",
    title: "Call a waiter",
    description: "Our team will assist you.",
    icon: BellRing,
    category: "Assistance",
  },
  {
    id: "bill",
    title: "Request bill",
    description: "Ask our team to prepare your bill.",
    icon: ReceiptText,
    category: "Assistance",
  },
];

const STATUS_LABELS = {
  Requested: "Requested",
  Accepted: "Accepted",
  Completed: "Completed",
};

function readRequests() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("smartdine_service_requests")
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function Waiter() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState(readRequests);
  const [selectedService, setSelectedService] = useState(null);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState("");

  const tableNumber =
    localStorage.getItem("smartdine_table") || "Not selected";

  const sessionId =
    localStorage.getItem("smartdine_session") || "";

  // Only display requests belonging to this dining session.
  const currentRequests = requests
    .filter(
      (request) =>
        request.sessionId === sessionId &&
        String(request.table) === String(tableNumber)
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

  const activeRequests = currentRequests.filter(
    (request) => request.status !== "Completed"
  );

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  // Refresh requests when this tab regains focus or another tab
  // updates localStorage. This prepares us for the staff demo.
  useEffect(() => {
    const refresh = () => setRequests(readRequests());

    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  function sendRequest() {
    if (!selectedService) return;

    if (tableNumber === "Not selected") {
      setSelectedService(null);
      setToast("Please select your table first.");
      return;
    }

    const newRequest = {
      id: `SR-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      serviceId: selectedService.id,
      service: selectedService.title,
      table: tableNumber,
      sessionId,
      note: note.trim(),
      status: "Requested",
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      completedAt: null,
    };

    const updatedRequests = [
      ...readRequests(),
      newRequest,
    ];

    localStorage.setItem(
  "smartdine_service_requests",
  JSON.stringify(updatedRequests)
);

window.dispatchEvent(
  new CustomEvent("smartdine-service-updated")
);

setRequests(updatedRequests);
    setSelectedService(null);
    setNote("");

    setToast(`${newRequest.service} requested successfully.`);
  }

  function formatTime(value) {
    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="sd-service-page">
      <div className="sd-service-orb sd-service-orb-one" />
      <div className="sd-service-orb sd-service-orb-two" />

      {/* Navigation */}
      <nav className="sd-service-nav">
        <button
          className="sd-service-back"
          onClick={() => navigate("/tracking")}
        >
          <ArrowLeft size={17} />
          <span>Back to tracking</span>
        </button>

        <div className="sd-service-brand">
          <div className="sd-service-brand-icon">
            <UtensilsCrossed size={17} />
          </div>

          <div>
            <strong>SmartDine</strong>
            <span>Thoughtful hospitality</span>
          </div>
        </div>

        <div className="sd-service-table">
          <span>YOUR TABLE</span>
          <strong>
            {tableNumber === "Not selected"
              ? "—"
              : `T${tableNumber}`}
          </strong>
        </div>
      </nav>

      <main className="sd-service-container">
        {/* Hero */}
        <motion.section
          className="sd-service-hero"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="sd-service-eyebrow">
            AT YOUR SERVICE
          </span>

          <h1>
            A little help,
            <br />
            <em>right at your table.</em>
          </h1>

          <p>
            Everything you need for a seamless dining
            experience. Choose a service and we’ll take
            care of the rest.
          </p>

          <div className="sd-service-hero-meta">
            <span>
              <Sparkles size={15} />
              Personalized table service
            </span>

            <span>
              <Clock3 size={15} />
              Request tracking
            </span>
          </div>
        </motion.section>

        {/* Services */}
        <section className="sd-service-section">
          <div className="sd-service-section-heading">
            <div>
              <span className="sd-service-eyebrow">
                HOW CAN WE HELP?
              </span>

              <h2>Choose a service.</h2>
            </div>

            <span className="sd-service-section-count">
              06 SERVICES
            </span>
          </div>

          <div className="sd-service-grid">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;

              return (
                <motion.button
                  key={service.id}
                  className="sd-service-card"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.06 * index,
                  }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedService(service);
                    setNote("");
                  }}
                >
                  <div className="sd-service-card-top">
                    <div className="sd-service-card-icon">
                      <Icon size={23} strokeWidth={1.7} />
                    </div>

                    <ArrowRight
                      size={18}
                      className="sd-service-card-arrow"
                    />
                  </div>

                  <div className="sd-service-card-content">
                    <span>{service.category}</span>

                    <h3>{service.title}</h3>

                    <p>{service.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Request history */}
        <section className="sd-service-history">
          <div className="sd-service-section-heading">
            <div>
              <span className="sd-service-eyebrow">
                YOUR REQUESTS
              </span>

              <h2>Service activity.</h2>
            </div>

            <div className="sd-service-active-count">
              <span className="sd-service-active-dot" />
              {activeRequests.length} active
            </div>
          </div>

          {currentRequests.length === 0 ? (
            <div className="sd-service-history-empty">
              <div>
                <MessageCircle size={23} />
              </div>

              <h3>No requests yet.</h3>

              <p>
                Your service requests will appear here
                once you send them.
              </p>
            </div>
          ) : (
            <div className="sd-service-request-list">
              {currentRequests.map((request) => {
                const service = SERVICES.find(
                  (item) =>
                    item.id === request.serviceId
                );

                const Icon = service?.icon || BellRing;

                return (
                  <motion.article
                    className="sd-service-request"
                    key={request.id}
                    layout
                  >
                    <div className="sd-service-request-icon">
                      <Icon size={19} />
                    </div>

                    <div className="sd-service-request-info">
                      <h3>{request.service}</h3>

                      <p>
                        {formatTime(request.createdAt)}
                        {request.note
                          ? ` · ${request.note}`
                          : ""}
                      </p>
                    </div>

                    <span
                      className={`sd-service-status ${
                        request.status === "Completed"
                          ? "is-completed"
                          : request.status === "Accepted"
                            ? "is-accepted"
                            : "is-requested"
                      }`}
                    >
                      {request.status === "Completed" ? (
                        <CheckCheck size={13} />
                      ) : request.status === "Accepted" ? (
                        <Check size={13} />
                      ) : (
                        <Clock3 size={13} />
                      )}

                      {STATUS_LABELS[request.status] ||
                        request.status}
                    </span>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom navigation */}
        <div className="sd-service-bottom">
          <div>
            <ChefHat size={21} />

            <p>
              Hungry for more? Explore the menu while
              our team assists you.
            </p>
          </div>

          <button onClick={() => navigate("/menu")}>
            Explore menu
            <ArrowRight size={17} />
          </button>
        </div>
      </main>

      {/* Request confirmation modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            className="sd-service-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              className="sd-service-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sd-service-modal-title"
              initial={{
                opacity: 0,
                y: 35,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.97,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 27,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="sd-service-modal-close"
                onClick={() => setSelectedService(null)}
                aria-label="Close"
              >
                <X size={19} />
              </button>

              <div className="sd-service-modal-icon">
                {(() => {
                  const Icon = selectedService.icon;
                  return <Icon size={27} />;
                })()}
              </div>

              <span className="sd-service-eyebrow">
                CONFIRM SERVICE REQUEST
              </span>

              <h2 id="sd-service-modal-title">
                {selectedService.title}
              </h2>

              <p>
                {selectedService.description}
              </p>

              <div className="sd-service-modal-table">
                <span>REQUEST FOR</span>

                <strong>
                  {tableNumber === "Not selected"
                    ? "No table selected"
                    : `Table ${tableNumber}`}
                </strong>
              </div>

              <label
                className="sd-service-note-label"
                htmlFor="service-note"
              >
                SPECIAL INSTRUCTIONS
                <span>Optional</span>
              </label>

              <textarea
                id="service-note"
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                maxLength={200}
                placeholder="Anything our team should know?"
                rows={3}
              />

              <button
                className="sd-service-send-btn"
                onClick={sendRequest}
              >
                <Send size={16} />
                Send request
                <ArrowRight size={17} />
              </button>

              <small>
                This request will be saved to your
                current dining session.
              </small>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="sd-service-toast"
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 15,
              scale: 0.95,
            }}
          >
            <div>
              <Check size={16} />
            </div>

            <span>{toast}</span>

            <button
              onClick={() => setToast("")}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}