import mongoose from 'mongoose';
import 'dotenv/config';

const EXERCISE_DB_NAME = 'exercises_db';
const EXERCISE_COLLECTION = 'exercises';

let connection = undefined;

/**
 * This function does the following:
 *  1. Connects to the MongoDB server.
 *  2. Drop EXERCISE_COLLECTION if asked to do so.
 *  3. Creates a model class for the movie schema.
 * @param {Boolean} dropCollection If true, drop EXERCISE_COLLECTION
 * 
 */
async function connect(dropCollection){
    try{
        connection = await createConnection();
        console.log("Successfully connected to MongoDB using Mongoose!");
        if(dropCollection){
            await connection.db.dropCollection(EXERCISE_COLLECTION);
        }
    } catch(err){
        console.log(err);
        throw Error(`Could not connect to MongoDB ${err.message}`)
    }
}

/**
 * Connect to the MongoDB server for the connect string in .env file
 * @returns A connection to the server
 */
async function createConnection(){
    await mongoose.connect(process.env.MONGODB_URI, 
                {dbName: EXERCISE_DB_NAME});
    return mongoose.connection;
}

// sets up structure of exercise
const exerciseSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  reps: {
    type: Number,
    required: true,
    min: 1,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    enum: ["lbs", "kgs", "bodyweight"],
  },
  date: {
    type: String,
    required: true,
  },
});

// exercise class
const Exercise = mongoose.model("Exercise", exerciseSchema); 

const createExercise = async (body) => { 
  const {name, reps, weight, unit, date} = body
  // Call the constructor to create an instance of the model class exercise
  const exercise = await new Exercise({name: name, reps: reps, weight: weight, unit: unit, date: date}); 
  // Call save to persist this object as a document in MongoDB 
  return exercise.save();
}

const findExercises = async (filter) => {
  const query = Exercise.find(filter);
  return query.exec();
}

const findExerciseById = async (id) => {
    return Exercise.findById(id).exec();
}

async function updateExercise(id, update) {
    return Exercise.findOneAndUpdate({_id: id}, update, {new: true, runValidators: true}).exec()
}

const deleteExercises = async (filter) => {
    return Exercise.deleteMany(filter).exec();
}

const deleteById = async (_id) => {
  const result = await Exercise.deleteOne({ _id: _id });
  return result.deletedCount;
}

export {connect, createExercise, deleteExercises, findExercises, deleteById, findExerciseById, updateExercise}