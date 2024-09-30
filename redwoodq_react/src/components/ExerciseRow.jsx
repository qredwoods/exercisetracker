import React from 'react'
import { TiDeleteOutline } from "react-icons/ti";
import { FiEdit3 } from "react-icons/fi";

const ExerciseRow = ({exercise}) => {
  const {name, reps, weight, unit, date} = exercise

  return (
    <tr>
      <td>{name}</td>
      <td>{reps}</td>
      <td>{weight}</td>
      <td>{unit}</td>
      <td>{date}</td>
      <td><FiEdit3 /></td>
      <td><TiDeleteOutline /></td>
    </tr>
  )
}

export default ExerciseRow