# ShipTrack Pro — Integrated First 4 Tasks

This folder combines the current React frontend with the completed Spring Boot shipment/auth backend.

## First 4 Milestone-1 tasks

1. Database Schema Design — backend entities/JPA/PostgreSQL configuration included.
2. JWT Authentication — register/login + JWT generation/validation.
3. Role-Based Access Control — Spring Security + `@PreAuthorize` on shipment operations, with role-aware ownership checks in the service.
4. Shipment Management APIs — create, list, get, update, status update, cancel, and history endpoints.

## Run

### Backend

```powershell
cd backend
.\mvnw.cmd clean spring-boot:run
```

Backend runs on `http://localhost:8080`.

Update `backend/src/main/resources/application.properties` if your PostgreSQL username/password differs.

### Frontend

Open another terminal:

```powershell
cd Frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.
Set `VITE_API_BASE_URL` before starting Vite to use a different backend URL; the default is `http://localhost:8080`.

## Main API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/shipments`
- `GET /api/shipments`
- `GET /api/shipments/{id}`
- `GET /api/shipments/track/{trackingNumber}`
- `PUT /api/shipments/{id}`
- `PATCH /api/shipments/{id}/status`
- `PATCH /api/shipments/{id}/cancel`
- `GET /api/shipments/{id}/history`
- `GET /api/shipments/{id}/location` and `/location-history`
- `PATCH /api/shipments/{id}/location`
- `POST /api/shipments/{id}/eta`
- `POST /api/routes/shipment/{id}/calculate`
- `GET /api/routes/shipment/{id}`
- `POST /api/forecasts/generate?shipmentId={id}`
- `GET /api/forecasts/shipment/{id}`
- `POST` and `GET /api/shipments/{id}/pod`
- `GET /api/notifications`
- `PATCH /api/notifications/{id}/read` and `/read-all`

Forecast responses include a limited shipment summary rather than serializing
the full shipment and its related user accounts.
The current-location endpoint returns `204 No Content` when no location has
been recorded; ETA calculations then use saved route origin coordinates.

The React login stores the JWT and uses it as a Bearer token for protected shipment requests.
