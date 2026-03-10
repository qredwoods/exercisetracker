import { useState } from "react";

function todayIsoLocal() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const ExerciseForm = ({
  title,
  buttonLabel,
  initialExercise = {},
  onSubmit,
}) => {
  const [name, setName] = useState(initialExercise.name || "");
  const [reps, setReps] = useState(initialExercise.reps || 0);
  const [weight, setWeight] = useState(initialExercise.weight || 0);
  const [unit, setUnit] = useState(initialExercise.unit || "lbs");
  const [date, setDate] = useState(initialExercise.date || todayIsoLocal());

  const handleSubmit = () => {
    onSubmit({
      name,
      reps,
      weight,
      unit,
      date,
    });
  };

  return (
    <div>
      <h2>{title}</h2>

      <input
        type="text"
        placeholder="Exercise name here"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="How many reps?"
        value={reps}
        onChange={(e) => setReps(e.target.valueAsNumber)}
      />

      <input
        type="number"
        placeholder="Weight lifted"
        value={weight}
        onChange={(e) => setWeight(e.target.valueAsNumber)}
      />

      <select value={unit} onChange={(e) => setUnit(e.target.value)}>
        <option value="lbs">Lbs</option>
        <option value="kgs">Kgs</option>
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button onClick={handleSubmit}>{buttonLabel}</button>
    </div>
  );
};

export default ExerciseForm;