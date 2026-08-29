import { useEffect, useState } from "react";
import "../../assets/css/report.css";

const API = "http://localhost:8080/api";

function SummaryCards() {
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0 });

  useEffect(() => {
    fetch(`${API}/dashboard`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setStats({ revenue: data.revenue || 0, totalOrders: data.totalOrders || 0, totalCustomers: data.totalCustomers || 0, totalProducts: data.totalProducts || 0 });
      })
      .catch(() => {});
  }, []);

  const cards = [
    { title: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, color: "#16a34a" },
    { title: "Total Orders", value: stats.totalOrders.toLocaleString(), color: "#2563eb" },
    { title: "Customers", value: stats.totalCustomers.toLocaleString(), color: "#7c3aed" },
    { title: "Products", value: stats.totalProducts.toLocaleString(), color: "#f59e0b" },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card, index) => (
        <div key={index} className="summary-card" style={{ borderTop: `5px solid ${card.color}` }}>
          <h4>{card.title}</h4>
          <h2>{card.value}</h2>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
