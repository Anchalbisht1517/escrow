import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import StatsBar from '../components/StatsBar'
import HowItWorks from '../components/HowItWorks'
import Categories from '../components/Categories'
import FeaturedFreelancers from '../components/FeaturedFreelancers'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

function LandingPage() {
    return (
        <div>
            <Navbar />
            <Hero />
            <StatsBar />
            <HowItWorks />
            <Categories />
            <FeaturedFreelancers />

            <CTASection />
            <Footer />
        </div>
    )
}

export default LandingPage