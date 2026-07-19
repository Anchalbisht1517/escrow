function Navbar() {
    return (
        <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">

            {/* Logo */}
            <div className="text-2xl font-bold text-indigo-600">
                Allie
            </div>

            {/* Nav Links */}
            <div className="flex gap-6 text-gray-600 font-medium">
                <a href="#" className="hover:text-indigo-600">Find Work</a>
                <a href="#" className="hover:text-indigo-600">Find Talent</a>
                <a href="#" className="hover:text-indigo-600">How It Works</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex gap-3">
                <button className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
                    Log In
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Sign Up
                </button>
            </div>

        </nav>
    )
}

export default Navbar