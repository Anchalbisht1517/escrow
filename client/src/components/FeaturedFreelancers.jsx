function FeaturedFreelancers() {
  const freelancers = [
    {
      initials: 'PS',
      name: 'Priya Sharma',
      title: 'Full Stack Developer',
      skills: ['React', 'Node.js', 'MongoDB'],
      rating: 4.9,
      reviews: 23,
      rate: '₹1,200/hr',
      completion: '97%',
    },
    {
      initials: 'RG',
      name: 'Rahul Gupta',
      title: 'UI/UX Designer',
      skills: ['Figma', 'Tailwind', 'React'],
      rating: 4.8,
      reviews: 18,
      rate: '₹900/hr',
      completion: '95%',
    },
    {
      initials: 'AV',
      name: 'Ankit Verma',
      title: 'Data Scientist',
      skills: ['Python', 'TensorFlow', 'SQL'],
      rating: 5.0,
      reviews: 31,
      rate: '₹1,500/hr',
      completion: '100%',
    },
    {
      initials: 'NS',
      name: 'Neha Singh',
      title: 'Content Strategist',
      skills: ['SEO', 'Copywriting', 'WordPress'],
      rating: 4.7,
      reviews: 15,
      rate: '₹600/hr',
      completion: '93%',
    },
  ]

  return (
    <div className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Top Freelancers on Allie
          </h2>
          <p className="text-gray-500 text-lg">
            Verified professionals ready to work
          </p>
        </div>

        {/* Freelancer cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {freelancers.map((f, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              {/* Avatar */}
              <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                {f.initials}
              </div>

              {/* Name and title */}
              <h3 className="font-bold text-gray-800 mb-1">{f.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{f.title}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {f.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <span className="text-yellow-400">⭐</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {f.rating}
                </span>
                <span className="text-gray-400 text-sm">
                  ({f.reviews} reviews)
                </span>
              </div>

              {/* Rate and completion */}
              <div className="flex justify-between text-sm mb-4">
                <span className="font-semibold text-gray-700">{f.rate}</span>
                <span className="text-emerald-600 font-medium">
                  {f.completion} completion
                </span>
              </div>

              {/* Button */}
              <button className="w-full py-2 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
                View Profile
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default FeaturedFreelancers