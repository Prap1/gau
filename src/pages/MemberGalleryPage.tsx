import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchGallery, uploadGalleryImage, deleteGalleryImage, clearGalleryMessage, clearGalleryError, GalleryImage } from "@/redux/gallerySlice";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, X, Plus, Filter, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const galleryCategories = ["Cows", "Feeding", "Medical", "Events", "Volunteers"];

const MemberGalleryPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { images, loading, error, message } = useSelector((state: RootState) => state.gallery);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const myImages = images.filter(img => img.uploaded_by === user?.id);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchGallery());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearGalleryMessage());
      setIsModalOpen(false);
      reset();
      setImagePreview(null);
    }
    if (error) {
      toast.error(error);
      dispatch(clearGalleryError());
    }
  }, [message, error, dispatch, reset]);

  const onSubmit = async (data: any) => {
    if (!data.image || data.image.length === 0) {
      toast.error("Please select an image");
      return;
    }
    const formData = new FormData();
    formData.append("title", data.title || "");
    formData.append("category", data.category);
    formData.append("image", data.image[0]);

    dispatch(uploadGalleryImage(formData));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
const handleDelete = async (id: number) => {
  const result = await MySwal.fire({
    title: "Are you sure?",
    text: "This photo will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    await dispatch(deleteGalleryImage(id));

    // ✅ Refresh gallery data
    dispatch(fetchGallery());

    MySwal.fire({
      title: "Deleted!",
      text: "Photo removed successfully",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  }
};

  return (
    <Layout>
      <div className="py-8 md:py-16 min-h-[80vh] bg-muted/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">My Gallery Uploads</h1>
              <p className="text-muted-foreground mt-1">Contribute photos to our sanctuary gallery</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2 w-full md:w-fit justify-center h-12 px-10 rounded-2xl shadow-xl shadow-primary/20"
            >
              <Upload className="w-5 h-5 shadow-sm" />
              Upload Photos
            </button>
          </div>

          {loading && images.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : myImages.length === 0 ? (
            <div className="card-elevated text-center py-24 flex flex-col items-center border-2 border-dashed border-border/50">
              <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                <Upload className="w-10 h-10 text-primary/40" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No photos uploaded</h3>
              <p className="text-muted-foreground mb-8 max-w-sm">Share beautiful moments from the sanctuary with everyone.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary h-14 px-10 rounded-2xl"
              >
                Start Uploading
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myImages.map((image) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-border shadow-md"
                >
                  <img src={image.image_url} alt={image.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">{image.category}</p>
                    <p className="text-white/70 text-[10px] mb-4 line-clamp-2">{image.title || "No title"}</p>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-3 bg-destructive text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {!image.is_approved && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500 text-white rounded-full text-[8px] font-bold uppercase tracking-wider">
                      Pending
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-background border border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold">Upload to Gallery</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-4">Select Image</label>
                  <label className={`relative block w-full aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${imagePreview ? 'border-primary' : 'border-border hover:border-primary/50 bg-muted/30'}`}>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      {...register("image", {
                        onChange: (e) => handleImageChange(e)
                      })}
                    />
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <Plus className="w-10 h-10 text-primary/40 mb-2" />
                        <p className="text-sm font-bold">Take or Choose Photo</p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {galleryCategories.map(cat => (
                      <label key={cat} className="flex-1">
                        <input type="radio" value={cat} {...register("category", { required: true })} className="hidden peer" defaultChecked={cat === "Cows"} />
                        <div className="px-3 py-2.5 text-center text-xs font-bold rounded-xl border border-border bg-background peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary cursor-pointer transition-all">
                          {cat}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Title (Optional)</label>
                  <input
                    {...register("title")}
                    placeholder="e.g. Beautiful Sunset with Cows"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 transition duration-200"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary h-14 rounded-2xl flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Upload"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default MemberGalleryPage;
