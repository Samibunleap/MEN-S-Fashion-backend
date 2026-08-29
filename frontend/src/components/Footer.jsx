import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ openSizeModal }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="logo">MEN'S</div>
          <p>
            Modern menswear crafted
            <br />
            for the discerning gentleman.
          </p>
        </div>

        <div className="footer-section">
          <h3>Shop</h3>
          <ul className="list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/clothing">Clothing</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Customer Service</h3>
          <ul className="list">
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
            <li>
              <a
                href="#size-guide"
                onClick={(e) => {
                  e.preventDefault();
                  openSizeModal();
                }}
              >
                Size Guide
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <ul className="social-icons">
            <li>
              <a
                href="https://www.instagram.com/?hl=en"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-instagram"></i> Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-facebook"></i> Facebook
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-linkedin"></i> LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="marquee-wrapper">
          <div className="marquee-track">
            <span>
              Free Shipping on Orders Over $50 &nbsp;&#10022;&nbsp; New Autumn
              Collection Now Live &nbsp;&#10022;&nbsp; Free Returns on All
              Orders &nbsp;&#10022;&nbsp; Free Shipping on Orders Over $50
              &nbsp;&#10022;&nbsp; New Autumn Collection Now Live
              &nbsp;&#10022;&nbsp; Free Returns on All Orders &nbsp;&#10022;&nbsp;
            </span>
          </div>
        </div>
        <div className="footer-legal">MEN'S Fashion.</div>
      </div>
    </footer>
  );
}