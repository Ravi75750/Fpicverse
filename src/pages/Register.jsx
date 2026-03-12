import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validations
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (!nameRegex.test(name)) {
            return toast.error('Please enter a valid name (letters and spaces only, min 2 chars)');
        }
        if (!emailRegex.test(email)) {
            return toast.error('Please enter a valid email address');
        }
        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            const normalizedEmail = email.toLowerCase().trim();
            await register(name, normalizedEmail, password);
            toast.success('Verification OTP sent to your email');
            navigate('/verify-otp', { state: { email, type: 'register' } });
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 sm:mt-20">
            <div className="bg-[#52b176] shadow-2xl shadow-blue-500/5 rounded-3xl p-8 border border-gray-100">
                <div className="text-center space-y-2 mb-8">
                    <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-2">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#1e097e]">Create Account</h2>
                    <p className="text-[#0c2e27]">Join PicVerse to explore amazing visuals</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 transition-all group"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <span>Create Account</span>
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
