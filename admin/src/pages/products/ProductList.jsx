import "../../assets/css/global.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8080/api";

function ProductList() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const normalizeProduct = (product) => ({
    ...product,
    id: Number(product.id),
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    featured:
      product.featured === true ||
      Number(product.featured) === 1,
    image:
      product.image ||
      product.image_url ||
      product.img ||
      "",
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/products`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Cannot load products."
        );
      }

      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : [];

      setProducts(
        productList.map(normalizeProduct)
      );
    } catch (error) {
      console.error(
        "Load products error:",
        error
      );

      setError(
        error.message ||
          "Cannot load products."
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) => {
      const keyword = search
        .trim()
        .toLowerCase();

      if (!keyword) {
        return true;
      }

      return [
        product.id,
        product.name,
        product.category,
        product.price,
        product.stock,
        product.description,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(keyword)
      );
    }
  );

  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `${API_URL}/products/${id}`,
        {
          method: "DELETE",
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete product."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const toggleFeatured = async (item) => {
    const nextFeatured = !item.featured;

    try {
      setUpdatingId(item.id);
      setError("");

      const response = await fetch(
        `${API_URL}/products/${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: item.name,
            category: item.category,
            price: Number(item.price),
            stock: Number(item.stock),
            description:
              item.description || "",
            image:
              item.image ||
              item.image_url ||
              "",
            featured: nextFeatured ? 1 : 0,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update featured status."
        );
      }

      const responseProduct =
        data.product || data;

      const updatedProduct =
        responseProduct?.id
          ? normalizeProduct(responseProduct)
          : {
              ...item,
              featured: nextFeatured,
            };

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === item.id
            ? updatedProduct
            : product
        )
      );
    } catch (error) {
      console.error(
        "Update featured error:",
        error
      );

      setError(
        error.message ||
          "Failed to update featured status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;

    event.currentTarget.src =
      "https://placehold.co/60x60?text=No+Image";
  };

  if (loading) {
    return (
      <div className="product-page">
        <h1>Products</h1>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-header">
        <div>
          <h1>Products</h1>

          <p>
            Total products: {products.length}
          </p>
        </div>

        <button
          type="button"
          className="btn-add"
          onClick={() =>
            navigate("/products/add")
          }
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "14px",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            backgroundColor: "#fef2f2",
            color: "#991b1b",
          }}
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={loadProducts}
            style={{ marginTop: "8px" }}
          >
            Try Again
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <input
          className="search-box"
          type="search"
          placeholder="Search product..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <button
          type="button"
          className="btn-edit"
          onClick={loadProducts}
        >
          Refresh
        </button>
      </div>

      <div
        className="products-table-wrapper"
        style={{ overflowX: "auto" }}
      >
        <table className="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => {
                const price = Number(
                  item.price || 0
                );

                const stock = Number(
                  item.stock || 0
                );

                const isUpdating =
                  updatingId === item.id;

                const isDeleting =
                  deletingId === item.id;

                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>

                    <td>
                      {
                        item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              backgroundColor: "#f0f0f0",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ccc",
                            }}
                          >
                            No Image
                          </div>
                        )
                      }
                    </td>

                    <td>
                      <strong>
                        {item.name}
                      </strong>
                    </td>

                    <td>
                      {item.category || "-"}
                    </td>

                    <td>
                      ${price.toFixed(2)}
                    </td>

                    <td>{stock}</td>

                    <td>
                      {stock > 10 ? (
                        <span
                          style={{
                            color: "green",
                            fontWeight: "bold",
                          }}
                        >
                          In Stock
                        </span>
                      ) : stock > 0 ? (
                        <span
                          style={{
                            color: "orange",
                            fontWeight: "bold",
                          }}
                        >
                          Low Stock
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "red",
                            fontWeight: "bold",
                          }}
                        >
                          Out of Stock
                        </span>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          toggleFeatured(item)
                        }
                        style={{
                          padding: "7px 10px",
                          borderRadius: "8px",
                          border:
                            "1px solid #9b7b5b",
                          background:
                            item.featured
                              ? "#8b6b4f"
                              : "transparent",
                          color: item.featured
                            ? "white"
                            : "#8b6b4f",
                          cursor: isUpdating
                            ? "not-allowed"
                            : "pointer",
                          fontWeight: "700",
                          opacity: isUpdating
                            ? 0.6
                            : 1,
                        }}
                      >
                        {isUpdating
                          ? "Updating..."
                          : item.featured
                            ? "★ Featured"
                            : "☆ Make Featured"}
                      </button>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() =>
                            navigate(
                              `/products/edit/${item.id}`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn-delete"
                          disabled={isDeleting}
                          onClick={() =>
                            deleteProduct(item.id)
                          }
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    padding: "30px",
                    textAlign: "center",
                  }}
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductList;