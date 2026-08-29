import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/css/addProduct.css";

const API = "http://localhost:8080/api";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState({ name: "", category: "Clothing", price: "", stock: "", description: "", image: "", featured: false });

  useEffect(() => {
    fetch(`${API}/products/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject("Not found"))
      .then((data) => {
        setProduct({
          name: data.name || "",
          category: data.category || "Clothing",
          price: data.price || "",
          stock: data.stock || "",
          description: data.description || "",
          image: data.image || "",
          featured: data.featured || false,
        });
      })
      .catch(() => alert("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please choose an image file."); return; }
    if (file.size > 4 * 1024 * 1024) { alert("Please choose an image smaller than 4MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setProduct((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, price: Number(product.price), stock: Number(product.stock) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      alert("Product updated successfully!");
      navigate("/products");
    } catch (err) {
      alert(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "30px" }}>Loading...</div>;

  return (
    <div className="add-product-page">
      <div className="product-card">
        <h2>Edit Product</h2>
        <form onSubmit={updateProduct}>
          <div className="form-grid">
            <div className="form-group"><label>Product ID</label><input value={id} disabled /></div>
            <div className="form-group"><label>Product Name</label><input type="text" name="name" value={product.name} onChange={handleChange} required /></div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={product.category} onChange={handleChange}>
                <option value="Clothing">Clothing</option>
                <option value="Shoes">Shoes</option>
                <option value="Jacket">Jacket</option>
                <option value="Accessories">Accessories</option>
                <option value="Bags">Bags</option>
              </select>
            </div>
            <div className="form-group"><label>Price ($)</label><input type="number" min="0" step="0.01" name="price" value={product.price} onChange={handleChange} required /></div>
            <div className="form-group"><label>Stock</label><input type="number" min="0" name="stock" value={product.stock} onChange={handleChange} required /></div>
            <div className="form-group full"><label>Description</label><textarea rows="6" name="description" value={product.description} onChange={handleChange} /></div>
            <div className="form-group full featured-field">
              <label className="featured-label">
                <input type="checkbox" checked={product.featured} onChange={(e) => setProduct((prev) => ({ ...prev, featured: e.target.checked }))} />
                <span>Show this product in Featured / Trending Now</span>
              </label>
            </div>
            <div className="form-group full"><label>Product Image</label><input type="file" accept="image/*" onChange={handleImage} />
              {product.image && <img src={product.image} alt="Preview" className="preview" />}
            </div>
          </div>
          <div className="buttons">
            <button type="button" className="btn-cancel" onClick={() => navigate("/products")}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>{saving ? "Saving..." : "Update Product"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
