import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../assets/css/report.css";

const API = "http://localhost:8080/api";

function TopProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API}/products`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setProducts(data.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="report-card-large">
      <div className="card-title">
        <h3>Top Products</h3>
        <button className="view-all" onClick={() => navigate("/products")}>View All</button>
      </div>
      <table className="report-table">
        <thead><tr><th>Image</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
        <tbody>
          {products.length > 0 ? products.map((product) => (
            <tr key={product.id}>
              <td><img src={product.image || "https://placehold.co/55x55?text=No+Image"} alt={product.name} className="product-image" /></td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>${Number(product.price).toFixed(2)}</td>
              <td>{product.stock}</td>
            </tr>
          )) : (
            <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No products yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TopProducts;
