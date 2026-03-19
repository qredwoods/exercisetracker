import "./App.css";
import HomePage from "./pages/HomePage";
import EditExercisePage from "./pages/EditExercisePage";
import CreateExercisePage from "./pages/CreateExercisePage";
import LoginPage from "./pages/LoginPage";

import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, logout, tryRestoreSession } from "./utils/api";
import Toast from "./components/Toast";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [exerciseDraft, setExerciseDraft] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message) => setToast(message), []);

  // restore session from refresh cookie, then load exercises
  useEffect(() => {
    tryRestoreSession()
      .then(async (user) => {
        if (user) {
          setUser(user);
          await loadExercises();
        }
      })
      .finally(() => setAuthLoading(false));
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
    sessionStorage.removeItem("headingSeen");
    sessionStorage.removeItem("welcomeSeen");
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
              user={user}
              exercises={exercises}
              setExercises={setExercises}
              setExerciseDraft={setExerciseDraft}
              showToast={showToast}
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
              showToast={showToast}
            />
          }
        />
        <Route
          path="/edit"
          element={
            <EditExercisePage
              exerciseDraft={exerciseDraft}
              setExercises={setExercises}
              showToast={showToast}
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

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}

export default App;