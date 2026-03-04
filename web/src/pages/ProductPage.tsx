import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useBasket } from "../context/BasketContext";
import type { Mirror, MirrorFinish, MirrorOptions } from "../types/mirror";
import "./ProductPage.css";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useBasket();
  const [mirror, setMirror] = useState<Mirror | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [finish, setFinish] = useState<MirrorFinish>("polished");
  const [height, setHeight] = useState(60);
  const [width, setWidth] = useState(40);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    const apiUrl = import.meta.env.VITE_API_URL ?? "/api";
    fetch(`${apiUrl}/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then(setMirror)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToBasket = () => {
    if (!mirror) return;
    const options: MirrorOptions = { finish, height, width };
    addItem(mirror, options, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) return <div className="page">Loading…</div>;
  if (error || !mirror) {
    return (
      <div className="page error">
        <p>{error ?? "Product not found"}</p>
        <Link to="/">← Back to Mirror Shop</Link>
      </div>
    );
  }

  return (
    <div className="page product-page">
      <Link to="/" className="back-link">
        ← Back to all mirrors
      </Link>
      <article className="product-detail">
        {mirror.imageUrl ? (
          <img src={mirror.imageUrl} alt={mirror.name} className="product-image" />
        ) : (
          <div className="product-image-placeholder">
            <span>No image</span>
          </div>
        )}
        <div className="product-info">
          <span className="product-type">{mirror.type}</span>
          <h1>{mirror.name}</h1>
          <p className="product-description">{mirror.description ?? "—"}</p>

          <div className="product-options">
            <label className="product-option">
              <span className="product-option-label">Finish</span>
              <select
                value={finish}
                onChange={(e) => setFinish(e.target.value as MirrorFinish)}
                className="product-option-select"
              >
                <option value="polished">Polished</option>
                <option value="heat-soaked">Heat soaked</option>
              </select>
            </label>
            <div className="product-option product-option-size">
              <span className="product-option-label">Size (cm)</span>
              <div className="product-option-size-inputs">
                <label>
                  <span className="product-option-size-label">Height</span>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value) || 60)}
                    className="product-option-input"
                  />
                </label>
                <label>
                  <span className="product-option-size-label">Width</span>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value) || 40)}
                    className="product-option-input"
                  />
                </label>
              </div>
            </div>
            <label className="product-option">
              <span className="product-option-label">Quantity</span>
              <input
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                className="product-option-input"
              />
            </label>
          </div>

          <button
            type="button"
            className={`add-to-basket ${added ? "added" : ""}`}
            onClick={handleAddToBasket}
            disabled={added}
          >
            {added ? "Added to basket ✓" : "Add to basket"}
          </button>
        </div>
      </article>
    </div>
  );
}
