# Gursha API Documentation

Base URL: `/api`

## Authentication & Access

- Public: no token required.
- Private: requires header `Authorization: Bearer <token>`.
- Admin only: private route + user role must be `admin`.
- Staff only: private route + user role must be `staff` and assigned to a restaurant.

Common auth errors:

- `401 { "message": "Not authorized" }` (missing/invalid token)
- `403 { "message": "Access denied: Admin only" }`
- `403 { "message": "Access denied: Staff only" }`
- `403 { "message": "Staff is not assigned to any restaurant" }`

---

## Auth Routes

### 1) Register User
- Method/Route: `POST /api/auth/register`
- Access: Public
- Input (JSON body):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```
- Validation:
  - `name` required
  - `email` must be valid
  - `password` required, min length 6
- Success response:
  - `201`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```
- Expected errors:
  - `400` validation errors
  - `400 { "message": "User already exists" }`
  - `500` server error

### 2) Login User
- Method/Route: `POST /api/auth/login`
- Access: Public
- Input (JSON body):
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```
- Validation:
  - `email` must be valid
  - `password` required
- Success response:
  - `200`
```json
{
  "message": "User logged in successfully",
  "token": "<jwt-token>"
}
```
- Expected errors:
  - `400` validation errors
  - `401 { "message": "Invalid credentials" }`
  - `500` server error

### 3) Get Current User
- Method/Route: `GET /api/auth/me`
- Access: Private
- Headers: `Authorization: Bearer <token>`
- Input: none
- Success response:
  - `200`
```json
{
  "message": "Current user info",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "diner"
  }
}
```
- Expected errors:
  - `401` not authorized
  - `404 { "message": "User not found" }`
  - `500` server error

### 4) Assign Staff Role
- Method/Route: `PUT /api/auth/assign-staff/:userId`
- Access: Private, Admin only
- Headers: `Authorization: Bearer <token>`
- Params:
  - `userId` (Mongo ObjectId)
- Input (JSON body):
```json
{
  "restaurantId": "<restaurant-object-id>"
}
```
- Success response:
  - `200`
```json
{
  "message": "User promoted to staff successfully",
  "user": {
    "_id": "...",
    "role": "staff",
    "restaurant": "..."
  }
}
```
- Expected errors:
  - `401` not authorized
  - `403` admin only
  - `404 { "message": "User not found" }`
  - `400 { "message": "Invalid Restaurant id." }`
  - `500` server error

---

## Reservation Routes

### 1) Create Reservation
- Method/Route: `POST /api/reservations`
- Access: Private (authenticated user)
- Headers: `Authorization: Bearer <token>`
- Input (JSON body):
```json
{
  "restaurant": "<restaurant-object-id>",
  "date": "2026-02-13",
  "time": "19:30",
  "partySize": 4
}
```
- Validation:
  - `restaurant` required
  - `date` required
  - `time` required
  - `partySize` integer, min `1`
- Behavior:
  - Auto-selects first available table with `capacity >= partySize`
  - Reservation duration is fixed to 2 hours
- Success response:
  - `201`
```json
{
  "message": "Reservation created successfully",
  "reservation": {
    "_id": "...",
    "restaurant": "...",
    "table": "...",
    "partySize": 4,
    "status": "Pending",
    "startTime": "...",
    "endTime": "...",
    "user": "..."
  }
}
```
- Expected errors:
  - `400` validation errors
  - `404 { "message": "Restaurant not found" }`
  - `400 { "message": "No tables available for this party size" }`
  - `400 { "message": "No available tables for selected time" }`
  - `400 { "message": "Invalid ID format" }`
  - `400 { "message": "Table is already reserved for the selected date and time" }`
  - `500` server error

### 2) Get My Reservations
- Method/Route: `GET /api/reservations/my`
- Access: Private (authenticated user)
- Headers: `Authorization: Bearer <token>`
- Input: none
- Success response:
  - `200`
```json
{
  "reservations": [
    {
      "_id": "...",
      "restaurant": {
        "_id": "...",
        "name": "Restaurant Name"
      },
      "table": {
        "_id": "...",
        "name": "T1",
        "capacity": 4
      },
      "status": "Pending",
      "startTime": "...",
      "endTime": "..."
    }
  ]
}
```
- Expected errors:
  - `401` not authorized
  - `404 { "message": "No reservations found" }`
  - `500` server error

### 3) Cancel Reservation
- Method/Route: `PUT /api/reservations/cancel/:id`
- Access: Private (reservation owner)
- Headers: `Authorization: Bearer <token>`
- Params:
  - `id` reservation ObjectId
- Input: none
- Success response:
  - `200 { "message": "Reservation canceled successfully" }`
- Expected errors:
  - `401` not authorized
  - `403 { "message": "Unauthorized" }` (not reservation owner)
  - `404 { "message": "Reservation not found" }`
  - `400 { "message": "Invalid reservation ID format" }`
  - `500` server error

### 4) Get Reservations for Staff Restaurant
- Method/Route: `GET /api/reservations/restaurant`
- Access: Private, Staff only
- Headers: `Authorization: Bearer <token>`
- Input: none
- Behavior:
  - Uses staff member's assigned restaurant from token user lookup (`req.restaurantId`)
- Success response:
  - `200`
```json
{
  "message": "Reservations fetched successfully",
  "reservations": [
    {
      "_id": "...",
      "table": {
        "_id": "...",
        "name": "T1",
        "capacity": 4
      },
      "user": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```
- Expected errors:
  - `401` not authorized
  - `403` staff-related access errors
  - `404 { "message": "No reservations found for this restaurant" }`
  - `500` server error

### 5) Update Reservation Status
- Method/Route: `PUT /api/reservations/status/:id`
- Access: Private, Staff only
- Headers: `Authorization: Bearer <token>`
- Params:
  - `id` reservation ObjectId
- Input (JSON body):
```json
{
  "status": "Confirmed"
}
```
- Validation in route allows:
  - `Pending`, `Confirmed`, `Seated`, `Completed`, `Cancelled`
- Success response:
  - `200`
```json
{
  "message": "Reservation status updated successfully",
  "reservation": {
    "_id": "...",
    "status": "Confirmed"
  }
}
```
- Expected errors:
  - `400` validation errors
  - `401` not authorized
  - `403` staff-related access errors
  - `404 { "message": "Reservation not found" }`
  - `400 { "message": "Invalid reservation ID format" }`
  - `500` server error

### 6) Dashboard Analytics (Staff Restaurant)
- Method/Route: `GET /api/reservations/restaurant/dashboard`
- Access: Private, Staff only
- Headers: `Authorization: Bearer <token>`
- Input: none
- Success response:
  - `200`
```json
{
  "totalReservations": 120,
  "todayReservations": 8,
  "reservationsByDate": [
    { "_id": "2026-02-07", "count": 10 }
  ],
  "reservationsByStatus": [
    { "_id": "Pending", "count": 12 },
    { "_id": "Confirmed", "count": 20 }
  ],
  "mostBookedTables": [
    { "tableId": "...", "tableName": "T1", "count": 30 }
  ]
}
```
- Expected errors:
  - `401` not authorized
  - `403` staff-related access errors
  - `500` server error

---

## Restaurant Routes

### 1) Get All Restaurants
- Method/Route: `GET /api/restaurants`
- Access: Public
- Input: none
- Success response:
  - `200`
```json
{
  "data": [
    {
      "_id": "...",
      "name": "Gursha",
      "location": "Addis Ababa",
      "cuisine": "Ethiopian",
      "priceRange": "$$"
    }
  ]
}
```
- Expected errors:
  - `500 { "message": "Error fetching restaurants", "error": "..." }`

### 2) Get Restaurant By ID
- Method/Route: `GET /api/restaurants/:id`
- Access: Public
- Params:
  - `id` restaurant ObjectId
- Input: none
- Success response:
  - `200`
```json
{
  "data": {
    "_id": "...",
    "name": "Gursha",
    "location": "Addis Ababa",
    "cuisine": "Ethiopian"
  }
}
```
- Expected errors:
  - `404 { "message": "Restaurant not found" }`
  - `400 { "message": "Invalid restaurant ID" }`
  - `500 { "message": "Error fetching restaurant", "error": "..." }`

### 3) Create Restaurant
- Method/Route: `POST /api/restaurants`
- Access: Private, Admin only
- Headers: `Authorization: Bearer <token>`
- Input (JSON body):
```json
{
  "name": "Gursha",
  "location": "Addis Ababa",
  "cuisine": "Ethiopian",
  "priceRange": "$$",
  "hours": "10:00 AM - 10:00 PM",
  "menu": [
    { "name": "Doro Wat", "price": 15, "description": "Spicy chicken stew" }
  ],
  "photos": ["https://example.com/photo1.jpg"]
}
```
- Validation:
  - `name` required
  - `location` required
  - `cuisine` required
- Success response:
  - `201`
```json
{
  "message": "Restaurant created successfully",
  "restaurant": {
    "_id": "...",
    "name": "Gursha",
    "location": "Addis Ababa",
    "cuisine": "Ethiopian"
  }
}
```
- Expected errors:
  - `400` validation errors
  - `401` not authorized
  - `403` admin only
  - `500 { "message": "Server error" }`

### 4) Update Restaurant
- Method/Route: `PUT /api/restaurants/:id`
- Access: Private, Admin only
- Headers: `Authorization: Bearer <token>`
- Params:
  - `id` restaurant ObjectId
- Input (JSON body, all optional):
```json
{
  "name": "Gursha Updated",
  "location": "Bole",
  "cuisine": "Fusion",
  "priceRange": "$$$",
  "hours": "9:00 AM - 11:00 PM",
  "menu": [],
  "photos": [],
  "tables": [],
  "staff": []
}
```
- Success response:
  - `200`
```json
{
  "message": "Restaurant with id ... updated successfully",
  "restaurant": {
    "_id": "...",
    "name": "Gursha Updated"
  }
}
```
- Expected errors:
  - `401` not authorized
  - `403` admin only
  - `404 { "message": "Restaurant not found" }`
  - `400 { "message": "Invalid restaurant ID" }`
  - `500 { "message": "Server error", "error": "..." }`

### 5) Delete Restaurant
- Method/Route: `DELETE /api/restaurants/:id`
- Access: Private, Admin only
- Headers: `Authorization: Bearer <token>`
- Params:
  - `id` restaurant ObjectId
- Input: none
- Success response:
  - `200`
```json
{
  "message": "Restaurant with id ... deleted successfully"
}
```
- Expected errors:
  - `401` not authorized
  - `403` admin only
  - `404 { "message": "Restaurant not found" }`
  - `400 { "message": "Invalid restaurant ID" }`
  - `500 { "message": "Server error", "error": "..." }`

---

## Table Routes

### 1) Get Tables By Restaurant
- Method/Route: `GET /api/tables/:restaurantId`
- Access: Public
- Params:
  - `restaurantId` restaurant ObjectId
- Input: none
- Success response:
  - `200`
```json
{
  "message": "Tables retrieved successfully",
  "tables": [
    {
      "_id": "...",
      "restaurant": { "_id": "...", "name": "Gursha" },
      "name": "T1",
      "capacity": 4,
      "status": "Available"
    }
  ]
}
```
- Expected errors:
  - `404 { "error": "Restaurant not found" }`
  - `400 { "error": "Invalid restaurant ID" }`
  - `500 { "error": "Internal server error", "message": "..." }`

### 2) Create Table
- Method/Route: `POST /api/tables`
- Access: Private, Staff only
- Headers: `Authorization: Bearer <token>`
- Input (JSON body):
```json
{
  "restaurant": "<restaurant-object-id>",
  "name": "T1",
  "capacity": 4
}
```
- Validation:
  - `restaurant` required
  - `name` required
  - `capacity` integer, min `1`
- Success response:
  - `201`
```json
{
  "message": "Table created successfully",
  "table": {
    "_id": "...",
    "restaurant": "...",
    "name": "T1",
    "capacity": 4,
    "status": "Available"
  }
}
```
- Expected errors:
  - `400` validation errors
  - `400 { "error": "A table with this name already exists in the restaurant" }`
  - `404 { "error": "Restaurant not found" }`
  - `400 { "error": "Invalid restaurant ID" }`
  - `401` not authorized
  - `403` staff-related access errors
  - `500 { "error": "Internal server error", "message": "..." }`

### 3) Update Table
- Method/Route: `PUT /api/tables/:id`
- Access: Private, Staff only
- Headers: `Authorization: Bearer <token>`
- Params:
  - `id` table ObjectId
- Input (JSON body, all optional):
```json
{
  "name": "T2",
  "capacity": 6,
  "status": "Occupied"
}
```
- Success response:
  - `200`
```json
{
  "message": "Table updated successfully",
  "table": {
    "_id": "...",
    "name": "T2",
    "capacity": 6,
    "status": "Occupied"
  }
}
```
- Expected errors:
  - `401` not authorized
  - `403` staff-related access errors
  - `404 { "error": "Table not found" }`
  - `400 { "error": "Invalid table ID" }`
  - `500 { "error": "Internal server error", "message": "..." }`

### 4) Delete Table
- Method/Route: `DELETE /api/tables/:id`
- Access: Private, Staff only
- Headers: `Authorization: Bearer <token>`
- Params:
  - `id` table ObjectId
- Input: none
- Success response:
  - `200 { "message": "Table deleted successfully" }`
- Expected errors:
  - `401` not authorized
  - `403` staff-related access errors
  - `404 { "error": "Table not found" }`
  - `400 { "error": "Invalid table ID" }`
  - `500 { "error": "Internal server error", "message": "..." }`

---

## Notes / Current Implementation Gaps

- `PUT /api/reservations/status/:id` route accepts `Completed`, but reservation model enum does not include `Completed` (model includes `Declined` instead). This can cause a server-side validation failure at save time.
- `assign-staff` route currently has no `express-validator` checks, so missing `restaurantId` is not cleanly validated before DB operations.
