import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  ChevronDown,
  CreditCard,
  Download,
  FileText,
  Minus,
  Plus,
  ReceiptText,
  Smartphone,
  Split,
  UtensilsCrossed,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const TAX_RATE = 0.05;

const PAYMENT_METHODS = [
  {
    id: "upi",
    title: "UPI",
    description: "Google Pay, PhonePe, Paytm & more",
    icon: Smartphone,
  },
  {
    id: "card",
    title: "Card",
    description: "Credit or debit card",
    icon: CreditCard,
  },
  {
    id: "cash",
    title: "Cash",
    description: "Pay at the restaurant",
    icon: Banknote,
  },
];

function getBillItems() {
  try {
    const currentOrder = JSON.parse(
      localStorage.getItem("smartdine_current_order")
    );

    if (currentOrder?.items?.length) {
      return currentOrder.items;
    }

    return JSON.parse(
      localStorage.getItem("smartdine_cart")
    ) || [];
  } catch {
    return [];
  }
}

function getItemTotal(item) {
  if (typeof item.finalPrice === "number") {
    return item.finalPrice;
  }

  return (item.price || 0) * (item.quantity || 1);
}

export default function Bill() {
  const navigate = useNavigate();

  const [items, setItems] = useState(getBillItems);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  useEffect(() => {
  const refreshBill = () => {
    setItems(getBillItems());
  };

  window.addEventListener("smartdine-order-updated", refreshBill);
  window.addEventListener("smartdine-order-created", refreshBill);
  window.addEventListener("storage", refreshBill);

  return () => {
    window.removeEventListener(
      "smartdine-order-updated",
      refreshBill
    );

    window.removeEventListener(
      "smartdine-order-created",
      refreshBill
    );

    window.removeEventListener(
      "storage",
      refreshBill
    );
  };
}, []);

  const tableNumber =
    localStorage.getItem("smartdine_table") ||
    "Not selected";

  const order = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("smartdine_current_order")
      );
    } catch {
      return null;
    }
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + getItemTotal(item),
    0
  );

  const taxableAmount = Math.max(subtotal - discount, 0);
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax;

  const splitAmount = splitEnabled
    ? total / splitCount
    : total;

  function applyCoupon() {
    const normalized = coupon.trim().toUpperCase();

    if (!normalized) {
      setCouponMessage("Enter a coupon code.");
      setDiscount(0);
      return;
    }

    if (normalized === "SMART10") {
      const amount = subtotal * 0.1;

      setDiscount(amount);
      setCouponMessage(
        `10% discount applied — save ₹${amount.toFixed(0)}`
      );
      return;
    }

    setDiscount(0);
    setCouponMessage(
      "This demo coupon is not valid."
    );
  }

  function changeSplitCount(amount) {
    setSplitCount((current) =>
      Math.min(10, Math.max(2, current + amount))
    );
  }

  function processPayment() {
    setProcessing(true);

    setTimeout(() => {
      const payment = {
        id: `PAY-${Date.now().toString().slice(-8)}`,
        orderId: order?.id || "SMARTDINE",
        method: paymentMethod,
        amount: total,
        split: splitEnabled,
        people: splitEnabled ? splitCount : 1,
        status: "Paid",
        paidAt: new Date().toISOString(),
      };

      localStorage.setItem(
  "smartdine_payment",
  JSON.stringify(payment)
);

// Save completed order to customer order history
const completedOrder = {
  ...(order || {}),
  status: "Paid",
  total,
  createdAt: order?.createdAt || new Date().toISOString(),
  paidAt: payment.paidAt,
  paymentId: payment.id,
};

const existingHistory = (() => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("smartdine_order_history")
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
})();

const withoutDuplicate = existingHistory.filter(
  (historyOrder) =>
    historyOrder?.id !== completedOrder?.id
);

const updatedHistory = [
  ...withoutDuplicate,
  completedOrder,
];

localStorage.setItem(
  "smartdine_order_history",
  JSON.stringify(updatedHistory)
);

window.dispatchEvent(
  new CustomEvent("smartdine-order-updated")
);

window.dispatchEvent(
  new CustomEvent("smartdine-order-created")
);

setProcessing(false);
setPaid(true);
    }, 1200);
  }

  function printReceipt() {
    window.print();
  }

  if (paid) {
    return (
      <div className="sd-bill-page">
        <motion.div
          className="sd-payment-success"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="sd-payment-success-icon">
            <Check size={34} />
          </div>

          <span className="sd-bill-eyebrow">
            PAYMENT SUCCESSFUL
          </span>

          <h1>Thank you.</h1>

          <p>
            Your payment has been recorded and your
            digital receipt is ready.
          </p>

          <div className="sd-payment-receipt">
            <div>
              <span>PAYMENT ID</span>
              <strong>
                {JSON.parse(
                  localStorage.getItem(
                    "smartdine_payment"
                  )
                )?.id || "—"}
              </strong>
            </div>

            <div>
              <span>AMOUNT PAID</span>
              <strong>
                ₹
                {total.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </strong>
            </div>

            <div>
              <span>METHOD</span>
              <strong>
                {paymentMethod.toUpperCase()}
              </strong>
            </div>
          </div>

          <div className="sd-payment-success-actions">
            <button onClick={printReceipt}>
              <Download size={16} />
              Print / Save receipt
            </button>

            <button
              className="secondary"
              onClick={() => navigate("/menu")}
            >
              Back to menu
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="sd-bill-page">
      <div className="sd-bill-orb sd-bill-orb-one" />
      <div className="sd-bill-orb sd-bill-orb-two" />

      {/* Navigation */}
      <nav className="sd-bill-nav">
        <button
          className="sd-bill-back"
          onClick={() => navigate("/tracking")}
        >
          <ArrowLeft size={17} />
          Tracking
        </button>

        <div className="sd-bill-brand">
          <div className="sd-bill-brand-icon">
            <UtensilsCrossed size={17} />
          </div>

          <div>
            <strong>SmartDine</strong>
            <span>Digital billing</span>
          </div>
        </div>

        <div className="sd-bill-table">
          <span>TABLE</span>
          <strong>
            {tableNumber === "Not selected"
              ? "—"
              : `T${tableNumber}`}
          </strong>
        </div>
      </nav>

      <main className="sd-bill-container">
        {/* Header */}
        <motion.section
          className="sd-bill-heading"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="sd-bill-eyebrow">
            DIGITAL CHECKOUT
          </span>

          <h1>
            Your bill,
            <br />
            <em>beautifully simple.</em>
          </h1>

          <p>
            Review your dining bill, choose your payment
            method, and receive your digital receipt.
          </p>
        </motion.section>

        <div className="sd-bill-layout">
          {/* LEFT */}
          <section className="sd-bill-main">
            {/* Items */}
            <div className="sd-bill-card">
              <div className="sd-bill-card-heading">
                <div>
                  <span>ITEMIZED BILL</span>
                  <h2>Your order</h2>
                </div>

                <ReceiptText size={21} />
              </div>

              {items.length === 0 ? (
                <div className="sd-bill-empty">
                  <FileText size={25} />
                  <p>No order items found.</p>
                </div>
              ) : (
                <div className="sd-bill-items">
                  {items.map((item, index) => (
                    <div
                      className="sd-bill-item"
                      key={`${item.id}-${index}`}
                    >
                      <div className="sd-bill-item-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="sd-bill-item-info">
                        <h3>{item.name}</h3>

                        <p>
                          {item.quantity || 1} × ₹
                          {(item.price || 0).toLocaleString(
                            "en-IN"
                          )}

                          {item.spice
                            ? ` · ${item.spice}`
                            : ""}
                        </p>
                      </div>

                      <strong>
                        ₹
                        {getItemTotal(item).toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 0,
                          }
                        )}
                      </strong>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="sd-bill-totals">
                <div>
                  <span>Subtotal</span>
                  <strong>
                    ₹
                    {subtotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>

                {discount > 0 && (
                  <div className="sd-bill-discount">
                    <span>Discount</span>
                    <strong>
                      − ₹
                      {discount.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>
                )}

                <div>
                  <span>
                    GST / tax
                    <small>Demo 5%</small>
                  </span>

                  <strong>
                    ₹
                    {tax.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>

                <div className="sd-bill-grand-total">
                  <span>Total</span>

                  <strong>
                    ₹
                    {total.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="sd-bill-card sd-bill-coupon-card">
              <div className="sd-bill-card-heading">
                <div>
                  <span>SAVINGS</span>
                  <h2>Have a coupon?</h2>
                </div>
              </div>

              <div className="sd-bill-coupon-input">
                <input
                  value={coupon}
                  onChange={(event) =>
                    setCoupon(event.target.value)
                  }
                  placeholder="Enter coupon code"
                />

                <button onClick={applyCoupon}>
                  Apply
                </button>
              </div>

              {couponMessage && (
                <motion.p
                  className={
                    discount > 0
                      ? "coupon-success"
                      : "coupon-error"
                  }
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {couponMessage}
                </motion.p>
              )}

              <span className="sd-bill-demo-code">
                Demo code: <strong>SMART10</strong>
              </span>
            </div>

            {/* Split bill */}
            <div className="sd-bill-card">
              <div className="sd-bill-split-top">
                <div className="sd-bill-card-heading">
                  <div>
                    <span>FLEXIBLE PAYMENT</span>
                    <h2>Split the bill</h2>
                  </div>
                </div>

                <button
                  className={`sd-bill-toggle ${
                    splitEnabled ? "active" : ""
                  }`}
                  onClick={() =>
                    setSplitEnabled(!splitEnabled)
                  }
                  aria-label="Toggle split bill"
                >
                  <span />
                </button>
              </div>

              <p className="sd-bill-split-description">
                Divide the total equally between everyone
                at your table.
              </p>

              <AnimatePresence>
                {splitEnabled && (
                  <motion.div
                    className="sd-bill-split-controls"
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                  >
                    <div className="sd-bill-split-count">
                      <button
                        onClick={() =>
                          changeSplitCount(-1)
                        }
                      >
                        <Minus size={15} />
                      </button>

                      <div>
                        <strong>{splitCount}</strong>
                        <span>people</span>
                      </div>

                      <button
                        onClick={() =>
                          changeSplitCount(1)
                        }
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <div className="sd-bill-per-person">
                      <span>PER PERSON</span>
                      <strong>
                        ₹
                        {splitAmount.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 0,
                          }
                        )}
                      </strong>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* RIGHT */}
          <aside className="sd-bill-sidebar">
            {/* Payment */}
            <div className="sd-bill-payment-card">
              <span className="sd-bill-eyebrow">
                PAYMENT METHOD
              </span>

              <h2>How would you like to pay?</h2>

              <div className="sd-payment-methods">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;

                  return (
                    <button
                      key={method.id}
                      className={`sd-payment-method ${
                        paymentMethod === method.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setPaymentMethod(method.id)
                      }
                    >
                      <div className="sd-payment-method-icon">
                        <Icon size={19} />
                      </div>

                      <div>
                        <strong>{method.title}</strong>
                        <span>{method.description}</span>
                      </div>

                      <div className="sd-payment-radio">
                        {paymentMethod === method.id && (
                          <Check size={12} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="sd-bill-pay-total">
                <span>
                  {splitEnabled
                    ? `Paying for ${splitCount} people`
                    : "Amount to pay"}
                </span>

                <strong>
                  ₹
                  {total.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </strong>
              </div>

              <button
                className="sd-bill-pay-button"
                onClick={processPayment}
                disabled={processing || items.length === 0}
              >
                {processing ? (
                  <>
                    <span className="sd-bill-spinner" />
                    Processing payment...
                  </>
                ) : (
                  <>
                    Pay ₹
                    {splitEnabled
                      ? splitAmount.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 0,
                          }
                        )
                      : total.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <p className="sd-bill-payment-note">
                <WalletCards size={15} />
                Demo payment flow. Connect your payment
                gateway in the backend for production.
              </p>
            </div>

            {/* Table */}
            <div className="sd-bill-table-card">
              <div className="sd-bill-table-icon">
                <UtensilsCrossed size={19} />
              </div>

              <div>
                <span>DINING TABLE</span>

                <strong>
                  {tableNumber === "Not selected"
                    ? "Table not selected"
                    : `Table ${tableNumber}`}
                </strong>
              </div>
            </div>

            {/* Receipt note */}
            <div className="sd-bill-receipt-note">
              <FileText size={18} />

              <div>
                <strong>Digital receipt</strong>

                <p>
                  Your receipt will be available
                  immediately after payment.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}