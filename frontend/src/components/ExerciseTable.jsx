import ExerciseRow, { formatDisplayDate } from './ExerciseRow'

const EXAMPLE_ROW = {
  name: "Example — Barbell Squat",
  reps: 5,
  weight: 135,
  unit: "lbs",
  date: new Date().toISOString().slice(0, 10),
};

const ExerciseTable = ({user, exercises, onDelete, onEdit, onDuplicate, onView, isFirstVisit, fadeIn, onFadeComplete}) => {
  const isEmpty = exercises.length === 0;
  const showWelcome = isEmpty && isFirstVisit;

  return (
    <div>
      <div className={`table-scaler${fadeIn ? " fade-in" : ""}`} onAnimationEnd={onFadeComplete}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Reps</th>
            <th>Weight</th>
            <th>Date</th>
            <th colSpan={3}>Actions</th>
          </tr>
        </thead>
        <tbody>
        {isEmpty ? (
          <tr className="example-row">
            <td>{EXAMPLE_ROW.name}</td>
            <td>{EXAMPLE_ROW.reps}</td>
            <td>{`${EXAMPLE_ROW.weight} ${EXAMPLE_ROW.unit}`}</td>
            <td>{formatDisplayDate(EXAMPLE_ROW.date)}</td>
            <td colSpan={3}></td>
          </tr>
        ) : (
          exercises.map((exercise) =>
            <ExerciseRow exercise={exercise} key={exercise._id} onDelete={onDelete} onEdit={onEdit} onDuplicate={onDuplicate} onView={onView}/>)
        )}
        </tbody>
      </table>
      </div>
      {showWelcome && (
        <div className="empty-hint" style={{ marginTop: "2rem" }}>
          <p className="welcome-line">Welcome{user?.firstName ? `, ${user.firstName}` : ""}.</p>
          <p>This is your <span className="underline-reveal">exercise log</span> — everything you track shows up here.</p>
          <p>Let's get started!</p>
        </div>
      )}
      {isEmpty && !showWelcome && (
        <div className="empty-hint">
          <p>Nothing here yet — log something to get started!</p>
        </div>
      )}
    </div>
  )
}


export default ExerciseTable