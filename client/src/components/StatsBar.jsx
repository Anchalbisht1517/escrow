function StatsBar() {
    const stats = [
        { number: '500+', label: 'Projects Posted' },
        { number: '200+', label: 'Verified Freelancers' },
        { number: '₹50L+', label: 'Paid Securely' },
        { number: '98%', label: 'Satisfaction Rate' },
    ]

    return (
        <div className="bg-gray-50 border-y border-gray-200 py-10">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
                {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                        <p className="text-3xl font-bold text-indigo-600">{stat.number}</p>
                        <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default StatsBar