import { useEffect, useState } from "react";
import "../../assets/css/report.css";

const API = "http://localhost:8080/api";

function RevenueSummary() {
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    fetch(`${API}/dashboard`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setRevenue(data.revenue || 0);
      })
      .catch(() => {});
  }, []);

  const summary = [
    { title: "Total Revenue", amount: `$${revenue.toLocaleString()}`, color: "#16a34a" },
    { title: "This Month", amount: `$${(revenue * 0.3).toFixed(2)}`, color: "#2563eb" },
    { title: "Average Order", amount: `$${revenue > 0 ? (revenue / 10).toFixed(2) : "0.00"}`, color: "#7b553c" },
  ];

  return (
    <div className="revenue-section">
      <h2 className="section-title">Revenue Summary</h2>
      <div className="revenue-grid">
        {summary.map((item, index) => (
          <div key={index} className="revenue-card" style={{ borderLeft: `6px solid ${item.color}` }}>
            <h4>{item.title}</h4>
            <h2>{item.amount}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RevenueSummary;
