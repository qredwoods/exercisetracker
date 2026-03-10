import { useState } from "react";

function todayIsoLocal() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = todayIsoLocal();

const ExerciseForm = ({
  formId = "exercise-form",
  initialExercise = {},
  onSubmit,
}) => {
  const [name, setName] = useState(initialExercise.name || "");
  const [reps, setReps] = useState(initialExercise.reps ?? "");
  const [weight, setWeight] = useState(initialExercise.weight ?? "");
  const [unit, setUnit] = useState(initialExercise.unit || "lbs");
  const [date, setDate] = useState(initialExercise.date || today);
  const [formError, setFormError] = useState("");

  const isBodyweight = unit === "bodyweight";

  const validateForm = () => {
    if (!name.trim() || reps === "" || !unit || !date) {
      return "Please complete all required fields.";
    }

    if (Number(reps) <= 0) {
      return "Reps must be greater than 0.";
    }

    if (unit !== "bodyweight") {
      if (weight === "") {
        return "Please enter weight used or select unit: bodyweight.";
      }

      if (Number(weight) < 0) {
        return "Weight cannot be negative.";
      }
    }

    if (date > today) {
      return "Date cannot be in the future.";
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError("");

    const payload = {
      name: name.trim(),
      reps: Number(reps),
      weight: isBodyweight ? 0 : Number(weight),
      unit,
      date,
    };

    await onSubmit(payload);
  };

  return (
    <div>
      <p className="form-error" aria-live="polite">
        {formError}
      </p>

      <form
        autoComplete="new-password"
        id={formId}
        className="exercise-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="form-field name-field">
          <input
            id={`${formId}-name`}
            type="text"
            placeholder="Exercise name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!formError && !name.trim()}
          />
        </div>

        <div className="form-field reps-field">
          <input
            id={`${formId}-reps`}
            type="number"
            min="1"
            placeholder="Reps"
            value={reps}
            onChange={(e) =>
              setReps(e.target.value === "" ? "" : Number(e.target.value))
            }
            aria-invalid={!!formError && reps === ""}
          />
        </div>

        <div className="form-field weight-field">
          <input
            id={`${formId}-weight`}
            type="number"
            min="0"
            placeholder={isBodyweight ? "no added weight" : "Weight"}
            value={isBodyweight ? "" : weight}
            onChange={(e) =>
              setWeight(e.target.value === "" ? "" : Number(e.target.value))
            }
            disabled={isBodyweight}
            className={isBodyweight ? "is-disabled" : ""}
            aria-invalid={!!formError && !isBodyweight && weight === ""}
          />
          
        </div>

        <div className="form-field unit-field">
          <select
            id={`${formId}-unit`}
            value={unit}
            onChange={(e) => {
              const nextUnit = e.target.value;
              setUnit(nextUnit);

              if (nextUnit === "bodyweight") {
                setWeight("");
              }
            }}
          >
            <option value="lbs">Unit: Lbs</option>
            <option value="kgs">Unit: Kgs</option>
            <option value="bodyweight">Bodyweight only</option>
          </select>
        </div>

        <div className="form-field date-field">
          <input
            id={`${formId}-date`}
            type="date"
            max={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={!!formError && !date}
          />
        </div>
      </form>
    </div>
  );
};

export default ExerciseForm;