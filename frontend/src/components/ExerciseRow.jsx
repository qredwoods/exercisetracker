import { TiDeleteOutline } from "react-icons/ti";
import { FiEdit3, FiCopy } from "react-icons/fi";

function formatDisplayDate(dateString) {
  const [year, month, day] = dateString.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  const monthDay = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const yearStr = date.toLocaleDateString("en-US", { year: "numeric" });
  const numeric = `${Number(month)}/${day}`;

  return <>
    <span className="date-month-day">{monthDay}</span>
    <span className="date-numeric">{numeric}</span>
    <span className="date-year">, {yearStr}</span>
  </>;
}

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
      <td>{isBodyweight ? "BW" : `${weight} ${unit}`}</td>
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

export { formatDisplayDate };
export default ExerciseRow;