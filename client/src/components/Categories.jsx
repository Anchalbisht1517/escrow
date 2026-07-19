function Categories() {
    const categories = [
        { icon: '💻', name: 'Web Development', count: '120+ projects' },
        { icon: '📱', name: 'Mobile Apps', count: '80+ projects' },
        { icon: '🎨', name: 'UI/UX Design', count: '95+ projects' },
        { icon: '📊', name: 'Data Science', count: '60+ projects' },
        { icon: '✍️', name: 'Content Writing', count: '110+ projects' },
        { icon: '📈', name: 'Digital Marketing', count: '75+ projects' },
        { icon: '🔧', name: 'DevOps & Cloud', count: '50+ projects' },
        { icon: '🤖', name: 'AI & Machine Learning', count: '45+ projects' },
    ]

    return (
        <div className="py-20 px-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">

                {/* Section header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Browse by Category
                    </h2>
                    <p className="text-gray-500 text-lg">
                        Find the right talent for any type of project
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((cat, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-6 text-center cursor-pointer border border-transparent hover:border-indigo-400 hover:shadow-md transition-all"
                        >
                            <div className="text-4xl mb-3">{cat.icon}</div>
                            <h3 className="font-semibold text-gray-800 mb-1">{cat.name}</h3>
                            <p className="text-gray-400 text-sm">{cat.count}</p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default Categories