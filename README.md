# Event Registration System

A RESTful API for browsing events and managing registrations, built with Express, Prisma, and PostgreSQL (hosted on Neon). Supports viewing events, submitting registrations with capacity enforcement, and cancelling registrations without losing history.

## Tech Stack

- **Node.js** (ECMAScript Modules)
- **Express** — web framework / routing
- **Prisma ORM** (`prisma-client-js` generator) — database modeling and queries
- **PostgreSQL** (Neon) — relational database
- **@prisma/adapter-pg** — driver adapter required by Prisma 7 for runtime connections
- **dotenv** — environment variable management
- **nodemon** (dev) — auto-restart on file changes

## Project Structure

```
event-registration-system/
├── prisma/
│   ├── schema.prisma           # Data models: User, Event, Registration
│   └── migrations/             # Version-controlled schema history
├── config/
│   └── prisma.js               # Shared Prisma Client instance (pg adapter)
├── controllers/
│   ├── userController.js       # User creation, view a user's registrations
│   ├── eventController.js      # Event CRUD (list/detail/create) + registration submission
│   └── registrationController.js  # Cancel a registration
├── routes/
│   ├── userRoutes.js
│   ├── eventRoutes.js
│   └── registrationRoutes.js
├── middleware/
│   └── errorHandler.js         # Centralized error handler (Prisma error codes)
├── postman/
│   └── Event-Registration-System.postman_collection.json
├── prisma7.config.ts           # CLI-side Prisma config (migration/studio connection)
├── .env                         # Environment variables (not committed)
├── .gitignore
├── server.js                    # App entry point
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (managed via [nvm](https://github.com/nvm-sh/nvm) recommended)
- A PostgreSQL connection string (this project uses [Neon](https://neon.tech))

### Installation

```bash
git clone https://github.com/samstar001/CodeAlpha_event_registration_system.git
cd CodeAlpha_event_registration_system
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/<database>?sslmode=require"
PORT=5000
```

> Note: use Neon's **direct** connection string (no `-pooler` in the hostname) for the most reliable local development experience.

### Database setup

```bash
npx prisma generate      # generates the Prisma Client into node_modules/@prisma/client
npx prisma migrate dev   # creates/syncs tables in your PostgreSQL database
```

### Running the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

On success:

```
Server running on port 5000
```

## Data Model

### User

| Field       | Type          | Notes            |
| ----------- | ------------- | ---------------- |
| `id`        | String (UUID) | Primary key      |
| `name`      | String        | Required         |
| `email`     | String        | Required, unique |
| `createdAt` | DateTime      | Auto             |

### Event

| Field         | Type          | Notes                                  |
| ------------- | ------------- | -------------------------------------- |
| `id`          | String (UUID) | Primary key                            |
| `title`       | String        | Required                               |
| `description` | String        | Optional                               |
| `date`        | DateTime      | Required                               |
| `location`    | String        | Optional                               |
| `capacity`    | Int           | Required — max confirmed registrations |
| `createdAt`   | DateTime      | Auto                                   |

### Registration

| Field          | Type          | Notes                                            |
| -------------- | ------------- | ------------------------------------------------ |
| `id`           | String (UUID) | Primary key                                      |
| `userId`       | String        | Foreign key → User                               |
| `eventId`      | String        | Foreign key → Event                              |
| `status`       | Enum          | `CONFIRMED` \| `CANCELLED` — default `CONFIRMED` |
| `registeredAt` | DateTime      | Auto                                             |

A unique constraint on `(userId, eventId)` prevents a user from registering twice for the same event. Cancelling a registration sets `status` to `CANCELLED` rather than deleting the row, preserving registration history.

## API Reference

Base URL: `http://localhost:5000/api`

### Users

**Create a user**

```
POST /api/users
```

Body:

```json
{ "name": "Michael Samuel", "email": "michael@example.com" }
```

**Get all users**

```
GET /api/users
```

**Get a single user**

```
GET /api/users/:id
```

**Get a user's registrations** (includes event details)

```
GET /api/users/:id/registrations
```

### Events

**Create an event**

```
POST /api/events
```

Body:

```json
{
  "title": "School Planning",
  "description": "Planning ahead for second semester",
  "capacity": 3,
  "date": "2026-12-10T14:30:00Z",
  "location": "Abuja, Nigeria"
}
```

**Get all events** (includes confirmed registration count)

```
GET /api/events
```

**Get a single event**

```
GET /api/events/:id
```

**Register for an event**

```
POST /api/events/:id/register
```

Body:

```json
{ "userId": "<user-id>" }
```

Success — `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "userId": "...",
    "eventId": "...",
    "status": "CONFIRMED"
  }
}
```

Error — `409 Conflict` (event full):

```json
{ "success": false, "message": "Event is full" }
```

Error — `409 Conflict` (duplicate registration):

```json
{ "success": false, "message": "Duplicate value for: userId, eventId" }
```

### Registrations

**Cancel a registration**

```
PATCH /api/registrations/:id/cancel
```

Success — `200 OK`:

```json
{ "success": true, "data": { "id": "...", "status": "CANCELLED" } }
```

Error — `404 Not Found`:

```json
{ "success": false, "message": "Registration not found" }
```

Error — `409 Conflict` (already cancelled):

```json
{ "success": false, "message": "Registration is already cancelled" }
```

## Error Handling

All errors are caught by a centralized error-handling middleware (`middleware/errorHandler.js`) and returned in a consistent shape:

```json
{ "success": false, "message": "..." }
```

| Error Type                                                            | Prisma Code                   | Status |
| --------------------------------------------------------------------- | ----------------------------- | ------ |
| Unique constraint violation (duplicate email, duplicate registration) | `P2002`                       | 409    |
| Record not found on update/delete                                     | `P2025`                       | 404    |
| Foreign key constraint failed (invalid `userId`/`eventId`)            | `P2003`                       | 400    |
| Invalid input shape/type                                              | `PrismaClientValidationError` | 400    |
| Database connection timeout                                           | `ETIMEDOUT`                   | 503    |
| Unhandled error                                                       | —                             | 500    |

## License

This project was built as part of the CodeAlpha internship program, as a learning/assignment exercise.
