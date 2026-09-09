import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ShipmentMap.css";

const DEFAULT_POINTS = {
    origin: { lat: 17.385, lon: 78.4867 },
    destination: { lat: 12.9716, lon: 77.5946 },
};

function getProgress(status) {
    return { CREATED: 0.12, PICKED_UP: 0.35, IN_TRANSIT: 0.6, OUT_FOR_DELIVERY: 0.85, DELIVERED: 1, CANCELLED: 0 }[status] ?? 0.6;
}

function pointAtProgress(points, progress) {
    const index = Math.min(points.length - 1, Math.floor(progress * (points.length - 1)));
    const nextIndex = Math.min(points.length - 1, index + 1);
    const segmentProgress = progress * (points.length - 1) - index;
    const current = points[index];
    const next = points[nextIndex];
    return {
        lat: current[0] + (next[0] - current[0]) * segmentProgress,
        lon: current[1] + (next[1] - current[1]) * segmentProgress,
    };
}

async function geocode(address) {
    const query = encodeURIComponent(`${address || ""}, India`);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`, {
        headers: { "Accept-Language": "en" },
    });
    if (!response.ok) throw new Error("Location lookup failed");
    const results = await response.json();
    if (!results.length) throw new Error("Location not found");
    return { lat: Number(results[0].lat), lon: Number(results[0].lon) };
}

async function getRoute(origin, destination) {
    const coordinates = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`);
    if (!response.ok) throw new Error("Route lookup failed");
    const data = await response.json();
    const geometry = data.routes?.[0]?.geometry?.coordinates;
    if (!geometry?.length) throw new Error("Route not found");
    return {
        points: geometry.map(([lon, lat]) => [lat, lon]),
        distanceKm: Math.round(data.routes[0].distance / 1000),
    };
}

function ShipmentMap({ shipment }) {
    const mapElement = useRef(null);
    const mapRef = useRef(null);
    const layersRef = useRef(null);
    const [mapData, setMapData] = useState(null);
    const [mapError, setMapError] = useState("");
    const status = shipment?.status || "IN_TRANSIT";
    const [liveProgress, setLiveProgress] = useState(() => getProgress(status));
    const currentPoint = mapData
        ? pointAtProgress(mapData.points, Math.max(liveProgress, getProgress(status)))
        : null;
    const originAddress = shipment?.senderAddress || "Hyderabad";
    const destinationAddress = shipment?.receiverAddress || "Bengaluru";

    useEffect(() => {
        if (!mapElement.current || mapRef.current) return undefined;
        mapRef.current = L.map(mapElement.current, { zoomControl: false });
        L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19,
        }).addTo(mapRef.current);
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        let active = true;
        async function loadRoute() {
            setMapError("");
            try {
                const [origin, destination] = await Promise.all([geocode(originAddress), geocode(destinationAddress)]);
                const route = await getRoute(origin, destination);
                if (active) setMapData({ origin, destination, ...route });
            } catch {
                if (active) {
                    setMapData({
                        origin: DEFAULT_POINTS.origin,
                        destination: DEFAULT_POINTS.destination,
                        points: [[DEFAULT_POINTS.origin.lat, DEFAULT_POINTS.origin.lon], [DEFAULT_POINTS.destination.lat, DEFAULT_POINTS.destination.lon]],
                    });
                    setMapError("Live route service unavailable. Showing the planned corridor.");
                }
            }
        }
        loadRoute();
        return () => { active = false; };
    }, [originAddress, destinationAddress]);

    useEffect(() => {
        if (!mapData) return undefined;
        const timer = window.setInterval(() => {
            setLiveProgress((value) => Math.min(1, value + 0.01));
        }, 3000);
        return () => window.clearInterval(timer);
    }, [mapData, status]);

    useEffect(() => {
        if (!mapRef.current || !mapData || !currentPoint) return;
        layersRef.current?.clearLayers();
        layersRef.current = L.layerGroup().addTo(mapRef.current);
        const routeLine = L.polyline(mapData.points, { color: "#e85d3f", weight: 5, opacity: 0.85 });
        const originMarker = L.circleMarker([mapData.origin.lat, mapData.origin.lon], { radius: 8, color: "#0f766e", fillColor: "#14b8a6", fillOpacity: 1, weight: 3 }).bindTooltip("Origin");
        const destinationMarker = L.circleMarker([mapData.destination.lat, mapData.destination.lon], { radius: 8, color: "#9f1239", fillColor: "#fb7185", fillOpacity: 1, weight: 3 }).bindTooltip("Destination");
        const vehicleMarker = L.circleMarker([currentPoint.lat, currentPoint.lon], { radius: 9, color: "#fff7ed", fillColor: "#f97316", fillOpacity: 1, weight: 3 }).bindTooltip(status === "DELIVERED" ? "Delivered" : "Current shipment location");
        layersRef.current.addLayer(routeLine).addLayer(originMarker).addLayer(destinationMarker).addLayer(vehicleMarker);
        mapRef.current.fitBounds(routeLine.getBounds(), { padding: [28, 28] });
    }, [currentPoint, mapData, status]);

    return (
        <section className="shipment-map-card">
            <div className="shipment-map-heading">
                <div><span className="shipment-map-eyebrow">ROUTE VISUALIZATION</span><h2>Shipment location</h2></div>
                <span className="shipment-map-provider">OpenStreetMap + OSRM</span>
            </div>
            <div className="shipment-map" ref={mapElement} aria-label="Shipment route map" />
            <div className="shipment-map-meta">
                <span><i className="map-dot map-dot-origin" /> Origin</span>
                <span><i className="map-dot map-dot-current" /> Current location</span>
                <span><i className="map-dot map-dot-destination" /> Destination</span>
                {mapData?.distanceKm && <strong>{mapData.distanceKm} km planned route</strong>}
            </div>
            {mapError && <p className="shipment-map-note">{mapError}</p>}
        </section>
    );
}

export default ShipmentMap;