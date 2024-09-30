import React from 'react'
import { TiDeleteOutline } from "react-icons/ti";
import { FiEdit3 } from "react-icons/fi";

const ExerciseRow = ({exercise, onDelete}) => {
  const {name, reps, weight, unit, date, _id} = exercise

  return (
    <tr>
      <td>{name}</td>
      <td>{reps}</td>
      <td>{weight}</td>
      <td>{unit}</td>
      <td>{date}</td>
      <td><FiEdit3 onClick={() => console.log('ay ya clicked edit')}/></td>
      <td><TiDeleteOutline onClick={() => onDelete(_id)}/></td>
    </tr>
  )
}

export default ExerciseRow