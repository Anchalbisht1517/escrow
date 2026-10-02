import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useParams } from 'react-router-dom'
import API from '../api/axiosInstance'
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
                const response = await API.get(`/api/projects/${projectId}/public`)
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
            await API.post(`/api/bids/${projectId}/place`, {
                projectId,
                amount: Number(bidAmount),
                estimatedDays: Number(estimatedDays),
                coverLetter,
            })
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
                    href="/browse-projects"
                    className="text-sm text-indigo-600 hover:underline mb-6 inline-block"
                >
                    ← Back to Projects
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
                                {project.client && (
                                    <div>
                                        <p className="text-gray-400">Posted by</p>
                                        <a
                                            href={`/freelancers/${project.client._id}`}
                                            className="font-semibold text-indigo-600 hover:underline"
                                        >
                                            {project.client.firstName} {project.client.lastName}
                                        </a>
                                    </div>
                                )}
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

                        {!user && project.status === 'open' && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                                <div className="text-3xl mb-3">💼</div>
                                <h3 className="font-bold text-gray-800 mb-2">Interested in this project?</h3>
                                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                                    Sign in as a freelancer to submit a proposal and place your bid.
                                </p>
                                <a
                                    href="/login"
                                    className="block w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 mb-2.5 text-center text-sm"
                                >
                                    Log In to Bid
                                </a>
                                <a
                                    href="/register"
                                    className="block w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 text-center text-sm"
                                >
                                    Create an Account
                                </a>
                            </div>
                        )}

                        {/* In Progress / Under Review Workspace View for Hired Freelancer */}
                        {(project.status === 'in-progress' || project.status === 'under-review') && user && (user._id === (project.hiredFreelancer?._id || project.hiredFreelancer)) && (
                            <WorkspaceCard
                                project={project}
                                user={user}
                                projectId={projectId}
                                onStatusChange={setProject}
                            />
                        )}

                        {/* Show generic closed message if project not open and user is NOT the hired freelancer */}
                        {project.status !== 'open' && !((project.status === 'in-progress' || project.status === 'under-review') && user && (user._id === (project.hiredFreelancer?._id || project.hiredFreelancer))) && (
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

// ─── Workspace Card — shown to hired freelancer ───
function WorkspaceCard({ project, projectId, onStatusChange }) {
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const handleSubmitWork = async () => {
        if (!window.confirm('Submit your work for client review? The client will be notified.')) return
        setSubmitting(true)
        setSubmitError('')
        try {
            const res = await API.patch(`/api/projects/${projectId}/submit`, {})
            onStatusChange(res.data.data.project)
            setSubmitSuccess(true)
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to submit work')
        } finally {
            setSubmitting(false)
        }
    }

    const isUnderReview = project.status === 'under-review'

    return (
        <div className={`rounded-2xl p-6 shadow-sm border ${isUnderReview ? 'bg-purple-50 border-purple-200' : 'bg-emerald-50 border-emerald-200'}`}>
            {/* Header */}
            <div className={`flex items-center gap-2 font-bold text-lg mb-2 ${isUnderReview ? 'text-purple-800' : 'text-emerald-800'}`}>
                <span>{isUnderReview ? '📤' : '🎉'}</span>
                <h3>{isUnderReview ? 'Work Submitted — Awaiting Review' : 'You are hired!'}</h3>
            </div>
            <p className={`text-sm mb-4 leading-relaxed ${isUnderReview ? 'text-purple-700' : 'text-emerald-700'}`}>
                {isUnderReview
                    ? 'Your work has been submitted. The client is reviewing it. You\'ll be notified once they approve or request changes.'
                    : 'You are actively working on this project. Once done, submit your work for client review.'}
            </p>

            {/* Info card */}
            <div className={`bg-white rounded-xl p-4 border space-y-3 text-sm mb-4 ${isUnderReview ? 'border-purple-100' : 'border-emerald-100'}`}>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Escrow Security</span>
                    <span className={`font-semibold flex items-center gap-1 ${isUnderReview ? 'text-purple-600' : 'text-emerald-600'}`}>
                        🔒 ₹{project.escrowAmount || project.budgetMax} Locked
                    </span>
                </div>
                {project.client && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Client</span>
                        <span className="font-semibold text-gray-800">
                            {project.client.firstName} {project.client.lastName}
                        </span>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isUnderReview ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isUnderReview ? 'Under Review' : 'In Progress'}
                    </span>
                </div>
                {project.workSubmittedAt && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Submitted</span>
                        <span className="text-gray-700 text-xs">
                            {new Date(project.workSubmittedAt).toLocaleString()}
                        </span>
                    </div>
                )}
            </div>

            {/* Submit Work button */}
            {!isUnderReview && (
                <>
                    {submitError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg mb-3">
                            {submitError}
                        </div>
                    )}
                    {submitSuccess ? (
                        <div className="bg-purple-100 text-purple-800 text-sm font-medium text-center py-2.5 rounded-lg">
                            ✅ Work submitted! Client has been notified.
                        </div>
                    ) : (
                        <button
                            onClick={handleSubmitWork}
                            disabled={submitting}
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {submitting ? 'Submitting...' : '📤 Submit Work for Review'}
                        </button>
                    )}
                </>
            )}

            {isUnderReview && (
                <p className="text-xs text-purple-800/70 text-center leading-relaxed">
                    Payment will be released to your wallet once the client approves the work.
                </p>
            )}
        </div>
    )
}