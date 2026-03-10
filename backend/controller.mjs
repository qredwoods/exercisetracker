import express from "express";
import * as model from "./model.mjs";
import "dotenv/config";
import cors from "cors"

const app = express();

const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({
  origin: ORIGIN,
  credentials: true
}));

app.use(express.json());

const isReadOnly =
  process.env.NODE_ENV === "production" && process.env.DEMO_READ_ONLY === "true";

app.use((req, res, next) => {
  // Allow safe methods
  if (!isReadOnly) return next();
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();

  return res.status(403).json({
    error: "Demo is read-only. Run locally for full access.",
  });
});

function isDateValid(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function isBodyValid(body) {

    const allowedFields = ['name','reps','weight', 'unit', 'date'].sort()
    const requestFields = Object.keys(body).sort()
    const fieldsMatch = JSON.stringify(allowedFields) === JSON.stringify(requestFields)
    if (fieldsMatch){
        const {name, reps, weight, unit, date} = body
        
        const validName = (typeof(name) === 'string') && (name.length > 0)
        const vReps = (typeof(reps) === 'number') && (reps > 0)
        const vWeight = (typeof(weight) === 'number') && (weight > 0)
        const vUnit = unit === 'kgs' || unit === 'lbs';
        
        const validationResult = validName && vReps && vWeight && vUnit && isDateValid(date)
        return validationResult
        
}}

// health check
app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok" });
});

// create new exercise
app.post("/api/exercises", async (req, res) => {
    const body = req.body   
    if (isBodyValid(body)) {
            const exercise = await model.createExercise(body);
       
        res.status(201).send(exercise);
    } else res.status(400).send({"Error": "Invalid Request"})
});

// get exercises
app.get("/api/exercises", async (req, res) => {
   const results = await model.findExercises(req.query)
   res.status(200).send(results)
});


app.get("/api/exercises/:_id", async (req, res) => {
    const result = await model.findExerciseById(req.params._id);
    if (result === null) {
        res.status(404).send({"Error": "Not found"})
    }
    else res.status(200).send(result)
});

// update
app.put("/api/exercises/:_id", async (req, res) => {
    const body = req.body
    if (isBodyValid(body)) {
    const result = await model.updateExercise(req.params._id, body)
    if (result === null) {
        res.status(404).send({"Error": "Not found"})
    }
    else res.status(200).send(result)
    } else res.status(400).send({"Error":"Invalid Request"})
})

// delete
app.delete("/api/exercises", async (req, res) => {
    const result = await model.deleteExercises(req.query)
    res.status(200).send({deletedCount: result.deletedCount})
});

app.delete("/api/exercises/:_id", async (req, res) => {
    const result = await model.deleteById(req.params._id)
    if (result === 0) { 
        res.status(404).send({"Error": "Not found"})
    }
    else res.sendStatus(204)
});

const PORT = process.env.PORT || 5000;

(async () => {
  await model.connect();
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));
})();