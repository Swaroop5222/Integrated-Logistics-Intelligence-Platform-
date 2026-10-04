import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  Headphones,
  Menu,
  MapPin,
  PackageCheck,
  Search,
  ShieldAlert,
  Truck,
  User,
  X,
  Zap,
} from "lucide-react";

import { apiRequest } from "../../api";
import "./SupportDashboard.css";

const ACTIVE_STATUSES = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
];

const SHIPMENT_STATUSES = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED_DELIVERY",
  "CANCELLED",
];

const REPORT_COLUMNS = [
  { header: "Shipment ID", key: "id", width: 14 },
  { header: "Tracking Number", key: "trackingNumber", width: 22 },
  { header: "Reference", key: "referenceId", width: 20 },
  { header: "Status", key: "status", width: 20 },
  { header: "Sender Address", key: "senderAddress", width: 36 },
  { header: "Receiver Address", key: "receiverAddress", width: 36 },
  { header: "Created At", key: "createdAt", width: 22 },
  { header: "Updated At", key: "updatedAt", width: 22 },
  { header: "Predicted Delivery", key: "predictedDeliveryTime", width: 24 },
  { header: "Forecast Confidence", key: "forecastConfidence", width: 22 },
];

function createReportRow(shipment, forecast) {
  return {
    id: shipment.id ?? "",
    trackingNumber: shipment.trackingNumber ?? "",
    referenceId: shipment.referenceId ?? "",
    status: shipment.status ?? "",
    senderAddress: shipment.senderAddress ?? "",
    receiverAddress: shipment.receiverAddress ?? "",
    createdAt: shipment.createdAt ?? "",
    updatedAt: shipment.updatedAt ?? "",
    predictedDeliveryTime: forecast?.predictedDeliveryTime ?? "",
    forecastConfidence: forecast?.confidence ?? "",
  };
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getReportFilename(extension) {
  return `support-shipment-report-${new Date().toISOString().slice(0, 10)}.${extension}`;
}

function toExcelColumn(index) {
  let result = "";
  let current = index;
  while (current > 0) {
    current -= 1;
    result = String.fromCharCode(65 + (current % 26)) + result;
    current = Math.floor(current / 26);
  }
  return result;
}

function escapeXml(value) {
  return Array.from(String(value))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || code >= 32;
    })
    .join("")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createWorksheetXml(columns, rows) {
  const allRows = [
    columns.map((column) => column.header),
    ...rows.map((row) => columns.map((column) => row[column.key] ?? "")),
  ];
  const lastColumn = toExcelColumn(columns.length);
  const lastRow = Math.max(allRows.length, 1);
  const sheetRows = allRows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cells = row
        .map((value, columnIndex) => {
          const reference = `${toExcelColumn(columnIndex + 1)}${rowNumber}`;
          const style = rowIndex === 0 ? ' s="1"' : "";
          if (typeof value === "number" && Number.isFinite(value)) {
            return `<c r="${reference}"${style}><v>${value}</v></c>`;
          }
          if (typeof value === "boolean") {
            return `<c r="${reference}"${style} t="b"><v>${value ? 1 : 0}</v></c>`;
          }
          if (value == null || value === "") {
            return `<c r="${reference}"${style}/>`;
          }
          return `<c r="${reference}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowNumber}">${cells}</row>`;
    })
    .join("");
  const columnDefinitions = columns
    .map(
      (column, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${column.width || 18}" customWidth="1"/>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<dimension ref="A1:${lastColumn}${lastRow}"/>
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="18"/>
<cols>${columnDefinitions}</cols>
<sheetData>${sheetRows}</sheetData>
<autoFilter ref="A1:${lastColumn}${lastRow}"/>
<pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>
</worksheet>`;
}

async function createXlsxBlob(sheets) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}
</Types>`
  );
  zip.folder("_rels").file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  );
  zip.folder("xl").file(
    "workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<bookViews><workbookView/></bookViews>
<sheets>${sheets.map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}</sheets>
</workbook>`
  );
  zip.folder("xl").folder("_rels").file(
    "workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("")}
<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
  );
  zip.folder("xl").file(
    "styles.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF7C3AED"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`
  );
  const worksheets = zip.folder("xl").folder("worksheets");
  sheets.forEach((sheet, index) => {
    worksheets.file(
      `sheet${index + 1}.xml`,
      createWorksheetXml(sheet.columns, sheet.rows)
    );
  });
  return zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    compression: "DEFLATE",
  });
}

function normalizeArray(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.shipments)) return data.shipments;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function getStatus(shipment) {
  return String(
    shipment?.status ||
      shipment?.shipmentStatus ||
      shipment?.currentStatus ||
      ""
  ).toUpperCase();
}

function formatStatus(status) {
  const map = {
    CREATED: "Created",
    PICKED_UP: "Picked Up",
    IN_TRANSIT: "In Transit",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    FAILED_DELIVERY: "Failed Delivery",
    CANCELLED: "Cancelled",
  };

  return map[status] || status || "Data unavailable";
}

function getTrackingNumber(shipment) {
  return shipment?.trackingNumber || "";
}

function getShipmentId(shipment) {
  return shipment?.id;
}

function getRoute(shipment) {
  if (!shipment?.senderAddress && !shipment?.receiverAddress) return "";
  return [shipment?.senderAddress, shipment?.receiverAddress]
    .filter(Boolean)
    .join(" → ");
}

function getDate(shipment) {
  return shipment?.updatedAt || shipment?.createdAt || null;
}

function formatDate(value) {
  if (!value) return "Data unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

function formatRelativeDate(value) {
  if (!value) return "Data unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data unavailable";
  }

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);

  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return formatDate(value);
}

function getUserName(user) {
  return user?.fullName || user?.email || "";
}

function getInitials(user) {
  const name = getUserName(user);

  if (!name) return "";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getShipmentStatusClass(status) {
  if (status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") {
    return "in-transit";
  }

  if (status === "FAILED_DELIVERY") {
    return "delayed";
  }

  if (status === "DELIVERED") {
    return "near-destination";
  }

  return "queued";
}

function getShipmentIcon(status) {
  if (status === "DELIVERED") {
    return <CheckCircle2 size={16} />;
  }

  if (status === "FAILED_DELIVERY") {
    return <ShieldAlert size={16} />;
  }

  if (status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY") {
    return <Truck size={16} />;
  }

  return <PackageCheck size={16} />;
}

function SupportDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [forecastsLoaded, setForecastsLoaded] = useState(false);
  const [forecastError, setForecastError] = useState("");
  const [exportingFormat, setExportingFormat] = useState("");
  const [exportError, setExportError] = useState("");
  const [search, setSearch] = useState("");
  const [trackingSearch, setTrackingSearch] = useState(
    () => new URLSearchParams(window.location.search).get("trackingNumber") || ""
  );
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const currentView =
    location.pathname === "/dashboard/support"
      ? "dashboard"
      : location.pathname.replace("/support/", "");

  useEffect(() => {
    let mounted = true;
    if (!localStorage.getItem("shiptrackToken")) {
      navigate("/login", { replace: true });
      setLoading(false);
      return undefined;
    }

    async function loadPortalData() {
      try {
        const [userResult, shipmentResult] = await Promise.all([
          apiRequest("/api/users/me"),
          apiRequest("/api/shipments"),
        ]);

        if (!mounted) return;
        if (userResult?.role !== "SUPPORT_AGENT") {
          const roleRoutes = {
            CUSTOMER: "/dashboard/customer",
            BUSINESS_CLIENT: "/dashboard/business",
            LOGISTICS_OPERATOR: "/dashboard/operator",
            ADMINISTRATOR: "/dashboard/admin",
          };
          navigate(roleRoutes[userResult?.role] || "/login", { replace: true });
          return;
        }
        setUser(userResult);
        setShipments(normalizeArray(shipmentResult));
        setLastRefreshed(new Date());
        setError("");
      } catch (err) {
        if (!mounted) return;
        console.error("Support dashboard loading failed:", err);
        setError(err.message || "Unable to load support dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function loadForecasts() {
      try {
        const result = await apiRequest("/api/forecasts");
        if (!mounted) return;
        setForecasts(normalizeArray(result));
        setForecastsLoaded(true);
        setForecastError("");
      } catch (err) {
        if (!mounted) return;
        console.error("Support forecast loading failed:", err);
        setForecastError(err.message || "Unable to load saved shipment forecasts.");
      }
    }

    loadPortalData();
    loadForecasts();
    const interval = window.setInterval(() => {
      loadPortalData();
      loadForecasts();
    }, 30000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [navigate]);

  useEffect(() => {
    const queryTrackingNumber = new URLSearchParams(location.search).get(
      "trackingNumber"
    );
    if (queryTrackingNumber) setTrackingSearch(queryTrackingNumber);
  }, [location.search]);

  useEffect(() => {
    const query = trackingSearch.trim();
    if (currentView !== "tracking" || !query) {
      setTrackingDetails(null);
      setTrackingError("");
      return undefined;
    }

    let cancelled = false;
    async function loadTrackingDetails() {
      setTrackingLoading(true);
      try {
        const normalizedQuery = query.toLowerCase();
        let shipment = shipments.find((item) =>
          [item?.trackingNumber, item?.referenceId]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase() === normalizedQuery)
        );

        if (!shipment) {
          shipment = await apiRequest(
            `/api/shipments/track/${encodeURIComponent(query)}`
          );
        }

        if (!shipment?.id) {
          throw new Error("The shipment response did not include an ID.");
        }

        const [tracking, history] = await Promise.all([
          apiRequest(`/api/shipments/${shipment.id}/tracking`),
          apiRequest(`/api/shipments/${shipment.id}/history`),
        ]);

        if (cancelled) return;
        setTrackingDetails({
          shipment,
          tracking,
          history: Array.isArray(history) ? history : [],
        });
        setTrackingError("");
      } catch (err) {
        if (cancelled) return;
        console.error("Support tracking lookup failed:", err);
        setTrackingDetails(null);
        setTrackingError(err.message || "Unable to load tracking details.");
      } finally {
        if (!cancelled) setTrackingLoading(false);
      }
    }

    loadTrackingDetails();
    return () => {
      cancelled = true;
    };
  }, [currentView, trackingSearch, shipments]);

  const activeShipments = useMemo(
    () =>
      shipments.filter((shipment) =>
        ACTIVE_STATUSES.includes(getStatus(shipment))
      ),
    [shipments]
  );

  const failedShipments = useMemo(
    () => shipments.filter((shipment) => getStatus(shipment) === "FAILED_DELIVERY"),
    [shipments]
  );

  const deliveredShipments = useMemo(
    () => shipments.filter((shipment) => getStatus(shipment) === "DELIVERED"),
    [shipments]
  );

  const inTransitShipments = useMemo(
    () =>
      shipments.filter((shipment) =>
        ["IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(getStatus(shipment))
      ),
    [shipments]
  );

  const forecastsByShipment = useMemo(() => {
    const byShipment = new Map();
    forecasts.forEach((forecast) => {
      const shipmentId = forecast?.shipment?.id;
      if (shipmentId == null) return;
      const key = String(shipmentId);
      const current = byShipment.get(key);
      if (
        !current ||
        new Date(forecast.createdAt || 0).getTime() >
          new Date(current.createdAt || 0).getTime()
      ) {
        byShipment.set(key, forecast);
      }
    });
    return byShipment;
  }, [forecasts]);

  const delayWarnings = useMemo(
    () =>
      shipments.filter((shipment) => {
        const status = getStatus(shipment);
        if (status === "DELIVERED" || status === "FAILED_DELIVERY" || status === "CANCELLED") {
          return false;
        }
        const forecast = forecastsByShipment.get(String(getShipmentId(shipment)));
        const predictedTime = new Date(forecast?.predictedDeliveryTime || "").getTime();
        const refreshedAt = lastRefreshed?.getTime() || 0;
        return Number.isFinite(predictedTime) && predictedTime < refreshedAt;
      }),
    [shipments, forecastsByShipment, lastRefreshed]
  );

  const sortedShipments = useMemo(
    () =>
      [...shipments].sort(
        (a, b) =>
          new Date(getDate(b) || 0).getTime() -
          new Date(getDate(a) || 0).getTime()
      ),
    [shipments]
  );

  const filteredShipments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sortedShipments;
    return sortedShipments.filter((shipment) =>
      [getTrackingNumber(shipment), shipment?.referenceId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [sortedShipments, search]);

  const alertRecords = useMemo(
    () =>
      [
        ...failedShipments.map((shipment) => ({ shipment, kind: "failed" })),
        ...delayWarnings.map((shipment) => ({ shipment, kind: "forecast-delay" })),
      ].sort(
        (a, b) =>
          new Date(getDate(b.shipment) || 0).getTime() -
          new Date(getDate(a.shipment) || 0).getTime()
      ),
    [failedShipments, delayWarnings]
  );
  const recentAlerts = alertRecords.slice(0, 4);

  const exceptionCount = failedShipments.length;
  const canExportReport =
    Boolean(lastRefreshed) && (forecastsLoaded || Boolean(forecastError));
  const reportRows = useMemo(
    () =>
      sortedShipments.map((shipment) =>
        createReportRow(
          shipment,
          forecastsByShipment.get(String(getShipmentId(shipment)))
        )
      ),
    [sortedShipments, forecastsByShipment]
  );

  const exportExcel = async () => {
    if (!lastRefreshed) return;
    setExportingFormat("xlsx");
    setExportError("");
    try {
      const shipmentById = new Map(
        shipments.map((shipment) => [String(shipment.id), shipment])
      );
      const sheets = [
        { name: "Shipments", columns: REPORT_COLUMNS, rows: reportRows },
        {
          name: "Status Summary",
          columns: [
            { header: "Shipment Status", key: "status", width: 28 },
            { header: "Shipment Count", key: "count", width: 20 },
          ],
          rows: SHIPMENT_STATUSES.map((status) => ({
            status: formatStatus(status),
            count: shipments.filter((shipment) => getStatus(shipment) === status)
              .length,
          })),
        },
        {
          name: "Saved Forecasts",
          columns: [
            { header: "Forecast ID", key: "id", width: 16 },
            { header: "Shipment ID", key: "shipmentId", width: 16 },
            { header: "Tracking Number", key: "trackingNumber", width: 24 },
            { header: "Predicted Delivery Time", key: "predictedDeliveryTime", width: 26 },
            { header: "Predicted Status", key: "predictedStatus", width: 22 },
            { header: "Confidence", key: "confidence", width: 16 },
            { header: "Forecast Created At", key: "createdAt", width: 24 },
          ],
          rows: forecasts.map((forecast) => {
          const shipmentId = forecast?.shipment?.id;
          const shipment = shipmentById.get(String(shipmentId));
          return {
            id: forecast?.id ?? "",
            shipmentId: shipmentId ?? "",
            trackingNumber:
              forecast?.shipment?.trackingNumber ??
              shipment?.trackingNumber ??
              "",
            predictedDeliveryTime: forecast?.predictedDeliveryTime ?? "",
            predictedStatus: forecast?.predictedStatus ?? "",
            confidence: forecast?.confidence ?? "",
            createdAt: forecast?.createdAt ?? "",
          };
          }),
        },
        {
          name: "Report Notes",
          columns: [
            { header: "Data Source", key: "source", width: 24 },
            { header: "Details", key: "details", width: 100 },
          ],
          rows: [
          {
            source: "Shipments",
            details: `Exported ${shipments.length} shipment records returned by the authenticated backend API.`,
          },
          {
            source: "Saved forecasts",
            details: forecastError
              ? `Forecast data was not included because its API request failed: ${forecastError}`
              : forecasts.length
                ? `Exported ${forecasts.length} saved forecast records returned by the authenticated backend API.`
                : "The backend returned no saved forecast records.",
          },
          ],
        },
      ];

      downloadFile(await createXlsxBlob(sheets), getReportFilename("xlsx"));
    } catch (err) {
      console.error("Support Excel report export failed:", err);
      setExportError(err.message || "Unable to export the Excel report.");
    } finally {
      setExportingFormat("");
    }
  };

  const exportPdf = async () => {
    if (!lastRefreshed) return;
    setExportingFormat("pdf");
    setExportError("");
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const lineHeight = 3.4;
      const cellPadding = 1.5;
      let y = margin;

      pdf.setFontSize(15);
      pdf.text("Support Shipment Report", margin, y + 5);
      y += 10;
      pdf.setFontSize(8);
      pdf.text(`Data refreshed: ${lastRefreshed.toLocaleString()}`, margin, y);
      y += 5;
      pdf.text(
        `Total: ${shipments.length}   Active: ${activeShipments.length}   In transit: ${inTransitShipments.length}   Delivered: ${deliveredShipments.length}   Failed delivery: ${failedShipments.length}`,
        margin,
        y
      );
      y += 7;
      pdf.setFontSize(7);
      pdf.text(
        forecastError
          ? `Saved forecasts not included: ${forecastError}`
          : `${forecasts.length} saved forecast record(s) included.`,
        margin,
        y
      );
      y += 7;

      const drawTable = (title, headers, rows, widths) => {
        const usableWidth = pageWidth - margin * 2;
        const adjustedWidths = widths.map(
          (width) => (width * usableWidth) / widths.reduce((sum, item) => sum + item, 0)
        );
        const drawHeader = () => {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7);
          let x = margin;
          const headerLines = headers.map((header, index) =>
            pdf.splitTextToSize(header, adjustedWidths[index] - cellPadding * 2)
          );
          const height =
            Math.max(...headerLines.map((lines) => lines.length)) * lineHeight +
            cellPadding * 2;
          pdf.setFillColor(124, 58, 237);
          pdf.rect(margin, y, usableWidth, height, "F");
          headerLines.forEach((lines, index) => {
            pdf.setTextColor(255, 255, 255);
            pdf.text(lines, x + cellPadding, y + cellPadding + lineHeight - 0.5);
            x += adjustedWidths[index];
          });
          y += height;
          pdf.setTextColor(15, 23, 42);
        };

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(title, margin, y + 4);
        y += 7;
        drawHeader();

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        rows.forEach((row, rowIndex) => {
          const linesByColumn = row.map((value, index) =>
            pdf.splitTextToSize(String(value ?? ""), adjustedWidths[index] - cellPadding * 2)
          );
          const rowHeight =
            Math.max(...linesByColumn.map((lines) => lines.length), 1) * lineHeight +
            cellPadding * 2;
          if (y + rowHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(9);
            pdf.text(title, margin, y + 4);
            y += 7;
            drawHeader();
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(7);
          }
          if (rowIndex % 2 === 1) {
            pdf.setFillColor(241, 245, 249);
            pdf.rect(margin, y, usableWidth, rowHeight, "F");
          }
          let x = margin;
          linesByColumn.forEach((lines, index) => {
            pdf.setTextColor(30, 41, 59);
            pdf.text(lines, x + cellPadding, y + cellPadding + lineHeight - 0.5);
            x += adjustedWidths[index];
          });
          y += rowHeight;
        });
        y += 7;
      };

      const shipmentHeaders = [
        "Shipment ID",
        "Tracking Number",
        "Reference",
        "Route",
        "Status",
        "Updated At",
        "Predicted Delivery",
        "Confidence",
      ];
      const shipmentPdfRows = sortedShipments.map((shipment) => {
        const forecast = forecastsByShipment.get(String(shipment.id));
        return [
          shipment.id ?? "",
          shipment.trackingNumber ?? "",
          shipment.referenceId ?? "",
          [shipment.senderAddress, shipment.receiverAddress].filter(Boolean).join(" → "),
          shipment.status ?? "",
          shipment.updatedAt ?? "",
          forecast?.predictedDeliveryTime ?? "",
          forecast?.confidence ?? "",
        ];
      });
      drawTable(
        "Shipments",
        shipmentHeaders,
        shipmentPdfRows,
        [14, 27, 24, 56, 25, 34, 43, 18]
      );

      const forecastRows = forecasts.map((forecast) => {
        const shipment = shipments.find(
          (item) => String(item.id) === String(forecast?.shipment?.id)
        );
        return [
          forecast?.id ?? "",
          forecast?.shipment?.id ?? "",
          forecast?.shipment?.trackingNumber ?? shipment?.trackingNumber ?? "",
          forecast?.predictedDeliveryTime ?? "",
          forecast?.predictedStatus ?? "",
          forecast?.confidence ?? "",
          forecast?.createdAt ?? "",
        ];
      });
      drawTable(
        "Saved Forecasts",
        [
          "Forecast ID",
          "Shipment ID",
          "Tracking Number",
          "Predicted Delivery",
          "Predicted Status",
          "Confidence",
          "Created At",
        ],
        forecastRows,
        [18, 18, 31, 49, 30, 22, 36]
      );

      downloadFile(pdf.output("blob"), getReportFilename("pdf"));
    } catch (err) {
      console.error("Support PDF report export failed:", err);
      setExportError(err.message || "Unable to export the PDF report.");
    } finally {
      setExportingFormat("");
    }
  };
  const currentViewTitle = {
    dashboard: "Support Dashboard",
    shipments: "Shipments",
    tracking: "Tracking",
    notifications: "Notifications",
    reports: "Reports",
    account: "Account",
  }[currentView] || "Support Dashboard";

  const closeSidebar = () => setSidebarOpen(false);

  const openTracking = (shipment) => {
    const trackingNumber = getTrackingNumber(shipment);
    setTrackingSearch(trackingNumber);
    setTrackingError("");
    navigate(`/support/tracking?trackingNumber=${encodeURIComponent(trackingNumber)}`);
  };

  const searchForTracking = (event) => {
    event.preventDefault();
    const value = trackingSearch.trim();
    if (!value) return;
    setTrackingError("");
    navigate(`/support/tracking?trackingNumber=${encodeURIComponent(value)}`);
  };

  const logout = () => {
    localStorage.removeItem("shiptrackToken");
    localStorage.removeItem("shiptrackUser");
    navigate("/login", { replace: true });
  };

  return (
    <div className="support-page">
      {sidebarOpen && (
        <div
          className="support-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={`support-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="support-logo">
          <div className="support-logo-mark">
            <Truck size={19} />
          </div>

          <div>
            <h2>ShipTrack</h2>
            <span>SUPPORT PORTAL</span>
          </div>

          <button
            className="support-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="support-profile">
          <div className="support-avatar">{getInitials(user)}</div>

          <div>
            <strong>{getUserName(user)}</strong>
            <span>{user?.role || "SUPPORT AGENT"}</span>
          </div>
        </div>

        <nav className="support-navigation">
          <div className="support-nav-title">SUPPORT</div>

          <Link
            className={`support-nav-link ${currentView === "dashboard" ? "active" : ""}`}
            to="/dashboard/support"
            onClick={closeSidebar}
          >
            <Headphones size={15} />
            Dashboard
          </Link>

          <Link
            className={`support-nav-link ${currentView === "shipments" ? "active" : ""}`}
            to="/support/shipments"
            onClick={closeSidebar}
          >
            <PackageCheck size={15} />
            Shipments
          </Link>

          <Link
            className={`support-nav-link ${currentView === "tracking" ? "active" : ""}`}
            to="/support/tracking"
            onClick={closeSidebar}
          >
            <MapPin size={15} />
            Tracking
          </Link>

          <Link
            className={`support-nav-link ${currentView === "notifications" ? "active" : ""}`}
            to="/support/notifications"
            onClick={closeSidebar}
          >
            <Bell size={15} />
            Notifications
          </Link>

          <div className="support-nav-title support-nav-second">
            MANAGEMENT
          </div>

          <Link
            className={`support-nav-link ${currentView === "reports" ? "active" : ""}`}
            to="/support/reports"
            onClick={closeSidebar}
          >
            <Box size={15} />
            Reports
          </Link>

          <Link
            className={`support-nav-link ${currentView === "account" ? "active" : ""}`}
            to="/support/account"
            onClick={closeSidebar}
          >
            <User size={15} />
            Account
          </Link>
        </nav>

        <div className="support-sidebar-bottom">
          <div className="support-info-box">
            <div className="support-info-icon">
              <Headphones size={15} />
            </div>

            <div>
              <strong>Support Center</strong>
              <p>
                Shipment and delivery support tools are available from this
                portal.
              </p>
            </div>
          </div>

          <button className="support-logout" onClick={logout}>
            <X size={14} />
            Logout
          </button>
        </div>
      </aside>

      <main className="support-main">
        <header className="support-header">
          <div className="support-header-left">
            <button
              className="support-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={17} />
            </button>

            <div>
              <div className="support-eyebrow">SUPPORT OPERATIONS</div>

              <h1>{currentViewTitle}</h1>

              <p>
                {currentView === "dashboard"
                  ? "Monitor shipments and delivery exceptions."
                  : currentView === "shipments"
                    ? "Search shipment records by tracking number or reference."
                    : currentView === "tracking"
                      ? "Review shipment location and tracking history."
                      : currentView === "notifications"
                        ? "Review shipment exceptions available from current status data."
                        : currentView === "reports"
                          ? "Shipment totals calculated from current backend records."
                          : "Account details provided by your profile."}
              </p>
            </div>
          </div>

          <div className="support-header-right">
            <div className="support-online">
              {lastRefreshed && <span />}
              {lastRefreshed ? "Data connected" : "Data unavailable"}
            </div>

            <Link
              className="support-notification"
              to="/support/notifications"
              title="Notifications"
            >
              <Bell size={16} />
            </Link>

            <div className="support-header-profile">
              <div>{getInitials(user)}</div>

              <div>
                <strong>{getUserName(user)}</strong>
                <span>{user?.role || "SUPPORT AGENT"}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="support-content">
          {error && (
            <div
              style={{
                marginBottom: "17px",
                padding: "12px 14px",
                border: "1px solid rgba(244,63,94,.18)",
                borderRadius: "10px",
                color: "#fda4af",
                background: "rgba(244,63,94,.06)",
                fontSize: "9px",
              }}
            >
              {error}
            </div>
          )}

          {currentView === "dashboard" && (
          <div className="support-stats">
            <div className="support-stat">
              <div className="support-stat-icon orange">
                <PackageCheck size={19} />
              </div>

              <div className="support-stat-content">
                <span>ACTIVE SHIPMENTS</span>
                <strong>
                  {loading ? "..." : lastRefreshed ? activeShipments.length : "—"}
                </strong>
                <small>Current active shipments</small>
              </div>
            </div>

            <div className="support-stat">
              <div className="support-stat-icon purple">
                <Truck size={19} />
              </div>

              <div className="support-stat-content">
                <span>IN TRANSIT</span>
                <strong>
                  {loading ? "..." : lastRefreshed ? inTransitShipments.length : "—"}
                </strong>
                <small>Currently moving</small>
              </div>
            </div>

            <div className="support-stat">
              <div className="support-stat-icon cyan">
                <CheckCircle2 size={19} />
              </div>

              <div className="support-stat-content">
                <span>DELIVERED</span>
                <strong>
                  {loading ? "..." : lastRefreshed ? deliveredShipments.length : "—"}
                </strong>
                <small>Successfully delivered</small>
              </div>
            </div>

            <div className="support-stat">
              <div className="support-stat-icon red">
                <ShieldAlert size={19} />
              </div>

              <div className="support-stat-content">
                <span>EXCEPTIONS</span>
                <strong>
                  {loading ? "..." : lastRefreshed ? exceptionCount : "—"}
                </strong>
                <small>Failed delivery status</small>
              </div>
            </div>
          </div>
          )}

          {currentView === "dashboard" && (
            <>
          <div className="support-search-card">
            <div className="support-search-title">
              <div className="support-search-icon">
                <Search size={19} />
              </div>

              <div>
                <span>SHIPMENT LOOKUP</span>
                <h2>Find a shipment</h2>
                <p>
                  Search using a tracking number or shipment reference.
                </p>
              </div>
            </div>

            <div className="support-search-box">
              <Search size={14} />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tracking number or reference..."
              />

              {search && (
                <button onClick={() => setSearch("")}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="support-top-grid">
            <section className="support-card">
              <div className="support-card-header">
                <div>
                  <span>SHIPMENT OPERATIONS</span>
                  <h2>Active &amp; Recent Shipments</h2>
                </div>

                <Link to="/support/shipments">
                  View all
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div className="support-shipment-list">
                {loading ? (
                  <div className="support-no-results">
                    <Clock3 size={20} />
                    <strong>Loading shipments...</strong>
                    <span>Please wait</span>
                  </div>
                ) : !lastRefreshed ? (
                  <div className="support-no-results">
                    <AlertCircle size={20} />
                    <strong>Shipment data unavailable</strong>
                    <span>Shipment records could not be loaded from the backend.</span>
                  </div>
                ) : filteredShipments.length === 0 ? (
                  <div className="support-no-results">
                    <PackageCheck size={20} />
                    <strong>No matching shipments</strong>
                    <span>
                      {search
                        ? "No shipment matched your search."
                        : "No shipment records are available."}
                    </span>
                  </div>
                ) : (
                  (search ? filteredShipments : filteredShipments.slice(0, 8)).map((shipment) => {
                    const shipmentId = getShipmentId(shipment);
                    const status = getStatus(shipment);
                    const tracking = getTrackingNumber(shipment);

                    return (
                      <div
                        className="support-shipment"
                        key={shipmentId || tracking}
                      >
                        <div className="shipment-symbol">
                          {getShipmentIcon(status)}
                        </div>

                        <div className="shipment-details">
                          <strong>{tracking || "Tracking number unavailable"}</strong>

                          <span>{getRoute(shipment) || "Route unavailable"}</span>

                          <small>
                            <Clock3 size={9} />
                            Latest shipment update: {formatRelativeDate(getDate(shipment))}
                          </small>
                        </div>

                        <div className="shipment-state">
                          <span
                            className={`support-status ${getShipmentStatusClass(
                              status
                            )}`}
                          >
                            {formatStatus(status)}
                          </span>

                          {shipment?.referenceId && (
                            <small>Ref: {shipment.referenceId}</small>
                          )}
                        </div>

                        <Link
                          className="shipment-eye"
                          to={`/support/tracking?trackingNumber=${encodeURIComponent(
                            tracking
                          )}`}
                          title="View shipment"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="support-card">
              <div className="support-card-header">
                <div>
                  <span>DELIVERY MONITORING</span>
                  <h2>Active Shipment Progress</h2>
                </div>

                <Activity size={15} />
              </div>

              <div className="customer-list">
                {loading ? (
                  <div className="support-no-results">
                    <Clock3 size={19} />
                    <strong>Loading shipment progress...</strong>
                  </div>
                ) : !lastRefreshed ? (
                  <div className="support-no-results">
                    <AlertCircle size={19} />
                    <strong>Shipment data unavailable</strong>
                  </div>
                ) : activeShipments.length === 0 ? (
                  <div className="support-no-results">
                    <Activity size={19} />
                    <strong>No active shipments</strong>
                    <span>
                      There are no active shipment statuses to monitor.
                    </span>
                  </div>
                ) : (
                  [...activeShipments]
                    .sort(
                      (a, b) =>
                        new Date(getDate(b) || 0).getTime() -
                        new Date(getDate(a) || 0).getTime()
                    )
                    .slice(0, 6)
                    .map((shipment) => (
                    <div
                      className="customer-item"
                      key={getShipmentId(shipment)}
                    >
                      <div className="customer-avatar">
                        {getShipmentIcon(getStatus(shipment))}
                      </div>

                      <div className="customer-data">
                        <strong>{getTrackingNumber(shipment) || "Tracking number unavailable"}</strong>

                        <small>
                          {formatStatus(getStatus(shipment))} ·{" "}
                          {formatRelativeDate(getDate(shipment))}
                        </small>
                      </div>

                      <button
                        className="support-inline-action"
                        onClick={() => openTracking(shipment)}
                        aria-label={`Track ${getTrackingNumber(shipment)}`}
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                    ))
                )}
              </div>
            </section>
          </div>

          <div className="support-bottom-grid">
            <section className="support-card">
              <div className="support-card-header">
                <div>
                  <span>EXCEPTIONS</span>
                  <h2>Delivery Exceptions</h2>
                </div>

                <div className="exception-count">{lastRefreshed ? exceptionCount : "—"}</div>
              </div>

              <div className="exception-summary">
                <div className="exception-box danger">
                  <strong>{lastRefreshed ? exceptionCount : "—"}</strong>
                  <span>Failed Delivery</span>
                </div>

                <div className="exception-box warning">
                  <strong>{forecastsLoaded ? delayWarnings.length : "N/A"}</strong>
                  <span>Overdue saved forecasts</span>
                </div>
              </div>

              <div className="exception-message">
                <AlertCircle size={14} />

                <span>
                  Failed-delivery exceptions use current shipment status. Delay
                  warnings use saved forecast delivery times for shipments that
                  remain undelivered; no separate DELAYED status is provided.
                </span>
              </div>
              {forecastError && <div className="support-page-error">{forecastError}</div>}
            </section>

            <section className="support-card">
              <div className="support-card-header">
                <div>
                  <span>ALERTS</span>
                  <h2>Current Alerts</h2>
                </div>

                <Bell size={15} />
              </div>

              <div className="support-alert-list">
                {loading ? (
                  <div className="support-no-results">
                    <Clock3 size={18} />
                    <strong>Loading alerts...</strong>
                  </div>
                ) : !lastRefreshed ? (
                  <div className="support-no-results">
                    <AlertCircle size={18} />
                    <strong>Shipment data unavailable</strong>
                  </div>
                ) : !forecastsLoaded && !forecastError && recentAlerts.length === 0 ? (
                  <div className="support-no-results">
                    <Clock3 size={18} />
                    <strong>Loading saved forecast data...</strong>
                  </div>
                ) : recentAlerts.length === 0 ? (
                  <div className="support-no-results">
                    <CheckCircle2 size={18} />
                    <strong>No current shipment alerts</strong>
                    <span>
                      No failed-delivery statuses or overdue saved forecasts were found.
                    </span>
                  </div>
                ) : (
                  recentAlerts.map(({ shipment, kind }) => {
                    const tracking = getTrackingNumber(shipment);
                    const forecast = forecastsByShipment.get(
                      String(getShipmentId(shipment))
                    );

                    return (
                      <div
                        className="support-alert"
                        key={`${getShipmentId(shipment)}-${kind}`}
                      >
                        <div className={`support-alert-icon ${kind === "failed" ? "danger" : "warning"}`}>
                          {kind === "failed" ? <ShieldAlert size={15} /> : <AlertCircle size={15} />}
                        </div>

                        <div>
                          <strong>
                            {kind === "failed"
                              ? formatStatus(getStatus(shipment))
                              : "Forecast delivery time passed"}
                          </strong>

                          <p>
                            {tracking} · {getRoute(shipment) || "Route unavailable"}
                          </p>

                          <small>
                            {kind === "failed"
                              ? formatRelativeDate(getDate(shipment))
                              : `Predicted ${formatDateTime(forecast?.predictedDeliveryTime)}`}
                          </small>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          <section className="support-card quick-card">
            <div className="support-card-header">
              <div>
                <span>SUPPORT TOOLS</span>
                <h2>Quick Actions</h2>
              </div>

              <Zap size={15} />
            </div>

            <div className="support-quick-actions">
              <Link to="/support/shipments">
                <div className="quick-icon orange">
                  <PackageCheck size={16} />
                </div>

                <div>
                  <strong>Shipments</strong>
                  <span>View shipment records</span>
                </div>

                <ArrowRight size={13} />
              </Link>

              <Link to="/support/tracking">
                <div className="quick-icon cyan">
                  <MapPin size={16} />
                </div>

                <div>
                  <strong>Live Tracking</strong>
                  <span>Track shipment locations</span>
                </div>

                <ArrowRight size={13} />
              </Link>

              <Link to="/support/reports">
                <div className="quick-icon purple">
                  <Box size={16} />
                </div>

                <div>
                  <strong>Reports</strong>
                  <span>Review shipment reports</span>
                </div>

                <ArrowRight size={13} />
              </Link>

              <Link to="/support/notifications">
                <div className="quick-icon red">
                  <Bell size={16} />
                </div>

                <div>
                  <strong>Notifications</strong>
                  <span>View available updates</span>
                </div>

                <ArrowRight size={13} />
              </Link>
            </div>
          </section>

          <div className="support-footer-status">
            <div>
              {lastRefreshed && <span className="support-green-dot" />}
              <strong>
                {lastRefreshed ? "Shipment data refreshed" : "Shipment data unavailable"}
              </strong>
              <small>
                {lastRefreshed
                  ? `Last refresh: ${lastRefreshed.toLocaleTimeString()}`
                  : "Waiting for a successful backend response"}
              </small>
            </div>

            <div className="support-footer-right">
              <span>Refresh interval: 30 seconds</span>
            </div>
          </div>
            </>
          )}

          {currentView === "shipments" && (
            <>
              <div className="support-search-card">
                <div className="support-search-title">
                  <div className="support-search-icon"><Search size={19} /></div>
                  <div>
                    <span>SHIPMENT LOOKUP</span>
                    <h2>Search shipments</h2>
                    <p>Search by the backend tracking number or reference ID.</p>
                  </div>
                </div>
                <div className="support-search-box">
                  <Search size={14} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tracking number or reference..."
                    aria-label="Search by tracking number or reference"
                  />
                  {search && <button onClick={() => setSearch("")}>Clear</button>}
                </div>
              </div>
              <section className="support-card">
                <div className="support-card-header">
                  <div>
                    <span>BACKEND SHIPMENT RECORDS</span>
                    <h2>{search ? "Matching Shipments" : "All Shipments"}</h2>
                  </div>
                  <span>                  {loading ? "Loading..." : lastRefreshed ? `${filteredShipments.length} records` : "Records unavailable"}</span>
                </div>
                <div className="support-shipment-list">
                  {loading ? (
                    <div className="support-no-results"><Clock3 size={20} /><strong>Loading shipments...</strong></div>
                  ) : !lastRefreshed ? (
                    <div className="support-no-results"><AlertCircle size={20} /><strong>Shipment data unavailable</strong></div>
                  ) : filteredShipments.length === 0 ? (
                    <div className="support-no-results"><PackageCheck size={20} /><strong>No matching shipments</strong><span>{search ? "No tracking number or reference matched." : "No shipment records are available."}</span></div>
                  ) : (
                    filteredShipments.map((shipment) => (
                      <div className="support-shipment" key={getShipmentId(shipment)}>
                        <div className="shipment-symbol">{getShipmentIcon(getStatus(shipment))}</div>
                        <div className="shipment-details">
                          <strong>{getTrackingNumber(shipment) || "Tracking number unavailable"}</strong>
                          <span>{getRoute(shipment) || "Route unavailable"}</span>
                          <small><Clock3 size={9} />Latest shipment update: {formatRelativeDate(getDate(shipment))}</small>
                        </div>
                        <div className="shipment-state">
                          <span className={`support-status ${getShipmentStatusClass(getStatus(shipment))}`}>{formatStatus(getStatus(shipment))}</span>
                          {shipment.referenceId && <small>Ref: {shipment.referenceId}</small>}
                        </div>
                        <button className="shipment-eye" onClick={() => openTracking(shipment)} title="View tracking" aria-label={`View tracking for ${getTrackingNumber(shipment)}`}>
                          <Eye size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}

          {currentView === "tracking" && (
            <>
              <form className="support-search-card" onSubmit={searchForTracking}>
                <div className="support-search-title">
                  <div className="support-search-icon"><MapPin size={19} /></div>
                  <div>
                    <span>SHIPMENT TRACKING</span>
                    <h2>Find tracking details</h2>
                    <p>Enter a tracking number or reference ID.</p>
                  </div>
                </div>
                <div className="support-search-box">
                  <Search size={14} />
                  <input
                    value={trackingSearch}
                    onChange={(event) => setTrackingSearch(event.target.value)}
                    placeholder="Tracking number or reference..."
                    aria-label="Tracking number or reference"
                  />
                  <button type="submit">Track</button>
                </div>
              </form>
              {trackingError && <div className="support-page-error">{trackingError}</div>}
              <section className="support-card">
                <div className="support-card-header">
                  <div><span>LOCATION &amp; DELIVERY PROGRESS</span><h2>Tracking details</h2></div>
                  {trackingLoading && <span>Refreshing...</span>}
                </div>
                {!trackingDetails ? (
                  <div className="support-no-results">
                    <MapPin size={20} />
                    <strong>{trackingLoading ? "Loading tracking details..." : "Search for a shipment"}</strong>
                    <span>{trackingLoading ? "Fetching current status and tracking history." : "Location is shown only when recorded by the backend."}</span>
                  </div>
                ) : (
                  <div className="support-detail-content">
                    <div className="support-detail-grid">
                      <div><span>Tracking number</span><strong>{trackingDetails.shipment.trackingNumber || "Not provided"}</strong></div>
                      {trackingDetails.shipment.referenceId && <div><span>Reference</span><strong>{trackingDetails.shipment.referenceId}</strong></div>}
                      <div><span>Route</span><strong>{getRoute(trackingDetails.shipment) || "Not provided"}</strong></div>
                      <div><span>Current status</span><strong>{formatStatus(getStatus(trackingDetails.shipment))}</strong></div>
                      <div><span>Current location</span><strong>{trackingDetails.tracking.currentLocation?.locationName || "No location recorded"}</strong></div>
                      {forecastsByShipment.get(String(trackingDetails.shipment.id))?.predictedDeliveryTime && (
                        <div>
                          <span>Saved predicted delivery</span>
                          <strong>{formatDateTime(forecastsByShipment.get(String(trackingDetails.shipment.id)).predictedDeliveryTime)}</strong>
                        </div>
                      )}
                      {trackingDetails.tracking.currentLocation?.latitude != null && trackingDetails.tracking.currentLocation?.longitude != null && (
                        <div><span>Coordinates</span><strong>{trackingDetails.tracking.currentLocation.latitude}, {trackingDetails.tracking.currentLocation.longitude}</strong></div>
                      )}
                      {trackingDetails.tracking.currentLocation?.recordedAt && (
                        <div><span>Location recorded</span><strong>{formatRelativeDate(trackingDetails.tracking.currentLocation.recordedAt)}</strong></div>
                      )}
                    </div>
                    <div className="support-history-columns">
                      <div>
                        <div className="support-card-header"><div><span>STATUS EVENTS</span><h2>Shipment history</h2></div></div>
                        {trackingDetails.history.length === 0 ? (
                          <div className="support-empty-inline">No status history is available.</div>
                        ) : (
                          <div className="support-alert-list">
                            {trackingDetails.history.map((entry) => (
                              <div className="support-alert" key={entry.id}>
                                <div className="support-alert-icon success"><CheckCircle2 size={15} /></div>
                                <div><strong>{formatStatus(entry.status)}</strong><p>{entry.remarks || ""}</p><small>{entry.createdAt ? formatRelativeDate(entry.createdAt) : ""}{entry.updatedByName ? ` · ${entry.updatedByName}` : ""}</small></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="support-card-header"><div><span>RECORDED LOCATIONS</span><h2>Location history</h2></div></div>
                        {!trackingDetails.tracking.locationHistory?.length ? (
                          <div className="support-empty-inline">No location history is available.</div>
                        ) : (
                          <div className="support-alert-list">
                            {trackingDetails.tracking.locationHistory.map((entry) => (
                              <div className="support-alert" key={entry.id}>
                                <div className="support-alert-icon warning"><MapPin size={15} /></div>
                                <div><strong>{entry.locationName || `${entry.latitude}, ${entry.longitude}`}</strong><p>{entry.latitude != null && entry.longitude != null ? `${entry.latitude}, ${entry.longitude}` : ""}</p><small>{entry.recordedAt ? formatRelativeDate(entry.recordedAt) : ""}</small></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {currentView === "notifications" && (
            <section className="support-card">
              <div className="support-card-header">
                <div><span>STATUS &amp; FORECAST ALERTS</span><h2>Shipment alerts &amp; exceptions</h2></div>
                <div className="exception-count">{loading ? "..." : lastRefreshed ? alertRecords.length : "—"}</div>
              </div>
              <div className="exception-message">
                <AlertCircle size={14} />
                <span>The backend has no notification feed. This view derives exceptions from FAILED_DELIVERY status and overdue warnings from saved forecast delivery times; it does not create forecast data.</span>
              </div>
              {forecastError && <div className="support-page-error">{forecastError}</div>}
              {loading ? (
                <div className="support-no-results"><Clock3 size={20} /><strong>Loading shipment exceptions...</strong></div>
              ) : !lastRefreshed ? (
                <div className="support-no-results"><AlertCircle size={20} /><strong>Shipment data unavailable</strong></div>
              ) : !forecastsLoaded && !forecastError && failedShipments.length === 0 ? (
                <div className="support-no-results"><Clock3 size={20} /><strong>Loading saved forecast data...</strong></div>
              ) : alertRecords.length === 0 ? (
                <div className="support-no-results"><CheckCircle2 size={20} /><strong>No current shipment alerts</strong><span>No failed-delivery status or overdue saved forecast was found.</span></div>
              ) : (
                <div className="support-shipment-list">
                  {alertRecords.map(({ shipment, kind }) => (
                    <div className="support-shipment" key={`${getShipmentId(shipment)}-${kind}`}>
                      <div className="shipment-symbol">{kind === "failed" ? <ShieldAlert size={16} /> : <AlertCircle size={16} />}</div>
                      <div className="shipment-details">
                        <strong>{getTrackingNumber(shipment) || "Tracking number unavailable"}</strong>
                        <span>{getRoute(shipment) || "Route unavailable"}</span>
                        <small><Clock3 size={9} />{kind === "failed" ? `Latest shipment update: ${formatRelativeDate(getDate(shipment))}` : `Predicted delivery: ${formatDateTime(forecastsByShipment.get(String(getShipmentId(shipment)))?.predictedDeliveryTime)}`}</small>
                      </div>
                      <div className="shipment-state"><span className={`support-status ${kind === "failed" ? "delayed" : "in-transit"}`}>{kind === "failed" ? "Failed Delivery" : "Forecast overdue"}</span>{shipment.referenceId && <small>Ref: {shipment.referenceId}</small>}</div>
                      <button className="shipment-eye" onClick={() => openTracking(shipment)} title="View tracking" aria-label={`View tracking for ${getTrackingNumber(shipment)}`}><Eye size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {currentView === "reports" && (
            <>
              <div className="support-stats support-report-stats">
                <div className="support-stat"><div className="support-stat-icon orange"><PackageCheck size={19} /></div><div className="support-stat-content"><span>TOTAL SHIPMENTS</span><strong>{loading ? "..." : lastRefreshed ? shipments.length : "—"}</strong><small>Records returned by backend</small></div></div>
                <div className="support-stat"><div className="support-stat-icon purple"><Truck size={19} /></div><div className="support-stat-content"><span>ACTIVE</span><strong>{loading ? "..." : lastRefreshed ? activeShipments.length : "—"}</strong><small>Not delivered, failed or cancelled</small></div></div>
                <div className="support-stat"><div className="support-stat-icon cyan"><CheckCircle2 size={19} /></div><div className="support-stat-content"><span>DELIVERED</span><strong>{loading ? "..." : lastRefreshed ? deliveredShipments.length : "—"}</strong><small>Current delivered status</small></div></div>
                <div className="support-stat"><div className="support-stat-icon red"><ShieldAlert size={19} /></div><div className="support-stat-content"><span>FAILED DELIVERY</span><strong>{loading ? "..." : lastRefreshed ? failedShipments.length : "—"}</strong><small>Current exception status</small></div></div>
              </div>
              <section className="support-card">
                <div className="support-card-header">
                  <div><span>BACKEND STATUS ENUM</span><h2>Shipment status breakdown</h2></div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={exportExcel}
                      disabled={!canExportReport || Boolean(exportingFormat)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "8px 10px",
                        border: "1px solid rgba(249, 115, 22, 0.2)",
                        borderRadius: "8px",
                        color: "#fb7185",
                        background: "rgba(249, 115, 22, 0.06)",
                        fontSize: "8px",
                        fontWeight: 700,
                        cursor: canExportReport && !exportingFormat ? "pointer" : "not-allowed",
                        opacity: canExportReport && !exportingFormat ? 1 : 0.55,
                      }}
                    >
                      {exportingFormat === "xlsx" ? "Exporting..." : "Export to Excel"}
                    </button>
                    <button
                      type="button"
                      onClick={exportPdf}
                      disabled={!canExportReport || Boolean(exportingFormat)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "8px 10px",
                        border: "1px solid rgba(124, 58, 237, 0.2)",
                        borderRadius: "8px",
                        color: "#c4b5fd",
                        background: "rgba(124, 58, 237, 0.06)",
                        fontSize: "8px",
                        fontWeight: 700,
                        cursor: canExportReport && !exportingFormat ? "pointer" : "not-allowed",
                        opacity: canExportReport && !exportingFormat ? 1 : 0.55,
                      }}
                    >
                      {exportingFormat === "pdf" ? "Exporting..." : "Export to PDF"}
                    </button>
                  </div>
                </div>
                {exportError && <div className="support-page-error">{exportError}</div>}
                {forecastError && <div className="exception-message">Saved forecast data could not be loaded; exports include shipment records and identify this omission.</div>}
                {!canExportReport && (
                  <div className="exception-message">
                    {loading || !forecastsLoaded
                      ? "Reports become exportable after current backend data has loaded."
                      : "Shipment data is unavailable; reports cannot be exported."}
                  </div>
                )}
                <div className="support-report-list">
                  {SHIPMENT_STATUSES.map((status) => (
                    <div className="support-report-row" key={status}>
                      <span className={`support-status ${getShipmentStatusClass(status)}`}>{formatStatus(status)}</span>
                      <strong>{loading ? "..." : lastRefreshed ? shipments.filter((shipment) => getStatus(shipment) === status).length : "—"}</strong>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {currentView === "account" && (
            <section className="support-card">
              <div className="support-card-header"><div><span>AUTHENTICATED PROFILE</span><h2>Account details</h2></div><User size={15} /></div>
              {!user ? (
                <div className="support-no-results"><Clock3 size={20} /><strong>{loading ? "Loading account..." : "Account details unavailable"}</strong></div>
              ) : (
                <div className="support-detail-grid support-account-grid">
                  {[
                    ["Name", user.fullName],
                    ["Email", user.email],
                    ["Role", user.role],
                    ["Phone", user.phoneNumber],
                    ["Registration ID", user.registerId],
                    ["Account created", user.createdAt ? formatDate(user.createdAt) : null],
                    ["Last profile update", user.updatedAt ? formatDate(user.updatedAt) : null],
                  ].filter(([, value]) => value != null && value !== "").map(([label, value]) => (
                    <div key={label}><span>{label}</span><strong>{value}</strong></div>
                  ))}
                </div>
              )}
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default SupportDashboard;