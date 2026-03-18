import ExerciseTable from "../components/ExerciseTable";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { todayIsoLocal } from "../utils/date";

function HomePage({ user, exercises, setExercises, setExerciseDraft }) {
  const navigate = useNavigate();
  const today = todayIsoLocal();

  const onDelete = async (_id) => {
    try {
      await apiFetch(`/api/exercises/${_id}`, { method: "DELETE" });
      setExercises((prev) => prev.filter((exercise) => exercise._id !== _id));
    } catch (err) {
      alert(err.message);
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


  return (
    <div>
      <ExerciseTable
        user={user}
        exercises={exercises}
        onDelete={onDelete}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
      />

      <div className="cta-row">
        <button className="cta-button" onClick={() => navigate("/create")}>
          Log Exercise
        </button>
      </div>
    </div>
  );
}

export default HomePage;