import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/axiosInstance'
import Navbar from '../components/Navbar'

function FreelancerDashboard() {
    const { user } = useAuth()
    const [wallet, setWallet] = useState(null)
    const [myActiveProjects, setMyActiveProjects] = useState([])
    const [availableProjects, setAvailableProjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!user?._id) return
            try {
                const [walletRes, activeRes, availableRes] = await Promise.all([
                    API.get('/api/users/wallet'),
                    API.get(`/api/projects?hiredFreelancer=${user._id}&status=in-progress`),
                    API.get('/api/projects?status=open'),
                ])
                setWallet(walletRes.data.data)
                setMyActiveProjects(activeRes.data.data.projects || [])
                setAvailableProjects(availableRes.data.data.projects || [])
            } catch (err) {
                console.error('Dashboard fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user?._id])

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 py-10">

                {/* Welcome header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.firstName} 👋
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Find projects and grow your freelance career
                        </p>
                    </div>
                    <a
                        href="/profile/edit"
                        className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                    >
                        ✏️ Edit Profile
                    </a>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                    {/* Wallet balance */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Wallet Balance</p>
                        <p className="text-3xl font-bold text-indigo-600">
                            {`₹${wallet?.walletBalance ?? '...'}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Earnings from completed projects
                        </p>
                    </div>

                    {/* Active projects count */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Active Projects</p>
                        <p className="text-3xl font-bold text-amber-600">
                            {myActiveProjects.length}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Projects currently in progress
                        </p>
                    </div>

                    {/* Completed projects */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Completed Projects</p>
                        <p className="text-3xl font-bold text-emerald-600">
                            {user?.completedProjectsCount ?? 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Successfully delivered work
                        </p>
                    </div>

                </div>

                {/* SECTION 1: My Active Projects (Hired & In-Progress) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-800">
                                My Active Projects
                            </h2>
                            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {myActiveProjects.length} In Progress
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Loading active projects...</div>
                    ) : myActiveProjects.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <div className="text-3xl mb-2">🚀</div>
                            <p className="text-gray-600 font-medium text-sm">No active projects right now</p>
                            <p className="text-gray-400 text-xs mt-1">
                                Apply to available projects below to start earning!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myActiveProjects.map((project) => (
                                <div
                                    key={project._id}
                                    className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-gray-900 text-lg">
                                                    {project.title}
                                                </h3>
                                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                                                    <span>⚡</span> In Progress
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {project.description}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                                                <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200 font-medium">
                                                    👤 Client: {project.client?.firstName} {project.client?.lastName || 'Client'}
                                                </span>
                                                <span className="bg-emerald-100/70 text-emerald-800 px-2.5 py-1 rounded-md font-semibold">
                                                    🔒 Escrow: ₹{project.escrowAmount || project.budgetMax} Locked
                                                </span>
                                                {project.deadline && (
                                                    <span className="text-gray-500">
                                                        📅 Deadline: {new Date(project.deadline).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <a
                                            href={`/projects/${project._id}`}
                                            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 whitespace-nowrap shadow-sm"
                                        >
                                            View Workspace →
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* SECTION 2: Available Projects (Open to bid) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Available Projects to Bid
                        </h2>
                        <a
                            href="/browse-projects"
                            className="text-sm text-indigo-600 hover:underline font-medium"
                        >
                            View all →
                        </a>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading available projects...</div>
                    ) : availableProjects.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            No projects available right now
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {availableProjects.slice(0, 5).map((project) => (
                                <div
                                    key={project._id}
                                    className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 mb-1">
                                                {project.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                                                {project.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {project.skillsRequired?.slice(0, 3).map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {`₹${project.budgetMin} - ₹${project.budgetMax} · ${project.totalBids} bids`}
                                            </p>
                                        </div>
                                        <a
                                            href={`/projects/${project._id}`}
                                            className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 whitespace-nowrap"
                                        >
                                            View &amp; Bid
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

            </div>
        </div>
    )
}

export default FreelancerDashboard
