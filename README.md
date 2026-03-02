# Exercise Tracker
Create, edit, review and delete exercise logs.

MERN app: a React frontend and REST API Express + Mongoose / MongoDB backend.

## Screenshots

### Home

<img width="625" height="453" alt="Screenshot 2026-02-09 at 12 53 36 AM" src="https://github.com/user-attachments/assets/27c14663-7ad3-438c-8f9e-eb4ae22e54fc" />


### Add


<img width="848" height="425" alt="Screenshot 2026-02-09 at 12 53 44 AM" src="https://github.com/user-attachments/assets/14c30417-0d84-4455-b366-88abd4c90375" />

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


Create a `.env` file in the backend folder.

```
PORT = <your preferred port here, e.g. 3000>  
MONGODB_URI = <your connection string>
```

With .env in place, from the same folder, in terminal enter:
```
npm i
npm start
```

The app will state whether the MongoDB connection was successful or not.

Once both terminal windows are up and running, you can add, edit, read, and delete exercises. 

These changes will persist in your database. 

You can also use the `test-requests.http` file to send requests (many IDEs can send http requests with relevant extensions) using only the backend.

