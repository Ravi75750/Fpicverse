import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Image as ImageIcon, PlusSquare } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-[#f5f5f5] border-b shadow-2xl border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <ImageIcon className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-[30px] font-bold bg-linear-to-r from-[#52b176] to-[#1e097e] bg-clip-text text-transparent">
                                PicVerse
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        <PlusSquare className="h-5 w-5" />
                                        <span className="hidden md:inline font-medium">Dashboard</span>
                                    </Link>
                                )}
                                <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <User className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-semibold text-gray-700">
                                        {user.name || user.email.split('@')[0]}
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Admin Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
