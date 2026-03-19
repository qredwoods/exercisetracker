import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { apiFetch } from "../utils/api";
import ExerciseForm from "../components/ExerciseForm";
import useFormError from "../utils/useFormError";

const CreateExercisePage = ({ setExercises, exerciseDraft, setExerciseDraft, showToast }) => {
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
      setExerciseDraft(null);
      navigate("/");
    } catch (err) {
      showToast(err.message);
    }
  };

  const isDuplicate = !!exerciseDraft;
  const { formError, showError, clearError, zoneClass } = useFormError();

  return (
    <div>
      <div className={zoneClass}>
        <p className={`form-heading${animate ? "" : " no-animate"}`}>
          {isDuplicate ? "How was it this time?" : "What'd you get up to?"}
        </p>
        <p className="form-error" aria-live="polite">{formError}</p>
      </div>
      <ExerciseForm
        formId="exercise-form"
        initialExercise={exerciseDraft || {}}
        onSubmit={addExercise}
        onError={showError}
        onErrorClear={clearError}
      />

      <div className="cta-row">
        <button className="cta-button" type="submit" form="exercise-form">
          Add Exercise
        </button>
        <button className="back-btn" onClick={() => navigate("/")}>
          <FiArrowLeft />
        </button>
      </div>
    </div>
  );
};

export default CreateExercisePage;