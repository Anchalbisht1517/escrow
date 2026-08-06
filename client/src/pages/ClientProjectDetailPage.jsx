import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/Navbar'

function ClientProjectDetailPage() {
    const { id: projectId } = useParams()
    const { user } = useAuth()
    const [project, setProject] = useState(null)
    const [bids, setBids] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionLoading, setActionLoading] = useState(null)
    const [message, setMessage] = useState('')

    const fetchData = async () => {
        try {
            const [projectRes, bidsRes] = await Promise.all([
                axios.get(
                    `http://localhost:5000/api/projects/${projectId}/public`,
                    { withCredentials: true }
                ),
                axios.get(
                    `http://localhost:5000/api/bids/${projectId}/all`,
                    { withCredentials: true }
                ),
            ])
            setProject(projectRes.data.data.project)
            setBids(bidsRes.data.data.bids)
        } catch (err) {
            setError('Failed to load project')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [projectId])

    const handleAcceptBid = async (bidId) => {
        setActionLoading(bidId)
        setMessage('')
        try {
            await axios.patch(
                `http://localhost:5000/api/bids/${projectId}/accept`,
                { bidId },
                { withCredentials: true }
            )
            setMessage('Bid accepted! Escrow locked successfully.')
            fetchData() // refresh data
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to accept bid')
        } finally {
            setActionLoading(null)
        }
    }

    const handleRejectBid = async (bidId) => {
        setActionLoading(bidId)
        setMessage('')
        try {
            await axios.patch(
                `http://localhost:5000/api/bids/bid/${bidId}/reject`,
                {},
                { withCredentials: true }
            )
            setMessage('Bid rejected.')
            fetchData()
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to reject bid')
        } finally {
            setActionLoading(null)
        }
    }

    const handleCompleteProject = async () => {
        setActionLoading('complete')
        setMessage('')
        try {
            await axios.patch(
                `http://localhost:5000/api/projects/${projectId}/complete`,
                {},
                { withCredentials: true }
            )
            setMessage('Project marked as complete! Payment released to freelancer.')
            fetchData()
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to complete project')
        } finally {
            setActionLoading(null)
        }
    }

    const handleCancelProject = async () => {
        if (!window.confirm('Are you sure you want to cancel this project?')) return
        setActionLoading('cancel')
        setMessage('')
        try {
            await axios.delete(
                `http://localhost:5000/api/projects/${projectId}`,
                { withCredentials: true }
            )
            setMessage('Project cancelled. Escrow refunded to your wallet.')
            fetchData()
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to cancel project')
        } finally {
            setActionLoading(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center py-20 text-gray-400">
                    Loading...
                </div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center py-20 text-red-500">
                    {error}
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
                    href="/client/dashboard"
                    className="text-sm text-indigo-600 hover:underline mb-6 inline-block"
                >
                    ← Back to Dashboard
                </a>

                {/* Message banner */}
                {message && (
                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-lg mb-6 text-sm">
                        {message}
                    </div>
                )}

                {/* Project header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {project.title}
                        </h1>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${project.status === 'open'
                            ? 'bg-emerald-100 text-emerald-700'
                            : project.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-700'
                                : project.status === 'completed'
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-red-100 text-red-600'
                            }`}>
                            {project.status}
                        </span>
                    </div>

                    <p className="text-gray-600 mb-4">{project.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-400">Budget</p>
                            <p className="font-semibold">₹{project.budgetMin} - ₹{project.budgetMax}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Total Bids</p>
                            <p className="font-semibold">{project.totalBids}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Escrow Status</p>
                            <p className="font-semibold capitalize">{project.escrowStatus}</p>
                        </div>
                        {project.escrowAmount > 0 && (
                            <div>
                                <p className="text-gray-400">Locked Amount</p>
                                <p className="font-semibold text-indigo-600">
                                    ₹{project.escrowAmount}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 mt-6">
                        {project.status === 'in-progress' && (
                            <button
                                onClick={handleCompleteProject}
                                disabled={actionLoading === 'complete'}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {actionLoading === 'complete' ? 'Processing...' : '✓ Mark as Complete'}
                            </button>
                        )}
                        {(project.status === 'open' || project.status === 'in-progress') && (
                            <button
                                onClick={handleCancelProject}
                                disabled={actionLoading === 'cancel'}
                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                            >
                                {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Project'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Bids section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                        Bids ({bids.length})
                    </h2>

                    {bids.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            No bids yet — share your project to attract freelancers
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bids.map((bid) => (
                                <div
                                    key={bid._id}
                                    className={`border rounded-xl p-4 ${bid.status === 'accepted'
                                        ? 'border-emerald-300 bg-emerald-50'
                                        : bid.status === 'rejected'
                                            ? 'border-gray-200 bg-gray-50 opacity-60'
                                            : 'border-gray-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">

                                            {/* Freelancer info */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {bid.freelancer?.firstName?.[0]}
                                                    {bid.freelancer?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {bid.freelancer?.firstName} {bid.freelancer?.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {bid.estimatedDays} days delivery
                                                    </p>
                                                </div>
                                                <span className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${bid.status === 'accepted'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : bid.status === 'rejected'
                                                        ? 'bg-gray-100 text-gray-500'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {bid.status}
                                                </span>
                                            </div>

                                            {/* Cover letter */}
                                            <p className="text-sm text-gray-600 mb-3">
                                                {bid.coverLetter}
                                            </p>

                                            {/* Bid amount */}
                                            <p className="text-lg font-bold text-indigo-600">
                                                ₹{bid.amount}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Accept/Reject buttons */}
                                    {bid.status === 'pending' && project.status === 'open' && (
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => handleAcceptBid(bid._id)}
                                                disabled={actionLoading === bid._id}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {actionLoading === bid._id ? 'Processing...' : 'Accept Bid'}
                                            </button>
                                            <button
                                                onClick={() => handleRejectBid(bid._id)}
                                                disabled={actionLoading === bid._id}
                                                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default ClientProjectDetailPage