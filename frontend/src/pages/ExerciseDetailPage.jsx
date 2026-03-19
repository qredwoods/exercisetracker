import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiCopy } from "react-icons/fi";
import { TiDeleteOutline } from "react-icons/ti";
import { formatDisplayDate } from "../components/ExerciseRow";
import { todayIsoLocal } from "../utils/date";
import { apiFetch } from "../utils/api";

const ExerciseDetailPage = ({ exerciseDraft, setExerciseDraft, setExercises, showToast }) => {
  const navigate = useNavigate();
  const exercise = exerciseDraft;

  if (!exercise?._id) {
    return (
      <div>
        <p className="form-error">No exercise selected.</p>
        <div className="cta-row">
          <button className="cta-button" onClick={() => navigate("/")}>
            Back Home
          </button>
        </div>
      </div>
    );
  }

  const { name, reps, weight, unit, date, notes, _id } = exercise;
  const isBodyweight = unit === "bodyweight";

  const onEdit = () => {
    setExerciseDraft(exercise);
    navigate("/edit");
  };

  const onDuplicate = () => {
    setExerciseDraft({
      ...exercise,
      _id: undefined,
      date: todayIsoLocal(),
    });
    navigate("/create");
  };

  const onDelete = async () => {
    try {
      await apiFetch(`/api/exercises/${_id}`, { method: "DELETE" });
      setExercises((prev) => prev.filter((e) => e._id !== _id));
      navigate("/");
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div className="detail-page">
      <div className="detail-card">
        <h2 className="detail-name">{name}</h2>

        <div className="detail-fields">
          <div className="detail-field">
            <span className="detail-label">Reps</span>
            <span className="detail-value">{reps}</span>
          </div>
          <div className="detail-field">
            <span className="detail-label">Weight</span>
            <span className="detail-value">{isBodyweight ? "Bodyweight" : `${weight} ${unit}`}</span>
          </div>
          <div className="detail-field">
            <span className="detail-label">Date</span>
            <span className="detail-value">{formatDisplayDate(date)}</span>
          </div>
        </div>

        {notes && (
          <div className="detail-notes">
            <span className="detail-label">Notes</span>
            <p className="detail-notes-text">{notes}</p>
          </div>
        )}

        <div className="detail-actions">
          <button className="icon-button" aria-label="Edit" onClick={onEdit}>
            <FiEdit3 />
          </button>
          <button className="icon-button" aria-label="Duplicate" onClick={onDuplicate}>
            <FiCopy />
          </button>
          <button className="icon-button" aria-label="Delete" onClick={onDelete}>
            <TiDeleteOutline />
          </button>
        </div>
      </div>

      <div className="cta-row">
        <button className="back-btn" onClick={() => navigate("/")}>
          <FiArrowLeft />
        </button>
      </div>
    </div>
  );
};

export default ExerciseDetailPage;
