import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const getApiUrl = () => {
        const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return url.replace(/\/$/, "");
    };

    const API_URL = getApiUrl();

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            if (data.token) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
            }
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const verifyLoginOTP = async (email, otp) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/verify-login`, { email, otp });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'OTP verification failed';
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const verifyRegisterOTP = async (email, otp) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'Verification failed';
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, verifyLoginOTP, register, verifyRegisterOTP, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
