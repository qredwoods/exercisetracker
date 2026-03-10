# Exercise Tracker
Create, edit, review and delete exercise logs.

MERN app: a React frontend and REST API Express + Mongoose / MongoDB backend.

## Screenshots

### Home


<img width="732" height="756" alt="Screenshot 2026-03-10 at 6 52 51 AM" src="https://github.com/user-attachments/assets/5c155e4c-898f-46d4-b923-fd7b8952146b" />


### Add

<img width="550" height="834" alt="Screenshot 2026-03-10 at 7 13 14 AM" src="https://github.com/user-attachments/assets/7e23a124-0f89-46b6-a56f-e54ea04bf633" />


## Run
There is a react folder for the Frontend, and rest folder for the REST API. The REST API backend can run independently. So can the frontend, but it will lack any CRUD functionality, only showing starter UI and buttons.
### Frontend
From the frontend folder
```
npm i
npm run dev
```
The app will be viewable locally on port 5173, the Vite standard, or if busy, another in your terminal.

### Backend

This project requires a [MongoDB connection string](https://www.mongodb.com/resources/products/fundamentals/mongodb-connection-string). You will need a MongoDB account (free is sufficient) to get one.


Copy the `.env.example` file and save as `.env` and populate the values.

With .env in place, from the same folder, in terminal enter:
```
npm i
npm start
```

The app will state whether the MongoDB connection was successful or not.

Once both terminal windows are up and running, you can add, edit, read, and delete exercises. 

These changes will persist in your database. 

## Features



You can also use the `test-requests.http` file to send requests (many IDEs can send http requests with relevant extensions) using only the backend.

