function CTASection() {
    return (
        <div className="bg-indigo-600 py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-white mb-4">
                    Ready to Get Started?
                </h2>
                <p className="text-indigo-200 text-lg mb-10">
                    Join hundreds of clients and freelancers already using Allie
                </p>
                <div className="flex gap-4 justify-center">
                    <button className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50">
                        Post a Project
                    </button>
                    <button className="px-8 py-3 border border-white text-white rounded-lg font-semibold hover:bg-indigo-700">
                        Find Work
                    </button>
                </div>
                <p className="text-indigo-300 text-sm mt-6">
                    Free to join. No monthly fees.
                </p>
            </div>
        </div>
    )
}

export default CTASection