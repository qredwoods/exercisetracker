import "./App.css";
import HomePage from "./pages/HomePage";
import EditExercisePage from "./pages/EditExercisePage";
import CreateExercisePage from "./pages/CreateExercisePage";
import LoginPage from "./pages/LoginPage";

import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch, logout, tryRestoreSession } from "./utils/api";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [exerciseDraft, setExerciseDraft] = useState(null);

  // try to restore session from refresh on cookie mount
  useEffect(() => {
    tryRestoreSession()
      .then((restored) => {
        if (restored) {
          // token is valid - set a minimal user object
          // (refresh doesn't return user info, 
          // so just mark as authenticated)
          setUser({ restored: true });
        }
      })
      .finally(() => setAuthLoading(false));
  }, [])

  // load exercises once authenticated
  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await apiFetch("/api/exercises");
      setExercises(data);
    } catch (err) {
      console.error("Failed to load exercises:", err);
      // if auth expired, kick to login
      if (err.status === 401) {
        setUser(null);
      }
    }
  };

  const handleAuth = (userData) => {
    setUser(userData);
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setExercises([]);
    setExerciseDraft(null);
    navigate("/");
  };

// show nothing while checking for existing session
if (authLoading) {
  return (
    <div className="auth-loading">
      <div className="auth-spinner" />
    </div>
  );
}

  // not logged in — show login page
  if (!user) {
    return (
      <>
        <header>
          <h1 className="site-title">SparkMvmt</h1>
          <p>Movement. Workouts. Accountability.</p>
        </header>
        <LoginPage onAuth={handleAuth} />
        <footer>©2026 Quinn Redwoods</footer>
      </>
    );
  }

  // logged in — normal app
  return (
    <>
      <header>
          <h1>
            <Link to="/" className="site-title">
              SparkMvmt
            </Link>
          </h1>
        <p> track exercises, energize your life</p>
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <footer> 
          <button className="signout-btn" onClick={handleLogout}>
            Sign out
          </button>
        <span className="copyright"> ©2026 Quinn Redwoods</span>
        </footer>
    </>
  );
}

export default App;