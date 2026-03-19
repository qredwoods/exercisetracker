import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import { apiFetch } from "../utils/api";
import ExerciseForm from "../components/ExerciseForm";
import useFormError from "../utils/useFormError";
import ConfirmOverlay from "../components/ConfirmOverlay";

const ExerciseFormPage = ({ setExercises, exerciseDraft, setExerciseDraft, showToast }) => {
  const navigate = useNavigate();
  const addAnotherRef = useRef(false);
  const formResetRef = useRef(null);
  const formDirtyRef = useRef(null);
  const [showDiscard, setShowDiscard] = useState(false);

  const isEdit = !!exerciseDraft?._id;
  const isDuplicate = !!exerciseDraft && !isEdit;

  const [animate] = useState(() => {
    if (isEdit) return false;
    if (sessionStorage.getItem("headingSeen")) return false;
    sessionStorage.setItem("headingSeen", "1");
    return true;
  });

  const heading = isEdit
    ? "Make a change"
    : isDuplicate
    ? "How was it this time?"
    : "What'd you get up to?";

  const handleSubmit = async (exercise) => {
    try {
      if (isEdit) {
        const updated = await apiFetch(`/api/exercises/${exerciseDraft._id}`, {
          method: "PUT",
          body: JSON.stringify(exercise),
        });
        setExercises((prev) =>
          prev.map((e) => (e._id === updated._id ? updated : e))
        );
        navigate("/");
      } else {
        const created = await apiFetch("/api/exercises", {
          method: "POST",
          body: JSON.stringify(exercise),
        });
        setExercises((prev) => [...prev, created]);

        if (addAnotherRef.current) {
          addAnotherRef.current = false;
          setExerciseDraft(null);
          formResetRef.current?.();
        } else {
          setExerciseDraft(null);
          navigate("/");
        }
      }
    } catch (err) {
      showToast(err.message);
    }
  };

  if (isEdit && !exerciseDraft?._id) {
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

  const { formError, showError, clearError, zoneClass } = useFormError();

  return (
    <div>
      <div className={zoneClass}>
        <p className={`form-heading${animate ? "" : " no-animate"}`}>
          {heading}
        </p>
        <p className="form-error" aria-live="polite">{formError}</p>
      </div>
      <ExerciseForm
        formId="exercise-form"
        initialExercise={exerciseDraft || {}}
        onSubmit={handleSubmit}
        onError={showError}
        onErrorClear={clearError}
        resetRef={formResetRef}
        dirtyRef={formDirtyRef}
      />

      <div className="cta-row">
        <div className="dual-btn">
          <button className="back-btn" onClick={() => {
            if (formDirtyRef.current?.()) { setShowDiscard(true); return; }
            navigate("/");
          }} aria-label="Back" data-tooltip="Back">
            <FiArrowLeft />
          </button>
          <button className="cta-button" type="submit" form="exercise-form" aria-label={isEdit ? "Update exercise" : "Log exercise and return"}>
            Save
          </button>
          {!isEdit && (
            <button
              className="cta-button cta-button--icon"
              type="button"
              aria-label="Log this, add another"
              data-tooltip="Log this, add another"
              onClick={() => {
                addAnotherRef.current = true;
                document.getElementById("exercise-form").requestSubmit();
              }}
            >
              <FiPlus />
            </button>
          )}
        </div>
      </div>

      {showDiscard && (
        <ConfirmOverlay
          message="Discard unsaved changes?"
          confirmLabel="Discard"
          cancelLabel="Keep editing"
          onConfirm={() => navigate("/")}
          onCancel={() => setShowDiscard(false)}
        />
      )}
    </div>
  );
};

export default ExerciseFormPage;
