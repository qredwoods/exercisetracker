import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from "../api";

const CreateExercisePage = () => {
  
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('lbs')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState('')

  const navigate = useNavigate()
const addExercise = async () => {
  const newExercise = { name, reps, weight, unit, date };

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
    <div>
    <h2>Add Exercise</h2>
    <input 
      type="text"
      placeholder="Exercise name here"
      value={name}
      onChange={e => setName(e.target.value)}/>

    <input 
      type="number"
      placeholder="How many reps?"
      value={reps}
      onChange={e => setReps(e.target.valueAsNumber)}/>
    <input 
      type="number"
      placeholder="Weight lifted"
      value={weight}
      onChange={e => setWeight(e.target.valueAsNumber)}/>
     <select 
      value={unit}
      onChange={e => setUnit(e.target.value)}
      >
      <option value='lbs'>Lbs</option>
      <option value='kgs'>Kgs</option>
      </select>
    <input 
      type="text"
      placeholder="mm-dd-yy"
      value={date}
      onChange={e => setDate(e.target.value)}/>
    <button onClick={addExercise}>Add</button>
  </div>
  )
}

export default CreateExercisePage
