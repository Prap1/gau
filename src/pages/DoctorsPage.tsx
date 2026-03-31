import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import DataTable, { TableStyles } from "react-data-table-component";
import { useForm } from "react-hook-form";
import { 
  Plus, Edit2, Trash2, X, Search, UserPlus, Mail, Phone, 
  ShieldCheck, Loader2, Calendar, BookOpen, Award, Briefcase, MapPin, User as UserIcon, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchUsers, addUser, updateUser, deleteUser, clearUserMessage, clearUserError, User } from "@/redux/userSlice";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface DoctorFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password?: string;
  joining_date?: string;
  gender?: string;
  dob?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  address?: string;
}

const DoctorsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading: isLoading, error, message } = useSelector((state: RootState) => state.users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DoctorFormData>();

  useEffect(() => {
    dispatch(fetchUsers("doctor"));
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearUserMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearUserError());
    }
  }, [message, error, dispatch]);

  const openModal = (doctor?: User) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setValue("first_name", doctor.first_name);
      setValue("last_name", doctor.last_name || "");
      setValue("email", doctor.email);
      setValue("phone_number", doctor.phone_number || "");
      setValue("joining_date", doctor.joining_date || "");
      setValue("gender", doctor.gender || "");
      setValue("dob", doctor.dob || "");
      setValue("specialization", doctor.specialization || "");
      setValue("qualification", doctor.qualification || "");
      setValue("experience", doctor.experience || "");
      setValue("address", doctor.address || "");
    } else {
      setEditingDoctor(null);
      reset({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        joining_date: new Date().toISOString().split('T')[0],
        gender: "Male",
        dob: "",
        specialization: "",
        qualification: "",
        experience: "",
        address: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
    reset();
  };

  const onSubmit = async (data: DoctorFormData) => {
    const submitData = { ...data, role: "doctor" };
    if (!submitData.password) {
      delete (submitData as any).password;
    }
    
    if (editingDoctor) {
      dispatch(updateUser({ id: editingDoctor.id, data: submitData }));
    } else {
      dispatch(addUser(submitData));
    }
    closeModal();
  };

  const handleDeleteDoctor = async (id: string) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This doctor profile will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      dispatch(deleteUser(id));
      MySwal.fire({
        title: "Deleted!",
        text: "Doctor record removed successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const filteredDoctors = users.filter(doc => 
    doc.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: "Doctor",
      selector: (row: User) => `${row.first_name} ${row.last_name}`,
      sortable: true,
      minWidth: "200px",
      cell: (row: User) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden">
            {row.profile_image ? (
               <img src={row.profile_image} alt="" className="w-full h-full object-cover" />
            ) : (
               <span className="text-sm font-bold text-primary">{row.first_name[0]}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate">{row.first_name} {row.last_name}</span>
            <span className="text-xs text-primary font-medium">{row.specialization || "General Vet"}</span>
          </div>
        </div>
      )
    },
    {
      name: "Contact & Bio",
      minWidth: "220px",
      cell: (row: User) => (
        <div className="flex flex-col py-2 justify-center gap-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{row.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{row.phone_number || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
        name: "Professional",
        minWidth: "180px",
        cell: (row: User) => (
          <div className="flex flex-col py-2 justify-center gap-1">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Award className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{row.qualification || 'No Quals'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>{row.experience || '0'} Exp</span>
            </div>
          </div>
        )
      },
    {
      name: "Status",
      selector: (row: User) => row.is_active ? "Active" : "Inactive",
      sortable: true,
      width: "100px",
      cell: (row: User) => (
        <div className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
          row.is_active 
            ? 'bg-green-100 text-green-700 border-green-200' 
            : 'bg-red-100 text-red-700 border-red-200'
        }`}>
          {row.is_active ? 'ACTIVE' : 'INACTIVE'}
        </div>
      )
    },
    {
      name: "Actions",
      width: "110px",
      cell: (row: User) => (
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => openModal(row)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDeleteDoctor(row.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const customStyles: TableStyles = {
    table: { style: { backgroundColor: 'transparent' } },
    headRow: {
      style: {
        backgroundColor: 'hsl(var(--muted) / 0.5)',
        borderBottom: '1px solid hsl(var(--border))',
        borderTopLeftRadius: '0.75rem',
        borderTopRightRadius: '0.75rem',
        minHeight: '48px',
      },
    },
    headCells: {
      style: {
        color: 'hsl(var(--muted-foreground))',
        fontWeight: 'bold',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
    },
    rows: {
      style: {
        backgroundColor: 'transparent',
        borderBottomColor: 'hsl(var(--border) / 0.5)',
        minHeight: '64px',
        '&:hover': {
          backgroundColor: 'hsl(var(--muted) / 0.3)',
          transition: 'all 0.2s',
        },
      },
    },
    cells: { style: { color: 'hsl(var(--foreground))' } },
    pagination: {
      style: {
        backgroundColor: 'transparent',
        borderTopColor: 'hsl(var(--border))',
        color: 'hsl(var(--muted-foreground))',
      },
    },
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/80 backdrop-blur-xl p-6 rounded-2xl border border-border/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative">
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              Doctors Directory
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">Manage veterinary professionals and their profiles</p>
          </div>
          
          <button 
            onClick={() => openModal()}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 flex items-center justify-center gap-2 relative z-10"
          >
            <UserPlus className="w-5 h-5" />
            Register Doctor
          </button>
        </div>

        {/* Data Section */}
        <div className="card-elevated p-1 border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
          <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/20 rounded-t-xl border-b border-border/50">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search by name, email, specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
              />
            </div>
            <div className="text-sm font-semibold text-muted-foreground bg-background px-4 py-2 rounded-xl border border-border shadow-sm">
              Active Professionals: <span className="text-primary">{filteredDoctors.length}</span>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredDoctors}
            customStyles={customStyles}
            pagination
            highlightOnHover
            pointerOnHover
            progressPending={isLoading}
            progressComponent={<div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-2xl bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6 overflow-hidden"
              >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UserPlus className="w-5 h-5 text-primary" />
                  </div>
                  {editingDoctor ? "Update Doctor Profile" : "Register New Doctor"}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Basic Info Group */}
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50 space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <UserIcon className="w-3 h-3" /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">First Name</label>
                            <input {...register("first_name", { required: "First name is required" })} type="text" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition" />
                            {errors.first_name && <p className="text-xs text-destructive mt-1 font-medium">{errors.first_name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">Last Name</label>
                            <input {...register("last_name")} type="text" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">Email Address</label>
                            <input {...register("email", { 
                                required: "Email is required",
                                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
                            })} type="email" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition" />
                            {errors.email && <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">Phone Number</label>
                            <input {...register("phone_number")} type="tel" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition" />
                        </div>
                    </div>
                </div>

                {/* Professional Info Group */}
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" /> Professional Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">Specialization</label>
                            <input {...register("specialization")} placeholder="e.g. Surgery, Nutrition" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">Qualification</label>
                            <input {...register("qualification")} placeholder="e.g. BVSc & AH" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">Years of Experience</label>
                            <input {...register("experience")} placeholder="e.g. 5+ years" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">Joining Date</label>
                            <input {...register("joining_date")} type="date" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition" />
                        </div>
                    </div>
                </div>

                {/* Personal Info Group */}
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50 space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <BookOpen className="w-3 h-3" /> Personal & Contact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">Gender</label>
                            <select {...register("gender")} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1.5">Date of Birth</label>
                            <input {...register("dob")} type="date" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Full Address</label>
                        <textarea {...register("address")} rows={2} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition resize-none" placeholder="Residential or Office address" />
                    </div>
                </div>

                <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/10">
                    <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-2"><Lock className="w-4 h-4 text-destructive" /> {editingDoctor ? "Update Password (Leave blank to keep current)" : "Password"}</label>
                    <input {...register("password", { 
                        required: editingDoctor ? false : "Password is required for new accounts",
                        minLength: { value: 8, message: "Min 8 characters" }
                    })} type="password" placeholder="••••••••" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition" />
                    {errors.password && <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>}
                </div>

                <div className="flex gap-3 pt-6 sticky bottom-0 bg-background/80 backdrop-blur-sm py-2">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-border font-bold text-foreground hover:bg-muted transition-colors text-sm">Cancel</button>
                  <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg text-sm">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingDoctor ? "Save Changes" : "Register Doctor")}
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

export default DoctorsPage;
