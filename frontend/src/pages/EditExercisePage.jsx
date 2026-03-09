import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'

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

    try { await apiFetch(`/api/exercises/${_id}`, {
      method: 'PUT',
      body: JSON.stringify(editedExercise),
    });

    alert("Successfully updated the exercise!");
    navigate("/")
  } catch (err) {
    alert(err.message)
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
      <option value='kgs'>Kgs</option>
      <option value='lbs'>Lbs</option>
      
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