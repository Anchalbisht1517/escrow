import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/Navbar'

function ClientDashboard() {
    const { user } = useAuth()
    const [projects, setProjects] = useState([])
    const [wallet, setWallet] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, walletRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/projects', {
                        withCredentials: true,
                    }),
                    axios.get('http://localhost:5000/api/users/wallet', {
                        withCredentials: true,
                    }),
                ])
                setProjects(projectsRes.data.data.projects)
                setWallet(walletRes.data.data)
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
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.firstName} 👋
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Here's what's happening with your projects
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
                            ₹{wallet?.walletBalance ?? '...'}
                        </p>
                        <a
                            href="/wallet"
                            className="text-xs text-indigo-500 hover:underline mt-2 inline-block"
                        >
                            Top up wallet →
                        </a>
                    </div>

                    {/* Total projects */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Total Projects</p>
                        <p className="text-3xl font-bold text-gray-800">
                            {loading ? '...' : projects.length}
                        </p>
                    </div>

                    {/* Active projects */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Active Projects</p>
                        <p className="text-3xl font-bold text-emerald-600">
                            {loading ? '...' : projects.filter(p => p.status === 'in-progress').length}
                        </p>
                    </div>

                </div>

                {/* Projects section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">My Projects</h2>
                        <a
                            href="/post-project"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                        >
                            + Post a Project
                        </a>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading...</div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400 mb-4">No projects yet</p>
                            <a
                                href="/post-project"
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                            >
                                Post your first project
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {projects.map((project) => (
                                <a
                                    key={project._id}
                                    href={`/client/projects/${project._id}`}
                                    className="block border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-1">
                                                {project.title}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                ₹{project.budgetMin} - ₹{project.budgetMax} · {project.totalBids} bids
                                            </p>
                                        </div>
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
                                </a>
                            ))}
                        </div>
                    )}

                </div>

            </div>
        </div>
    )
}

export default ClientDashboard