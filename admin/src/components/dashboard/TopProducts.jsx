import { useEffect, useState } from "react";
import "../../assets/css/dashboardNew.css";

const API = "http://localhost:8080/api";

function TopProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API}/dashboard`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && data.topProducts) {
          setProducts(data.topProducts);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="top-products-card">
      <div className="card-header"><h3>Top Products</h3></div>
      <div className="top-products-list">
        {products.length > 0 ? products.map((product) => (
          <div className="top-product-item" key={product.id}>
            <img src={product.image || "https://placehold.co/50x50?text=No+Image"} alt={product.name} />
            <div className="product-info">
              <h4>{product.name}</h4>
              <small>${product.price}</small>
            </div>
            <span className="stock-badge">{product.stock} in stock</span>
          </div>
        )) : (
          <p style={{ textAlign: "center", padding: "20px", color: "#777" }}>No products yet.</p>
        )}
      </div>
    </div>
  );
}

export default TopProducts;
