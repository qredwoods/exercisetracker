import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CreateExercisePage = () => {
  
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState('')

  const navigate = useNavigate()
  const addExercise = async () => {
    const newExercise = { name, reps, weight, unit, date };
    const response = await fetch('/exercises', {
      method: 'POST',
      body: JSON.stringify(newExercise),
      headers: { 'Content-Type': 'application/json'}
    });
    if(response.status === 201){
      alert("Successfully added the exercise!");
    } else {
      alert(`Failed to add exercise, status code = ${response.status}`);
    }
    navigate("/");
  };

  return (
    <div>
    <h2>Add Exercise</h2>
    <input 
      type="text"
      placeholder="Enter exercise name here"
      value={name}
      onChange={e => setName(e.target.value)}/>

    <input 
      type="number"
      placeholder="How many reps did you do?"
      value={reps}
      onChange={e => setReps(e.target.valueAsNumber)}/>
    <input 
      type="number"
      placeholder="Enter weight here"
      value={weight}
      onChange={e => setWeight(e.target.valueAsNumber)}/>
    <input 
      type="text"
      placeholder="kgs or lbs"
      value={unit}
      onChange={e => setUnit(e.target.value)}/>
    <input 
      type="text"
      placeholder="mm-dd-yy"
      value={date}
      onChange={e => setDate(e.target.value)}/>
    <button onClick={addExercise}/>
  </div>
  )
}

export default CreateExercisePage
