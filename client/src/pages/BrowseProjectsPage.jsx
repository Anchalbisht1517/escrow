import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

function BrowseProjectsPage() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [skillFilter, setSkillFilter] = useState('')
    const [budgetMin, setBudgetMin] = useState('')
    const [budgetMax, setBudgetMax] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const fetchProjects = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (skillFilter) params.append('skills', skillFilter)
            if (budgetMin) params.append('budgetMin', budgetMin)
            if (budgetMax) params.append('budgetMax', budgetMax)
            params.append('page', page)
            params.append('limit', 10)

            const res = await axios.get(
                `http://localhost:5000/api/projects?${params.toString()}`,
                { withCredentials: true }
            )
            setProjects(res.data.data.projects)
            setTotalPages(res.data.data.totalPages || 1)
        } catch (err) {
            console.error('Browse projects error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [page])

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchProjects()
    }

    const handleClear = () => {
        setSearch('')
        setSkillFilter('')
        setBudgetMin('')
        setBudgetMax('')
        setPage(1)
        fetchProjects()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Browse Projects
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Find the perfect project that matches your skills
                    </p>
                </div>

                {/* Search and filters */}
                <form
                    onSubmit={handleSearch}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by keyword..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Skills filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Skills
                            </label>
                            <input
                                type="text"
                                value={skillFilter}
                                onChange={(e) => setSkillFilter(e.target.value)}
                                placeholder="e.g. React, Node.js"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Budget filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Budget Range (₹)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={budgetMin}
                                    onChange={(e) => setBudgetMin(e.target.value)}
                                    placeholder="Min"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                />
                                <input
                                    type="number"
                                    value={budgetMax}
                                    onChange={(e) => setBudgetMax(e.target.value)}
                                    placeholder="Max"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Filter buttons */}
                    <div className="flex gap-3 mt-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </form>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400">
                        Loading projects...
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🔍</div>
                        <p className="text-gray-500 text-lg">No projects found</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Try different keywords or clear filters
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-500 mb-4">
                            Showing {projects.length} projects
                        </p>

                        <div className="space-y-4">
                            {projects.map((project) => (
                                <div
                                    key={project._id}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">

                                            {/* Title and status */}
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-800">
                                                    {project.title}
                                                </h3>
                                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                                                    {project.status}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                                                {project.description}
                                            </p>

                                            {/* Skills */}
                                            {project.skillsRequired?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {project.skillsRequired.map((skill, i) => (
                                                        <span
                                                            key={i}
                                                            className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Meta info */}
                                            <div className="flex gap-6 text-sm text-gray-500">
                                                <span>
                                                    💰 ₹{project.budgetMin} - ₹{project.budgetMax}
                                                </span>
                                                <span>📋 {project.totalBids} bids</span>
                                                <span className="capitalize">
                                                    🕐 {project.budgetType}
                                                </span>
                                                {project.deadline && (
                                                    <span>
                                                        📅 {new Date(project.deadline).toLocaleDateString('en-IN')}
                                                    </span>
                                                )}
                                            </div>

                                        </div>

                                        {/* View and Bid button */}
                                        <a
                                            href={`/projects/${project._id}`}
                                            className="ml-6 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 whitespace-nowrap"
                                        >
                                            View &amp; Bid
                                        </a>

                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-3 mt-8">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    ← Previous
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-600">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    )
}

export default BrowseProjectsPage
