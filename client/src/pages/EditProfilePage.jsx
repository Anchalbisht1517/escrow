import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/Navbar'

// ── Shared input component ──────────────────────────────────────────
function Field({ label, hint, children }) {
    return (
        <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
            {children}
        </div>
    )
}

const inputCls =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors'

// ── Main page ───────────────────────────────────────────────────────
function EditProfilePage() {
    const { user, refreshUser } = useAuth()
    const isFreelancer = user?.role === 'freelancer'

    // ── Shared state ──
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        zipCode: '',
        phoneNo: '',
        // client-only
        companyName: '',
        companyDesc: '',
        // freelancer-only
        bio: '',
        hourlyRate: '',
        experience: '',
        skills: '',          // comma-separated string in UI, sent as array
        portfolioLinks: '',  // comma-separated string in UI, sent as array
    })

    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null) // { type: 'success'|'error', text }

    // Pre-fill form from current user object once available
    useEffect(() => {
        if (!user) return
        setForm({
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            address: user.address ?? '',
            city: user.city ?? '',
            zipCode: user.zipCode ?? '',
            phoneNo: user.phoneNo ?? '',
            // client-only
            companyName: user.clientInfo?.companyName ?? '',
            companyDesc: user.clientInfo?.companyDesc ?? '',
            // freelancer-only
            bio: user.freelancerInfo?.bio ?? user.bio ?? '',
            hourlyRate: user.freelancerInfo?.hourlyRate ?? '',
            experience: user.freelancerInfo?.experience ?? '',
            skills: (user.freelancerInfo?.skills ?? []).join(', '),
            portfolioLinks: (user.freelancerInfo?.portfolioLinks ?? []).join(', '),
        })
    }, [user])

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        const endpoint = isFreelancer
            ? 'http://localhost:5000/api/auth/freelancer/profile'
            : 'http://localhost:5000/api/auth/client/profile'

        try {
            const payload = isFreelancer
                ? {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    address: form.address,
                    city: form.city,
                    zipCode: form.zipCode,
                    phoneNo: form.phoneNo,
                    bio: form.bio,
                    hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
                    experience: form.experience,
                    skills: form.skills
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    portfolioLinks: form.portfolioLinks
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                }
                : {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    address: form.address,
                    city: form.city,
                    zipCode: form.zipCode,
                    phoneNo: form.phoneNo,
                    companyName: form.companyName,
                    companyDesc: form.companyDesc,
                }

            await axios.put(endpoint, payload, { withCredentials: true })
            await refreshUser()
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to save changes',
            })
        } finally {
            setSaving(false)
            // Auto-clear message after 4s
            setTimeout(() => setMessage(null), 4000)
        }
    }

    const dashboardHref =
        user?.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <a
                            href={dashboardHref}
                            className="text-sm text-indigo-600 hover:underline inline-block mb-2"
                        >
                            ← Back to Dashboard
                        </a>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                        <p className="text-gray-500 mt-1 capitalize">{user?.role} account</p>
                    </div>

                    {/* Avatar preview */}
                    <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                </div>

                {/* Toast message */}
                {message && (
                    <div
                        className={`px-4 py-3 rounded-xl mb-6 text-sm font-medium border ${message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                            }`}
                    >
                        {message.type === 'success' ? '✓ ' : '✕ '}{message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* ── Section: Personal Info ── */}
                    <Section title="Personal Information">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <Field label="First Name">
                                <input
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    required
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Last Name">
                                <input
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    required
                                    className={inputCls}
                                />
                            </Field>
                        </div>

                        <Field label="Phone Number">
                            <input
                                type="tel"
                                name="phoneNo"
                                value={form.phoneNo}
                                onChange={handleChange}
                                placeholder="+91 98765 43210"
                                className={inputCls}
                            />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
                            <Field label="City">
                                <input
                                    type="text"
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    placeholder="Mumbai"
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Zip Code">
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={form.zipCode}
                                    onChange={handleChange}
                                    placeholder="400001"
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Address">
                                <input
                                    type="text"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Street, Area"
                                    className={inputCls}
                                />
                            </Field>
                        </div>
                    </Section>

                    {/* ── Section: Client fields ── */}
                    {!isFreelancer && (
                        <Section title="Company Details">
                            <Field label="Company Name">
                                <input
                                    type="text"
                                    name="companyName"
                                    value={form.companyName}
                                    onChange={handleChange}
                                    placeholder="Acme Corp"
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Company Description">
                                <textarea
                                    name="companyDesc"
                                    value={form.companyDesc}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Brief description of your company or what you do..."
                                    className={`${inputCls} resize-none`}
                                />
                            </Field>
                        </Section>
                    )}

                    {/* ── Section: Freelancer fields ── */}
                    {isFreelancer && (
                        <Section title="Freelancer Details">
                            <Field label="Bio" hint="Tell clients about yourself and your expertise">
                                <textarea
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="I'm a full-stack developer with 5 years of experience..."
                                    className={`${inputCls} resize-none`}
                                />
                            </Field>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                <Field label="Hourly Rate (₹/hr)">
                                    <input
                                        type="number"
                                        name="hourlyRate"
                                        value={form.hourlyRate}
                                        onChange={handleChange}
                                        placeholder="500"
                                        min="0"
                                        className={inputCls}
                                    />
                                </Field>
                                <Field label="Experience">
                                    <input
                                        type="text"
                                        name="experience"
                                        value={form.experience}
                                        onChange={handleChange}
                                        placeholder="5 years in web development"
                                        className={inputCls}
                                    />
                                </Field>
                            </div>

                            <Field
                                label="Skills"
                                hint="Comma-separated — e.g. React, Node.js, MongoDB"
                            >
                                <input
                                    type="text"
                                    name="skills"
                                    value={form.skills}
                                    onChange={handleChange}
                                    placeholder="React, Node.js, MongoDB"
                                    className={inputCls}
                                />
                                {/* Live skill preview */}
                                {form.skills && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {form.skills
                                            .split(',')
                                            .map((s) => s.trim())
                                            .filter(Boolean)
                                            .map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                    </div>
                                )}
                            </Field>

                            <Field
                                label="Portfolio Links"
                                hint="Comma-separated URLs to your work"
                            >
                                <input
                                    type="text"
                                    name="portfolioLinks"
                                    value={form.portfolioLinks}
                                    onChange={handleChange}
                                    placeholder="https://github.com/you, https://yoursite.com"
                                    className={inputCls}
                                />
                            </Field>
                        </Section>
                    )}

                    {/* ── Save button ── */}
                    <div className="flex gap-4 mt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <a
                            href={dashboardHref}
                            className="px-8 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </a>
                    </div>

                </form>
            </div>
        </div>
    )
}

// ── Section wrapper ─────────────────────────────────────────────────
function Section({ title, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">
                {title}
            </h2>
            {children}
        </div>
    )
}

export default EditProfilePage
