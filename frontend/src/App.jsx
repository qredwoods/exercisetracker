import "./App.css";
import HomePage from "./pages/HomePage";
import ExerciseFormPage from "./pages/ExerciseFormPage";
import ExerciseDetailPage from "./pages/ExerciseDetailPage";
import LoginPage from "./pages/LoginPage";

import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, logout, tryRestoreSession } from "./utils/api";
import Toast from "./components/Toast";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [exerciseDraft, setExerciseDraft] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message) => setToast(message), []);
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    if (sessionStorage.getItem("welcomeSeen")) return false;
    sessionStorage.setItem("welcomeSeen", "1");
    return true;
  });
  const showWelcome = exercises.length === 0 && isFirstVisit && !exercisesLoading;

  // Once exercises appear, welcome should never come back this session
  useEffect(() => {
    if (exercises.length > 0 && isFirstVisit) {
      setIsFirstVisit(false);
    }
  }, [exercises.length, isFirstVisit]);

  // restore session from refresh cookie, then load exercises
  useEffect(() => {
    tryRestoreSession()
      .then(async (user) => {
        if (user) {
          setUser(user);
          setJustLoggedIn(true);
          await loadExercises();
        }
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const loadExercises = async () => {
    setExercisesLoading(true);
    try {
      const data = await apiFetch("/api/exercises");
      setExercises(data);
    } catch (err) {
      console.error("Failed to load exercises:", err);
      if (err.status === 401) {
        setUser(null);
      }
    } finally {
      setExercisesLoading(false);
    }
  };

  const handleAuth = async (userData) => {
    setUser(userData);
    setJustLoggedIn(true);
    await loadExercises();
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

  return (
    <>
      <header>
        <h1>
          {user ? (
            <Link to="/" className="site-title">
              SparkMvmt
            </Link>
          ) : (
            <span className="site-title">SparkMvmt</span>
          )}
        </h1>
        <p>track exercises, energize your life</p>
      </header>

      {!user ? (
        <>
          <LoginPage onAuth={handleAuth} />
          <footer>©2026 Quinn Redwoods</footer>
        </>
      ) : (
        <>

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              user={user}
              exercises={exercises}
              exercisesLoading={exercisesLoading}
              setExercises={setExercises}
              setExerciseDraft={setExerciseDraft}
              showToast={showToast}
              isFirstVisit={isFirstVisit}
              justLoggedIn={justLoggedIn}
              onFadeComplete={() => setJustLoggedIn(false)}
            />
          }
        />
        <Route
          path="/create"
          element={
            <ExerciseFormPage
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
            <ExerciseFormPage
              setExercises={setExercises}
              exerciseDraft={exerciseDraft}
              setExerciseDraft={setExerciseDraft}
              showToast={showToast}
            />
          }
        />
        <Route
          path="/exercise/:id"
          element={
            <ExerciseDetailPage
              exerciseDraft={exerciseDraft}
              setExerciseDraft={setExerciseDraft}
              setExercises={setExercises}
              showToast={showToast}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <footer>
          {!showWelcome && <p className="home-greeting">{`${user.firstName}'s log`}</p>}
          <button className="signout-btn" onClick={handleLogout}>
            Sign out
          </button>
        <span className="copyright"> ©2026 Quinn Redwoods</span>
        </footer>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </>
      )}
    </>
  );
}

export default App;