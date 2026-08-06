import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/Navbar'

const SKILL_OPTIONS = [
    'React', 'Node.js', 'Python', 'MongoDB', 'Express',
    'Vue', 'Angular', 'TypeScript', 'GraphQL', 'AWS',
    'Docker', 'Figma', 'UI/UX', 'WordPress', 'Laravel',
]

function BrowseProjectsPage() {
    const { user } = useAuth()

    // Filters
    const [search, setSearch] = useState('')
    const [selectedSkills, setSelectedSkills] = useState([])
    const [budgetMin, setBudgetMin] = useState('')
    const [budgetMax, setBudgetMax] = useState('')

    // Data
    const [projects, setProjects] = useState([])
    const [pagination, setPagination] = useState(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    // Debounced search input (applied state)
    const [appliedSearch, setAppliedSearch] = useState('')

    const fetchProjects = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (appliedSearch) params.set('search', appliedSearch)
            if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(','))
            if (budgetMin) params.set('budgetMin', budgetMin)
            if (budgetMax) params.set('budgetMax', budgetMax)
            params.set('page', page)
            params.set('limit', 10)

            const res = await axios.get(
                `http://localhost:5000/api/projects?${params.toString()}`,
                { withCredentials: true }
            )
            setProjects(res.data.data.projects)
            setPagination(res.data.data.pagination)
        } catch (err) {
            console.error('Browse projects error:', err)
        } finally {
            setLoading(false)
        }
    }, [appliedSearch, selectedSkills, budgetMin, budgetMax, page])

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        setPage(1)
        setAppliedSearch(search)
    }

    const toggleSkill = (skill) => {
        setPage(1)
        setSelectedSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        )
    }

    const handleBudgetApply = () => {
        setPage(1)
        fetchProjects()
    }

    const clearFilters = () => {
        setSearch('')
        setAppliedSearch('')
        setSelectedSkills([])
        setBudgetMin('')
        setBudgetMax('')
        setPage(1)
    }

    const hasFilters = appliedSearch || selectedSkills.length > 0 || budgetMin || budgetMax

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Page header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Browse Projects</h1>
                    <p className="text-gray-500">
                        {pagination
                            ? `${pagination.total} open project${pagination.total !== 1 ? 's' : ''} available`
                            : 'Finding projects for you...'}
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">

                {/* ── Sidebar filters ── */}
                <aside className="w-64 flex-shrink-0">

                    {/* Search */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
                        <h2 className="font-semibold text-gray-800 mb-3">Search</h2>
                        <form onSubmit={handleSearchSubmit}>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Keywords..."
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 pr-9"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700"
                                >
                                    🔍
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Budget range */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
                        <h2 className="font-semibold text-gray-800 mb-3">Budget (₹)</h2>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="number"
                                value={budgetMin}
                                onChange={(e) => setBudgetMin(e.target.value)}
                                placeholder="Min"
                                className="w-1/2 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            />
                            <input
                                type="number"
                                value={budgetMax}
                                onChange={(e) => setBudgetMax(e.target.value)}
                                placeholder="Max"
                                className="w-1/2 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <button
                            onClick={handleBudgetApply}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                        >
                            Apply
                        </button>
                    </div>

                    {/* Skills */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
                        <h2 className="font-semibold text-gray-800 mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {SKILL_OPTIONS.map((skill) => (
                                <button
                                    key={skill}
                                    onClick={() => toggleSkill(skill)}
                                    className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${selectedSkills.includes(skill)
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear filters */}
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="w-full text-sm text-red-500 hover:text-red-700 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            ✕ Clear all filters
                        </button>
                    )}
                </aside>

                {/* ── Project list ── */}
                <div className="flex-1 min-w-0">

                    {/* Active filter chips */}
                    {hasFilters && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {appliedSearch && (
                                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full border border-indigo-200">
                                    "{appliedSearch}"
                                    <button onClick={() => { setSearch(''); setAppliedSearch(''); setPage(1) }} className="ml-1 hover:text-indigo-900">✕</button>
                                </span>
                            )}
                            {selectedSkills.map((s) => (
                                <span key={s} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full border border-indigo-200">
                                    {s}
                                    <button onClick={() => toggleSkill(s)} className="ml-1 hover:text-indigo-900">✕</button>
                                </span>
                            ))}
                            {(budgetMin || budgetMax) && (
                                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full border border-indigo-200">
                                    ₹{budgetMin || '0'} – ₹{budgetMax || '∞'}
                                    <button onClick={() => { setBudgetMin(''); setBudgetMax(''); setPage(1) }} className="ml-1 hover:text-indigo-900">✕</button>
                                </span>
                            )}
                        </div>
                    )}

                    {loading ? (
                        /* Skeleton loader */
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                                    <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                                    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                                    <div className="h-4 bg-gray-100 rounded w-4/5 mb-4" />
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-gray-100 rounded-full w-16" />
                                        <div className="h-6 bg-gray-100 rounded-full w-20" />
                                        <div className="h-6 bg-gray-100 rounded-full w-14" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                            <div className="text-5xl mb-4">🔭</div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No projects found</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Try adjusting your filters or search terms
                            </p>
                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {projects.map((project) => (
                                <ProjectCard key={project._id} project={project} userRole={user?.role} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8">
                            <p className="text-sm text-gray-500">
                                Page {pagination.page} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={!pagination.hasPrevPage}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ← Previous
                                </button>
                                {/* Page number pills */}
                                {[...Array(pagination.totalPages)].map((_, i) => {
                                    const pg = i + 1
                                    if (
                                        pg === 1 ||
                                        pg === pagination.totalPages ||
                                        Math.abs(pg - pagination.page) <= 1
                                    ) {
                                        return (
                                            <button
                                                key={pg}
                                                onClick={() => setPage(pg)}
                                                className={`w-9 h-9 text-sm rounded-lg border font-medium ${pg === pagination.page
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pg}
                                            </button>
                                        )
                                    }
                                    if (Math.abs(pg - pagination.page) === 2) {
                                        return <span key={pg} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                                    }
                                    return null
                                })}
                                <button
                                    disabled={!pagination.hasNextPage}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ── Project Card ── */
function ProjectCard({ project, userRole }) {
    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        return `${days}d ago`
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">

                    {/* Title row */}
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                            {project.title}
                        </h3>
                        <span className="flex-shrink-0 text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium capitalize">
                            {project.status}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                        {project.description}
                    </p>

                    {/* Skill tags */}
                    {project.skillsRequired?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {project.skillsRequired.slice(0, 5).map((skill, i) => (
                                <span
                                    key={i}
                                    className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100"
                                >
                                    {skill}
                                </span>
                            ))}
                            {project.skillsRequired.length > 5 && (
                                <span className="text-xs px-3 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                                    +{project.skillsRequired.length - 5} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="font-semibold text-gray-800">
                            ₹{project.budgetMin.toLocaleString()} – ₹{project.budgetMax.toLocaleString()}
                        </span>
                        <span className="capitalize text-gray-400">{project.budgetType}</span>
                        <span>·</span>
                        <span>{project.totalBids} bid{project.totalBids !== 1 ? 's' : ''}</span>
                        {project.deadline && (
                            <>
                                <span>·</span>
                                <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                            </>
                        )}
                        <span>·</span>
                        <span>{timeAgo(project.createdAt)}</span>
                        {project.client && (
                            <>
                                <span>·</span>
                                <span>by {project.client.firstName} {project.client.lastName}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* CTA button */}
                <div className="flex-shrink-0">
                    {userRole === 'freelancer' ? (
                        <a
                            href={`/projects/${project._id}`}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap"
                        >
                            View & Bid
                        </a>
                    ) : (
                        <a
                            href={`/projects/${project._id}`}
                            className="px-5 py-2 border border-indigo-600 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors whitespace-nowrap"
                        >
                            View Project
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BrowseProjectsPage
