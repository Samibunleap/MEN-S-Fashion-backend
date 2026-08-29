import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "../../assets/css/dashboardNew.css";

const API = "http://localhost:8080/api";

function SalesChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${API}/dashboard`)
      .then((r) => r.ok ? r.json() : null)
      .then((result) => {
        if (result && result.salesData) {
          setData(result.salesData);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="chart-card">
      <div className="card-header"><h3>Sales Overview</h3><button className="view-all">Monthly</button></div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="#7b553c" strokeWidth={4} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesChart;
