import { useState } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import ExerciseRow from './ExerciseRow'
import { formatDisplayDate } from '../utils/date'

const EXAMPLE_ROW = {
  name: "Example — Barbell Squat",
  reps: 5,
  weight: 135,
  unit: "lbs",
  date: new Date().toISOString().slice(0, 10),
};

const ExerciseTable = ({user, exercises, onDelete, onEdit, onDuplicate, onView, isFirstVisit, fadeIn, onFadeComplete, highlightId, onHighlightEnd, deletingId}) => {
  const [sort, setSort] = useState({ field: "date", dir: "desc" });
  const [flashField, setFlashField] = useState(null);
  const isEmpty = exercises.length === 0;
  const showWelcome = isEmpty && isFirstVisit;

  const toggleSort = (field) => {
    setSort((s) => {
      if (s.field !== field) setFlashField(field);
      return s.field === field
        ? { field, dir: s.dir === "desc" ? "asc" : "desc" }
        : { field, dir: field === "date" ? "desc" : "asc" };
    });
  };

  const sorted = [...exercises].sort((a, b) => {
    const cmp = a[sort.field].localeCompare(b[sort.field]);
    return sort.dir === "asc" ? cmp : -cmp;
  });

  return (
    <div>
      {!isEmpty && (
        <p className="table-heading">
          Exercise Log · {exercises.length} {exercises.length === 1 ? 'entry' : 'entries'}
        </p>
      )}
      <div className={`table-scaler${fadeIn ? " fade-in" : ""}`} onAnimationEnd={onFadeComplete}>
      <table>
        <thead>
          <tr>
            <th
              className={`sortable-th${flashField === "name" ? " sort-col-flash" : ""}`}
              onClick={() => toggleSort("name")}
              onAnimationEnd={() => flashField === "name" && setFlashField(null)}
            >
              <span className="sortable-th-text">Name</span><span className={`sort-indicator-right${sort.field !== "name" ? " sort-inactive" : ""}`}>{sort.field === "name" ? (sort.dir === "asc" ? <FiChevronDown /> : <FiChevronUp />) : <FiChevronDown />}</span>
            </th>
            <th>Reps</th>
            <th>Weight</th>
            <th
              className={`sortable-th${flashField === "date" ? " sort-col-flash" : ""}`}
              onClick={() => toggleSort("date")}
            >
              <span className={`sort-indicator${sort.field !== "date" ? " sort-inactive" : ""}`}>{sort.field === "date" ? (sort.dir === "desc" ? <FiChevronDown /> : <FiChevronUp />) : <FiChevronDown />}</span><span className="sortable-th-text">Date</span>
            </th>
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
          sorted.map((exercise) =>
            <ExerciseRow exercise={exercise} key={exercise._id} onDelete={onDelete} onEdit={onEdit} onDuplicate={onDuplicate} onView={onView} highlight={exercise._id === highlightId} onHighlightEnd={onHighlightEnd} deleting={exercise._id === deletingId} flashField={flashField}/>)
        )}
        </tbody>
      </table>
      </div>
      {showWelcome && (
        <div className="empty-hint" style={{ marginTop: "2rem" }}>
          <p className="welcome-line">Welcome{user?.firstName ? `, ${user.firstName}` : ""}.</p>
          <p>This is your <span className="underline-reveal">exercise log</span> — everything you track shows up here.</p>
          <p>Let&apos;s get started!</p>
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