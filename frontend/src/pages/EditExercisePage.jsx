import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { apiFetch } from "../utils/api";
import ExerciseForm from "../components/ExerciseForm";
import useFormError from "../utils/useFormError";

const EditExercisePage = ({ exerciseDraft, setExercises, showToast }) => {
  const navigate = useNavigate();
  const { formError, showError, clearError, zoneClass } = useFormError();

  const updateExercise = async (editedExercise) => {
    if (!exerciseDraft?._id) {
      return;
    }

    try {
      const updatedExercise = await apiFetch(`/api/exercises/${exerciseDraft._id}`, {
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
      showToast(err.message);
    }
  };

  if (!exerciseDraft?._id) {
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
      <div className={zoneClass}>
        <p className="form-heading">Make a change</p>
        <p className="form-error" aria-live="polite">{formError}</p>
      </div>
      <ExerciseForm
        formId="exercise-form"
        title=""
        initialExercise={exerciseDraft}
        onSubmit={updateExercise}
        onError={showError}
        onErrorClear={clearError}
      />

      <div className="cta-row">
        <button className="cta-button" type="submit" form="exercise-form">
          Update Exercise
        </button>
        <button className="back-btn" onClick={() => navigate("/")}>
          <FiArrowLeft />
        </button>
      </div>
    </div>
  );
};

export default EditExercisePage;