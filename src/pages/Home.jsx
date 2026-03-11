import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, ExternalLink, Loader, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

const Home = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedColor, setSelectedColor] = useState('All');
    const [selectedSort, setSelectedSort] = useState('random');

    const categories = ['All', 'Nature', 'Business', 'Abstract', 'Minimal', 'Tech', 'People'];
    const colors = ['All', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'White', 'Black'];
    const sorts = [
        { label: 'Random', value: 'random' },
        { label: 'Newest', value: 'new' },
        { label: 'Oldest', value: 'old' }
    ];

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchImages();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedCategory, selectedColor, selectedSort]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const params = {
                sort: selectedSort
            };
            if (searchTerm) params.search = searchTerm;
            if (selectedColor !== 'All') params.color = selectedColor;

            let finalSearch = searchTerm;
            if (selectedCategory !== 'All') {
                finalSearch = searchTerm ? `${searchTerm} ${selectedCategory}` : selectedCategory;
                params.search = finalSearch;
            }

            const { data } = await axios.get(`${API_BASE_URL}/api/images`, {
                params
            });
            setImages(data);
        } catch (error) {
            toast.error('Failed to fetch images');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Main Header Section */}
            <div className="max-w-2xl mx-auto text-center space-y-6 py-4">

                {/* 1. Enlarged Pyramid Container (w-32 h-32) */}
                <div className="mx-auto w-32 h-32 flex items-center justify-center mb-2">
                    <HomeIcon className="h-full w-full text-blue-500 drop-shadow-xl" />
                </div>

                {/* 2. Text Content */}
                <div className="space-y-0">
                    <h1 className="text-4xl py-2 font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent leading-tight">
                        A Place of Pics And Icons
                    </h1>
                    <p className="text-lg text-gray-500 pt-2 max-w-lg mx-auto">
                        High-quality images for your next creative project. Free to download.
                    </p>
                </div>

                {/* Search & Filter Section */}
                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm shadow-sm"
                            placeholder="Search by title or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Dropdowns (Aligned to Right) */}
                    <div className="flex items-center justify-end gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort:</span>
                            <select
                                value={selectedSort}
                                onChange={(e) => setSelectedSort(e.target.value)}
                                className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                            >
                                {sorts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category:</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Color:</span>
                            <select
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                                className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                            >
                                {colors.map(col => <option key={col} value={col}>{col}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Grid Logic */}
            {loading ? (
                <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="break-inside-avoid bg-white rounded-2xl overflow-hidden animate-pulse border border-gray-100 shadow-sm">
                            <div className="aspect-[3/4] bg-gray-200" />
                        </div>
                    ))}
                </div>
            ) : images.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                    <div className="text-gray-400 text-6xl">😕</div>
                    <h3 className="text-xl font-semibold text-gray-900">No images found</h3>
                    <p className="text-gray-500">Try searching for something else.</p>
                </div>
            ) : (
                <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                    {images.map((image) => (
                        <div key={image._id} className="break-inside-avoid group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 italic">
                            <Link to={`/image/${image._id}`} className="block">
                                <img
                                    src={image.imageUrl}
                                    alt={image.title}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white font-bold text-sm truncate capitalize">{image.title}</p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;