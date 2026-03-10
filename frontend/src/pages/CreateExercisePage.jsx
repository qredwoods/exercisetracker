import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import ExerciseForm from "../components/ExerciseForm";

const CreateExercisePage = () => {
  const navigate = useNavigate();

  const addExercise = async (newExercise) => {
    try {
      await apiFetch("/api/exercises", {
        method: "POST",
        body: JSON.stringify(newExercise),
      });

      alert("Successfully added the exercise!");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <ExerciseForm
      title="Add Exercise"
      buttonLabel="Add"
      onSubmit={addExercise}
    />
  );
};

export default CreateExercisePage;