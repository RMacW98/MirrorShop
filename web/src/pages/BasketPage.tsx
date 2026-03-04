import { Link } from "react-router-dom";
import { useBasket } from "../context/BasketContext";
import { FINISH_LABELS } from "../types/mirror";
import "./BasketPage.css";

export default function BasketPage() {
  const { items, removeItem, itemCount } = useBasket();


  if (itemCount === 0) {
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

  return (
    <div className="page basket-page">
      <h1>Your basket</h1>
      <ul className="basket-list">
        {items.map((item) => {
          const finishText =
            item.options.finishes.length > 0
              ? item.options.finishes
                  .map((finish) => FINISH_LABELS[finish])
                  .join(", ")
              : "No finish selected";

          return (
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
                  {finishText} · {item.options.height} × {item.options.width} cm
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
          );
        })}
      </ul>
      <div className="basket-summary">
        <Link to="/" className="continue-shopping">
          ← Continue shopping
        </Link>
      </div>
    </div>
  );
}
