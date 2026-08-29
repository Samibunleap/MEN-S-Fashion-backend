import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/addProduct.css";

const API_URL = "http://localhost:8080/api";

const initialProduct = {
  name: "",
  category: "Clothing",
  price: "",
  stock: "",
  description: "",
  image: "",
  featured: false,
};

function AddProduct() {
  const navigate = useNavigate();

  const [product, setProduct] =
    useState(initialProduct);

  const [categories, setCategories] =
    useState([]);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(
          `${API_URL}/categories`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Cannot load categories."
          );
        }

        setCategories(
          Array.isArray(data) ? data : []
        );
      } catch (requestError) {
        console.error(
          "Load categories error:",
          requestError
        );

        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setProduct((currentProduct) => ({
      ...currentProduct,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  const handleImage = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please choose an image file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError(
        "Please choose an image smaller than 4MB."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProduct((currentProduct) => ({
        ...currentProduct,
        image: String(reader.result || ""),
      }));

      setError("");
    };

    reader.onerror = () => {
      setError(
        "Could not read the selected image."
      );
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProduct((currentProduct) => ({
      ...currentProduct,
      image: "",
    }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    const name = product.name.trim();
    const category =
      product.category.trim();

    const price = Number(product.price);
    const stock = Number(product.stock);

    if (!name) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (!category) {
      setError(
        "Product category is required."
      );
      return;
    }

    if (
      product.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    if (
      product.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        "Stock must be a whole number equal to or greater than 0."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            category,
            price,
            stock,
            description:
              product.description.trim(),
            image: product.image || "",
            featured:
              Boolean(product.featured),
          }),
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
            "Failed to save product."
        );
      }

      setSuccess(
        "Product added successfully."
      );

      setProduct(initialProduct);

      window.setTimeout(() => {
        navigate("/products", {
          replace: true,
        });
      }, 600);
    } catch (requestError) {
      console.error(
        "Add product error:",
        requestError
      );

      setError(
        requestError.message ||
          "Could not save product. Make sure the backend is running."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="product-card">
        <div className="add-product-header">
          <div>
            <h2>Add New Product</h2>

            <p>
              Add a product to the MySQL
              catalog.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: "18px",
              padding: "12px 14px",
              border:
                "1px solid #fecaca",
              borderRadius: "8px",
              backgroundColor:
                "#fef2f2",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 14px",
              border:
                "1px solid #bbf7d0",
              borderRadius: "8px",
              backgroundColor:
                "#f0fdf4",
              color: "#166534",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={saveProduct}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">
                Product Name *
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Product name"
                value={product.name}
                onChange={handleChange}
                disabled={saving}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">
                Category *
              </label>

              <select
                id="category"
                name="category"
                value={product.category}
                onChange={handleChange}
                disabled={saving}
                required
              >
                <option value="">
                  Choose Category
                </option>

                {categories.length > 0 ? (
                  categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    )
                  )
                ) : (
                  <>
                    <option value="Clothing">
                      Clothing
                    </option>

                    <option value="Footwear">
                      Footwear
                    </option>

                    <option value="Accessories">
                      Accessories
                    </option>

                    <option value="Bags">
                      Bags
                    </option>

                    <option value="Jackets">
                      Jackets
                    </option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="price">
                Price ($) *
              </label>

              <input
                id="price"
                type="number"
                name="price"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={product.price}
                onChange={handleChange}
                disabled={saving}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">
                Stock *
              </label>

              <input
                id="stock"
                type="number"
                name="stock"
                min="0"
                step="1"
                placeholder="0"
                value={product.stock}
                onChange={handleChange}
                disabled={saving}
                required
              />

              <small>
                Enter a number greater than
                0 to show the product as in
                stock.
              </small>
            </div>

            <div className="form-group full">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                rows="6"
                name="description"
                placeholder="Product description"
                value={product.description}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="form-group full featured-field">
              <label className="featured-label">
                <input
                  type="checkbox"
                  name="featured"
                  checked={product.featured}
                  onChange={handleChange}
                  disabled={saving}
                />

                <span>
                  Show this product in
                  Featured / Trending Now
                </span>
              </label>

              <small>
                Enable this option to show
                the product on the website
                home page.
              </small>
            </div>

            <div className="form-group full">
              <label htmlFor="productImage">
                Product Image
              </label>

              <input
                id="productImage"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImage}
                disabled={saving}
              />

              <small>
                PNG, JPG or WebP. Maximum
                size: 4MB.
              </small>

              {product.image && (
                <div
                  style={{
                    marginTop: "14px",
                  }}
                >
                  <img
                    src={product.image}
                    alt="Product preview"
                    className="preview"
                    style={{
                      display: "block",
                      width: "180px",
                      height: "180px",
                      borderRadius: "10px",
                      objectFit: "cover",
                    }}
                  />

                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={removeImage}
                    disabled={saving}
                    style={{
                      marginTop: "10px",
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="buttons">
            <button
              type="button"
              className="btn-cancel"
              disabled={saving}
              onClick={() =>
                navigate("/products")
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-save"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;