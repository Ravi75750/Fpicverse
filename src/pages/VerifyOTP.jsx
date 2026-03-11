import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, KeyRound, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    const location = useLocation();
    const navigate = useNavigate();
    const { verifyLoginOTP, verifyRegisterOTP } = useAuth();

    const email = location.state?.email;
    const type = location.state?.type;

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) return toast.error('Check your OTP');

        setLoading(true);
        try {
            if (type === 'login') {
                await verifyLoginOTP(email, otpValue);
                toast.success('Login successful!');
                navigate('/');
            } else {
                await verifyRegisterOTP(email, otpValue);
                toast.success('Account verified and logged in!');
                navigate('/');
            }
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 sm:mt-20 text-center">
            <div className="bg-white shadow-2xl shadow-blue-500/5 rounded-3xl p-8 border border-gray-100">
                <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-6">
                    <KeyRound className="h-6 w-6" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h2>
                <p className="text-gray-500 mb-8">
                    We've sent a 6-digit code to <br />
                    <span className="font-semibold text-gray-900">{email}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={inputRefs[index]}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-100 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 transition-all group"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Verify Account</span>}
                    </button>
                </form>

                <div className="mt-8 text-sm text-gray-500">
                    Didn't receive the code?{' '}
                    <button className="font-semibold text-blue-600 hover:text-blue-500 transition-colors inline-flex items-center space-x-1">
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Resend</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
