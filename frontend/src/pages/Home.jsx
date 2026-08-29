import React from 'react';
import { Link } from 'react-router-dom';

export default function Home({ products = [], onSelectProduct, addToCart }) {
  // Only products selected as Featured in the Admin Dashboard appear here.
  const trending = Array.isArray(products)
    ? products.filter((product) => product.source === 'admin' && product.featured === true).slice(0, 8)
    : [];

  return (
    <main>
     {/* Hero Banner Section */}
<section className="hero hero-wrap-offset">
  <div className="hero-overlay" />

  <div className="hero-text">
    <span className="hero-eyebrow">
      New Season • 2026
    </span>

    <h1>
      Define
      <br />
      <em>Your Style</em>
    </h1>

    <p>
      Modern Menswear for Every Occasion
    </p>

    <div className="buttons">
      <Link
        to="/clothing"
        className="btn-primary"
      >
        Shop Now
      </Link>

      <a href="#new-trending" className="btn-outline">
        New Trending
      </a>
    </div>
  </div>
</section>
      {/* Essentials Category Section */}
      <section className="essentials">
        <div className="section-header">
          <span className="section-label">Collections</span>
          <h2>Essentials</h2>
        </div>
        <div className="card-container">
          <Link to="/clothing" className="card">
            <div className="card-img-wrap">
              <img src="/image/Smart Casual Blazer.png" alt="Smart Casual Blazer" />
              <div className="card-hover-btn">Explore</div>
            </div>
            <p>Smart Casual Blazer</p>
          </Link>

          <Link to="/clothing" className="card">
            <div className="card-img-wrap">
              <img src="/image/Half-Zip Knit Sweater.jpg" alt="Half-Zip Knit Sweater" />
              <div className="card-hover-btn">Explore</div>
            </div>
            <p>Half-Zip Knit Sweater</p>
          </Link>

          <Link to="/clothing" className="card">
            <div className="card-img-wrap">
              <img src="/image/Canvas Tote Bag.png" alt="Canvas Tote Bag" />
              <div className="card-hover-btn">Explore</div>
            </div>
            <p>Canvas Tote Bag</p>
          </Link>

          <Link to="/clothing" className="card">
            <div className="card-img-wrap">
              <img src="/image/Chronograph Watch.png" alt="Chronograph Watch" />
              <div className="card-hover-btn">Explore</div>
            </div>
            <p>Chronograph Watch</p>
          </Link>
        </div>
      </section>

      {/* Trending Products Grid */}
<section
  className="home-trending"
  id="new-trending"
>
  <div className="home-section-heading">
    <span>Featured</span>
    <h2>Trending Now</h2>
  </div>

  {trending.length > 0 ? (
    <div className="home-trending-grid">
      {trending.map((product) => (
        <article
          key={product.id}
          className="home-product-card"
          role="button"
          tabIndex={0}
          onClick={() => {
            if (onSelectProduct) {
              onSelectProduct(product);
            }
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();

              if (onSelectProduct) {
                onSelectProduct(product);
              }
            }
          }}
        >
          <div className="home-product-image">
            <img
              src={product.image}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src =
                  "/image/product1.png";
              }}
            />

            <span className="home-featured-label">
              Featured
            </span>

            <div className="home-product-actions">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  if (addToCart) {
                    addToCart(product.id, "M");
                  }
                }}
              >
                + Add to Bag
              </button>
            </div>
          </div>

          <div className="home-product-content">
            <span className="home-product-category">
              {product.category ||
                product.cat ||
                "Fashion"}
            </span>

            <h3>
              {product.name || "Product"}
            </h3>

            <p className="home-product-price">
              $
              {Number(
                product.price || 0
              ).toFixed(2)}
            </p>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <div className="home-empty-featured">
      <h3>No featured products yet</h3>

      <p>
        Select products as Featured in the
        Admin Dashboard.
      </p>

      <Link to="/clothing">
        View All Products
      </Link>
    </div>
  )}
</section>
    </main>
  );
}