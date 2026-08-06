import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/Navbar'

function WalletPage() {
    const { user } = useAuth()
    const [wallet, setWallet] = useState(null)
    const [loading, setLoading] = useState(true)
    const [topupAmount, setTopupAmount] = useState('')
    const [topupLoading, setTopupLoading] = useState(false)
    const [topupMessage, setTopupMessage] = useState('')

    const fetchWallet = async () => {
        try {
            const res = await axios.get(
                'http://localhost:5000/api/users/wallet',
                { withCredentials: true }
            )
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
            await axios.post(
                'http://localhost:5000/api/users/wallet/topup',
                { amount: Number(topupAmount) },
                { withCredentials: true }
            )
            setTopupMessage(`₹${topupAmount} added successfully!`)
            setTopupAmount('')
            fetchWallet()
        } catch (err) {
            setTopupMessage(err.response?.data?.message || 'Top up failed')
        } finally {
            setTopupLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
                    <p className="text-gray-500 mt-1">
                        Manage your balance and transactions
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                    {/* Balance card */}
                    <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white">
                        <p className="text-indigo-200 text-sm mb-2">Available Balance</p>
                        <p className="text-5xl font-bold mb-4">
                            ₹{loading ? '...' : wallet?.walletBalance ?? 0}
                        </p>
                        <p className="text-indigo-200 text-sm">
                            {user?.role === 'client'
                                ? 'Use this balance to hire freelancers'
                                : 'Your earnings from completed projects'}
                        </p>
                    </div>

                    {/* Quick stats */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
                            <p className="text-3xl font-bold text-gray-800">
                                {loading ? '...' : wallet?.transactionHistory?.length ?? 0}
                            </p>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-1">Role</p>
                            <p className="text-lg font-semibold text-indigo-600 capitalize">
                                {user?.role}
                            </p>
                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Top up form — clients only */}
                    {user?.role === 'client' && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">
                                Top Up Wallet
                            </h2>

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
                    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${user?.role === 'client' ? 'md:col-span-2' : 'md:col-span-3'
                        }`}>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">
                            Transaction History
                        </h2>

                        {loading ? (
                            <div className="text-center py-6 text-gray-400">Loading...</div>
                        ) : wallet?.transactionHistory?.length === 0 ? (
                            <div className="text-center py-6 text-gray-400">
                                No transactions yet
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {[...(wallet?.transactionHistory ?? [])]
                                    .reverse()
                                    .map((tx, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {tx.description}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(tx.date).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`text-sm font-bold ${tx.type === 'credit'
                                                    ? 'text-emerald-600'
                                                    : 'text-red-500'
                                                }`}>
                                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    )
}

export default WalletPage