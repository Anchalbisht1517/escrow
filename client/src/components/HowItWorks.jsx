function HowItWorks() {
    const steps = [
        {
            icon: '📋',
            step: '01',
            title: 'Post Your Project',
            description:
                'Describe what you need, set your budget, and list required skills. Takes less than 5 minutes.',
        },
        {
            icon: '🤝',
            step: '02',
            title: 'Review Bids & Hire',
            description:
                'Receive proposals from verified freelancers. Review profiles, ratings, and completion rates. Hire with one click.',
        },
        {
            icon: '🔒',
            step: '03',
            title: 'Pay Securely via Escrow',
            description:
                'Funds are locked in escrow when you hire. Released to the freelancer only when you approve the completed work.',
        },
    ]

    return (
        <div className="py-20 px-6 bg-white">
            <div className="max-w-6xl mx-auto">

                {/* Section header */}
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        How Allie Works
                    </h2>
                    <p className="text-gray-500 text-lg">
                        Get your project done in 3 simple steps
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="relative bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
                        >
                            {/* Step number */}
                            <div className="text-5xl mb-4">{step.icon}</div>
                            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
                                Step {step.step}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                {step.title}
                            </h3>
                            <p className="text-gray-500 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom note */}
                <p className="text-center text-gray-400 text-sm mt-10">
                    Something go wrong? Cancel anytime for a full refund — as long as work hasn't been approved.
                </p>

            </div>
        </div>
    )
}

export default HowItWorks