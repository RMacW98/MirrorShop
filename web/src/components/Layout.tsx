import { Outlet, Link } from "react-router-dom";
import { useBasket } from "../context/BasketContext";
import "./Layout.css";

export default function Layout() {
  const { itemCount } = useBasket();

  return (
    <div className="layout">
      <header className="layout-header">
        <Link to="/basket" className="basket-button" title="View basket">
          🛒 Basket ({itemCount})
        </Link>
        <Link to="/" className="layout-title">
          <h1>Mirror Shop</h1>
          <p>Reflecting style for every space</p>
        </Link>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
