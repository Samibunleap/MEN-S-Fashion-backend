import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/css/addProduct.css";

const API = "http://localhost:8080/api";

function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState({ name: "", description: "" });

  useEffect(() => {
    fetch(`${API}/categories/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject("Not found"))
      .then((data) => setCategory({ name: data.name || "", description: data.description || "" }))
      .catch(() => alert("Category not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setCategory({ ...category, [e.target.name]: e.target.value });

  const updateCategory = async (e) => {
    e.preventDefault();
    if (!category.name.trim()) { alert("Category name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update category");
      alert("Category updated successfully!");
      navigate("/categories");
    } catch (err) {
      alert(err.message || "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "30px" }}>Loading...</div>;

  return (
    <div className="add-product-page">
      <div className="product-card">
        <h2>Edit Category</h2>
        <form onSubmit={updateCategory}>
          <div className="form-grid">
            <div className="form-group"><label>Category ID</label><input value={id} disabled /></div>
            <div className="form-group"><label>Category Name</label><input type="text" name="name" value={category.name} onChange={handleChange} required /></div>
            <div className="form-group full"><label>Description</label><textarea rows="4" name="description" value={category.description} onChange={handleChange} /></div>
          </div>
          <div className="buttons">
            <button type="button" className="btn-cancel" onClick={() => navigate("/categories")}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>{saving ? "Saving..." : "Update Category"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCategory;
