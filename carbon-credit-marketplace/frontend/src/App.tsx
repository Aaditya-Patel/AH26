import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Education from './pages/Education'
import Calculator from './pages/Calculator'
import Matching from './pages/Matching'
import Marketplace from './pages/Marketplace'
import Formalities from './pages/Formalities'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/education" element={<Education />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/formalities" element={<Formalities />} />
      </Routes>
    </Router>
  )
}

export default App
