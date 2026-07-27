import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

function ProjectDetailPage() {
    const { user } = useAuth()
    const { id: projectId } = useParams()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Bid form state
    const [bidAmount, setBidAmount] = useState('')
    const [estimatedDays, setEstimatedDays] = useState('')
    const [coverLetter, setCoverLetter] = useState('')
    const [bidLoading, setBidLoading] = useState(false)
    const [bidError, setBidError] = useState('')
    const [bidSuccess, setBidSuccess] = useState(false)

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/projects/${projectId}/public`,
                    { withCredentials: true }
                )
                setProject(response.data.data.project) // ← add .project here
            } catch (err) {
                setError('Project not found')
            } finally {
                setLoading(false)
            }
        }
        fetchProject()
    }, [projectId])

    const handleBidSubmit = async (e) => {
        e.preventDefault()
        setBidLoading(true)
        setBidError('')

        try {
            await axios.post(
                `http://localhost:5000/api/bids/${projectId}/place`,
                {
                    projectId,
                    amount: Number(bidAmount),
                    estimatedDays: Number(estimatedDays),
                    coverLetter,
                },
                { withCredentials: true }
            )
            setBidSuccess(true)
        } catch (err) {
            setBidError(err.response?.data?.message || 'Failed to place bid')
        } finally {
            setBidLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center py-20 text-gray-400">
                    Loading project...
                </div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center py-20 text-red-500">
                    {error || 'Project not found'}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-10">

                {/* Back link */}
                <a
                    href="/freelancer/dashboard"
                    className="text-sm text-indigo-600 hover:underline mb-6 inline-block"
                >
                    ← Back to Dashboard
                </a>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left — Project details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">

                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {project.title}
                                </h1>
                                <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
                                    {project.status}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 leading-relaxed mb-6">
                                {project.description}
                            </p>

                            {/* Skills */}
                            {project.skillsRequired?.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        Skills Required
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.skillsRequired.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="bg-indigo-50 text-indigo-600 text-sm px-3 py-1 rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Project info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Budget</p>
                                    <p className="font-semibold text-gray-800">
                                        ₹{project.budgetMin} - ₹{project.budgetMax}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Budget Type</p>
                                    <p className="font-semibold text-gray-800 capitalize">
                                        {project.budgetType}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Total Bids</p>
                                    <p className="font-semibold text-gray-800">
                                        {project.totalBids}
                                    </p>
                                </div>
                                {project.deadline && (
                                    <div>
                                        <p className="text-gray-400">Deadline</p>
                                        <p className="font-semibold text-gray-800">
                                            {new Date(project.deadline).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Right — Bid form */}
                    <div className="lg:col-span-1">
                        {user?.role === 'freelancer' && project.status === 'open' && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">
                                    Place a Bid
                                </h2>

                                {bidSuccess ? (
                                    <div className="text-center py-6">
                                        <div className="text-4xl mb-3">🎉</div>
                                        <p className="font-semibold text-gray-800 mb-1">
                                            Bid Placed!
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            The client will review your proposal
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleBidSubmit}>

                                        {bidError && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-4 text-sm">
                                                {bidError}
                                            </div>
                                        )}

                                        {/* Bid amount */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Your Bid (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                required
                                                placeholder={`${project.budgetMin} - ${project.budgetMax}`}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>

                                        {/* Estimated days */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Time (days)
                                            </label>
                                            <input
                                                type="number"
                                                value={estimatedDays}
                                                onChange={(e) => setEstimatedDays(e.target.value)}
                                                required
                                                placeholder="7"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>

                                        {/* Cover letter */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cover Letter
                                            </label>
                                            <textarea
                                                value={coverLetter}
                                                onChange={(e) => setCoverLetter(e.target.value)}
                                                required
                                                rows={5}
                                                placeholder="Explain why you're the best fit for this project..."
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={bidLoading}
                                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {bidLoading ? 'Placing bid...' : 'Place Bid'}
                                        </button>

                                    </form>
                                )}
                            </div>
                        )}

                        {/* Show message if project not open */}
                        {project.status !== 'open' && (
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center">
                                <p className="text-gray-500 text-sm">
                                    This project is no longer accepting bids
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div >
    )
}

export default ProjectDetailPage