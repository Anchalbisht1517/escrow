import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, allowedRole }) {
    const { user, loading } = useAuth()

    // Still checking if user is logged in
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-indigo-600 font-medium">Loading...</div>
            </div>
        )
    }

    // Not logged in — redirect to login smoothly
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Wrong role — redirect to their correct dashboard
    if (allowedRole && user.role !== allowedRole) {
        return (
            <Navigate
                to={user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'}
                replace
            />
        )
    }

    // All checks passed — show the page
    return children
}

export default ProtectedRoute