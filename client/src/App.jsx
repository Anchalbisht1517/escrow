import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'

// Placeholder dashboard components for now
function ClientDashboard() {
  return <div className="p-10 text-2xl font-bold text-indigo-600">Client Dashboard — Coming Soon</div>
}

function FreelancerDashboard() {
  return <div className="p-10 text-2xl font-bold text-indigo-600">Freelancer Dashboard — Coming Soon</div>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute allowedRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancer/dashboard"
          element={
            <ProtectedRoute allowedRole="freelancer">
              <FreelancerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App