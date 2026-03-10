import ExerciseRow from './ExerciseRow'

const ExerciseTable = ({exercises, onDelete, onEdit, onDuplicate}) => {
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
            <th colSpan={3}>Actions</th>
          </tr>
        </thead>
        <tbody>
        {exercises.map((exercise) => 
            <ExerciseRow exercise={exercise} key={exercise._id} onDelete={onDelete} onEdit={onEdit} onDuplicate={onDuplicate}/>)}
        </tbody>
          </table></div>
  )
}


export default ExerciseTable