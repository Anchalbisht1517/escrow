import { useAuth } from '../context/AuthContext'

function Navbar() {
    const { user, loading, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        window.location.href = '/'
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
                    // Show nothing while checking auth
                    <div className="w-20 h-9 bg-gray-100 rounded-lg animate-pulse" />
                ) : user ? (
                    // Logged in — show user info and logout
                    <div className="flex items-center gap-4">
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
                    // Not logged in — show login/signup
                    <>
                        <a
                            href="/login"
                            className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                        >
                            Log In
                        </a>
                        <a
                            href="/register"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Sign Up
                        </a>
                    </>
                )}
            </div>

        </nav>
    )
}

export default Navbar