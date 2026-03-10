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
  title,
  buttonLabel,
  initialExercise = {},
  onSubmit,
}) => {
  const [name, setName] = useState(initialExercise.name || "");
  const [reps, setReps] = useState(initialExercise.reps ?? "");
  const [weight, setWeight] = useState(initialExercise.weight ?? "");
  const [unit, setUnit] = useState(initialExercise.unit || "lbs");
  const [date, setDate] = useState(initialExercise.date || today);
  const [formError, setFormError] = useState("");

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
      weight: unit === "bodyweight" ? 0 : Number(weight),
      unit,
      date,
    };

    await onSubmit(payload);
  };

  const isBodyweight = unit === "bodyweight";

  return (
    <div>
      <h2>{title}</h2>

      {formError && <p className="form-error">{formError}</p>}

      <form
        className="exercise-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="form-field name-field">
          <label htmlFor="name">Exercise</label>
          <input
            id="name"
            type="text"
            placeholder="Exercise name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!formError && !name.trim()}
          />
        </div>

        <div className="form-field reps-field">
          <label htmlFor="reps">Reps</label>
          <input
            id="reps"
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
        <label htmlFor="weight">Weight</label>
          <input
            id="weight"
            type="number"
            min="0"
            placeholder={isBodyweight ? "Bodyweight only" : "Weight"}
            value={isBodyweight ? "" : weight}
            onChange={(e) =>
              setWeight(e.target.value === "" ? "" : Number(e.target.value))
            }
            disabled={isBodyweight}
            className={isBodyweight ? "is-disabled" : ""}
            />
        </div>

        <div className="form-field unit-field">
          <label htmlFor="unit">Unit</label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => {
              const nextUnit = e.target.value;
              setUnit(nextUnit);

              if (nextUnit === "bodyweight") {
                setWeight("");
              }
            }}
          >
            <option value="lbs">Lbs</option>
            <option value="kgs">Kgs</option>
            <option value="bodyweight">Bodyweight</option>
          </select>
        </div>

        <div className="form-field date-field">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            max={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={!!formError && !date}
          />
        </div>

        <div className="form-field submit-field">
          <label className="visually-hidden" htmlFor="submit-button">
            Submit
          </label>
          <button id="submit-button" type="submit">
            {buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExerciseForm;