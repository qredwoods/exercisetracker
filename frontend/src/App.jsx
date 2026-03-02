
import './App.css';
import HomePage from './pages/HomePage';
import EditExercisePage from './pages/EditExercisePage'
import CreateExercisePage from './pages/CreateExercisePage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import { useState } from 'react';



function App() {
  const [exerciseToEdit, setExerciseToEdit] = useState([]);
  
  return (
    <>
      <header><h1>LiftLog</h1>
      <p>Track Workouts, Stay Accountable</p></header>
      <Router>
      <Navigation/>
        <Routes>
          <Route path="/" element={<HomePage setExerciseToEdit={setExerciseToEdit}/>}/>
          <Route path="/create" element={<CreateExercisePage/>}/> 
          <Route path="/edit" element={<EditExercisePage exerciseToEdit={exerciseToEdit}/>}/> 
        </Routes>
      </Router>
      <footer>©2024 Quinn Redwoods</footer>
    </>
  )
}

export default App
