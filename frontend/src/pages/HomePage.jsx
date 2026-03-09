import ExerciseTable from '../components/ExerciseTable'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

function HomePage({setExerciseToEdit}) {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState([])
  const loadExercises = async () => {
    try {
      const exercises = await apiFetch("/api/exercises");
      setExercises(exercises);
    } catch (err) {
      alert(err.message);
    }
  };
  
  const onDelete = async (_id) => {

  try {
    await apiFetch(`/api/exercises/${_id}`, { method: "DELETE"});
    await loadExercises();
  } catch(err) {
    alert(err.message)
  }
};
  
  const onEdit = (exerciseToEdit) => {
    setExerciseToEdit(exerciseToEdit);
    navigate('/edit')
  }

  useEffect(() => {
    loadExercises(); 
   }, []);

  return (
    <div>
    <h2>Exercises Done</h2>
        <ExerciseTable exercises={exercises} onDelete={onDelete} onEdit={onEdit}/>
        <button onClick={() => navigate('/create')}>New Entry</button>
    </div>
  )
}


export default HomePage