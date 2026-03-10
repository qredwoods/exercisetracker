import "./App.css";
import HomePage from "./pages/HomePage";
import EditExercisePage from "./pages/EditExercisePage";
import CreateExercisePage from "./pages/CreateExercisePage";

import { Link, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "./utils/api";

function App() {
  const [exercises, setExercises] = useState([]);
  const [exerciseToEdit, setExerciseToEdit] = useState(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await apiFetch("/api/exercises");
      setExercises(data);
    } catch (err) {
      console.error("Failed to load exercises:", err);
    }
  };

  return (
    <>
      <header>
        <h1>
          <Link to="/" className="site-title">
            LiftLog
          </Link>
        </h1>
        <p>Track Workouts, Stay Accountable</p>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              exercises={exercises}
              setExercises={setExercises}
              setExerciseToEdit={setExerciseToEdit}
            />
          }
        />
        <Route
          path="/create"
          element={
            <CreateExercisePage
              setExercises={setExercises}
            />
          }
        />
        <Route
          path="/edit"
          element={
            <EditExercisePage
              exerciseToEdit={exerciseToEdit}
              setExercises={setExercises}
            />
          }
        />
      </Routes>

      <footer>©2026 Quinn Redwoods</footer>
    </>
  );
}

export default App;