import { Link, useNavigate } from 'react-router-dom'

function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-indigo-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">

                {/* Big 404 */}
                <h1 className="text-9xl font-bold text-indigo-200 mb-4">404</h1>

                {/* Icon */}
                <div className="text-6xl mb-6">🔍</div>

                {/* Message */}
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    Page not found
                </h2>
                <p className="text-gray-500 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <Link
                        to="/"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Go Home
                    </Link>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                    >
                        Go Back
                    </button>
                </div>

                {/* Allie branding */}
                <p className="text-gray-400 text-sm mt-10">
                    <Link to="/" className="text-indigo-600 font-semibold hover:underline">
                        Allie
                    </Link>
                    {' '}— Secure Freelance Marketplace
                </p>

            </div>
        </div>
    )
}

export default NotFoundPage
