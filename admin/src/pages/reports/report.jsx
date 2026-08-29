import SummaryCards from "./SummaryCards";
import TopProducts from "./TopProducts";
import RecentOrders from "./RecentOrders";
import RevenueSummary from "./RevenueSummary";

import "../../assets/css/report.css";

function Report() {
  return (
    <div className="report-page">

      {/* Header */}
      <div className="report-header">

        <div>
          <h1>Reports Dashboard</h1>
          <p>Dashboard / Reports</p>
        </div>

      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Main Grid */}

      <div className="report-main-grid">

        <TopProducts />

        <RecentOrders />

      </div>

      {/* Revenue Summary */}

      <RevenueSummary />

    </div>
  );
}

export default Report;