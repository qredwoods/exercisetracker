import express from "express";
import * as model from "./model.mjs";
import "dotenv/config";
const app = express();

app.use(express.json());
// connect to MongoDB
model.connect()

// create new user
app.post("/exercises", async (req, res) => {
    const user = await model.createExercise(
        req.body.name,
        req.body.reps,
        req.body.weight,
        req.body.unit,
        req.body.date
    );
   
    res.status(201).send(user);
   
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
    const result = await model.updateExercise(req.params._id, req.body)
    if (result === null) {
        res.status(404).send({"Error": "Not found"})
    }
    else res.status(200).send(result)
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