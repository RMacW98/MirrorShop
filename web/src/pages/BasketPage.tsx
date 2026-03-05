import { useState } from "react";
import { Link } from "react-router-dom";
import { useBasket } from "../context/BasketContext";
import { useAuth } from "../context/AuthContext";
import "./BasketPage.css";

function MissingDetailsForm({
  currentName,
  currentPhone,
  onUpdate,
}: {
  currentName: string;
  currentPhone: string;
  onUpdate: (data: { name?: string; phoneNumber?: string }) => Promise<void>;
}) {
  const [name, setName] = useState(currentName);
  const [phoneNumber, setPhoneNumber] = useState(currentPhone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onUpdate({ name: name.trim() || undefined, phoneNumber: phoneNumber.trim() || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="missing-details-form" onSubmit={handleSave}>
      <p className="checkout-details-prompt">
        Add the missing details below to complete your order. These will be saved to your account.
      </p>
      {(!currentName || !currentPhone) && (
        <>
          {!currentName && (
            <label className="checkout-field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your full name"
              />
            </label>
          )}
          {!currentPhone && (
            <label className="checkout-field">
              <span>Phone number</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="+44 7xxx xxxxxx"
              />
            </label>
          )}
          {error && <p className="checkout-error">{error}</p>}
          <button type="submit" className="checkout-submit" disabled={saving}>
            {saving ? "Saving…" : "Save to account"}
          </button>
        </>
      )}
    </form>
  );
}

export default function BasketPage() {
  const { items, removeItem, clearBasket, itemCount } = useBasket();
  const { user, updateProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);

  const customerName = user?.name?.trim() ?? "";
  const customerEmail = user?.email?.trim() ?? "";
  const customerPhone = user?.phoneNumber?.trim() ?? "";
  const hasRequiredDetails = customerName && customerEmail && customerPhone;

  const handleCompleteOrder = async () => {
    if (!user || !hasRequiredDetails) return;
    setError(null);
    setSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "/api";
      const res = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          lines: items.map((item) => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            finish: item.options.finish,
            height: item.options.height,
            width: item.options.width,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to place order");
      }
      clearBasket();
      setOrderComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (itemCount === 0 && !orderComplete) {
    return (
      <div className="page basket-page">
        <h1>Your basket</h1>
        <p className="basket-empty">Your basket is empty.</p>
        <Link to="/" className="back-link">
          ← Continue shopping
        </Link>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="page basket-page">
        <h1>Order complete</h1>
        <p className="basket-empty">Thank you! Your order has been placed successfully.</p>
        <Link to="/" className="back-link">
          ← Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page basket-page">
      <h1>Your basket</h1>
      <ul className="basket-list">
        {items.map((item) => (
          <li key={item.lineId} className="basket-item">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="basket-item-image" />
            ) : (
              <div className="basket-item-placeholder">No image</div>
            )}
            <div className="basket-item-details">
              <Link to={`/product/${item.id}`} className="basket-item-name">
                {item.name}
              </Link>
              <span className="basket-item-type">{item.type}</span>
              <p className="basket-item-options">
                {item.options.finish === "polished" ? "Polished" : "Heat soaked"} · {item.options.height} × {item.options.width} cm
              </p>
              <p className="basket-item-quantity">Quantity: {item.quantity}</p>
            </div>
            <button
              type="button"
              className="basket-item-remove"
              onClick={() => removeItem(item.lineId)}
              title="Remove from basket"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="basket-checkout">
        <h2>Complete your order</h2>
        {!user ? (
          <p className="checkout-login-prompt">
            <Link to="/login">Log in</Link> to complete your order. Your name, email, and phone number will be taken from your account.
          </p>
        ) : !hasRequiredDetails ? (
          <MissingDetailsForm
            currentName={customerName}
            currentPhone={customerPhone}
            onUpdate={updateProfile}
          />
        ) : (
          <>
            <p className="basket-checkout-intro">Order will be placed with your account details:</p>
            <div className="checkout-details">
              <p><strong>Name:</strong> {customerName}</p>
              <p><strong>Email:</strong> {customerEmail}</p>
              <p><strong>Phone:</strong> {customerPhone}</p>
            </div>
            {error && <p className="checkout-error">{error}</p>}
            <button
              type="button"
              className="checkout-submit"
              onClick={handleCompleteOrder}
              disabled={submitting}
            >
              {submitting ? "Placing order…" : "Complete order"}
            </button>
          </>
        )}
      </div>

      <div className="basket-summary">
        <Link to="/" className="continue-shopping">
          ← Continue shopping
        </Link>
      </div>
    </div>
  );
}
