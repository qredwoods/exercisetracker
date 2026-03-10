import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import ExerciseForm from "../components/ExerciseForm";

const EditExercisePage = ({ exerciseToEdit, setExercises }) => {
  const navigate = useNavigate();

  const updateExercise = async (editedExercise) => {
    if (!exerciseToEdit?._id) {
      return;
    }

    try {
      const updatedExercise = await apiFetch(`/api/exercises/${exerciseToEdit._id}`, {
        method: "PUT",
        body: JSON.stringify(editedExercise),
      });

      setExercises((prev) =>
        prev.map((exercise) =>
          exercise._id === updatedExercise._id ? updatedExercise : exercise
        )
      );

      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  if (!exerciseToEdit?._id) {
    return (
      <div>
        <p className="form-error">No exercise selected to edit.</p>
        <div className="cta-row">
          <button className="cta-button" onClick={() => navigate("/")}>
            Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ExerciseForm
        formId="exercise-form"
        title=""
        initialExercise={exerciseToEdit}
        onSubmit={updateExercise}
      />

      <div className="cta-row">
        <button className="cta-button" type="submit" form="exercise-form">
          Update Exercise
        </button>
      </div>
    </div>
  );
};

export default EditExercisePage;