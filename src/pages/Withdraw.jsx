import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Withdraw() {
    const [user, setUser] = useState(null);
    const [amount, setAmount] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [savingBank, setSavingBank] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const data = await api.getMe();
            if (data.error) {
                navigate('/login');
            } else {
                setUser(data.user);
                if (data.user.bankDetails) {
                    setAccountNumber(data.user.bankDetails.accountNumber || '');
                    setIfsc(data.user.bankDetails.ifsc || '');
                    setAccountHolder(data.user.bankDetails.accountHolder || '');
                }
            }
        } catch (err) {
            navigate('/login');
        }
    };

    const handleSaveBank = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setSavingBank(true);

        try {
            const data = await api.saveBankDetails(accountNumber, ifsc, accountHolder);
            if (data.error) {
                setError(data.error);
            } else {
                setMessage('Bank details saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            setError('Failed to save bank details');
        } finally {
            setSavingBank(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const data = await api.submitWithdrawal(parseFloat(amount));
            if (data.error) {
                setError(data.error);
            } else {
                setMessage('Withdrawal request submitted! Balance deducted.');
                setUser({ ...user, balance: data.balance });
                setAmount('');
            }
        } catch (err) {
            setError('Failed to submit withdrawal');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold">Withdraw</h1>
                    <p className="text-sm">Balance: ₹{user.balance.toFixed(2)}</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-4">
                {/* Bank Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Bank Details</h2>

                    <form onSubmit={handleSaveBank} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Account Number</label>
                            <input
                                type="text"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="Enter account number"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">IFSC Code</label>
                            <input
                                type="text"
                                value={ifsc}
                                onChange={(e) => setIfsc(e.target.value)}
                                placeholder="Enter IFSC code"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-2">Account Holder Name</label>
                            <input
                                type="text"
                                value={accountHolder}
                                onChange={(e) => setAccountHolder(e.target.value)}
                                placeholder="Enter account holder name"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={savingBank}
                            className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 transition"
                        >
                            {savingBank ? 'Saving...' : 'Save Bank Details'}
                        </button>
                    </form>
                </div>

                {/* Withdrawal */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Request Withdrawal</h2>

                    {message && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleWithdraw} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="1"
                                max={user.balance}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            {loading ? 'Submitting...' : 'Submit Withdrawal'}
                        </button>
                    </form>
                </div>

                <Link
                    to="/game"
                    className="block text-center text-blue-600 hover:underline"
                >
                    Back to Game
                </Link>
            </div>
        </div>
    );
}
