import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// 1. Create the context
const AuthContext = createContext(null)

// 2. Create the provider — wraps the whole app
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check if user is already logged in when app loads
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:5000/api/auth/me',
                    { withCredentials: true }
                )
                setUser(response.data.data)
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        checkAuth()
    }, [])

    // Login function — called from LoginPage
    const login = async (email, password) => {
        const response = await axios.post(
            'http://localhost:5000/api/auth/login',
            { email, password },
            { withCredentials: true }
        )
        setUser(response.data.data)
        return response.data.data
    }

    // Logout function
    const logout = async () => {
        await axios.post(
            'http://localhost:5000/api/auth/logout',
            {},
            { withCredentials: true }
        )
        setUser(null)
    }

    // Re-fetch the current user from /api/auth/me and update context.
    // Called after profile updates so Navbar and other consumers reflect new data.
    const refreshUser = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5000/api/auth/me',
                { withCredentials: true }
            )
            setUser(response.data.data)
        } catch {
            // If the refresh fails, leave existing user state intact
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

// 3. Custom hook — how other components access the context
export function useAuth() {
    return useContext(AuthContext)
}