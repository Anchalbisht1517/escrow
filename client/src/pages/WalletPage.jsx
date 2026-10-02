import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/axiosInstance'
import Navbar from '../components/Navbar'

// ─── Determine icon + label + color for each transaction type ───
function getTxMeta(tx) {
    const desc = tx.description?.toLowerCase() || ''
    if (desc.includes('escrow locked') || desc.includes('escrow locked')) {
        return { icon: '🔒', label: 'Escrow Locked', color: 'text-orange-500' }
    }
    if (desc.includes('escrow') && desc.includes('released')) {
        return { icon: '✅', label: 'Escrow Released', color: 'text-emerald-600' }
    }
    if (desc.includes('top-up') || desc.includes('topup') || desc.includes('razorpay')) {
        return { icon: '💳', label: 'Top-up', color: 'text-indigo-600' }
    }
    if (desc.includes('withdrawal') || desc.includes('withdraw')) {
        return { icon: '🏦', label: 'Withdrawal', color: 'text-red-500' }
    }
    if (desc.includes('refund')) {
        return { icon: '↩️', label: 'Refund', color: 'text-blue-500' }
    }
    if (tx.type === 'credit') {
        return { icon: '💰', label: 'Credit', color: 'text-emerald-600' }
    }
    return { icon: '💸', label: 'Debit', color: 'text-red-500' }
}

function WalletPage() {
    const { user } = useAuth()
    const [wallet, setWallet] = useState(null)
    const [loading, setLoading] = useState(true)
    const [topupAmount, setTopupAmount] = useState('')
    const [topupLoading, setTopupLoading] = useState(false)
    const [topupMessage, setTopupMessage] = useState('')

    const fetchWallet = async () => {
        try {
            const res = await API.get('/api/users/wallet')
            setWallet(res.data.data)
        } catch (err) {
            console.error('Wallet fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWallet()
    }, [])

    const handleTopup = async (e) => {
        e.preventDefault()
        setTopupLoading(true)
        setTopupMessage('')
        try {
            await API.post('/api/users/wallet/topup', { amount: Number(topupAmount) })
            setTopupMessage(`₹${topupAmount} added successfully!`)
            setTopupAmount('')
            fetchWallet()
        } catch (err) {
            setTopupMessage(err.response?.data?.message || 'Top up failed')
        } finally {
            setTopupLoading(false)
        }
    }

    const lockedInEscrow = wallet?.lockedInEscrow ?? 0
    const escrowProjects = wallet?.escrowProjects ?? []
    const availableBalance = wallet?.walletBalance ?? 0
    const totalBalance = availableBalance + lockedInEscrow

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
                    <p className="text-gray-500 mt-1">Manage your balance and transactions</p>
                </div>

                {/* Balance cards row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

                    {/* Available balance */}
                    <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white">
                        <p className="text-indigo-200 text-sm mb-1">Available Balance</p>
                        <p className="text-5xl font-bold mb-2">
                            ₹{loading ? '...' : availableBalance.toLocaleString('en-IN')}
                        </p>
                        <p className="text-indigo-200 text-sm">
                            {user?.role === 'client'
                                ? 'Use this balance to hire freelancers'
                                : 'Your earnings from completed projects'}
                        </p>

                        {/* Escrow locked strip inside balance card */}
                        {!loading && lockedInEscrow > 0 && (
                            <div className="mt-5 bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-indigo-100 text-sm">
                                    <span>🔒</span>
                                    <span>Locked in Escrow</span>
                                </div>
                                <span className="text-white font-bold text-sm">
                                    ₹{lockedInEscrow.toLocaleString('en-IN')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Stats card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
                            <p className="text-3xl font-bold text-gray-800">
                                {loading ? '...' : wallet?.transactionHistory?.length ?? 0}
                            </p>
                        </div>
                        {!loading && lockedInEscrow > 0 && (
                            <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-3">
                                <p className="text-xs text-orange-500 font-medium mb-0.5">
                                    🔒 In Escrow
                                </p>
                                <p className="text-xl font-bold text-orange-600">
                                    ₹{lockedInEscrow.toLocaleString('en-IN')}
                                </p>
                            </div>
                        )}
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-1">Role</p>
                            <p className="text-lg font-semibold text-indigo-600 capitalize">
                                {user?.role}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Escrow breakdown — show only if there are active escrow projects */}
                {!loading && escrowProjects.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">🔒</span>
                            <h2 className="font-bold text-orange-800 text-sm">
                                Escrow Breakdown — ₹{lockedInEscrow.toLocaleString('en-IN')} locked
                            </h2>
                        </div>
                        <p className="text-xs text-orange-600 mb-3 leading-relaxed">
                            {user?.role === 'client'
                                ? 'These funds are safely held until you approve the work. They will be released to the freelancer upon your approval.'
                                : 'These funds are locked by the client and will be released to your wallet once the client approves your work.'}
                        </p>
                        <div className="space-y-2">
                            {escrowProjects.map((project) => (
                                <div
                                    key={project._id}
                                    className="bg-white rounded-xl px-4 py-3 flex items-center justify-between border border-orange-100"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {project.title}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            project.status === 'under-review'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {project.status === 'under-review' ? '📤 Under Review' : '⚙️ In Progress'}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-orange-600">
                                        🔒 ₹{(project.escrowAmount || 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Top up form — clients only */}
                    {user?.role === 'client' && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Top Up Wallet</h2>

                            {topupMessage && (
                                <div className={`px-3 py-2 rounded-lg mb-4 text-sm ${topupMessage.includes('successfully')
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-red-50 text-red-600 border border-red-200'
                                }`}>
                                    {topupMessage}
                                </div>
                            )}

                            <form onSubmit={handleTopup}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={topupAmount}
                                        onChange={(e) => setTopupAmount(e.target.value)}
                                        required
                                        min="1"
                                        placeholder="Enter amount"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* Quick amounts */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[1000, 5000, 10000].map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setTopupAmount(String(amt))}
                                            className="py-1 text-xs border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50"
                                        >
                                            ₹{amt.toLocaleString()}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={topupLoading}
                                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 text-sm"
                                >
                                    {topupLoading ? 'Processing...' : 'Add Money'}
                                </button>
                            </form>

                            <p className="text-xs text-gray-400 mt-3 text-center">
                                Razorpay integration coming soon
                            </p>
                        </div>
                    )}

                    {/* Transaction history */}
                    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${user?.role === 'client' ? 'md:col-span-2' : 'md:col-span-3'}`}>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Transaction History</h2>

                        {loading ? (
                            <div className="text-center py-6 text-gray-400">Loading...</div>
                        ) : wallet?.transactionHistory?.length === 0 ? (
                            <div className="text-center py-6 text-gray-400">No transactions yet</div>
                        ) : (
                            <div className="space-y-1 max-h-96 overflow-y-auto">
                                {[...(wallet?.transactionHistory ?? [])]
                                    .reverse()
                                    .map((tx, index) => {
                                        const meta = getTxMeta(tx)
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
                                            >
                                                {/* Icon bubble */}
                                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
                                                    {meta.icon}
                                                </div>

                                                {/* Description + date */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        {tx.description}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {new Date(tx.date).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                        {' · '}
                                                        <span className="text-gray-400">{meta.label}</span>
                                                    </p>
                                                </div>

                                                {/* Amount */}
                                                <span className={`text-sm font-bold flex-shrink-0 ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        )
                                    })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default WalletPage