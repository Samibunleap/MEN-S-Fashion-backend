import React from "react";

function Clothing({
  products = [],
  onSelectProduct = () => {},
  addToCart = () => {},
}) {
  const clothingProducts = Array.isArray(products)
    ? products
    : [];

  const getProductImage = (product) => {
    return (
      product.image_url ||
      product.image ||
      product.img ||
      "/image/product1.png"
    );
  };

  const formatPrice = (price) => {
    return Number(price || 0).toFixed(2);
  };

  const handleProductClick = (product) => {
    onSelectProduct(product);
  };

  const handleAddToCart = (
    event,
    product
  ) => {
    event.stopPropagation();

    if (Number(product.stock || 0) <= 0) {
      return;
    }

    addToCart(product.id, "M");
  };

  return (
    <main className="clothing-page">
      {/* Page hero */}
      <section className="page-hero">
        <div className="page-hero-overlay" />

        <div className="page-hero-text">
          <span className="section-label">
            Shop
          </span>

          <h1>Clothing</h1>
        </div>
      </section>

      {/* Shop layout */}
      <section className="shop-layout">
        <div className="shop-grid-wrap">
          <div className="shop-toolbar">
            <span className="shop-count">
              Showing{" "}
              {clothingProducts.length}{" "}
              products
            </span>
          </div>

          <div className="shop-product-grid">
            {clothingProducts.length > 0 ? (
              clothingProducts.map(
                (product) => {
                  const stock = Number(
                    product.stock || 0
                  );

                  const isOutOfStock =
                    stock <= 0;

                  return (
                    <article
                      key={product.id}
                      className="product-card"
                      onClick={() =>
                        handleProductClick(
                          product
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                            "Enter" ||
                          event.key === " "
                        ) {
                          handleProductClick(
                            product
                          );
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="product-card-image-wrap">
                        <img
                          src={getProductImage(product)}
                          alt={product.name || "Product"}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/image/product1.png";
                          }}
                        />

                        {Boolean(
                          Number(
                            product.featured
                          )
                        ) && (
                          <span className="product-featured-badge">
                            Featured
                          </span>
                        )}

                        {isOutOfStock && (
                          <span className="product-stock-badge">
                            Out of stock
                          </span>
                        )}

                        <div className="product-hover">
                          <button
                            type="button"
                            className="product-add-button"
                            disabled={
                              isOutOfStock
                            }
                            onClick={(event) =>
                              handleAddToCart(
                                event,
                                product
                              )
                            }
                          >
                            {isOutOfStock
                              ? "Out of Stock"
                              : "+ Add to Bag"}
                          </button>
                        </div>
                      </div>

                      <div className="product-card-content">
                        <span className="product-card-category">
                          {product.category ||
                            product.cat ||
                            "Fashion"}
                        </span>

                        <h3>
                          {product.name ||
                            "Product"}
                        </h3>

                        <div className="product-card-bottom">
                          <p className="product-card-price">
                            $
                            {formatPrice(
                              product.price
                            )}
                          </p>

                          <span
                            className={
                              isOutOfStock
                                ? "product-card-stock out"
                                : "product-card-stock"
                            }
                          >
                            {isOutOfStock
                              ? "Unavailable"
                              : `${stock} in stock`}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                }
              )
            ) : (
              <div className="shop-empty-state">
                <h2>
                  No products found
                </h2>

                <p>
                  Products will appear here
                  when they are available.
                </p>
              </div>
            )}  
          </div>
        </div>
      </section>
    </main>
  );
}

export default Clothing;