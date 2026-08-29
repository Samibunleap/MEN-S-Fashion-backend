import "../../assets/css/dashboardNew.css";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import SummaryCards from "../../components/dashboard/SummaryCards";
import SalesChart from "../../components/dashboard/SalesChart";
import TopProducts from "../../components/dashboard/TopProducts";
import RecentOrders from "../../components/dashboard/RecentOrders";
import OrderStatus from "../../components/dashboard/OrderStatus";
import LowStock from "../../components/dashboard/LowStock";

function Dashboard() {
  return (
    <div className="dashboard-page">

      <DashboardHeader />

      <SummaryCards />

      <div className="dashboard-grid">

        <SalesChart />

        <TopProducts />

      </div>

      <div className="dashboard-grid">

        <RecentOrders />

        <OrderStatus />

      </div>

      <LowStock />

    </div>
  );
}

export default Dashboard;