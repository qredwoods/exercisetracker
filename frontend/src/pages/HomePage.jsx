import ExerciseTable from "../components/ExerciseTable";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

function HomePage({ exercises, setExercises, setExerciseToEdit }) {
  const navigate = useNavigate();

  const onDelete = async (_id) => {
    try {
      await apiFetch(`/api/exercises/${_id}`, { method: "DELETE" });
      setExercises((prev) => prev.filter((exercise) => exercise._id !== _id));
    } catch (err) {
      alert(err.message);
    }
  };

  const onEdit = (exerciseToEdit) => {
    setExerciseToEdit(exerciseToEdit);
    navigate("/edit");
  };

  return (
    <div>
      <ExerciseTable
        exercises={exercises}
        onDelete={onDelete}
        onEdit={onEdit}
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