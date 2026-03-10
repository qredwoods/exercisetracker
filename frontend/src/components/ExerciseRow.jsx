import { TiDeleteOutline } from "react-icons/ti";
import { FiEdit3 } from "react-icons/fi";

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

const ExerciseRow = ({exercise, onDelete, onEdit}) => {
  const {name, reps, weight, unit, date, _id} = exercise

  return (
    <tr>
      <td>{name}</td>
      <td>{reps}</td>
      <td>{weight}</td>
      <td>{unit}</td>
      <td>{formatDisplayDate(date)}</td>
      <td><FiEdit3 onClick={() => onEdit(exercise)}/></td>
      <td><TiDeleteOutline onClick={() => onDelete(_id)}/></td>
    </tr>
  )
}

export default ExerciseRow