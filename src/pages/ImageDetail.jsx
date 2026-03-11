import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, Calendar, User, Tag, ArrowLeft, Loader2, Sparkles, Share2, Heart, Eye, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const ImageDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [image, setImage] = useState(null);
    const [relatedImages, setRelatedImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchImageDetails();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchImageDetails = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/images/${id}`);
            setImage(data);

            const allImages = await axios.get(`${API_BASE_URL}/api/images`);
            const currentTags = (data.tags || []).map(t => t.toLowerCase());

            const related = allImages.data.filter(img => {
                if (img._id === id) return false;
                const imgTags = (img.tags || []).map(t => t.toLowerCase());
                return imgTags.some(tag => currentTags.includes(tag));
            });
            setRelatedImages(related.slice(0, 12)); // Limit to 12 for vertical grid
        } catch (error) {
            toast.error('Failed to load image details');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!user) {
            toast.error('Please login to download');
            navigate('/login');
            return;
        }
        try {
            await axios.put(`${API_BASE_URL}/api/images/${id}/download`);
            const response = await fetch(image.imageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${image.title || 'picverse-image'}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.success('Download started');
            setImage(prev => ({ ...prev, downloadCount: (prev.downloadCount || 0) + 1 }));
        } catch (error) {
            toast.error('Download failed');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
                <Loader />
            </div>
        );
    }

    if (!image) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <h1 className="text-6xl font-black text-gray-100">404</h1>
            <p className="text-gray-500 font-medium">This magic moment is missing.</p>
            <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all">Go Home</Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header / Navigation */}
            <div className="mb-8 flex items-center justify-between">
                <Link to="/" className="inline-flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-all font-semibold group">
                    <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <span>Back to Gallery</span>
                </Link>
                <div className="flex items-center space-x-2">
                    <button className="p-2.5 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                        <Heart className="h-5 w-5" />
                    </button>
                    <button className="p-2.5 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all shadow-sm">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
                {/* Image Showcase */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-blue-500/5 group ring-1 ring-gray-100 italic transition-all">
                        <img
                            src={image.imageUrl}
                            alt={image.title}
                            className="w-full h-auto max-h-[85vh] object-contain bg-gray-50/50"
                        />
                        <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center gap-2">
                                <Eye className="h-3 w-3" /> Still Preview
                            </div>
                        </div>
                    </div>
                </div>

                {/* Glassmorphic Info Sidebar */}
                <div className="xl:col-span-4 space-y-8 xl:sticky xl:top-24">
                    <div className="space-y-6 bg-white/70 backdrop-blur-xl border border-gray-100/50 p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />

                        <div className="space-y-3">
                            <h1 className="text-4xl font-black tracking-tight text-gray-900 capitalize leading-[1.1]">
                                {image.title}
                            </h1>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                {image.description || 'No description provided.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50/80 rounded-3xl border border-gray-100/50 space-y-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Uploader</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-[10px] text-white font-bold">
                                        {image.uploadedBy.email[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 truncate">{image.uploadedBy.email.split('@')[0]}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50/80 rounded-3xl border border-gray-100/50 space-y-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Published</span>
                                <div className="flex items-center space-x-2 text-gray-700 font-bold text-sm">
                                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                    <span>{new Date(image.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block px-1">Tags</span>
                            <div className="flex flex-wrap gap-2">
                                {image.tags.map((tag, i) => (
                                    <div key={i} className="flex items-center space-x-1 px-4 py-2 bg-white/50 border border-gray-100 text-gray-600 rounded-2xl text-[12px] font-bold shadow-sm hover:scale-105 transition-transform cursor-default">
                                        <Tag className="h-3 w-3 text-blue-500" />
                                        <span>{tag}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 pt-4">
                            <button
                                onClick={handleDownload}
                                className="w-full flex items-center justify-center space-x-4 bg-gray-900 text-white px-8 py-5 rounded-[2rem] font-black text-lg hover:bg-blue-600 transition-all shadow-2xl shadow-gray-900/10 hover:shadow-blue-600/20 group active:scale-[0.98]"
                            >
                                <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                                    <Download className="h-6 w-6" />
                                </div>
                                <span>Download Free</span>
                            </button>

                            <div className="flex items-center justify-between px-8 py-4 bg-blue-50/50 border border-blue-100/50 rounded-3xl group">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Analytics</span>
                                    <span className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                        High Quality Content
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-blue-600 leading-none">
                                        {image.downloadCount || 0}
                                    </span>
                                    <span className="block text-[8px] font-black text-blue-400 uppercase tracking-widest">Downloads</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-1">
                            <Info className="h-4 w-4 text-gray-300" />
                            <p className="text-[10px] text-gray-400 font-medium">PicVerse License allows free use. No attribution required.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Images Section (Vertical Grid for Scrolling) */}
            {relatedImages.length > 0 && (
                <div className="pt-24 space-y-12">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="p-4 bg-blue-50 rounded-[2rem] text-blue-600">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-4xl font-black tracking-tight">More Like This</h2>
                            <p className="text-gray-500 font-medium">Handpicked inspiration curated by our magic algorithm.</p>
                        </div>
                    </div>

                    <div className="columns-2 sm:columns-3 lg:columns-4 gap-6 space-y-6">
                        {relatedImages.map((related) => (
                            <Link
                                key={related._id}
                                to={`/image/${related._id}`}
                                className="break-inside-avoid block group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                            >
                                <img
                                    src={related.imageUrl}
                                    alt={related.title}
                                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                    <p className="text-white font-bold text-sm truncate">{related.title}</p>
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">View Details</p>
                                </div>
                                <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                    <ImageIcon className="h-4 w-4" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {relatedImages.length >= 8 && (
                        <div className="flex justify-center pt-8">
                            <Link
                                to="/"
                                className="px-10 py-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-full font-black hover:bg-gray-100 transition-all flex items-center gap-3 group"
                            >
                                Browse All Gallery
                                <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Add this helper for the component
const ImageIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export default ImageDetail;
