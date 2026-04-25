import { useState, useRef } from "react";
import { uploadToCloudinary } from "../utils/cloudinary";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export default function ImageUpload({ value = [], onChange, max = 1, label = "Upload Image", folder = "uploads" }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const images = Array.isArray(value) ? value : value ? [value] : [];

  async function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remaining = max - images.length;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    try {
      const urls = [];
      for (const file of toUpload) {
        const url = await uploadToCloudinary(file, folder);
        urls.push(url);
      }
      const newImages = [...images, ...urls];
      onChange(max === 1 ? newImages[0] : newImages);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index) {
    const newImages = images.filter((_, i) => i !== index);
    onChange(max === 1 ? (newImages[0] || "") : newImages);
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <img
                src={url}
                alt={`Upload ${i + 1}`}
                className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < max && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-3 w-full px-4 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Uploading...</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                <Upload size={18} className="text-indigo-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                <p className="text-xs text-gray-400">
                  {max > 1 ? `${images.length}/${max} images` : "Click to upload"}
                </p>
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
