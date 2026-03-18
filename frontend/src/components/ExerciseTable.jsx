import { useState } from 'react'
import ExerciseRow from './ExerciseRow'

const EXAMPLE_ROW = {
  name: "Example — Barbell Squat",
  reps: 5,
  weight: 135,
  unit: "lbs",
  date: new Date().toISOString().slice(0, 10),
};

const ExerciseTable = ({user, exercises, onDelete, onEdit, onDuplicate}) => {
  const isEmpty = exercises.length === 0;
  const [animate] = useState(() => {
    if (sessionStorage.getItem("welcomeSeen")) return false;
    sessionStorage.setItem("welcomeSeen", "1");
    return true;
  });

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
        {isEmpty ? (
          <tr className="example-row">
            <td>{EXAMPLE_ROW.name}</td>
            <td>{EXAMPLE_ROW.reps}</td>
            <td>{EXAMPLE_ROW.weight}</td>
            <td>{EXAMPLE_ROW.unit}</td>
            <td>{EXAMPLE_ROW.date}</td>
            <td colSpan={3}></td>
          </tr>
        ) : (
          exercises.map((exercise) =>
            <ExerciseRow exercise={exercise} key={exercise._id} onDelete={onDelete} onEdit={onEdit} onDuplicate={onDuplicate}/>)
        )}
        </tbody>
      </table>
      {isEmpty && (
        <div className="empty-hint">
          <p className={`welcome-line${animate ? "" : " no-animate"}`}>Welcome{user?.firstName ? `, ${user.firstName}` : ""}.</p>
          <p>This is your <span className={`underline-reveal${animate ? "" : " no-animate"}`}>exercise log</span> — everything you track shows up here.</p>
          <p>Let's get started!</p>
        </div>
      )}
    </div>
  )
}


export default ExerciseTable