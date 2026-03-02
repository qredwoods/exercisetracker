import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EditExercisePage = ({exerciseToEdit}) => {

  const [name, setName] = useState(exerciseToEdit.name)
  const [unit, setUnit] = useState(exerciseToEdit.unit)
  const [reps, setReps] = useState(exerciseToEdit.reps)
  const [weight, setWeight] = useState(exerciseToEdit.weight)
  const [date, setDate] = useState(exerciseToEdit.date)

  const _id = exerciseToEdit._id

  const navigate = useNavigate()
  const updateExercise = async (_id) => {
    const editedExercise = { name, reps, weight, unit, date };
    const response = await fetch(`/api/exercises/${_id}`, {
      method: 'PUT',
      body: JSON.stringify(editedExercise),
      headers: { 'Content-Type': 'application/json'}
    });
    if (response.status === 201) {
  alert("Successfully update the exercise!");
} else {
  let errorMessage = `Failed to update the exercise, status code = ${response.status}`;

  try {
    const data = await response.json();
    if (data.error) {
      errorMessage = data.error;
    }
  } catch {
    // ignore JSON parse errors (e.g. empty response)
  }

  alert(errorMessage);
}
  };

  return (
    <div>
    <h2>Edit Exercise</h2>
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
      <option value='kgs'>Kgs</option>type="text"
      <option value='lbs'>Lbs</option>type="text"
      
      </select>
    <input 
      type="text"
      placeholder="mm-dd-yy"
      value={date}
      onChange={e => setDate(e.target.value)}/>
    <button onClick={() => updateExercise(_id)}>Update</button>
    </div>
  )
}

export default EditExercisePage