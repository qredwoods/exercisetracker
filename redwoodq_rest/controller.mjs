import express from "express";
import * as model from "./model.mjs";
import "dotenv/config";
const app = express();


app.use(express.json());
// connect to MongoDB
model.connect()

function isDateValid(date) {
    const format = /^\d\d-\d\d-\d\d$/;
    return format.test(date);
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
        const vUnit = unit === 'kgs' | unit === 'lbs';
        
        const validationResult = validName && vReps && vWeight && vUnit && isDateValid(date)
        return validationResult
        
}}
// create new exercise
app.post("/exercises", async (req, res) => {
    const body = req.body   
    if (isBodyValid(body)) {
            const exercise = await model.createExercise(body);
       
        res.status(201).send(exercise);
    } else res.status(400).send({"Error": "Invalid Request"})
});

// get exercises
app.get("/exercises", async (req, res) => {
   const results = await model.findExercises(req.query)
   res.status(200).send(results)
});


app.get("/exercises/:_id", async (req, res) => {
    const result = await model.findExerciseById(req.params._id);
    if (result === null) {
        res.status(404).send({"Error": "Not found"})
    }
    else res.status(200).send(result)
});

// update
app.put("/exercises/:_id", async (req, res) => {
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
app.delete("/exercises", async (req, res) => {
    const result = await model.deleteExercises(req.query)
    res.status(200).send({deletedCount: result.deletedCount})
});

app.delete("/exercises/:_id", async (req, res) => {
    const result = await model.deleteById(req.params._id)
    if (result === 0) { 
        res.status(404).send({"Error": "Not found"})
    }
    else res.sendStatus(204)
});

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}...`);
});