import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ClientDashboard from './pages/ClientDashboard'
import FreelancerDashboard from './pages/FreelancerDashboard'
import PostProjectPage from './pages/PostProjectPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ClientProjectDetailPage from './pages/ClientProjectDetailPage'
import WalletPage from './pages/WalletPage'
import NotFoundPage from './pages/NotFoundPage'
import BrowseProjectsPage from './pages/BrowseProjectsPage'
import EditProfilePage from './pages/EditProfilePage'
import FreelancerProfilePage from './pages/FreelancerProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute allowedRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-project"
          element={
            <ProtectedRoute allowedRole="client">
              <PostProjectPage />
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
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/projects/:id"
          element={
            <ProtectedRoute allowedRole="client">
              <ClientProjectDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse-projects"
          element={
            <ProtectedRoute>
              <BrowseProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        {/* Public — no auth needed, matches backend route */}
        <Route path="/freelancers/:id" element={<FreelancerProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App