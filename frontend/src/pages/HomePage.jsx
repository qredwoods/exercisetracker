import { useState } from "react";
import ExerciseTable from "../components/ExerciseTable";
import DashboardSummary from "../components/DashboardSummary";
import ConfirmOverlay from "../components/ConfirmOverlay";
import { useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import { apiFetch } from "../utils/api";
import { todayIsoLocal, formatDisplayDate } from "../utils/date";

function HomePage({ user, exercises, exercisesLoading, setExercises, setExerciseDraft, showToast, isFirstVisit, justLoggedIn, onFadeComplete, highlightId, setHighlightId, onPurposeChange }) {
  const navigate = useNavigate();
  const today = todayIsoLocal();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const onDeleteRequest = (_id) => {
    const exercise = exercises.find((e) => e._id === _id);
    setDeleteTarget(exercise);
  };

  const onDeleteConfirm = async () => {
    const id = deleteTarget._id;
    setDeleteTarget(null);
    try {
      await apiFetch(`/api/exercises/${id}`, { method: "DELETE" });
      setDeletingId(id);
      setTimeout(() => {
        setExercises((prev) => prev.filter((e) => e._id !== id));
        setDeletingId(null);
      }, 1000);
    } catch (err) {
      showToast(err.message);
    }
  };

  const onEdit = (exerciseDraft) => {
    setExerciseDraft(exerciseDraft);
    navigate("/edit");
  };

  const onDuplicate = (exercise) => {
    setExerciseDraft({
      ...exercise,
      _id: undefined,
      date: today,
    });
    navigate("/create");
  };

  const onView = (exercise) => {
    setExerciseDraft(exercise);
    navigate(`/exercise/${exercise._id}`);
  };

  const onPRClick = (exercise) => {
    setExerciseDraft(exercise);
    navigate(`/exercise/${exercise._id}`);
  };

  if (exercisesLoading) {
    return (
      <div className="exercises-loading">
        <div className="auth-spinner" />
      </div>
    );
  }

  return (
    <div>
      <DashboardSummary
        exercises={exercises}
        user={user}
        onPurposeChange={onPurposeChange}
        onPRClick={onPRClick}
      />
      <div className="cta-row-fixed">
        <button className="cta-button" onClick={() => { flushSync(() => setExerciseDraft(null)); navigate("/create"); }}>
          Log Exercise
        </button>
      </div>
      <ExerciseTable
        user={user}
        exercises={exercises}
        onDelete={onDeleteRequest}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onView={onView}
        onCreate={() => { flushSync(() => setExerciseDraft(null)); navigate("/create"); }}
        isFirstVisit={isFirstVisit}
        fadeIn={justLoggedIn}
        onFadeComplete={onFadeComplete}
        highlightId={highlightId}
        onHighlightEnd={() => setHighlightId(null)}
        deletingId={deletingId}
      />

      {deleteTarget && (
        <ConfirmOverlay
          message={<>Delete this entry? <span className="overlay-highlight">{deleteTarget.name}, {formatDisplayDate(deleteTarget.date)}</span></>}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={onDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default HomePage;
