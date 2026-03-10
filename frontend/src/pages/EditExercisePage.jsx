import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import ExerciseForm from "../components/ExerciseForm";

const EditExercisePage = ({ exerciseToEdit }) => {
  const navigate = useNavigate();

  const updateExercise = async (editedExercise) => {
    try {
      await apiFetch(`/api/exercises/${exerciseToEdit._id}`, {
        method: "PUT",
        body: JSON.stringify(editedExercise),
      });

      alert("Successfully updated the exercise!");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <ExerciseForm
      title="Edit Exercise"
      buttonLabel="Update"
      initialExercise={exerciseToEdit}
      onSubmit={updateExercise}
    />
  );
};

export default EditExercisePage;