import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  Phone, 
  Edit2, 
  Camera, 
  X, 
  Lock, 
  Loader2,
  CheckCircle2,
  Award,
  Briefcase,
  MapPin,
  Pill as SpecializationIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { updateProfile, clearMessage, clearError } from "@/redux/authSlice";
import { toast } from "sonner";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password?: string;
  profile_image?: FileList;
  joining_date?: string;
  gender?: string;
  dob?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  address?: string;
}

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error, message } = useSelector((state: RootState) => state.auth);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProfileFormData>();

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number || "",
        joining_date: user.joining_date || "",
        gender: user.gender || "Male",
        dob: user.dob || "",
        specialization: user.specialization || "",
        qualification: user.qualification || "",
        experience: user.experience || "",
        address: user.address || "",
      });
      if (user.profile_image) {
        setImagePreview(user.profile_image); 
      }
    }
  }, [user, reset]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      setIsEditModalOpen(false);
      setImagePreview(null);
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [message, error, dispatch]);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    formData.append("phone_number", data.phone_number);
    
    // Add new fields
    if (data.joining_date) formData.append("joining_date", data.joining_date);
    if (data.gender) formData.append("gender", data.gender);
    if (data.dob) formData.append("dob", data.dob);
    if (data.specialization) formData.append("specialization", data.specialization);
    if (data.qualification) formData.append("qualification", data.qualification);
    if (data.experience) formData.append("experience", data.experience);
    if (data.address) formData.append("address", data.address);

    if (data.password) {
      formData.append("password", data.password);
    }
    
    if (data.profile_image?.[0]) {
      formData.append("profile_image", data.profile_image[0]);
    }

    dispatch(updateProfile(formData));
  };

  const profileImageUrl = user?.profile_image || null;

  return (
    <Layout>
      <div className="section-padding min-h-[80vh] bg-muted/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Sidebar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
              <div className="card-elevated text-center p-8 sticky top-32 border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                
                <div className="relative inline-block mb-6 -mt-10 lg:mt-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl mx-auto bg-muted">
                    {imagePreview || profileImageUrl ? (
                      <img src={imagePreview || profileImageUrl!} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <button onClick={() => setIsEditModalOpen(true)} className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform z-10">
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 truncate px-2">{user?.first_name} {user?.last_name}</h2>
                <p className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-widest mb-4">{user?.role}</p>
                
                <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 bg-green-500/10 text-green-600 rounded-full text-[10px] sm:text-xs font-bold w-fit mx-auto mb-6 sm:mb-8 border border-green-500/20 shadow-sm">
                  <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> VERIFIED ACCOUNT
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 mb-6 sm:mb-8 text-left">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 transition-all hover:border-primary/30">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Joined</p>
                      <p className="text-sm font-bold text-foreground">{user?.joining_date || "N/A"}</p>
                    </div>
                  </div>
                  {user?.role === 'doctor' && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10 transition-all hover:border-primary/20">
                    <SpecializationIcon className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase">Specialization</p>
                      <p className="text-sm font-bold text-foreground">{user?.specialization || "General Vet"}</p>
                    </div>
                  </div>
                  )}
                </div>

                <button onClick={() => setIsEditModalOpen(true)} className="w-full py-3.5 sm:py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group shadow-lg text-sm sm:text-base">
                  <Edit2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Update Profile
                </button>
              </div>
            </motion.div>

            {/* Profile Content */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
              
              {/* Personal Section */}
              <div className="card-elevated p-8 border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-primary" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-6">
                  <DetailItem icon={UserIcon} label="Full Name" value={`${user?.first_name} ${user?.last_name}`} />
                  <DetailItem icon={Mail} label="Email Address" value={user?.email} />
                  <DetailItem icon={Phone} label="Phone Number" value={user?.phone_number || "Not provided"} />
                  <DetailItem icon={Calendar} label="Date of Birth" value={user?.dob || "Not provided"} />
                  <DetailItem icon={Shield} label="Gender" value={user?.gender} className="capitalize" />
                  <DetailItem icon={MapPin} label="Residential Address" value={user?.address || "No address saved"} fullWidth />
                </div>
              </div>

              {/* Professional Section */}
              <div className="card-elevated p-8 border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" /> Professional Background
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <DetailItem icon={Award} label="Qualification" value={user?.qualification || "N/A"} />
                  <DetailItem icon={Briefcase} label="Experience" value={user?.experience || "N/A"} />
                  {user?.role === 'doctor' && (
                    <DetailItem icon={SpecializationIcon} label="Specialization" value={user?.specialization || "General Veterinary"} fullWidth />
                  )}
                </div>
              </div>

              {/* Security Section */}
              <div className="card-elevated p-8 border border-border/50 border-l-[6px] border-l-primary bg-background/80 backdrop-blur-xl shadow-2xl rounded-2xl">
                <h3 className="text-xl font-bold text-foreground mb-4">Account Security</h3>
                <p className="text-sm text-muted-foreground mb-6">Manage your password and active sessions.</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-muted/30 rounded-2xl border border-border gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 sm:p-3 bg-background rounded-xl shadow-sm shrink-0"><Lock className="w-4 sm:w-5 h-4 sm:h-5 text-primary" /></div>
                    <div>
                      <p className="font-bold text-foreground text-sm sm:text-base">Change Password</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground italic">Keep your account secure with a strong password.</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(true)} className="w-full sm:w-auto px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors shadow-sm text-sm">Manage</button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="fixed inset-0 bg-background/90 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-background border border-border/50 rounded-3xl shadow-2xl p-8 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-foreground">Update Profile Details</h2>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all"><X className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20 bg-muted mb-3 shadow-lg">
                        {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><UserIcon className="w-12 h-12 text-muted-foreground/30" /></div>}
                      </div>
                      <label htmlFor="p_img" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10"><Camera className="w-7 h-7" /></label>
                      <input id="p_img" type="file" accept="image/*" className="hidden" {...register("profile_image")} onChange={(e) => { register("profile_image").onChange(e); onImageChange(e); }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputWrapper label="First Name"><input {...register("first_name", { required: "Required" })} className="p-input" /></InputWrapper>
                    <InputWrapper label="Last Name"><input {...register("last_name")} className="p-input" /></InputWrapper>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputWrapper label="Email Address"><input {...register("email", { required: "Required" })} className="p-input" /></InputWrapper>
                    <InputWrapper label="Phone Number"><input {...register("phone_number")} className="p-input" /></InputWrapper>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputWrapper label="Joining Date"><input type="date" {...register("joining_date")} className="p-input" /></InputWrapper>
                    <InputWrapper label="Date of Birth"><input type="date" {...register("dob")} className="p-input" /></InputWrapper>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputWrapper label="Gender">
                      <select {...register("gender")} className="p-input">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </InputWrapper>
                    <InputWrapper label="Experience"><input {...register("experience")} className="p-input" /></InputWrapper>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputWrapper label="Qualification"><input {...register("qualification")} className="p-input" /></InputWrapper>
                    {user?.role === 'doctor' && (
                      <InputWrapper label="Specialization"><input {...register("specialization")} className="p-input" /></InputWrapper>
                    )}
                  </div>

                  <InputWrapper label="Home/Office Address" fullWidth>
                    <textarea {...register("address")} rows={3} className="p-input py-3 resize-none" placeholder="Enter your full address" />
                  </InputWrapper>

                  <div className="pt-6 border-t border-border mt-4">
                    <InputWrapper label="New Password (Optional)" fullWidth icon={<Lock className="w-4 h-4 text-primary" />}>
                      <input type="password" {...register("password")} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 transition duration-200" />
                    </InputWrapper>
                  </div>

                  <div className="flex items-center gap-4 pt-8 sticky bottom-0 bg-background/80 backdrop-blur-sm py-4">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 rounded-2xl border-2 border-border font-bold text-foreground hover:bg-muted transition-all">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sync Changes"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

const DetailItem = ({ icon: Icon, label, value, className = "", fullWidth = false }: { icon: any, label: string, value?: string, className?: string, fullWidth?: boolean }) => (
  <div className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border/30 hover:border-primary/30 transition-all ${fullWidth ? "sm:col-span-2" : ""}`}>
    <div className="p-2.5 sm:p-3 bg-background rounded-xl shadow-sm shrink-0 border border-border/50"><Icon className="w-4 sm:w-5 h-4 sm:h-5 text-primary" /></div>
    <div className="min-w-0">
      <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-bold text-foreground text-xs sm:text-sm md:text-base break-words ${className}`}>{value || "Not provided"}</p>
    </div>
  </div>
);

const InputWrapper = ({ label, children, fullWidth = false, icon }: { label: string, children: React.ReactNode, fullWidth?: boolean, icon?: React.ReactNode }) => (
  <div className={fullWidth ? "sm:col-span-2" : ""}>
    <label className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
      {icon} {label}
    </label>
    {children}
  </div>
);

export default ProfilePage;
