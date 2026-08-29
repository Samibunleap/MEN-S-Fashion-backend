import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/global.css";

const API = "http://localhost:8080/api";

function CategoryList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const filteredCategories = categories.filter((category) => {
    const keyword = search.toLowerCase();
    return (
      (category.name || "").toLowerCase().includes(keyword) ||
      (category.description || "").toLowerCase().includes(keyword)
    );
  });

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res = await fetch(`${API}/categories/${id}`, { method: "DELETE" });
      if (res.ok) setCategories(categories.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete category");
    }
  };

  return (
    <div className="product-page">
      <div className="product-header">
        <h1>Categories</h1>
        <button className="btn-add" onClick={() => navigate("/categories/add")}>+ Add Category</button>
      </div>

      <input className="search-box" placeholder="Search category..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading categories...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="product-table">
            <thead>
              <tr><th>ID</th><th>Category</th><th>Description</th><th width="220">Action</th></tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{category.description || "-"}</td>
                  <td className="action-buttons">
                    <button className="btn-edit" onClick={() => navigate(`/categories/edit/${category.id}`)}>Edit</button>
                    <button className="btn-delete" onClick={() => deleteCategory(category.id)}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No categories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CategoryList;
