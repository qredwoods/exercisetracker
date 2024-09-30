import React from 'react'
import ExerciseRow from './ExerciseRow'

const ExerciseTable = ({exercises}) => {
  return (
    <div>ExerciseTable 
      <p>GET data from '/exercises'</p>
      <p>put that data in</p>
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
            <ExerciseRow exercise={exercise}/>)}
        </tbody>
          </table></div>
  )
}


export default ExerciseTable