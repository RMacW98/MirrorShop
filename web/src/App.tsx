import { Routes, Route } from "react-router-dom";
import { BasketProvider } from "./context/BasketContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import BasketPage from "./pages/BasketPage";

export default function App() {
  return (
    <BasketProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="basket" element={<BasketPage />} />
        </Route>
      </Routes>
    </BasketProvider>
  );
}
