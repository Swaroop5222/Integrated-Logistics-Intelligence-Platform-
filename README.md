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

The React login stores the JWT and uses it as a Bearer token for protected shipment requests.
