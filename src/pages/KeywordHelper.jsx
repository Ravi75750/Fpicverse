import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, Save, SkipForward, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const KeywordHelper = () => {
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [keywords, setKeywords] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchImagesToTag();
    }, []);

    const fetchImagesToTag = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/images');
            // Filter images that have empty keywords
            const untagged = data.filter(img => !img.keywords || img.keywords.length === 0);
            setImages(untagged);
        } catch (error) {
            toast.error('Failed to fetch images');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!keywords.trim()) return toast.error('Please enter some keywords');
        setSaving(true);
        try {
            const currentImage = images[currentIndex];
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.put(`http://localhost:5000/api/images/${currentImage._id}/keywords`, {
                keywords: keywords.split(',').map(k => k.trim())
            }, config);

            toast.success('Keywords saved');
            setKeywords('');
            if (currentIndex < images.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                toast.success('All images processed!');
                fetchImagesToTag();
            }
        } catch (error) {
            toast.error('Failed to save keywords');
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setKeywords('');
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
    if (images.length === 0) return <div className="text-center p-20">No images left to tag! <CheckCircle className="inline ml-2 text-green-500" /></div>;

    const currentImage = images[currentIndex];

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Image Keyword Helper</h1>
                <div className="text-sm font-medium text-gray-500">
                    Image {currentIndex + 1} of {images.length}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                <div className="space-y-4">
                    <img
                        id="target-image"
                        src={currentImage.imageUrl}
                        alt={currentImage.title}
                        className="w-full h-auto rounded-2xl shadow-lg object-contain bg-gray-50"
                        style={{ maxHeight: '400px' }}
                    />
                    <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-sm font-semibold text-gray-700">Title: <span className="font-normal">{currentImage.title}</span></p>
                        <p className="text-sm font-semibold text-gray-700">Tags: <span className="font-normal">{currentImage.tags.join(', ')}</span></p>
                    </div>
                </div>

                <div className="space-y-6 flex flex-col justify-center">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Add Keywords (comma separated)</label>
                        <textarea
                            id="keywords-input"
                            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-32 resize-none"
                            placeholder="night, mountain, moon, dark, black..."
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            id="save-button"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                            Save & Next
                        </button>
                        <button
                            id="skip-button"
                            onClick={handleSkip}
                            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            <SkipForward className="h-5 w-5" />
                            Skip
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-700">
                    <strong>AI Instruction:</strong> Please analyze the image on the left and provide 5-10 relevant keywords. Focus on objects, setting, mood, and colors.
                </p>
            </div>
        </div>
    );
};

export default KeywordHelper;
