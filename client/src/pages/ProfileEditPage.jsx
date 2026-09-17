import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/axiosInstance'
import Navbar from '../components/Navbar'

function ProfileEditPage() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Freelancer fields
  const [bio, setBio] = useState(user?.bio || '')
  const [skills, setSkills] = useState(
    user?.freelancerInfo?.skills?.join(', ') || ''
  )
  const [hourlyRate, setHourlyRate] = useState(
    user?.freelancerInfo?.hourlyRate || ''
  )
  const [experience, setExperience] = useState(
    user?.freelancerInfo?.experience || ''
  )
  const [portfolioLinks, setPortfolioLinks] = useState(
    user?.freelancerInfo?.portfolioLinks?.join(', ') || ''
  )

  // Client fields
  const [companyName, setCompanyName] = useState(
    user?.clientInfo?.companyName || ''
  )
  const [companyDesc, setCompanyDesc] = useState(
    user?.clientInfo?.companyDesc || ''
  )

  // Shared fields
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [address, setAddress] = useState(user?.address || '')
  const [city, setCity] = useState(user?.city || '')
  const [phoneNo, setPhoneNo] = useState(user?.phoneNo || '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const endpoint =
        user?.role === 'freelancer'
          ? '/api/auth/freelancer/profile'
          : '/api/auth/client/profile'

      const body =
        user?.role === 'freelancer'
          ? {
              firstName,
              lastName,
              bio,
              skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
              hourlyRate: Number(hourlyRate),
              experience,
              portfolioLinks: portfolioLinks
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
              address,
              city,
              phoneNo,
            }
          : {
              firstName,
              lastName,
              companyName,
              companyDesc,
              address,
              city,
              phoneNo,
            }

      await API.put(endpoint, body)
      setMessage('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500 mt-1 capitalize">
            {user?.role} account — {user?.email}
          </p>
        </div>

        {/* Success message */}
        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {message}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
        >

          {/* Basic info — shared by both roles */}
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Basic Information
          </h2>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                placeholder="9876543210"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <hr className="mb-6" />

          {/* Freelancer specific fields */}
          {user?.role === 'freelancer' && (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Freelancer Profile
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell clients about yourself and your experience..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node.js, MongoDB (comma separated)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate skills with commas
                </p>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="1000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="3 years"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio Links
                </label>
                <input
                  type="text"
                  value={portfolioLinks}
                  onChange={(e) => setPortfolioLinks(e.target.value)}
                  placeholder="https://github.com/you, https://yoursite.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate links with commas
                </p>
              </div>
            </>
          )}

          {/* Client specific fields */}
          {user?.role === 'client' && (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Company Information
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="TechCorp India"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Description
                </label>
                <textarea
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
                  rows={3}
                  placeholder="Tell freelancers about your company..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default ProfileEditPage