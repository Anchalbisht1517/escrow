import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/Navbar'

function PostProjectPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [form, setForm] = useState({
        title: '',
        description: '',
        budgetMin: '',
        budgetMax: '',
        budgetType: 'fixed',
        skillsRequired: '',
        deadline: '',
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await axios.post(
                'http://localhost:5000/api/projects',
                {
                    ...form,
                    budgetMin: Number(form.budgetMin),
                    budgetMax: Number(form.budgetMax),
                    skillsRequired: form.skillsRequired
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                },
                { withCredentials: true }
            )
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-lg mx-auto px-6 py-20 text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Project Posted!
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Freelancers can now find and bid on your project.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a
                            href="/client/dashboard"
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                        >
                            Go to Dashboard
                        </a>
                        <button
                            onClick={() => setSuccess(false)}
                            className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50"
                        >
                            Post Another
                        </button>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-2xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Post a Project</h1>
                    <p className="text-gray-500 mt-1">
                        Describe what you need and receive bids from verified freelancers
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">

                    {/* Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Build a React e-commerce website"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            required
                            rows={5}
                            placeholder="Describe your project in detail — what you need, any specific requirements, expected deliverables..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                        />
                    </div>

                    {/* Budget type */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget Type
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, budgetType: 'fixed' })}
                                className={`flex-1 py-2 rounded-lg border font-medium text-sm transition-colors ${form.budgetType === 'fixed'
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'border-gray-300 text-gray-600 hover:border-indigo-400'
                                    }`}
                            >
                                Fixed Price
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, budgetType: 'hourly' })}
                                className={`flex-1 py-2 rounded-lg border font-medium text-sm transition-colors ${form.budgetType === 'hourly'
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'border-gray-300 text-gray-600 hover:border-indigo-400'
                                    }`}
                            >
                                Hourly Rate
                            </button>
                        </div>
                    </div>

                    {/* Budget range */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Budget (₹)
                            </label>
                            <input
                                type="number"
                                name="budgetMin"
                                value={form.budgetMin}
                                onChange={handleChange}
                                required
                                placeholder="1000"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Budget (₹)
                            </label>
                            <input
                                type="number"
                                name="budgetMax"
                                value={form.budgetMax}
                                onChange={handleChange}
                                required
                                placeholder="5000"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Skills Required
                        </label>
                        <input
                            type="text"
                            name="skillsRequired"
                            value={form.skillsRequired}
                            onChange={handleChange}
                            placeholder="React, Node.js, MongoDB (comma separated)"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Separate skills with commas
                        </p>
                    </div>

                    {/* Deadline */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deadline (optional)
                        </label>
                        <input
                            type="date"
                            name="deadline"
                            value={form.deadline}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Posting...' : 'Post Project'}
                    </button>

                </form>
            </div>
        </div>
    )
}

export default PostProjectPage