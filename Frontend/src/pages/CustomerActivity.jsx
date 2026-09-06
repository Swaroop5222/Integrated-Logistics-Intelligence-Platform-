import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./CustomerActivity.css";

const customerData = [
  {
    id: "CUS-001",
    name: "Arjun Electronics",
    email: "arjun@electronics.com",
    shipments: 24,
    active: 6,
    delivered: 17,
    lastActivity: "Today, 10:42 AM",
    status: "Active",
  },
  {
    id: "CUS-002",
    name: "Metro Retail",
    email: "contact@metroretail.com",
    shipments: 19,
    active: 4,
    delivered: 14,
    lastActivity: "Today, 09:18 AM",
    status: "Active",
  },
  {
    id: "CUS-003",
    name: "Nova Fashion",
    email: "orders@novafashion.com",
    shipments: 16,
    active: 3,
    delivered: 12,
    lastActivity: "Yesterday, 06:32 PM",
    status: "Active",
  },
  {
    id: "CUS-004",
    name: "GreenMart Supplies",
    email: "admin@greenmart.com",
    shipments: 13,
    active: 2,
    delivered: 10,
    lastActivity: "Yesterday, 04:21 PM",
    status: "Active",
  },
  {
    id: "CUS-005",
    name: "TechZone India",
    email: "logistics@techzone.in",
    shipments: 11,
    active: 3,
    delivered: 7,
    lastActivity: "Aug 30, 03:45 PM",
    status: "Active",
  },
  {
    id: "CUS-006",
    name: "Urban Furniture",
    email: "dispatch@urbanfurniture.in",
    shipments: 9,
    active: 1,
    delivered: 7,
    lastActivity: "Aug 29, 11:20 AM",
    status: "Inactive",
  },
];

const activityData = [
  {
    type: "Shipment Created",
    customer: "Arjun Electronics",
    description: "Created shipment TRK-2026-105",
    time: "10 min ago",
  },
  {
    type: "Tracking Viewed",
    customer: "Metro Retail",
    description: "Checked shipment TRK-2026-102",
    time: "24 min ago",
  },
  {
    type: "Shipment Delivered",
    customer: "Nova Fashion",
    description: "Shipment TRK-2026-098 delivered successfully",
    time: "1 hr ago",
  },
  {
    type: "Shipment Created",
    customer: "GreenMart Supplies",
    description: "Created shipment TRK-2026-104",
    time: "2 hrs ago",
  },
  {
    type: "Tracking Viewed",
    customer: "TechZone India",
    description: "Checked shipment TRK-2026-101",
    time: "3 hrs ago",
  },
];

function CustomerActivity() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredCustomers = useMemo(() => {
    return customerData.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        customer.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="customer-activity-page">

      {/* SIDEBAR */}
      <aside className="business-sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">S</div>

          <div>
            <h2>ShipTrack</h2>
            <span>Business Portal</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">BUSINESS</p>

          <Link
            to="/dashboard/business"
            className="business-nav-link"
          >
            <span className="nav-icon">⌂</span>
            Overview
          </Link>

          <Link
            to="/business/create-shipment"
            className="business-nav-link"
          >
            <span className="nav-icon">＋</span>
            Create Shipment
          </Link>

          <Link
            to="/business/shipment-management"
            className="business-nav-link"
          >
            <span className="nav-icon">▣</span>
            Shipment Management
          </Link>

          <Link
            to="/business/shipment-history"
            className="business-nav-link"
          >
            <span className="nav-icon">◷</span>
            Shipment History
          </Link>

          <Link
            to="/business/package-information"
            className="business-nav-link"
          >
            <span className="nav-icon">□</span>
            Package Information
          </Link>

          <Link
            to="/business/tracking"
            className="business-nav-link"
          >
            <span className="nav-icon">⌖</span>
            Tracking
          </Link>

          <Link
            to="/business/delivery-performance"
            className="business-nav-link"
          >
            <span className="nav-icon">↗</span>
            Delivery Performance
          </Link>

          <Link
            to="/business/delay-analysis"
            className="business-nav-link"
          >
            <span className="nav-icon">△</span>
            Delay Analysis
          </Link>

          <Link
            to="/business/logistics-overview"
            className="business-nav-link"
          >
            <span className="nav-icon">◈</span>
            Logistics Overview
          </Link>

          <Link
            to="/business/customer-activity"
            className="business-nav-link active"
          >
            <span className="nav-icon">♙</span>
            Customer Activity
          </Link>

          <Link
            to="/business/reports"
            className="business-nav-link"
          >
            <span className="nav-icon">▤</span>
            Reports & Export
          </Link>

          <Link
            to="/business/notifications"
            className="business-nav-link"
          >
            <span className="nav-icon">♢</span>
            Notifications
          </Link>
        </div>

        <div className="sidebar-bottom">

          <div className="business-status">
            <span className="status-dot"></span>

            <div>
              <strong>System Operational</strong>
              <small>All services running</small>
            </div>
          </div>

          <Link to="/login" className="business-logout">
            <span>↪</span>
            Logout
          </Link>

        </div>
      </aside>

      {/* MAIN */}
      <main className="customer-activity-main">

        {/* HEADER */}
        <header className="activity-topbar">

          <div>
            <span className="breadcrumb">
              Business Client / Customer Activity
            </span>

            <h1>Customer Activity</h1>

            <p>
              Monitor customer shipment activity and engagement across your
              logistics network.
            </p>
          </div>

          <div className="topbar-right">

            <button className="topbar-notification">
              ♢
              <span>3</span>
            </button>

            <div className="business-user">

              <div className="user-avatar">
                BC
              </div>

              <div>
                <strong>Business Client</strong>
                <small>Operations Manager</small>
              </div>

            </div>

          </div>
        </header>

        {/* STATS */}
        <section className="activity-stats">

          <div className="activity-stat-card orange">
            <div className="activity-stat-top">
              <span>Total Customers</span>
              <div className="activity-stat-icon">♙</div>
            </div>

            <h2>86</h2>

            <div className="activity-change positive">
              ↑ 8.4%
              <span>vs last month</span>
            </div>
          </div>

          <div className="activity-stat-card purple">
            <div className="activity-stat-top">
              <span>Active Customers</span>
              <div className="activity-stat-icon">●</div>
            </div>

            <h2>71</h2>

            <div className="activity-change positive">
              ↑ 5.7%
              <span>this month</span>
            </div>
          </div>

          <div className="activity-stat-card cyan">
            <div className="activity-stat-top">
              <span>Active Shipments</span>
              <div className="activity-stat-icon">▣</div>
            </div>

            <h2>46</h2>

            <div className="activity-change">
              <span>Across all customers</span>
            </div>
          </div>

          <div className="activity-stat-card green">
            <div className="activity-stat-top">
              <span>Customer Engagement</span>
              <div className="activity-stat-icon">↗</div>
            </div>

            <h2>84.2%</h2>

            <div className="activity-change positive">
              ↑ 4.8%
              <span>this month</span>
            </div>
          </div>

        </section>

        {/* MAIN GRID */}
        <section className="activity-grid">

          {/* CUSTOMER TABLE */}
          <div className="activity-card customers-card">

            <div className="activity-card-header">

              <div>
                <h3>Customer Overview</h3>
                <p>
                  Shipment activity and engagement by customer
                </p>
              </div>

              <span className="customer-count">
                {filteredCustomers.length} Customers
              </span>

            </div>

            {/* FILTERS */}
            <div className="customer-filters">

              <div className="activity-search">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

            </div>

            {/* TABLE */}
            <div className="customer-table-wrapper">

              <table className="customer-table">

                <thead>
                  <tr>
                    <th>CUSTOMER</th>
                    <th>SHIPMENTS</th>
                    <th>ACTIVE</th>
                    <th>DELIVERED</th>
                    <th>LAST ACTIVITY</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>

                      <td>
                        <div className="customer-name">

                          <div className="customer-avatar">
                            {customer.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)}
                          </div>

                          <div>
                            <strong>{customer.name}</strong>
                            <span>{customer.email}</span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <strong className="shipment-number">
                          {customer.shipments}
                        </strong>
                      </td>

                      <td>
                        <strong className="active-number">
                          {customer.active}
                        </strong>
                      </td>

                      <td>
                        <strong className="delivered-number">
                          {customer.delivered}
                        </strong>
                      </td>

                      <td>
                        <span className="last-activity">
                          {customer.lastActivity}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            customer.status === "Active"
                              ? "customer-status active-status"
                              : "customer-status inactive-status"
                          }
                        >
                          {customer.status}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

              {filteredCustomers.length === 0 && (
                <div className="customer-empty">
                  <div>⌕</div>
                  <strong>No customers found</strong>
                  <span>
                    Try changing your search or filter.
                  </span>
                </div>
              )}

            </div>

          </div>

          {/* RECENT ACTIVITY */}
          <div className="activity-card recent-card">

            <div className="activity-card-header">

              <div>
                <h3>Recent Activity</h3>
                <p>Latest customer actions</p>
              </div>

              <span className="live-badge">
                <span></span>
                LIVE
              </span>

            </div>

            <div className="recent-activity-list">

              {activityData.map((activity, index) => (
                <div
                  className="recent-activity-item"
                  key={index}
                >

                  <div
                    className={
                      activity.type === "Shipment Delivered"
                        ? "recent-icon delivered-icon"
                        : activity.type === "Shipment Created"
                        ? "recent-icon created-icon"
                        : "recent-icon tracking-icon"
                    }
                  >
                    {activity.type === "Shipment Delivered"
                      ? "✓"
                      : activity.type === "Shipment Created"
                      ? "+"
                      : "⌖"}
                  </div>

                  <div className="recent-content">

                    <strong>
                      {activity.type}
                    </strong>

                    <span>
                      {activity.customer}
                    </span>

                    <p>
                      {activity.description}
                    </p>

                    <small>
                      {activity.time}
                    </small>

                  </div>

                </div>
              ))}

            </div>

          </div>

        </section>

        {/* CUSTOMER ENGAGEMENT */}
        <section className="activity-card engagement-card">

          <div className="activity-card-header">

            <div>
              <h3>Customer Engagement</h3>
              <p>
                Understand how customers interact with your logistics
                platform.
              </p>
            </div>

          </div>

          <div className="engagement-grid">

            <div className="engagement-item">

              <div className="engagement-icon orange-engagement">
                ⌖
              </div>

              <div className="engagement-info">
                <strong>Tracking Activity</strong>

                <p>
                  Customers checking shipment status
                </p>

                <div className="engagement-progress">
                  <div style={{ width: "82%" }}></div>
                </div>

                <span>82%</span>
              </div>

            </div>

            <div className="engagement-item">

              <div className="engagement-icon purple-engagement">
                ▣
              </div>

              <div className="engagement-info">
                <strong>Shipment Creation</strong>

                <p>
                  Customers creating new shipments
                </p>

                <div className="engagement-progress">
                  <div style={{ width: "68%" }}></div>
                </div>

                <span>68%</span>
              </div>

            </div>

            <div className="engagement-item">

              <div className="engagement-icon green-engagement">
                ✓
              </div>

              <div className="engagement-info">
                <strong>Delivery Confirmation</strong>

                <p>
                  Customers viewing completed deliveries
                </p>

                <div className="engagement-progress">
                  <div style={{ width: "91%" }}></div>
                </div>

                <span>91%</span>
              </div>

            </div>

          </div>

        </section>

        {/* INSIGHTS */}
        <section className="activity-card customer-insights">

          <div className="activity-card-header">

            <div>
              <h3>Customer Insights</h3>
              <p>Useful observations from recent activity</p>
            </div>

          </div>

          <div className="insights-grid">

            <div className="customer-insight">

              <div className="customer-insight-icon green-insight">
                ↑
              </div>

              <div>
                <strong>Customer activity increased</strong>
                <p>
                  Overall customer engagement has increased by 8.4%
                  compared with last month.
                </p>
              </div>

            </div>

            <div className="customer-insight">

              <div className="customer-insight-icon purple-insight">
                ●
              </div>

              <div>
                <strong>71 active customers</strong>
                <p>
                  Most customers currently have ongoing shipment
                  activity on the platform.
                </p>
              </div>

            </div>

            <div className="customer-insight warning-insight">

              <div className="customer-insight-icon orange-insight">
                !
              </div>

              <div>
                <strong>15 customers inactive</strong>
                <p>
                  Consider reviewing inactive customer accounts and
                  recent shipment history.
                </p>
              </div>

            </div>

          </div>

        </section>

        <footer className="customer-activity-footer">
          <span>© 2026 ShipTrack Intelligence Platform</span>
          <span>Customer Activity Monitoring: Operational</span>
        </footer>

      </main>
    </div>
  );
}

export default CustomerActivity;