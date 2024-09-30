import React from 'react'
import { useState } from 'react'

const EditExercisePage = ({exerciseToEdit}) => {

  const [name, setName] = useState(exerciseToEdit.name)
  const [unit, setUnit] = useState(exerciseToEdit.unit)
  const [reps, setReps] = useState(exerciseToEdit.reps)
  const [weight, setWeight] = useState(exerciseToEdit.weight)
  const [date, setDate] = useState(exerciseToEdit.date)

  return (
    <div>EditExercisePage</div>
  )
}

export default EditExercisePage