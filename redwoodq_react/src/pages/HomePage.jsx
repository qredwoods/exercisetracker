import ExerciseTable from '../components/ExerciseTable'
import { useEffect, useState } from 'react'


function HomePage() {
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
        <ExerciseTable exercises={exercises}/>
    </div>
  )
}


export default HomePage