import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Upload, Trash2, LayoutGrid, FileText, Tag, Image as ImageIcon, Loader2, Plus, X, Users, Mail, ShieldCheck, ShieldAlert, Search, Wand2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('images'); // 'images' or 'users'
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [bulkLoading, setBulkLoading] = useState(false);

    // Filter state
    const [adminSearch, setAdminSearch] = useState('');
    const [adminColor, setAdminColor] = useState('All');
    const [adminSort, setAdminSort] = useState('new');

    const colors = ['All', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'White', 'Black'];
    const sorts = [
        { label: 'Newest', value: 'new' },
        { label: 'Oldest', value: 'old' },
        { label: 'Random', value: 'random' }
    ];

    // Form state
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');
    const [keywords, setKeywords] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploadType, setUploadType] = useState('files'); // 'files' or 'folder'

    useEffect(() => {
        if (activeTab === 'images') {
            const timeoutId = setTimeout(() => {
                fetchAdminImages();
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            fetchUsers();
        }
    }, [activeTab, adminSearch, adminColor, adminSort]);

    const fetchAdminImages = async () => {
        try {
            setLoading(true);
            const params = { sort: adminSort };
            if (adminSearch) params.search = adminSearch;
            if (adminColor !== 'All') params.color = adminColor;

            const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, "");
            const { data } = await axios.get(`${apiUrl}/api/images`, { params });
            setImages(data);
        } catch (error) {
            toast.error('Failed to fetch images');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get(`${API_BASE_URL}/api/auth`, config);
            setUsers(data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles(files);
            const newPreviews = [];
            files.slice(0, 5).forEach(file => { // Show first 5 previews
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result);
                    if (newPreviews.length === Math.min(files.length, 5)) {
                        setPreviews(newPreviews);
                    }
                };
                reader.readAsDataURL(file);
            });
            if (files.length > 5) {
                // Keep the rest as count
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return toast.error('Please select image(s)');

        setUploadLoading(true);
        setUploadProgress({ current: 0, total: selectedFiles.length });

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < selectedFiles.length; i++) {
            const formData = new FormData();
            formData.append('title', title); // Will be prefixed by color in backend if provided
            formData.append('tags', tags);
            formData.append('keywords', keywords);
            formData.append('image', selectedFiles[i]);

            try {
                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                await axios.post(`${API_BASE_URL}/api/images`, formData, config);
                successCount++;
            } catch (error) {
                console.error(`Upload failed for ${selectedFiles[i].name}:`, error);
                failCount++;
            }
            setUploadProgress(prev => ({ ...prev, current: i + 1 }));
        }

        if (successCount > 0) {
            toast.success(`Successfully uploaded ${successCount} image(s)`);
            setTitle('');
            setTags('');
            setKeywords('');
            setSelectedFiles([]);
            setPreviews([]);
            fetchAdminImages();
        }

        if (failCount > 0) {
            toast.error(`Failed to upload ${failCount} image(s)`);
        }

        setUploadLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.delete(`${API_BASE_URL}/api/images/${id}`, config);
            toast.success('Image deleted');
            setImages(images.filter((img) => img._id !== id));
        } catch (error) {
            toast.error('Deletion failed');
        }
    };

    const handleUpdateKeywords = async (id, newKeywords) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.put(`${API_BASE_URL}/api/images/${id}/keywords`, { keywords: newKeywords }, config);
            toast.success('Keywords updated');
            fetchAdminImages();
        } catch (error) {
            toast.error('Failed to update keywords');
        }
    };

    const handleAutoTag = async (id) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.put(`${API_BASE_URL}/api/images/${id}/auto-tag`, {}, config);
            toast.success('Image auto-tagged successfully');
            fetchAdminImages();
        } catch (error) {
            toast.error('Auto-tagging failed');
        }
    };

    const handleBulkAutoTag = async () => {
        if (!window.confirm('This will automatically update keywords for ALL images based on their titles and tags. Proceed?')) return;

        try {
            setBulkLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post(`${API_BASE_URL}/api/images/reindex-keywords`, {}, config);
            toast.success(data.message);
            fetchAdminImages();
        } catch (error) {
            toast.error('Bulk auto-tagging failed');
        } finally {
            setBulkLoading(false);
        }
    };

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500">Manage your gallery content and users</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setActiveTab('images')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition-all border ${activeTab === 'images' ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                    >
                        <ImageIcon className="h-5 w-5" />
                        <span className="font-semibold">{images.length} Images</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition-all border ${activeTab === 'users' ? 'bg-purple-50 text-purple-600 border-purple-100 shadow-sm' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                    >
                        <Users className="h-5 w-5" />
                        <span className="font-semibold">{users.length} Users</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Section: Upload (only show for Images tab) */}
                <div className="lg:col-span-1 space-y-6">
                    {activeTab === 'images' ? (
                        <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-blue-500/5 border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Upload className="h-5 w-5 text-blue-500" />
                                Upload New Image
                            </h2>

                            <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                                <button
                                    onClick={() => setUploadType('files')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${uploadType === 'files' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Select Files
                                </button>
                                <button
                                    onClick={() => setUploadType('folder')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${uploadType === 'folder' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Select Folder
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Image File</label>
                                    <div
                                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${selectedFiles.length > 0 ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200 hover:border-blue-400'
                                            }`}
                                        onClick={() => document.getElementById('file-upload').click()}
                                    >
                                        <div className="space-y-1 text-center">
                                            {previews.length > 0 ? (
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {previews.map((src, idx) => (
                                                        <div key={idx} className="relative group">
                                                            <img src={src} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                                                        </div>
                                                    ))}
                                                    {selectedFiles.length > 5 && (
                                                        <div className="h-16 w-16 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg font-bold">
                                                            +{selectedFiles.length - 5}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="flex text-sm text-gray-600">
                                                        <span className="font-semibold text-blue-600 hover:text-blue-500">Upload files or folder</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
                                                </>
                                            )}
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                multiple
                                                {...(uploadType === 'folder' ? {
                                                    webkitdirectory: "true",
                                                    directory: "true"
                                                } : {})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {selectedFiles.length <= 1 && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Title</label>
                                            <div className="relative">
                                                <LayoutGrid className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    placeholder="Grand Canyon Sunset"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Tags (comma separated)</label>
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    placeholder="nature, sunset, desert"
                                                    value={tags}
                                                    onChange={(e) => setTags(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Keywords (comma separated)</label>
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    placeholder="green, nature, aesthetic"
                                                    value={keywords}
                                                    onChange={(e) => setKeywords(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <button
                                    type="submit"
                                    disabled={uploadLoading}
                                    className="w-full flex flex-col items-center justify-center space-y-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/10"
                                >
                                    {uploadLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span className="text-xs">Uploading {uploadProgress.current} / {uploadProgress.total}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-5 w-5" />
                                            <span>Upload {selectedFiles.length > 1 ? `${selectedFiles.length} Images` : 'Image'}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-purple-500/5 border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-500" />
                                User Statistics
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <p className="text-gray-500 text-sm">Total Users</p>
                                    <p className="text-3xl font-bold text-purple-600">{users.length}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                    <p className="text-gray-500 text-sm">Verified Users</p>
                                    <p className="text-3xl font-bold text-green-600">{users.filter(u => u.isVerified).length}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <p className="text-gray-500 text-sm">Admins</p>
                                    <p className="text-3xl font-bold text-blue-600">{users.filter(u => u.role === 'admin').length}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-2xl shadow-blue-500/5">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="font-bold">{activeTab === 'images' ? 'Recent Uploads' : 'Registered Users'}</h2>
                            <div className="flex items-center gap-4">
                                {activeTab === 'images' && images.length > 0 && (
                                    <button
                                        onClick={handleBulkAutoTag}
                                        disabled={bulkLoading}
                                        className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 text-sm font-bold bg-purple-50 px-3 py-1 rounded-lg transition-all"
                                    >
                                        {bulkLoading ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Wand2 className="h-3.5 w-3.5" />
                                        )}
                                        Auto-Tag All
                                    </button>
                                )}
                                <button
                                    onClick={activeTab === 'images' ? fetchAdminImages : fetchUsers}
                                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {activeTab === 'images' && (
                            <div className="p-4 bg-white border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                                <div className="relative flex-1 group w-full">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500" />
                                    <input
                                        type="text"
                                        placeholder="Search images..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                        value={adminSearch}
                                        onChange={(e) => setAdminSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <select
                                        value={adminSort}
                                        onChange={(e) => setAdminSort(e.target.value)}
                                        className="flex-1 md:flex-none px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                                    >
                                        {sorts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                    <select
                                        value={adminColor}
                                        onChange={(e) => setAdminColor(e.target.value)}
                                        className="flex-1 md:flex-none px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                                    >
                                        {colors.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="divide-y divide-gray-50">
                            {loading ? (
                                <div className="p-20 flex justify-center">
                                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                </div>
                            ) : activeTab === 'images' ? (
                                images.length === 0 ? (
                                    <div className="p-20 text-center space-y-2">
                                        <p className="text-gray-500 italic">No images in your collection yet.</p>
                                    </div>
                                ) : (
                                    images.map((image) => (
                                        <div key={image._id} className="p-4 space-y-4 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <img src={image.imageUrl} alt="" className="h-20 w-20 object-cover rounded-xl border border-gray-100 shadow-sm" />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">{image.title}</h3>
                                                    <p className="text-xs text-gray-500 truncate mb-2">{image.description}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {image.tags.map((tag, i) => (
                                                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-medium">#{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Downloads</p>
                                                        <p className="text-lg font-bold text-gray-700 leading-none">{image.downloadCount || 0}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(image._id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete Image"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Keyword Management Row */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                                <div className="relative flex-1 group">
                                                    <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-focus-within:text-blue-500" />
                                                    <input
                                                        type="text"
                                                        defaultValue={image.keywords?.join(', ')}
                                                        placeholder="Keywords (comma separated)..."
                                                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleUpdateKeywords(image._id, e.target.value);
                                                            }
                                                        }}
                                                        id={`keywords-${image._id}`}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleUpdateKeywords(image._id, document.getElementById(`keywords-${image._id}`).value)}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all text-xs font-bold"
                                                    title="Save Keywords"
                                                >
                                                    <Save className="h-3.5 w-3.5" />
                                                    <span className="hidden sm:inline">Save</span>
                                                </button>
                                                <button
                                                    onClick={() => handleAutoTag(image._id)}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all text-xs font-bold"
                                                    title="Auto-Tag with AI"
                                                >
                                                    <Wand2 className="h-3.5 w-3.5" />
                                                    <span className="hidden sm:inline">Auto-Tag</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                users.length === 0 ? (
                                    <div className="p-20 text-center space-y-2">
                                        <p className="text-gray-500 italic">No users registered yet.</p>
                                    </div>
                                ) : (
                                    users.map((user_item) => (
                                        <div key={user_item._id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                            <div className="h-12 w-12 bg-purple-100 text-purple-600 flex items-center justify-center rounded-2xl border border-purple-50">
                                                <Mail className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900 truncate">{user_item.email}</h3>
                                                    {user_item.role === 'admin' ? (
                                                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full font-bold uppercase tracking-wider">
                                                            <ShieldCheck className="h-3 w-3" /> Admin
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-bold uppercase tracking-wider">User</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {user_item.isVerified ? (
                                                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                                            <div className="h-1.5 w-1.5 bg-green-500 rounded-full" /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                                            <div className="h-1.5 w-1.5 bg-red-500 rounded-full" /> Unverified
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-400">• Joined {new Date(user_item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="hidden md:block text-right">
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">User ID</p>
                                                <p className="text-xs font-mono text-gray-500">{user_item._id}</p>
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
