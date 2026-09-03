import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Dashboards
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import BusinessDashboard from "./pages/dashboards/BusinessDashboard";
import OperatorDashboard from "./pages/dashboards/OperatorDashboard";
import OperatorShipmentTracking from "./pages/OperatorShipmentTracking";
import OperatorLiveDelivery from "./pages/OperatorLiveDelivery";
import DriverTracking from "./pages/DriverTracking";
import OperatorRouteManagement from "./pages/OperatorRouteManagement";
import OperatorETADelays from "./pages/OperatorETADelays";
import OperatorProofOfDelivery from "./pages/OperatorProofOfDelivery";
import SupportDashboard from "./pages/dashboards/SupportDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";

// Customer Pages
import ActiveShipments from "./pages/ActiveShipments";
import ShipmentHistory from "./pages/ShipmentHistory";
import Tracking from "./pages/Tracking";
import Notifications from "./pages/Notifications";
import TrackingInsights from "./pages/TrackingInsights";

// Business Client Pages
import CreateShipment from "./pages/CreateShipment";
import ShipmentManagement from "./pages/ShipmentManagement";
import BusinessShipmentHistory from "./pages/BusinessShipmentHistory";
import PackageInformation from "./pages/PackageInformation";
import BusinessTracking from "./pages/BusinessTracking";
import DeliveryPerformance from "./pages/DeliveryPerformance";
import DelayAnalysis from "./pages/DelayAnalysis";
import LogisticsOverview from "./pages/LogisticsOverview";
import CustomerActivity from "./pages/CustomerActivity";
import Reports from "./pages/Reports";
import BusinessNotifications from "./pages/BusinessNotifications";

// Temporary Business Module
import BusinessModule from "./pages/BusinessModule";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= COMMON ================= */}

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/* ================= CUSTOMER ================= */}

        <Route
          path="/dashboard/customer"
          element={<CustomerDashboard />}
        />

        <Route
          path="/shipments/active"
          element={<ActiveShipments />}
        />

        <Route
          path="/shipments/history"
          element={<ShipmentHistory />}
        />

        <Route
          path="/tracking"
          element={<Tracking />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/tracking-insights"
          element={<TrackingInsights />}
        />


        {/* ================= BUSINESS CLIENT ================= */}

        <Route
          path="/dashboard/business"
          element={<BusinessDashboard />}
        />

        <Route
          path="/business/create-shipment"
          element={<CreateShipment />}
        />

        <Route
          path="/business/shipment-management"
          element={<ShipmentManagement />}
        />

        <Route
          path="/business/shipment-history"
          element={<BusinessShipmentHistory />}
        />

        <Route
          path="/business/package-information"
          element={<PackageInformation />}
        />

        <Route
          path="/business/tracking"
          element={<BusinessTracking />}
        />

        <Route
          path="/business/delivery-performance"
          element={<DeliveryPerformance />}
        />

        <Route
          path="/business/delay-analysis"
          element={<DelayAnalysis />}
        />

        <Route
          path="/business/logistics-overview"
          element={<LogisticsOverview />}
        />

        <Route
          path="/business/customer-activity"
          element={<CustomerActivity />}
        />

        <Route
          path="/business/reports"
          element={<Reports />}
        />

        <Route
          path="/business/notifications"
          element={<BusinessNotifications />}
        />


        {/* ================= TEMPORARY BUSINESS MODULE ================= */}

        <Route
          path="/business/module"
          element={<BusinessModule />}
        />


        {/* ================= LOGISTICS OPERATOR ================= */}

        <Route
          path="/dashboard/operator"
          element={<OperatorDashboard />}
        />

        <Route
          path="/operator/shipment-tracking"
          element={<OperatorShipmentTracking />}
        />

        <Route
          path="/operator/live-delivery"
          element={<OperatorLiveDelivery />}
        />

        <Route
          path="/operator/driver-tracking"
          element={<DriverTracking />}
        />

        <Route
          path="/operator/routes"
          element={<OperatorRouteManagement />}
        />

        <Route
          path="/operator/eta-delay"
          element={<OperatorETADelays />}
        />

        <Route
          path="/operator/pod"
          element={<OperatorProofOfDelivery />}
        />


        {/* ================= SUPPORT AGENT ================= */}

        <Route
          path="/dashboard/support"
          element={<SupportDashboard />}
        />


        {/* ================= ADMINISTRATOR ================= */}

        <Route
          path="/dashboard/admin"
          element={<AdminDashboard />}
        />


        {/* ================= FALLBACK ================= */}

        <Route
          path="*"
          element={<Home />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;