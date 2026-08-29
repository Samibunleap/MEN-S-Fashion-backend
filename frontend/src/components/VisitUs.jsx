import React from 'react';
import "../App.css";

export default function VisitUs() {
  return (
    <section className="visit-us-section">
      <div className="visit-us-container">
        
        {/* ផ្នែកព័ត៌មាន (ខាងឆ្វេង) */}
        <div className="visit-us-info">
          <span className="sub-title">VISIT US</span>
          <h2>Our MEN'S Fashion</h2>
          
          <div className="info-item">
            <h3>MEN'S Fashion — Phnom Penh</h3>
            <p>
              Russian Federation Blvd (110),<br />
              Phnom Penh 120404
            </p>
          </div>

          <div className="info-item">
            <h3>Store Hours</h3>
            <p>
              Mon–Sat: 10:00am – 8:00pm<br />
              Sunday: 11:00am – 6:00pm
            </p>
          </div>

          <div className="info-item">
            <h3>Store Direct</h3>
            <p>+855 962702059</p>
          </div>

          <a 
            href="https://maps.google.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="directions-btn"
          >
            GET DIRECTIONS ↗
          </a>
        </div>

        {/* ផ្នែក Google Map (ខាងស្តាំ) */}
        <div className="visit-us-map">
          <iframe
            title="Store Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.773138837119!2d104.88595!3d11.5681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDM0JzA1LjIiTiAxMDTQwrA1MycxMTAuOCJF!5e0!3m2!1sen!2skh!4v1600000000000!5m2!1sen!2skh"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

      </div>
    </section>
  );
}