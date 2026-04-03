import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchPosts, createPost, updatePost, deletePost, clearBlogMessage, clearBlogError, BlogPost } from "@/redux/blogSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Loader2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const categories = ["Cows", "Feeding", "Medical", "Events", "Volunteers", "General"];

const MemberBlogPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error, message } = useSelector((state: RootState) => state.blog);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const myPosts = posts.filter(post => post.author === user?.id);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearBlogMessage());
      setIsModalOpen(false);
      reset();
      setImagePreview(null);
    }
    if (error) {
      toast.error(error);
      dispatch(clearBlogError());
    }
  }, [message, error, dispatch, reset]);

  const onEdit = (post: BlogPost) => {
    setEditingPost(post);
    setValue("title", post.title);
    setValue("content", post.content);
    setValue("category", post.category);
    setValue("is_published", post.is_published);
    setImagePreview(post.cover_image_url);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    reset({
      title: "",
      content: "",
      category: "General",
      is_published: true
    });
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("category", data.category);
    formData.append("is_published", data.is_published);
    
    if (data.cover_image?.[0]) {
      formData.append("cover_image", data.cover_image[0]);
    }

    if (editingPost) {
      dispatch(updatePost({ id: editingPost.id, formData }));
    } else {
      dispatch(createPost(formData));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Call react-hook-form's onChange so the file is stored in form state
    await register("cover_image").onChange(e);
    // Then update the preview
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
      text: "This post will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });
  
    if (result.isConfirmed) {
      await dispatch(deletePost(id));
  
      // ✅ Refresh gallery data
      dispatch(fetchPosts());
  
      MySwal.fire({
        title: "Deleted!",
        text: "Post removed successfully",
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
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">My Blog Posts</h1>
              <p className="text-muted-foreground mt-1">Manage your articles and stories</p>
            </div>
            <button 
              onClick={handleOpenCreate}
              className="btn-primary flex items-center gap-2 w-full md:w-fit justify-center h-12 px-8 rounded-2xl shadow-xl shadow-primary/20"
            >
              <Plus className="w-5 h-5 shadow-sm" />
              Create New Post
            </button>
          </div>

          {loading && posts.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : myPosts.length === 0 ? (
            <div className="card-elevated text-center py-20">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-6">You haven't written any blog posts yet.</p>
              <button 
                onClick={handleOpenCreate}
                className="btn-primary"
              >
                Write your first post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPosts.map((post) => (
                <motion.div 
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card-elevated group overflow-hidden border border-border/50 hover:border-primary/50 transition-all flex flex-col h-full"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted flex-shrink-0">
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                      {post.category}
                    </div>
                    {!post.is_published && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Draft
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-3 line-clamp-1 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-grow">{post.content}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(post.created_at).toLocaleDateString()}</p>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onEdit(post)}
                          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                       <button
                      onClick={() => handleDelete(post.id)}
                      className="p-3 bg-destructive text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Modal */}
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
              className="relative w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="text-2xl font-bold">{editingPost ? "Edit Post" : "Create New Post"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="post-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1.5">Post Title</label>
                    <input 
                      {...register("title", { required: "Title is required" })}
                      placeholder="Enter a catchy title..."
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 transition duration-200 font-bold"
                    />
                    {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message as string}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5">Category</label>
                      <select 
                        {...register("category")}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 transition duration-200"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end h-full">
                       <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-all w-full">
                          <input type="checkbox" {...register("is_published")} className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                          <span className="font-bold text-sm">Publish Immediately</span>
                       </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1.5">Cover Image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-20 rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                           <img src={imagePreview} className="w-full h-full object-cover" />
                        ) : (
                           <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="btn-outline text-xs inline-flex items-center gap-2 cursor-pointer">
                          <ImageIcon className="w-4 h-4" />
                          Choose Image
                          <input type="file" className="hidden" accept="image/*" {...register("cover_image")} onChange={handleImageChange} ref={register("cover_image").ref} />
                        </label>
                        <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-bold">Recommended size: 1200x630 (Cloudinary)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1.5">Content</label>
                    <textarea 
                      {...register("content", { required: "Content is required" })}
                      rows={8}
                      placeholder="Tell your story..."
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 transition duration-200 resize-none leading-relaxed"
                    />
                    {errors.content && <p className="text-xs text-destructive mt-1">{errors.content.message as string}</p>}
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-border flex items-center gap-4 bg-muted/30">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-border text-foreground font-bold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  form="post-form"
                  type="submit"
                  disabled={loading}
                  className="flex-[2] btn-primary flex items-center justify-center gap-2 h-14"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingPost ? "Save Changes" : "Post Article")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default MemberBlogPage;
