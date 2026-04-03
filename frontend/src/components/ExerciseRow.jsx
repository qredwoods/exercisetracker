import { TiDeleteOutline } from "react-icons/ti";
import { FiEdit3, FiCopy } from "react-icons/fi";
import { formatDisplayDate } from "../utils/date";

const ExerciseRow = ({ exercise, onDelete, onEdit, onDuplicate, onView, highlight, onHighlightEnd, deleting, flashField }) => {
  const { name, reps, weight, unit, date, _id } = exercise;
  const isBodyweight = unit === "bodyweight";

  const className = [
    "clickable-row",
    highlight ? "row-highlight" : "",
    deleting ? "row-deleting" : "",
  ].filter(Boolean).join(" ");

  return (
    <tr className={className} onClick={() => onView(exercise)} onAnimationEnd={highlight ? onHighlightEnd : undefined}>
      <td className={flashField === "name" ? "sort-col-flash" : ""}>{name}</td>
      <td>{reps}</td>
      <td>{isBodyweight ? "BW" : <>{weight}<span className="unit-label" data-short={unit.slice(0, -1)}> {unit}</span></>}</td>
      <td className={flashField === "date" ? "sort-col-flash" : ""}>{formatDisplayDate(date)}</td>

      <td onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="icon-button"
          aria-label={`Edit ${name}`}
          onClick={() => onEdit(exercise)}
        >
          <FiEdit3 />
        </button>
      </td>

      <td onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="icon-button"
          aria-label={`Duplicate ${name}`}
          onClick={() => onDuplicate(exercise)}
        >
          <FiCopy />
        </button>
      </td>

      <td onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="icon-button"
          aria-label={`Delete ${name}`}
          onClick={() => onDelete(_id)}
        >
          <TiDeleteOutline />
        </button>
      </td>
    </tr>
  );
};

export default ExerciseRow;