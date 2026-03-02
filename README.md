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
From the redwoodq_react folder
```
npm i
npm run dev
```
The app will be viewable locally on port 5173, the Vite standard, or if busy, another in your terminal.

### Backend (requires .env file) - Needs some care to
Create a `.env` file in the redwoodq_rest folder:
It needs two values, a port ("3000" is a fine default) and a [MongoDB connection string](https://www.mongodb.com/resources/products/fundamentals/mongodb-connection-string). You will need a MongoDB account (free is sufficient) to get one.

In the environment file the variables should be formatted as follows.
```
PORT = "<your preferred port here>"  
MONGODB_URI = "<your connection string>"
```

Once you have a .env file in the redwoodq_react folder, from the same folder in terminal enter:
```
npm i
npm start
```
This will use the nodemon package for hot reloads. 

If you do not connect successfully to MongoDB, you will see

```
Error: Could not connect to MongoDB
```

Once both terminal windows are up and running, you can add, edit, read, and delete exercises. 

These changes will persist in your database until you restart the application. There is an optional drop table parameter in the model, but it is not currently used.

You can also use the `a9-test-requests.http` file to send requests (many IDEs can send http requests with relevant extensions) using only the backend.

