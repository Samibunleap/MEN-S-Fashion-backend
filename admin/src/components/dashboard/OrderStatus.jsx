import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "../../assets/css/dashboardNew.css";

const API = "http://localhost:8080/api";

function OrderStatus() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${API}/dashboard`)
      .then((r) => r.ok ? r.json() : null)
      .then((result) => {
        if (result) {
          const chartData = [
            { name: "Delivered", value: result.delivered || 0 },
            { name: "Processing", value: result.preparing || 0 },
            { name: "Shipping", value: result.shipping || 0 },
            { name: "Cancelled", value: result.cancelled || 0 },
          ].filter(d => d.value > 0);
          setData(chartData.length > 0 ? chartData : [{ name: "No orders", value: 1 }]);
        }
      })
      .catch(() => {});
  }, []);

  const COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444"];

  return (
    <div className="order-status-card">
      <div className="card-header"><h3>Order Status</h3></div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="status-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <span className="legend-color" style={{ background: COLORS[index % COLORS.length] }}></span>
            <p>{item.name} ({item.value})</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderStatus;
