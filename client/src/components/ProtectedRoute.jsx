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

    // Not logged in — redirect to login
    if (!user) {
        window.location.href = '/login'
        return null
    }

    // Wrong role — redirect to their correct dashboard
    if (allowedRole && user.role !== allowedRole) {
        window.location.href = user.role === 'client'
            ? '/client/dashboard'
            : '/freelancer/dashboard'
        return null
    }

    // All checks passed — show the page
    return children
}

export default ProtectedRoute