function Footer() {
    return (
        <footer className="bg-[#1E1B4B] text-gray-400 py-16 px-6">
            <div className="max-w-6xl mx-auto">

                {/* Top section */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">

                    {/* Logo and tagline */}
                    <div className="col-span-2 md:col-span-1">
                        <h2 className="text-white text-2xl font-bold mb-2">Allie</h2>
                        <p className="text-sm leading-relaxed">
                            Hire trusted freelancers with secure escrow payments.
                        </p>
                    </div>

                    {/* Company links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">About</a></li>
                            <li><a href="#" className="hover:text-white">Blog</a></li>
                            <li><a href="#" className="hover:text-white">Careers</a></li>
                            <li><a href="#" className="hover:text-white">Press</a></li>
                        </ul>
                    </div>

                    {/* For Clients */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">For Clients</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">How to hire</a></li>
                            <li><a href="#" className="hover:text-white">Post a project</a></li>
                            <li><a href="#" className="hover:text-white">Enterprise</a></li>
                        </ul>
                    </div>

                    {/* For Freelancers */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">For Freelancers</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Find work</a></li>
                            <li><a href="#" className="hover:text-white">Create profile</a></li>
                            <li><a href="#" className="hover:text-white">Resources</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Help center</a></li>
                            <li><a href="#" className="hover:text-white">Contact</a></li>
                            <li><a href="#" className="hover:text-white">Privacy</a></li>
                            <li><a href="#" className="hover:text-white">Terms</a></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm">© 2026 Allie. All rights reserved.</p>
                    <div className="flex gap-4 text-sm">
                        <a href="#" className="hover:text-white">Twitter</a>
                        <a href="#" className="hover:text-white">LinkedIn</a>
                        <a href="#" className="hover:text-white">Instagram</a>
                    </div>
                </div>

            </div>
        </footer>
    )
}

export default Footer