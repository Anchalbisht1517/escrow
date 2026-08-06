import { useState } from 'react'
import axios from 'axios'

function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email })
            setSent(true)
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
                    <h2 className="text-xl font-semibold text-gray-800 mt-2">
                        Reset your password
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                {sent ? (
                    <div className="text-center">
                        <div className="text-5xl mb-4">📧</div>
                        <h3 className="font-semibold text-gray-800 mb-2">Check your inbox</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            If an account exists for <span className="font-medium">{email}</span>,
                            you'll receive a reset link shortly.
                        </p>
                        <a
                            href="/login"
                            className="text-indigo-600 text-sm font-medium hover:underline"
                        >
                            ← Back to Log In
                        </a>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="priya@example.com"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Remember your password?{' '}
                            <a href="/login" className="text-indigo-600 font-medium hover:underline">
                                Log In
                            </a>
                        </p>
                    </>
                )}

            </div>
        </div>
    )
}

export default ForgotPasswordPage
