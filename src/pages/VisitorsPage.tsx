import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import DataTable, { TableStyles } from "react-data-table-component";
import { useForm } from "react-hook-form";
import { 
  Plus, Edit2, Trash2, X, Search, Loader2, Calendar, 
  User, Phone, MapPin, Mail, UserPlus, History, Clock, ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchVisitors, addVisitor, updateVisitor, deleteVisitor, addVisit, clearVisitorMessage, clearVisitorError, Visitor } from "@/redux/visitorSlice";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface VisitorFormData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  visit_date?: string;
  visit_time?: string;
  notes?: string;
}

const VisitorsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { visitors, loading: isLoading, error, message } = useSelector((state: RootState) => state.visitor);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Visits Modal state
  const [isVisitsModalOpen, setIsVisitsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [visitNotes, setVisitNotes] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitTime, setVisitTime] = useState("");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<VisitorFormData>();

  useEffect(() => {
    dispatch(fetchVisitors());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearVisitorMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearVisitorError());
    }
  }, [message, error, dispatch]);

  const openModal = (visitor?: Visitor) => {
    if (visitor) {
      setEditingVisitor(visitor);
      setValue("name", visitor.name);
      setValue("email", visitor.email || "");
      setValue("phone", visitor.phone);
      setValue("dob", visitor.dob || "");
      setValue("address", visitor.address);
      setValue("visit_date", "");
      setValue("visit_time", "");
      setValue("notes", "");
    } else {
      setEditingVisitor(null);
      reset({
          name: "",
          email: "",
          phone: "",
          dob: "",
          address: "",
          visit_date: new Date().toISOString().split('T')[0],
          visit_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          notes: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVisitor(null);
    reset();
  };

  const openVisitsModal = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setVisitNotes("");
    setVisitDate(new Date().toISOString().split('T')[0]);
    setVisitTime("");
    setIsVisitsModalOpen(true);
  };

  const closeVisitsModal = () => {
    setIsVisitsModalOpen(false);
    setSelectedVisitor(null);
  };

  const onSubmit = async (data: VisitorFormData) => {
    if (editingVisitor) {
      dispatch(updateVisitor({ id: editingVisitor.id, data }));
    } else {
      dispatch(addVisitor(data));
    }
    closeModal();
  };

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVisitor) {
       await dispatch(addVisit({
         visitor: selectedVisitor.id,
         visit_date: visitDate,
         visit_time: visitTime || null,
         notes: visitNotes
       }));
       setVisitNotes("");
       setVisitDate(new Date().toISOString().split('T')[0]);
       setVisitTime("");
    }
  };

  const handleDeleteVisitor = async (id: string) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This visitor record will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      dispatch(deleteVisitor(id));
      MySwal.fire({
        title: "Deleted!",
        text: "Visitor record removed successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const columns = [
    {
      name: "Visitor Info",
      selector: (row: Visitor) => row.name,
      sortable: true,
      minWidth: "220px",
      cell: (row: Visitor) => (
        <div className="flex items-center gap-3 py-3">
          <div className="p-2 bg-primary/10 rounded-full text-primary shadow-inner"><User className="w-5 h-5" /></div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-sm">{row.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Mail className="w-3 h-3 text-primary" /> {row.email || "No Email"}</span>
          </div>
        </div>
      )
    },
    {
      name: "Contact",
      selector: (row: Visitor) => row.phone,
      sortable: true,
      minWidth: "150px",
      cell: (row: Visitor) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium flex items-center gap-2 text-foreground/80"><Phone className="w-3.5 h-3.5 text-primary" /> {row.phone}</span>
        </div>
      )
    },
    {
        name: "Last Visit",
        selector: (row: Visitor) => row.last_visit_date || "N/A",
        sortable: true,
        width: "140px",
        cell: (row: Visitor) => (
          <div className="flex flex-col gap-0.5">
            <span className={`text-xs font-bold ${row.last_visit_date ? 'text-primary' : 'text-muted-foreground/60 italic'}`}>
              {row.last_visit_date || "Never visited"}
            </span>
            {row.visits && row.visits.length > 0 && (
                <span className="text-[10px] text-muted-foreground font-medium">Total: {row.visits.length} times</span>
            )}
          </div>
        )
    },
    {
        name: "Address",
        selector: (row: Visitor) => row.address,
        sortable: true,
        wrap: true,
        minWidth: "180px",
        cell: (row: Visitor) => (
          <span className="text-sm text-muted-foreground line-clamp-2">{row.address}</span>
        )
    },
    {
      name: "Actions",
      width: "140px",
      cell: (row: Visitor) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openVisitsModal(row)} className="p-2.5 hover:bg-primary/10 text-primary rounded-xl transition-all" title="Visit History"><History className="w-4.5 h-4.5" /></button>
          <button onClick={() => openModal(row)} className="p-2.5 hover:bg-primary/10 text-primary rounded-xl transition-all" title="Edit"><Edit2 className="w-4.5 h-4.5" /></button>
          <button onClick={() => handleDeleteVisitor(row.id)} className="p-2.5 hover:bg-destructive/10 text-destructive rounded-xl transition-all" title="Delete"><Trash2 className="w-4.5 h-4.5" /></button>
        </div>
      )
    }
  ];

  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phone.includes(searchTerm) ||
    v.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customStyles: TableStyles = {
    headRow: { style: { borderTopStyle: 'solid' as any, borderTopWidth: '1px', borderTopColor: 'var(--border)', backgroundColor: 'var(--muted)', minHeight: '52px' } },
    pagination: { style: { borderTopStyle: 'solid' as any, borderTopWidth: '1px', borderTopColor: 'var(--border)' } },
    rows: {
        style: {
            minHeight: '72px',
            '&:hover': {
                backgroundColor: 'var(--muted)/10',
            }
        }
    }
  };

  return (
    <Layout>
      <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto overflow-hidden animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <UserPlus className="w-10 h-10 text-primary" />
              Visitors Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Keep track of guests and visitors at the Gau Shala.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Add Visitor
          </button>
        </div>

        <div className="card-elevated p-0 overflow-hidden border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl rounded-2xl">
          <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
            </div>
            <div className="px-4 py-2 bg-background border border-border rounded-xl text-sm font-bold text-muted-foreground">
                Total Registered: <span className="text-primary">{visitors.length}</span>
            </div>
          </div>
          
          <div className="overflow-x-auto w-full">
            <DataTable
              columns={columns}
              data={filteredVisitors}
              pagination
              responsive
              highlightOnHover
              pointerOnHover
              customStyles={customStyles}
              progressPending={isLoading}
              progressComponent={
                <div className="p-12 flex items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span>Loading visitors...</span>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-background border border-border rounded-2xl shadow-2xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-primary" />
                    {editingVisitor ? "Edit Visitor Info" : "Register New Visitor"}
                  </h2>
                  <button onClick={closeModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 tracking-wide text-foreground/80"><User className="w-4 h-4 text-primary" /> Full Name</label>
                      <input {...register("name", { required: "Name is required" })} placeholder="Enter name" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                      {errors.name && <p className="text-xs text-destructive mt-1 font-bold">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 tracking-wide text-foreground/80"><Phone className="w-4 h-4 text-primary" /> Phone Number</label>
                      <input {...register("phone", { required: "Phone is required" })} placeholder="Enter phone" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 tracking-wide text-foreground/80"><Mail className="w-4 h-4 text-primary" /> Email Address</label>
                      <input type="email" {...register("email")} placeholder="Optional@example.com" className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 tracking-wide text-foreground/80"><Calendar className="w-4 h-4 text-primary" /> Date of Birth</label>
                      <input type="date" {...register("dob")} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 tracking-wide text-foreground/80"><MapPin className="w-4 h-4 text-primary" /> Permanent Address</label>
                    <textarea {...register("address", { required: "Address is required" })} placeholder="City, State, Country..." className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all h-24 resize-none" />
                  </div>

                  {!editingVisitor && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <h3 className="text-sm font-bold text-primary mb-3">Initial Visit Details (Optional)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                             <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 text-foreground/80"><Calendar className="w-4 h-4 text-primary" /> Visit Date</label>
                             <input type="date" {...register("visit_date")} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                          </div>
                          <div>
                             <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 text-foreground/80"><Clock className="w-4 h-4 text-primary" /> Visit Time</label>
                             <input type="time" {...register("visit_time")} className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                          </div>
                        </div>
                        <div className="mt-4">
                           <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 text-foreground/80"><ClipboardList className="w-4 h-4 text-primary" /> Visit Notes</label>
                           <textarea {...register("notes")} placeholder="Enter visit details or purpose..." className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all h-20 resize-none" />
                        </div>
                      </div>
                  )}

                  <div className="flex gap-3 pt-6">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-muted font-bold transition-all">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
                        {editingVisitor ? "Save Changes" : "Register Visitor"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Visits/History Modal */}
      <AnimatePresence>
        {isVisitsModalOpen && selectedVisitor && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeVisitsModal} className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <History className="w-6 h-6 text-primary" /> 
                        Visit History
                    </h2>
                    <p className="text-sm text-muted-foreground">Managing visits for <span className="font-black text-primary">{selectedVisitor.name}</span></p>
                  </div>
                  <button onClick={closeVisitsModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar mb-6">
                   {/* Record New Visit UI */}
                   <form onSubmit={handleAddVisit} className="p-4 bg-primary/5 rounded-2xl border border-primary/10 border-dashed space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5" /> Record New Visit
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Visit Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                        <input 
                                            type="date" 
                                            value={visitDate}
                                            onChange={(e) => setVisitDate(e.target.value)}
                                            required
                                            className="w-full pl-8 pr-2 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Visit Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                        <input 
                                            type="time" 
                                            value={visitTime}
                                            onChange={(e) => setVisitTime(e.target.value)}
                                            className="w-full pl-8 pr-2 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                className="sm:self-end px-6 py-2 bg-primary text-primary-foreground font-black rounded-xl text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                            >
                                Log Visit
                            </button>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Notes / Purpose</label>
                            <div className="relative">
                                <ClipboardList className="absolute left-3 top-3 w-4 h-4 text-primary" />
                                <textarea 
                                    placeholder="Enter visit details or purpose..."
                                    value={visitNotes}
                                    onChange={(e) => setVisitNotes(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none h-20 resize-none"
                                />
                            </div>
                        </div>
                   </form>

                   {/* Past Visits List */}
                   <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> Past Recorded Visits
                        </h3>
                        {selectedVisitor.visits && selectedVisitor.visits.length > 0 ? (
                            <div className="space-y-3">
                                {selectedVisitor.visits.map((visit, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={visit.id} 
                                        className="p-4 bg-muted/20 border border-border rounded-xl flex flex-col sm:flex-row gap-3 relative transition-all hover:bg-muted/30"
                                    >
                                        <div className="flex flex-col gap-1 sm:w-32 shrink-0">
                                            <span className="text-xs font-black text-foreground">{visit.visit_date} {visit.visit_time && `at ${visit.visit_time.substring(0,5)}`}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Visit #{selectedVisitor.visits.length - idx}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-foreground/80 leading-relaxed italic">
                                                {visit.notes || <span className="text-muted-foreground/50">No additional notes recorded for this visit.</span>}
                                            </p>
                                        </div>
                                        <div className="absolute top-4 right-4 text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-background border border-border rounded-full">
                                            Logged: {new Date(visit.created_at).toLocaleDateString()}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-muted/10 border-2 border-dashed border-border rounded-2xl">
                                <Clock className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                <p className="text-muted-foreground font-medium">No prior visit history found for this individual.</p>
                            </div>
                        )}
                   </div>
                </div>

                <button 
                  onClick={closeVisitsModal} 
                  className="w-full py-3 rounded-xl border-2 border-border font-black text-foreground hover:bg-muted transition-all uppercase tracking-widest text-xs"
                >
                    Close History
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default VisitorsPage;
