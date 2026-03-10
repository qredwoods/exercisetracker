import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import ExerciseForm from "../components/ExerciseForm";

const CreateExercisePage = ({ setExercises }) => {
  const navigate = useNavigate();

  const addExercise = async (newExercise) => {
    try {
      const createdExercise = await apiFetch("/api/exercises", {
        method: "POST",
        body: JSON.stringify(newExercise),
      });

      setExercises((prev) => [...prev, createdExercise]);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <ExerciseForm
        formId="exercise-form"
        onSubmit={addExercise}
      />

      <div className="cta-row">
        <button className="cta-button" type="submit" form="exercise-form">
          Add Exercise
        </button>
      </div>
    </div>
  );
};

export default CreateExercisePage;