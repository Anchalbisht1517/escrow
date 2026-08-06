function Hero() {
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white px-6 py-20">
            <div className="max-w-6xl mx-auto flex items-center gap-12">

                {/* Left side - text content */}
                <div className="flex-1">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                        🛡️ Trusted Escrow Payments
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
                        Hire Top Freelancers. <br />
                        <span className="text-indigo-600">Pay Only When</span> <br />
                        You're Satisfied.
                    </h1>

                    {/* Subtext */}
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        Post your project, receive competitive bids from verified
                        freelancers, and pay securely through our escrow system.
                        Your money is protected until the job is done.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex gap-4 mb-8">
                        <a
                            href="/post-project"
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                        >
                            Post a Project →
                        </a>
                        <a
                            href="/register"
                            className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50"
                        >
                            Find Work as Freelancer
                        </a>
                    </div>

                    {/* Trust indicators */}
                    <div className="flex gap-6 text-sm text-gray-500">
                        <span>✓ No upfront fees</span>
                        <span>✓ Secure escrow</span>
                        <span>✓ Verified freelancers</span>
                    </div>

                </div>

                {/* Right side - mock card */}
                <div className="flex-1 hidden lg:block">
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">

                        {/* Project card mock */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-800">Build a Node.js REST API</h3>
                                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                                    Open
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mb-3">
                                Need an experienced backend developer...
                            </p>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">₹2,000 - ₹4,000</span>
                                <span className="text-gray-500">3 bids received</span>
                            </div>
                        </div>

                        {/* Freelancer bid card mock */}
                        <div className="border border-gray-100 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    PS
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">Priya Sharma</p>
                                    <p className="text-gray-500 text-xs">⭐ 4.9 · 23 reviews</p>
                                </div>
                                <span className="ml-auto font-semibold text-gray-800">₹3,200</span>
                            </div>
                        </div>

                        {/* Escrow badge */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                            <span className="text-emerald-600">🔒</span>
                            <span className="text-emerald-700 text-sm font-medium">
                                Escrow: ₹3,200 locked safely
                            </span>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default Hero