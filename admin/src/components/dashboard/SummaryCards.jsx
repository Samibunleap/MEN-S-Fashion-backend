import { useEffect, useState } from "react";
import "../../assets/css/dashboardNew.css";

const API = "http://localhost:8080/api";

function SummaryCards() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    fetch(`${API}/dashboard`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setStats({
            totalOrders: data.totalOrders || 0,
            revenue: data.revenue || 0,
            totalCustomers: data.totalCustomers || 0,
            totalProducts: data.totalProducts || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const cards = [
    { title: "Total Orders", value: stats.totalOrders.toLocaleString(), icon: "FaShoppingBag", color: "" },
    { title: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: "FaDollarSign", color: "" },
    { title: "Total Customers", value: stats.totalCustomers.toLocaleString(), icon: "FaUsers", color: "" },
    { title: "Total Products", value: stats.totalProducts.toLocaleString(), icon: "FaBoxOpen", color: "" },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card, index) => (
        <div className="summary-card" key={index}>
          <div className="summary-icon" style={{ background: card.color }}>
            {card.icon === "FaShoppingBag" ? <i className="fas fa-shopping-bag"></i> :
             card.icon === "FaDollarSign" ? <i className="fas fa-dollar-sign"></i> :
             card.icon === "FaUsers" ? <i className="fas fa-users"></i> :
             <i className="fas fa-box-open"></i>}
          </div>
          <div className="summary-content">
            <h4>{card.title}</h4>
            <h2>{card.value}</h2>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
