import { useState } from 'react'
import axios from 'axios'

function RegisterPage() {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('client')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                firstName,
                lastName,
                email,
                password,
                role,
            })
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-indigo-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full shadow-lg">
                    <div className="text-5xl mb-4">📧</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Check your email
                    </h2>
                    <p className="text-gray-500">
                        We sent a verification link to <strong>{email}</strong>.
                        Click it to activate your account.
                    </p>
                    <a
                        href="/login"
                        className="inline-block mt-6 text-indigo-600 font-medium hover:underline"
                    >
                        Go to Login →
                    </a>
                </div>
            </div >
        )
    }

    return (
        <div className="min-h-screen bg-indigo-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">

                {/* Header */}
                <div className="text-center mb-8">
                    <a href="/" className="text-3xl font-bold text-indigo-600">Allie</a>
                    <h2 className="text-xl font-semibold text-gray-800 mt-1">
                        Create your account
                    </h2>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Role selection */}
                    <div className="flex gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('client')}
                            className={`flex-1 py-2 rounded-lg border font-medium text-sm transition-colors ${role === 'client'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-gray-300 text-gray-600 hover:border-indigo-400'
                                }`}
                        >
                            I am a Client
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('freelancer')}
                            className={`flex-1 py-2 rounded-lg border font-medium text-sm transition-colors ${role === 'freelancer'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-gray-300 text-gray-600 hover:border-indigo-400'
                                }`}
                        >
                            I am a Freelancer
                        </button>
                    </div>

                    {/* Name fields */}
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                placeholder="Priya"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                placeholder="Sharma"
                            />
                        </div>
                    </div>

                    {/* Email */}
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

                    {/* Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="Min 8 characters"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>

                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <a href="/login" className="text-indigo-600 font-medium hover:underline">
                        Log in
                    </a>
                </p>

            </div>
        </div>
    )
}

export default RegisterPage