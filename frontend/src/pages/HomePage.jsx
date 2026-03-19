import ExerciseTable from "../components/ExerciseTable";
import { useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import { apiFetch } from "../utils/api";
import { todayIsoLocal } from "../utils/date";

function HomePage({ user, exercises, exercisesLoading, setExercises, setExerciseDraft, showToast, isFirstVisit, justLoggedIn, onFadeComplete }) {
  const navigate = useNavigate();
  const today = todayIsoLocal();

  const onDelete = async (_id) => {
    try {
      await apiFetch(`/api/exercises/${_id}`, { method: "DELETE" });
      setExercises((prev) => prev.filter((exercise) => exercise._id !== _id));
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


  if (exercisesLoading) {
    return (
      <div className="exercises-loading">
        <div className="auth-spinner" />
      </div>
    );
  }

  return (
    <div>
      <ExerciseTable
        user={user}
        exercises={exercises}
        onDelete={onDelete}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onView={onView}
        isFirstVisit={isFirstVisit}
        fadeIn={justLoggedIn}
        onFadeComplete={onFadeComplete}
      />

      <div className="cta-row">
        <button className="cta-button" onClick={() => { flushSync(() => setExerciseDraft(null)); navigate("/create"); }}>
          Log Exercise
        </button>
      </div>
    </div>
  );
}

export default HomePage;
