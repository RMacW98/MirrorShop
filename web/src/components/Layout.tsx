import { Outlet, Link } from "react-router-dom";
import { useBasket } from "../context/BasketContext";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

export default function Layout() {
  const { itemCount } = useBasket();
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-left">
          <Link to="/basket" className="basket-button" title="View basket">
            🛒 Basket ({itemCount})
          </Link>
          {user ? (
            <button type="button" className="auth-button" onClick={logout}>
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="auth-link">Log in</Link>
              <Link to="/register" className="auth-link">Register</Link>
            </>
          )}
        </div>
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
