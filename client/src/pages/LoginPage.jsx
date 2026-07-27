import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const user = await login(email, password)
            // Redirect based on role
            if (user.role === 'client') {
                window.location.href = '/client/dashboard'
            } else {
                window.location.href = '/freelancer/dashboard'
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-indigo-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">

                <div className="text-center mb-8">
                    <a href="/" className="text-3xl font-bold text-indigo-600">Allie</a>
                    <h2 className="text-xl font-semibold text-gray-800 mt-1">
                        Welcome back
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="priya@example.com"
                        />
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <a href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
                                Forgot password?
                            </a>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="Your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{' '}
                    <a href="/register" className="text-indigo-600 font-medium hover:underline">
                        Sign up
                    </a>
                </p>

            </div>
        </div>
    )
}

export default LoginPage