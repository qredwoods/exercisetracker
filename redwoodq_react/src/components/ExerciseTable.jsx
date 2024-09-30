import React from 'react'
import ExerciseRow from './ExerciseRow'

const ExerciseTable = ({exercises, onDelete, onEdit}) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Reps</th>
            <th>Weight</th>
            <th>Unit</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
        {exercises.map((exercise) => 
            <ExerciseRow exercise={exercise} onDelete={onDelete} onEdit={onEdit}/>)}
        </tbody>
          </table></div>
  )
}


export default ExerciseTable