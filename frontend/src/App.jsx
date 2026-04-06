import "./App.css";
import HomePage from "./pages/HomePage";
import ExerciseFormPage from "./pages/ExerciseFormPage";
import ExerciseDetailPage from "./pages/ExerciseDetailPage";
import LoginPage from "./pages/LoginPage";

import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, logout, tryRestoreSession, hasDataKey, updatePurpose } from "./utils/api";
import { decryptExercises, encrypt, decrypt, getDataKey } from "./utils/crypto";
import { computePRs } from "./utils/pr";
import { cacheExercises, getCachedExercises } from "./utils/cache";
import Toast from "./components/Toast";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [exerciseDraft, setExerciseDraft] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message) => setToast(message), []);
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    if (sessionStorage.getItem("welcomeSeen")) return false;
    sessionStorage.setItem("welcomeSeen", "1");
    return true;
  });
  const showWelcome = exercises.length === 0 && isFirstVisit && !exercisesLoading;
  const prData = useMemo(() => computePRs(exercises), [exercises]);

  // Once exercises appear, welcome should never come back this session
  useEffect(() => {
    if (exercises.length > 0 && isFirstVisit) {
      setIsFirstVisit(false);
    }
  }, [exercises.length, isFirstVisit]);

  // keep IndexedDB cache in sync with exercises state
  useEffect(() => {
    if (user && exercises.length > 0) {
      cacheExercises(exercises).catch(() => {});
    }
  }, [exercises, user]);

  // restore session from refresh cookie, then load exercises
  // no password available here → can't unlock encryption key
  // show cached exercises immediately, fetch server data in background
  useEffect(() => {
    tryRestoreSession()
      .then(async (user) => {
        if (user) {
          setUser(user);
          setJustLoggedIn(true);
          await loadExercises({ fromCache: true });
        }
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const loadExercises = async ({ fromCache = false } = {}) => {
    setExercisesLoading(true);

    // cache-first: show cached exercises immediately if available
    if (fromCache) {
      try {
        const cached = await getCachedExercises();
        if (cached.length > 0) {
          setExercises(cached);
          setExercisesLoading(false);
        }
      } catch { /* IndexedDB unavailable — continue to server */ }
    }

    try {
      const raw = await apiFetch("/api/exercises");
      // if encrypted but no key (session restore), keep cached data
      if (!hasDataKey() && raw.length > 0 && raw[0].name?.includes(".")) {
        return; // cached exercises already shown
      }
      const data = hasDataKey() ? await decryptExercises(raw) : raw;
      setExercises(data);
    } catch (err) {
      if (err.status === 401) {
        setUser(null);
      }
    } finally {
      setExercisesLoading(false);
    }
  };

  const handleAuth = async (userData) => {
    // decrypt purpose if encrypted (contains "." separator from AES-GCM format)
    if (hasDataKey() && userData.purpose && userData.purpose.includes(".")) {
      try {
        userData = { ...userData, purpose: await decrypt(userData.purpose, getDataKey()) };
      } catch { /* leave as-is if decryption fails */ }
    }
    setUser(userData);
    setJustLoggedIn(true);
    await loadExercises();
  };

  const navigate = useNavigate();

  const handlePurposeUpdate = async (purpose) => {
    try {
      const payload = hasDataKey()
        ? await encrypt(purpose, getDataKey())
        : purpose;
      await updatePurpose(payload);
      setUser((prev) => ({ ...prev, purpose }));
    } catch (err) {
      showToast(err.message);
    }
  };

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
        <p className="tagline">track exercises, energize your life</p>
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
              highlightId={highlightId}
              setHighlightId={setHighlightId}
              onPurposeChange={handlePurposeUpdate}
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
              setHighlightId={setHighlightId}
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
              setHighlightId={setHighlightId}
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
              prData={prData}
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