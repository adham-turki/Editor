// src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import SelectDocument from './DocumentSelection';
import Editor from './DocumentEditor';
import Register from './Register.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/select-document" element={<SelectDocument />} />
        <Route path="/editor/:documentId" element={<Editor />} />
      </Routes>
    </Router>
  );
}

export default App;
