import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Mirror } from "../types/mirror";
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState<Mirror[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? "/api";
    fetch(`${apiUrl}/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading mirrors…</div>;
  if (error) return <div className="page error">Error: {error}</div>;

  return (
    <div className="page">
      <main className="product-grid">
        {products.map((mirror) => (
          <Link key={mirror.id} to={`/product/${mirror.id}`} className="product-card-link">
            <article className="product-card">
              <h2>{mirror.name}</h2>
              <span className="type">{mirror.type}</span>
              <p className="description">{mirror.description ?? "—"}</p>
            </article>
          </Link>
        ))}
      </main>
    </div>
  );
}
