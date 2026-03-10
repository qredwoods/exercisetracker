import { TiDeleteOutline } from "react-icons/ti";
import { FiEdit3, FiCopy } from "react-icons/fi";

function formatDisplayDate(dateString) {
  const [year, month, day] = dateString.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ExerciseRow = ({ exercise, onDelete, onEdit, onDuplicate }) => {
  const { name, reps, weight, unit, date, _id } = exercise;
  const isBodyweight = unit === "bodyweight";

  return (
    <tr>
      <td>{name}</td>
      <td>{reps}</td>
      <td>{isBodyweight ? "BW" : weight}</td>
      <td>{isBodyweight ? "—" : unit}</td>
      <td>{formatDisplayDate(date)}</td>

      <td>
        <button
          type="button"
          className="icon-button"
          aria-label={`Edit ${name}`}
          onClick={() => onEdit(exercise)}
        >
          <FiEdit3 />
        </button>
      </td>

      <td>
        <button
          type="button"
          className="icon-button"
          aria-label={`Duplicate ${name}`}
          onClick={() => onDuplicate(exercise)}
        >
          <FiCopy />
        </button>
      </td>

      <td>
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