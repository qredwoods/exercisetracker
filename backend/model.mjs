import mongoose from 'mongoose';

async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Successfully connected to MongoDB using Mongoose!");
    } catch(err) {
        console.log(err);
        throw Error(`Could not connect to MongoDB ${err.message}`);
    }
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
  notes: {
    type: String,
    trim: true,
    default: "",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  demoExpiresAt: {
    type: Date,
    sparse: true,
    index: { expires: 0 },
  },
});

// exercise class
const Exercise = mongoose.model("Exercise", exerciseSchema); 

const createExercise = async (body) => {
  const {name, reps, weight, unit, date, notes, userId} = body;
  const exercise = new Exercise({name, reps, weight, unit, date, notes, userId});
  return exercise.save();
}

const findExercises = async (filter) => {
  const query = Exercise.find(filter);
  return query.exec();
}

const findExerciseById = async (id) => {
    return Exercise.findById(id).exec();
}

async function updateExercise(id, update, userId) {
    // only update if exercise belongs to user
    return Exercise.findOneAndUpdate(
      { _id: id, userId },
      update,
      { new: true, runValidators: true }
    ).exec();
}

const deleteExercises = async (filter) => {
    return Exercise.deleteMany(filter).exec();
}

const deleteById = async (_id, userId) => {
  const result = await Exercise.deleteOne({ _id, userId });
  return result.deletedCount;
}

async function disconnect() {
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

export {connect, disconnect, Exercise, createExercise, deleteExercises, findExercises, deleteById, findExerciseById, updateExercise}
