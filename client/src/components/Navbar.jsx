import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/axiosInstance'

function Navbar() {
    const { user, loading, logout } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)

    const handleLogout = async () => {
        await logout()
        window.location.href = '/'
    }

    // Fetch notifications when logged in
    useEffect(() => {
        if (!user) return
        const fetchNotifications = async () => {
            try {
                const res = await API.get('/api/notifications')
                setNotifications(res.data.data.notifications || [])
                setUnreadCount(res.data.data.unreadCount || 0)
            } catch {
                // silently fail — don't break the navbar
            }
        }
        fetchNotifications()
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [user])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkAllRead = async () => {
        try {
            await API.patch('/api/notifications/read-all')
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch {
            // silent
        }
    }

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            try {
                await API.patch(`/api/notifications/${notification._id}/read`)
                setNotifications((prev) =>
                    prev.map((n) => n._id === notification._id ? { ...n, read: true } : n)
                )
                setUnreadCount((c) => Math.max(0, c - 1))
            } catch { /* silent */ }
        }
        if (notification.project?._id) {
            const path = user?.role === 'client'
                ? `/client/projects/${notification.project._id}`
                : `/projects/${notification.project._id}`
            window.location.href = path
        }
        setShowDropdown(false)
    }

    const notificationIcon = (type) => {
        const icons = {
            bid_placed: '💼',
            bid_accepted: '🎉',
            bid_rejected: '❌',
            work_submitted: '📤',
            revision_requested: '🔄',
            payment_released: '💰',
            project_cancelled: '🚫',
        }
        return icons[type] || '🔔'
    }

    const timeAgo = (date) => {
        const mins = Math.floor((Date.now() - new Date(date)) / 60000)
        if (mins < 1) return 'just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        return `${Math.floor(hrs / 24)}d ago`
    }

    return (
        <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">

            {/* Logo */}
            <a href="/" className="text-2xl font-bold text-indigo-600">
                Allie
            </a>

            {/* Nav Links */}
            <div className="flex gap-6 text-gray-600 font-medium">
                <a href="/browse-projects" className="hover:text-indigo-600">Find Work</a>
                <a href="/browse-projects" className="hover:text-indigo-600">Find Talent</a>
                <a href="#how-it-works" className="hover:text-indigo-600">How It Works</a>
            </div>

            {/* Auth section */}
            <div className="flex gap-3 items-center">
                {loading ? (
                    <div className="w-20 h-9 bg-gray-100 rounded-lg animate-pulse" />
                ) : user ? (
                    <div className="flex items-center gap-4">
                        {/* Quick nav links */}
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                            <a
                                href={user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'}
                                className="hover:text-indigo-600 transition-colors"
                            >
                                Dashboard
                            </a>
                            <a href="/wallet" className="hover:text-indigo-600 transition-colors">
                                💰 Wallet
                            </a>
                        </div>

                        {/* Notification Bell */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                id="notification-bell"
                                onClick={() => setShowDropdown((v) => !v)}
                                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                                title="Notifications"
                            >
                                <span className="text-xl">🔔</span>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                        <span className="font-bold text-gray-800 text-sm">Notifications</span>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400 text-sm">
                                                No notifications yet
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <button
                                                    key={n._id}
                                                    onClick={() => handleNotificationClick(n)}
                                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.read ? 'bg-indigo-50/60' : ''}`}
                                                >
                                                    <div className="flex gap-3 items-start">
                                                        <span className="text-lg mt-0.5 flex-shrink-0">
                                                            {notificationIcon(n.type)}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                                {n.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {timeAgo(n.createdAt)}
                                                            </p>
                                                        </div>
                                                        {!n.read && (
                                                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-800">{user.firstName}</p>
                            <p className="text-xs text-indigo-600 capitalize">{user.role}</p>
                        </div>
                        <a href="/profile/edit">
                            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-indigo-400 hover:ring-offset-1 transition-all cursor-pointer" title="Edit Profile">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                        </a>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <a href="/login" className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
                            Log In
                        </a>
                        <a href="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Sign Up
                        </a>
                    </>
                )}
            </div>

        </nav>
    )
}

export default Navbar
