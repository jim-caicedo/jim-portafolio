import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import House from './components/House';
import Interior from './pages/Interior';
import CVViewer from './pages/CVViewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<House />} />
        <Route path="/interior" element={<Interior />} />
        <Route path="/cv" element={<CVViewer />} />
      </Routes>
    </Router>
  );
}

export default App;
