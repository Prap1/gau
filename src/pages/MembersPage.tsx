import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import DataTable, { TableStyles } from "react-data-table-component";
import { useForm } from "react-hook-form";
import { 
  Edit2, Trash2, X, Search, UserPlus, Mail, Phone, Users, 
  Loader2, CheckCircle, XCircle, Clock, Calendar, BookOpen, Award, Briefcase, MapPin, User as UserIcon, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchUsers, addUser, updateUser, deleteUser, clearUserMessage, clearUserError, User } from "@/redux/userSlice";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface MemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password?: string;
  joining_date?: string;
  gender?: string;
  dob?: string;
  qualification?: string;
  experience?: string;
  address?: string;
}

type FilterTab = "all" | "pending" | "active";

const MembersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading: isLoading, error, message } = useSelector((state: RootState) => state.users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MemberFormData>();

  useEffect(() => {
    dispatch(fetchUsers("member"));
  }, [dispatch]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearUserMessage()); }
    if (error) { toast.error(error); dispatch(clearUserError()); }
  }, [message, error, dispatch]);

  const openModal = (member?: User) => {
    if (member) {
      setEditingMember(member);
      setValue("first_name", member.first_name);
      setValue("last_name", member.last_name || "");
      setValue("email", member.email);
      setValue("phone_number", member.phone_number || "");
      setValue("joining_date", member.joining_date || "");
      setValue("gender", member.gender || "");
      setValue("dob", member.dob || "");
      setValue("qualification", member.qualification || "");
      setValue("experience", member.experience || "");
      setValue("address", member.address || "");
    } else {
      setEditingMember(null);
      reset({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        joining_date: new Date().toISOString().split('T')[0],
        gender: "Male",
        dob: "",
        qualification: "",
        experience: "",
        address: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingMember(null); reset(); };

  const onSubmit = async (data: MemberFormData) => {
    const submitData = { ...data, role: "member" };
    if (!submitData.password) delete (submitData as any).password;
    if (editingMember) {
      dispatch(updateUser({ id: editingMember.id, data: submitData }));
    } else {
      dispatch(addUser(submitData));
    }
    closeModal();
  };

  const handleDeleteMember = async (id: string) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This member record will be permanently deleted!",
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
        text: "Member removed successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleApprove = (member: User) => {
    dispatch(updateUser({
      id: member.id,
      data: { is_active: true, role: "member" }
    }));
  };

  const handleReject = async (member: User) => {
    const result = await MySwal.fire({
      title: "Reject Request?",
      text: `Reject and delete ${member.first_name}'s membership request?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, reject",
    });

    if (result.isConfirmed) {
      dispatch(deleteUser(member.id));
      MySwal.fire({
        title: "Rejected",
        text: "Membership request has been removed.",
        icon: "info",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const allMembers = users;
  const pendingMembers = users.filter(u => u.is_verified && !u.is_active);
  const activeMembers = users.filter(u => u.is_active);

  const searchFiltered = (list: User[]) =>
    list.filter(u =>
      u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const displayData = searchFiltered(
    activeTab === "pending" ? pendingMembers :
    activeTab === "active" ? activeMembers :
    allMembers
  );

  const tabs = [
    { key: "all" as FilterTab, label: "All", count: allMembers.length },
    { key: "pending" as FilterTab, label: "Pending Approval", count: pendingMembers.length },
    { key: "active" as FilterTab, label: "Active", count: activeMembers.length },
  ];

  const columns = [
    {
      name: "Member",
      selector: (row: User) => `${row.first_name} ${row.last_name}`,
      sortable: true,
      minWidth: "180px",
      cell: (row: User) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden">
            {row.profile_image
              ? <img src={row.profile_image} alt="" className="w-full h-full object-cover" />
              : <span className="text-sm font-bold text-primary">{row.first_name?.[0]}</span>
            }
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate">{row.first_name} {row.last_name}</span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>Joined: {row.joining_date || 'N/A'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      name: "Contact",
      minWidth: "180px",
      hide: "sm" as any,
      cell: (row: User) => (
        <div className="flex flex-col gap-1 text-sm text-muted-foreground min-w-0">
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{row.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{row.phone_number || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      name: "Address",
      selector: (row: User) => row.address || "-",
      sortable: true,
      hide: "lg" as any,
      minWidth: "150px",
      cell: (row: User) => (
        <div className="flex items-start gap-2 text-xs text-muted-foreground py-2">
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/50" />
          <span className="line-clamp-2">{row.address || 'No address'}</span>
        </div>
      )
    },
    {
      name: "Status",
      selector: (row: User) => row.is_active ? "Active" : "Pending",
      sortable: true,
      width: "110px",
      cell: (row: User) => {
        const isPending = row.is_verified && !row.is_active;
        return (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${
            row.is_active
              ? 'bg-green-100 text-green-700 border-green-200'
              : isPending
              ? 'bg-amber-100 text-amber-700 border-amber-200'
              : 'bg-red-100 text-red-700 border-red-200'
          }`}>
            {row.is_active
              ? 'ACTIVE'
              : isPending
              ? 'PENDING'
              : 'INACTIVE'
            }
          </div>
        );
      }
    },
    {
      name: "Actions",
      width: "160px",
      cell: (row: User) => {
        const isPending = row.is_verified && !row.is_active;
        return (
          <div className="flex items-center gap-1 shrink-0 flex-wrap">
            {isPending && (
              <>
                <button onClick={() => handleApprove(row)} className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors" title="Approve">
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button onClick={() => handleReject(row)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors" title="Reject">
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
            {!isPending && (
              <button onClick={() => openModal(row)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => handleDeleteMember(row.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      }
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/80 backdrop-blur-xl p-6 rounded-2xl border border-border/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Users className="w-8 h-8 text-primary" />
              </div>
              Member Directory
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">Review membership requests and manage profiles</p>
          </div>
          <button onClick={() => openModal()} className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 flex items-center justify-center gap-2 relative z-10">
            <UserPlus className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", count: allMembers.length, color: "text-primary" },
            { label: "Pending", count: pendingMembers.length, color: "text-amber-600" },
            { label: "Active", count: activeMembers.length, color: "text-green-600" },
          ].map(stat => (
            <div key={stat.label} className="bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 p-4 shadow-lg text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-4 flex flex-col gap-4 bg-muted/20 border-b border-border/50">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      activeTab === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={displayData}
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
                className="relative w-full max-w-2xl bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6 flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg"><UserPlus className="w-5 h-5 text-primary" /></div>
                    {editingMember ? "Update Member Profile" : "Register New Member"}
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
                          <input {...register("first_name", { required: "First name is required" })} type="text" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                          {errors.first_name && <p className="text-xs text-destructive mt-1 font-medium">{errors.first_name.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-foreground mb-1.5">Last Name</label>
                          <input {...register("last_name")} type="text" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-foreground mb-1.5">Email Address</label>
                          <input {...register("email", { required: "Email is required" })} type="email" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-foreground mb-1.5">Phone Number</label>
                          <input {...register("phone_number")} type="tel" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                        </div>
                      </div>
                  </div>

                  {/* Member Bio Group */}
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                      <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3 h-3" /> Professional & Tenure
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-foreground mb-1.5">Qualification</label>
                              <input {...register("qualification")} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-foreground mb-1.5">Exp / Background</label>
                              <input {...register("experience")} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-foreground mb-1.5">Joining Date</label>
                              <input {...register("joining_date")} type="date" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                          </div>
                          <div>
                            {/* Empty or Gender or other */}
                          </div>
                      </div>
                  </div>

                  {/* Personal Bio Group */}
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/50 space-y-4">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <BookOpen className="w-3 h-3" /> Personal Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-foreground mb-1.5">Gender</label>
                              <select {...register("gender")} className="w-full px-4 py-2 rounded-lg border border-border bg-background">
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-foreground mb-1.5">Date of Birth</label>
                              <input {...register("dob")} type="date" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-foreground mb-1.5 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Full Address</label>
                          <textarea {...register("address")} rows={2} className="w-full px-4 py-2 rounded-lg border border-border bg-background resize-none" placeholder="Residential address" />
                      </div>
                  </div>

                  {editingMember ? null : (
                    <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/10">
                      <label className="block text-sm font-bold text-foreground mb-1.5">Password</label>
                      <input {...register("password", { required: !editingMember })} type="password" placeholder="••••••••" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                  )}

                  <div className="flex gap-3 pt-6 sticky bottom-0 bg-background/80 backdrop-blur-sm py-2">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-border font-bold text-sm">Cancel</button>
                    <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg text-sm">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingMember ? "Save Changes" : "Register Member")}
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

export default MembersPage;
