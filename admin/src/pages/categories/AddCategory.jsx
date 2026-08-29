import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/addProduct.css";

const API = "http://localhost:8080/api";

function AddCategory() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState({ name: "", description: "" });

  const handleChange = (e) => setCategory({ ...category, [e.target.name]: e.target.value });

  const addCategory = async (e) => {
    e.preventDefault();
    if (!category.name.trim()) { alert("Category name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add category");
      alert("Category added successfully!");
      navigate("/categories");
    } catch (err) {
      alert(err.message || "Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="product-card">
        <h2>Add Category</h2>
        <form onSubmit={addCategory}>
          <div className="form-grid">
            <div className="form-group">
              <label>Category Name</label>
              <input type="text" name="name" placeholder="e.g. Clothing" value={category.name} onChange={handleChange} required />
            </div>
            <div className="form-group full">
              <label>Description</label>
              <textarea rows="4" name="description" placeholder="Enter category description..." value={category.description} onChange={handleChange} />
            </div>
          </div>
          <div className="buttons">
            <button type="button" className="btn-cancel" onClick={() => navigate("/categories")}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>{saving ? "Saving..." : "Add Category"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCategory;
