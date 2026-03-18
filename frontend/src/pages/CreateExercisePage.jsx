import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiFetch } from "../utils/api";
import ExerciseForm from "../components/ExerciseForm";

const CreateExercisePage = ({ setExercises, exerciseDraft }) => {
  const navigate = useNavigate();
  const [animate] = useState(() => {
    if (sessionStorage.getItem("headingSeen")) return false;
    sessionStorage.setItem("headingSeen", "1");
    return true;
  });

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

  const isDuplicate = !!exerciseDraft;

  return (
    <div>
      <p className={`form-heading${animate ? "" : " no-animate"}`}>
        {isDuplicate ? "How was it this time?" : "What'd you get up to?"}
      </p>
      <ExerciseForm
        formId="exercise-form"
        initialExercise={exerciseDraft || {}}
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