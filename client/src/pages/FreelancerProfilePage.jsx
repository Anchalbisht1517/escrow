import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

function FreelancerProfilePage() {
    const { id } = useParams()

    const [profile, setProfile] = useState(null)   // { user, completedProjectsCount, abandonedProjectsCount, completionRate }
    const [reviews, setReviews] = useState([])
    const [avgRating, setAvgRating] = useState(null)
    const [totalReviews, setTotalReviews] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [profileRes, reviewsRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/users/${id}/profile`),
                    axios.get(`http://localhost:5000/api/users/${id}/reviews`),
                ])
                setProfile(profileRes.data.data)
                setReviews(reviewsRes.data.data.reviews ?? [])
                setAvgRating(reviewsRes.data.data.avgRating)
                setTotalReviews(reviewsRes.data.data.totalReviews ?? 0)
            } catch (err) {
                setError(err.response?.data?.message || 'User not found')
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <ProfileSkeleton />
                </div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Profile not found</h2>
                    <p className="text-gray-400 text-sm mb-6">{error}</p>
                    <a href="/browse-projects" className="text-indigo-600 hover:underline text-sm">
                        ← Browse Projects
                    </a>
                </div>
            </div>
        )
    }

    const { user, completedProjectsCount, abandonedProjectsCount, completionRate } = profile
    const isFreelancer = user.role === 'freelancer'
    const skills = user.freelancerInfo?.skills ?? []
    const portfolioLinks = user.freelancerInfo?.portfolioLinks ?? []
    const bio = user.freelancerInfo?.bio || user.bio || ''

    const starDisplay = (rating) => {
        const full = Math.floor(rating)
        const half = rating % 1 >= 0.5
        return (
            <span className="text-yellow-400">
                {'★'.repeat(full)}
                {half ? '½' : ''}
                <span className="text-gray-200">{'★'.repeat(5 - full - (half ? 1 : 0))}</span>
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-10">

                {/* Back link */}
                <a
                    href="/browse-projects"
                    className="text-sm text-indigo-600 hover:underline inline-block mb-6"
                >
                    ← Back to Browse
                </a>

                {/* ── Hero card ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                    <div className="flex items-start gap-6">

                        {/* Avatar */}
                        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-md">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>

                        {/* Name + meta */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </h1>
                                    <p className="text-indigo-600 text-sm font-medium capitalize mt-0.5">
                                        {user.role}
                                        {user.city && ` · ${user.city}`}
                                    </p>
                                </div>

                                {/* Rating badge */}
                                {avgRating && (
                                    <div className="flex-shrink-0 text-right">
                                        <div className="text-2xl font-bold text-gray-800">
                                            {avgRating.toFixed(1)}
                                        </div>
                                        <div className="text-sm">{starDisplay(avgRating)}</div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Bio */}
                            {bio && (
                                <p className="text-gray-600 text-sm leading-relaxed mt-4 max-w-2xl">
                                    {bio}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left column: Stats + Skills + Contact ── */}
                    <div className="lg:col-span-1 space-y-5">

                        {/* Stats */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                                Stats
                            </h2>
                            <div className="space-y-3">
                                <StatRow
                                    icon="✅"
                                    label="Completed"
                                    value={`${completedProjectsCount} project${completedProjectsCount !== 1 ? 's' : ''}`}
                                    valueClass="text-emerald-600 font-semibold"
                                />
                                {completionRate !== null && (
                                    <StatRow
                                        icon="📈"
                                        label="Completion Rate"
                                        value={`${completionRate}%`}
                                        valueClass={completionRate >= 80 ? 'text-emerald-600 font-semibold' : 'text-orange-500 font-semibold'}
                                    />
                                )}
                                {abandonedProjectsCount > 0 && (
                                    <StatRow
                                        icon="⚠️"
                                        label="Abandoned"
                                        value={`${abandonedProjectsCount}`}
                                        valueClass="text-orange-500 font-semibold"
                                    />
                                )}
                                {isFreelancer && user.freelancerInfo?.hourlyRate && (
                                    <StatRow
                                        icon="💰"
                                        label="Hourly Rate"
                                        value={`₹${user.freelancerInfo.hourlyRate}/hr`}
                                        valueClass="text-indigo-600 font-semibold"
                                    />
                                )}
                                {totalReviews > 0 && (
                                    <StatRow
                                        icon="⭐"
                                        label="Avg Rating"
                                        value={`${(avgRating ?? 0).toFixed(1)} / 5`}
                                        valueClass="text-yellow-500 font-semibold"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Skills */}
                        {skills.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        {user.freelancerInfo?.experience && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                    Experience
                                </h2>
                                <p className="text-sm text-gray-600">{user.freelancerInfo.experience}</p>
                            </div>
                        )}

                        {/* Portfolio links */}
                        {portfolioLinks.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    Portfolio
                                </h2>
                                <ul className="space-y-2">
                                    {portfolioLinks.map((link, i) => (
                                        <li key={i}>
                                            <a
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-indigo-600 hover:underline break-all flex items-center gap-1"
                                            >
                                                <span>🔗</span>
                                                <span className="truncate">{link.replace(/^https?:\/\//, '')}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* ── Right column: Reviews ── */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                            {/* Reviews header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-800">
                                    Reviews {totalReviews > 0 && <span className="text-gray-400 font-normal text-base">({totalReviews})</span>}
                                </h2>
                                {avgRating && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-gray-800">{avgRating.toFixed(1)}</span>
                                        <div>
                                            <div className="text-base">{starDisplay(avgRating)}</div>
                                            <p className="text-xs text-gray-400">avg rating</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {reviews.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-3">💬</div>
                                    <p className="text-gray-500 text-sm">No reviews yet</p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        Reviews appear here after completed projects
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {reviews.map((review, i) => (
                                        <ReviewCard key={i} review={review} starDisplay={starDisplay} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

/* ── Sub-components ──────────────────────────────────────────────── */

function StatRow({ icon, label, value, valueClass }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 flex items-center gap-1.5">
                <span>{icon}</span> {label}
            </span>
            <span className={valueClass ?? 'text-gray-800 font-medium'}>{value}</span>
        </div>
    )
}

function ReviewCard({ review, starDisplay }) {
    const reviewer = review.fromUser
    const initials = reviewer
        ? `${reviewer.firstName?.[0] ?? ''}${reviewer.lastName?.[0] ?? ''}`
        : '?'
    const name = reviewer
        ? `${reviewer.firstName ?? ''} ${reviewer.lastName ?? ''}`.trim()
        : 'Anonymous'

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const days = Math.floor(diff / 86400000)
        if (days === 0) return 'today'
        if (days === 1) return 'yesterday'
        if (days < 30) return `${days}d ago`
        const months = Math.floor(days / 30)
        return `${months}mo ago`
    }

    return (
        <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
                {/* Reviewer avatar */}
                <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-gray-800 text-sm">{name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                            {review.createdAt ? timeAgo(review.createdAt) : ''}
                        </span>
                    </div>
                    <div className="mb-2 text-sm">{starDisplay(review.rating)}</div>
                    {review.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

function ProfileSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-2xl p-8">
                <div className="flex gap-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-2xl" />
                    <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-48 mb-3" />
                        <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
                        <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-5 h-40 flex flex-col gap-3 justify-center">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}
                    </div>
                    <div className="bg-white rounded-2xl p-5 h-24" />
                </div>
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 h-64" />
            </div>
        </div>
    )
}

export default FreelancerProfilePage
