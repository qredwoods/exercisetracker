# SparkMvmt – Exercise Tracker

Create, edit, review, and delete exercise logs.

SparkMvmt is a full-stack MERN application featuring a responsive React frontend and a REST API backend built with Express, Mongoose, and MongoDB.

The app allows users to quickly log workouts, track exercise details, and manage their training history through a clean and responsive interface.

## ⚠️ 3/12/26: In Progress: Auth Integration
Backend auth is complete (JWT access/refresh tokens, protected routes). `test-requests.http` updated.
Frontend auth UI is next — app will not load exercises until that lands. 

### Note - title is changing, new working title in code

---

# Screenshots

### Early Prototype
<img width="607" height="405" alt="Screenshot 2026-03-10 at 7 47 42 AM" src="https://github.com/user-attachments/assets/b285916c-53c1-4861-b757-775fa74d3692" />


### Current Version
#### Home


<img width="732" height="756" alt="Screenshot 2026-03-10 at 6 52 51 AM" src="https://github.com/user-attachments/assets/5c155e4c-898f-46d4-b923-fd7b8952146b" />

#### Add

<img width="550" height="834" alt="Screenshot 2026-03-10 at 7 13 14 AM" src="https://github.com/user-attachments/assets/7e23a124-0f89-46b6-a56f-e54ea04bf633" />

The interface evolved significantly during development, progressing from a minimal prototype to a polished, responsive UI with improved table interactions, accessibility, and mobile support.

---

# Features

- Create, edit, duplicate, and delete exercise logs
- Responsive UI (desktop and mobile layouts)
- Bodyweight exercise support
- Accessible form controls and icon buttons
- Client-side form validation
- MongoDB persistence
- RESTful API backend
- Environment-based configuration with `.env`

---

# Tech Stack

### Frontend
- React
- Vite
- React Router
- React Icons

### Backend
- Node.js
- Express
- MongoDB
- Mongoose

---

# Project Structure


/frontend → Frontend (React + Vite)
/backend → REST API (Node.js, Express, MongoDB)

The backend can run independently of the frontend.
The frontend can also run without the backend for UI development, though CRUD functionality will not be available.

---

# Running the Project Locally

## Backend Setup

This project requires a **MongoDB connection string**.

You can obtain one by creating a free MongoDB Atlas account:

https://www.mongodb.com/resources/products/fundamentals/mongodb-connection-string

### Configure environment variables

Copy the example file:

`cp .env.example .env`

Then populate the values. 

### Start the backend

From `backend` folder:
```
npm install
npm start
```


The server will indicate whether the MongoDB connection was successful.

---

### Frontend Setup

From the `frontend` folder:

```
npm install
npm run dev
```
The application will run locally at http://localhost:5173


If that port is already in use, Vite will automatically select another available port.

---

## Using the App

Once both frontend and backend are running you can:

- Log new exercises
- Edit existing workouts
- Duplicate previous entries
- Delete exercises
- View all stored workouts

All changes persist to your MongoDB database.

---

## API Testing

You can interact with the backend API directly using the included file:
`test-requests.http`


Many IDEs (such as VS Code with the REST Client extension) allow sending HTTP requests directly from this file.

---

# Design Decisions

SparkMvmt was built with a focus on clarity, maintainability, and progressive improvement.

## Stateless REST API
The backend is a simple REST API built with Express and Mongoose. The API remains stateless and can be tested independently of the frontend.

## Frontend / Backend Separation
The frontend (`react`) and backend (`rest`) are separate applications. This mirrors real-world deployments and allows each layer to run independently during development.

## Environment Configuration
Runtime configuration is handled through environment variables using `.env`. A `.env.example` file is provided so the project can be configured easily without exposing secrets.

## Demo Mode Support
The `DEMO_READ_ONLY` flag can disable write operations. This allows the project to be deployed publicly in demo mode without allowing database modifications.

## Responsive UI
The interface adapts between a compact stacked layout and a wider table layout to remain usable on both desktop and smaller screens.

## Accessibility Considerations
The interface attempts to support accessible interaction patterns:

- Button elements are used for action icons
- `aria-label` attributes are included for icon buttons
- Focus states are preserved for keyboard navigation

## Progressive UI Iteration
The UI evolved significantly during development. Early versions focused on functionality, while later iterations improved:

- visual hierarchy and appeal
- table layout consistency
- clear action buttons
- responsive form design

---

# Roadmap

Planned improvements include:

- Application deployment (AWS: EC2, ALB, Cloudfront, S3 - initiated)
- User authentication (JWT, nearing completion)
- Exercise name autocomplete
- Grouping exercises by workouts
- Notes field
- Encryption of entries

---

## License

MIT License

---

## Author

Quinn Redwoods

