import { useEffect, useState } from "react";
import "../../assets/css/dashboardNew.css";

const API = "http://localhost:8080/api";

function LowStock() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API}/dashboard`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && data.lowStockProducts) {
          setProducts(data.lowStockProducts);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="low-stock-card">
      <div className="card-header">
        <h3>Low Stock Alert</h3>
      </div>
      <div className="low-stock-list">
        {products.length > 0 ? products.map((product) => (
          <div className="low-stock-item" key={product.id}>
            <img src={product.image || "https://placehold.co/50x50?text=No+Image"} alt={product.name} />
            <div className="low-stock-info">
              <h4>{product.name}</h4>
              <small>Remaining Stock</small>
            </div>
            <span className="stock-badge">{product.stock} Left</span>
          </div>
        )) : (
          <p style={{ textAlign: "center", padding: "20px", color: "#777" }}>No low stock products.</p>
        )}
      </div>
    </div>
  );
}

export default LowStock;
