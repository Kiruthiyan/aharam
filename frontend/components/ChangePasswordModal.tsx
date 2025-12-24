
import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string; // Add username prop
}

export default function ChangePasswordModal({ isOpen, onClose, username }: ChangePasswordModalProps) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('புதிய கடவுச்சொற்கள் பொருந்தவில்லை (New passwords do not match)');
            return;
        }

        if (newPassword.length < 6) {
            setError('கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும் (Password must be at least 6 chars)');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch('http://localhost:8080/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: username,
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! (Password changed successfully)');
                setTimeout(() => {
                    localStorage.setItem("requirePasswordChange", "false"); // Clear flag locally
                    // Force logout or reload
                    window.location.reload();
                }, 1500);
            } else {
                setError(data.message || 'Error Changing Password');
            }
        } catch (err) {
            setError('Server Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white">
                        <Lock className="w-5 h-5" />
                        <h3 className="font-bold text-lg">கடவுச்சொல் மாற்றம் தேவை (Required)</h3>
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-6">
                        பாதுகாப்பு காரணங்களுக்காக உங்கள் கடவுச்சொல்லை மாற்றவும்.
                        (For security, please change your password.)
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-center gap-2">
                            <span className="font-bold">Success:</span> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">பழைய கடவுச்சொல் (Old Password)</label>
                            <input
                                type="password"
                                required
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm"
                                placeholder="******"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">புதிய கடவுச்சொல் (New Password)</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm"
                                placeholder="******"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">உறுதிப்படுத்த (Confirm Password)</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm"
                                placeholder="******"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Updating...' : 'கடவுச்சொல்லை மாற்றவும் (Update Password)'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
