# ShipTrack Pro — Integrated Logistics Intelligence Platform

ShipTrack Pro is an integrated logistics management platform with a React frontend and Spring Boot backend. The system provides shipment management, authentication, role-based access control, live delivery tracking, shipment status management, ETA calculation, and delivery forecasting.

## Milestone-1 Tasks

### 1. Database Schema Design

- JPA entities and PostgreSQL database configuration.
- Entities and relationships for users, shipments, tracking, notifications, routes, and related modules.

### 2. JWT Authentication

- User registration and login.
- JWT token generation and validation.
- Secure API access using Bearer tokens.

### 3. Role-Based Access Control

Implemented using Spring Security for:

- `CUSTOMER`
- `BUSINESS_CLIENT`
- `LOGISTICS_OPERATOR`
- `SUPPORT_AGENT`
- `ADMINISTRATOR`

Role-based permissions are implemented using Spring Security and `@PreAuthorize`.

### 4. Shipment Management APIs

Implemented APIs for:

- Create shipment
- List shipments
- Get shipment by ID
- Track shipment by tracking number
- Update shipment
- Update shipment status
- Cancel shipment
- View shipment status history

---

## Milestone-2 Tasks

### 1. Google Maps Integration

Integration for route visualization and location tracking is currently in progress.

### 2. Live Delivery Tracking

Backend implementation completed for shipment location tracking.

Features include:

- Update shipment location
- Get current shipment location
- Get location history
- Get live tracking information
- Store latitude and longitude
- Store location name and recorded time

### Live Tracking APIs

```text
PATCH /api/shipments/{id}/location
GET   /api/shipments/{id}/location
GET   /api/shipments/{id}/location-history
GET   /api/shipments/{id}/tracking