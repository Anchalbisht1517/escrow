import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/Navbar'

function FreelancerDashboard() {
    const { user } = useAuth()
    const [wallet, setWallet] = useState(null)
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletRes, projectsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/users/wallet', {
                        withCredentials: true,
                    }),
                    axios.get('http://localhost:5000/api/projects', {
                        withCredentials: true,
                    }),
                ])
                setWallet(walletRes.data.data)
                setProjects(projectsRes.data.data.projects)
            } catch (err) {
                console.error('Dashboard fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 py-10">

                {/* Welcome header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.firstName} 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Find projects and grow your freelance career
                    </p>
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

                    {/* Completed projects */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Completed Projects</p>
                        <p className="text-3xl font-bold text-emerald-600">
                            {user?.completedProjectsCount ?? 0}
                        </p>
                    </div>

                    {/* Rating */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Your Rating</p>
                        <p className="text-3xl font-bold text-yellow-500">
                            {user?.avgRating ? `⭐ ${user.avgRating}` : 'No ratings yet'}
                        </p>
                    </div>

                </div>

                {/* Available projects */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Available Projects
                        </h2>
                        <a
                            href="/browse-projects"
                            className="text-sm text-indigo-600 hover:underline font-medium"
                        >
                            View all →
                        </a>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading...</div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            No projects available right now
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {projects.slice(0, 5).map((project) => (
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
                                            View and Bid
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
