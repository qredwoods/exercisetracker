import "./App.css";
import HomePage from "./pages/HomePage";
import EditExercisePage from "./pages/EditExercisePage";
import CreateExercisePage from "./pages/CreateExercisePage";

import { Link, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "./utils/api";

function App() {
  const [exercises, setExercises] = useState([]);
  const [exerciseDraft, setExerciseDraft] = useState(null);

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
            SparkMvmt
          </Link>
        </h1>
        <p>the story of moving how you want to</p>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              exercises={exercises}
              setExercises={setExercises}
              setExerciseDraft={setExerciseDraft}
            />
          }
        />
        <Route
          path="/create"
          element={
            <CreateExercisePage
              setExercises={setExercises}
              exerciseDraft={exerciseDraft}
              setExerciseDraft={setExerciseDraft}
            />
          }
        />
        <Route
          path="/edit"
          element={
            <EditExercisePage
              exerciseDraft={exerciseDraft}
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