import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../assets/css/addProduct.css";

const API = "http://localhost:8080/api";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/products/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: "30px" }}>Loading...</div>;
  if (!product) return <div style={{ padding: "30px" }}><h2>Product Not Found</h2></div>;

  return (
    <div className="add-product-page">
      <div className="product-card">
        <h2>Product Detail</h2>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "40px", marginTop: "30px" }}>
          <img
            src={product.image || "https://placehold.co/300x300?text=No+Image"}
            alt={product.name}
            style={{ width: "100%", borderRadius: "15px", border: "1px solid #ddd", objectFit: "cover" }}
          />
          <div>
            <h2>{product.name}</h2>
            <p><strong>ID:</strong> {product.id}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Price:</strong> ${product.price}</p>
            <p><strong>Stock:</strong> {product.stock}</p>
            <p><strong>Featured:</strong> {product.featured ? "Yes" : "No"}</p>
            <p><strong>Description:</strong></p>
            <p>{product.description || "No description"}</p>
            <div style={{ marginTop: "30px" }}>
              <button className="btn-save" onClick={() => navigate(`/products/edit/${product.id}`)}>Edit Product</button>
              <button className="btn-cancel" style={{ marginLeft: "15px" }} onClick={() => navigate("/products")}>Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
