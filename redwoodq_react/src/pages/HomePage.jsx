import ExerciseTable from '../components/ExerciseTable'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage({setExerciseToEdit}) {
  const navigate = useNavigate()
  const onDelete = async (_id) => {
    const response = await fetch(`/exercises/${_id}`, { method: 'DELETE' });
    if (response.status === 204) {
      const getResponse = await fetch('/exercises');
      const exercises = await getResponse.json();
      setExercises(exercises);
    } else {
      console.error(`Failed to delete exercise with id = ${_id}, status code = ${response.status}`)
    }
  }
  
  const onEdit = (exerciseToEdit) => {console.log('onEdit was called')
    setExerciseToEdit(exerciseToEdit);
    navigate('/edit')
  }

  const [exercises, setExercises] = useState([]);

  const loadExercises = async () => {
    const response = await fetch('/exercises');
    const exercises = await response.json();
    setExercises(exercises);
  }

  useEffect(() => {
    loadExercises(); 
   }, []);

  return (
    <div>
    <h2>Exercises Done</h2>
        <ExerciseTable exercises={exercises} onDelete={onDelete} onEdit={onEdit}/>
    </div>
  )
}


export default HomePage