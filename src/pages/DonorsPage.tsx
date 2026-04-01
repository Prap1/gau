import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import DataTable, { TableStyles } from "react-data-table-component";
import { useForm } from "react-hook-form";
import { 
  Plus, Edit2, Trash2, X, Search, Loader2, Calendar, 
  User, Phone, Mail, Heart, Briefcase, IndianRupee, HelpCircle, MapPin, 
  History, Eye, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { 
  fetchDonors, addDonation, updateDonor, deleteDonor, 
  clearDonorMessage, clearDonorError, Donor, Donation 
} from "@/redux/donorSlice";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface DonationFormData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  donation_type: "Money" | "Material";
  amount: number | "";
  material_details: string;
  material_quantity: string;
  is_visitor?: boolean;
}

const DonorsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { donors, loading: isLoading, error, message } = useSelector((state: RootState) => state.donor);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDonorForHistory, setSelectedDonorForHistory] = useState<Donor | null>(null);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DonationFormData>();
  const watchedDonationType = watch("donation_type");

  useEffect(() => {
    dispatch(fetchDonors());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearDonorMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearDonorError());
    }
  }, [message, error, dispatch]);

  const openModal = (donor?: Donor) => {
    if (donor) {
      setEditingDonor(donor);
      setValue("name", donor.name);
      setValue("email", donor.email || "");
      setValue("phone", donor.phone);
      setValue("dob", donor.dob || "");
      setValue("address", donor.address || "");
      setValue("donation_type", "Money"); // Default for edits/new donations
    } else {
      setEditingDonor(null);
      reset({
          name: "",
          email: "",
          phone: "",
          dob: "",
          address: "",
          donation_type: "Money",
          amount: "",
          material_details: "",
          material_quantity: "",
          is_visitor: false
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDonor(null);
    reset();
  };

  const onSubmit = async (data: DonationFormData) => {
    if (editingDonor && !data.amount && !data.material_details) {
        // Just updating donor profile
        dispatch(updateDonor({ 
            id: editingDonor.id, 
            data: { 
                name: data.name, 
                email: data.email, 
                phone: data.phone, 
                dob: data.dob, 
                address: data.address 
            } 
        }));
    } else {
        // Logging a new donation (will find/create donor in backend)
        const formattedData = {
            ...data,
            amount: data.donation_type === "Money" ? Number(data.amount) : null,
            material_details: data.donation_type === "Material" ? data.material_details : null,
            material_quantity: data.donation_type === "Material" ? data.material_quantity : null,
            is_visitor: data.is_visitor,
        };
        dispatch(addDonation(formattedData));
    }
    closeModal();
  };

  const handleDeleteDonor = async (id: string) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Delete this donor and ALL their donation history? This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete everything!",
    });

    if (result.isConfirmed) {
      dispatch(deleteDonor(id));
      if (selectedDonorForHistory?.id === id) setSelectedDonorForHistory(null);
      MySwal.fire({
        title: "Deleted!",
        text: "Donor and history removed successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const columns = [
    {
      name: "Donor Profile",
      selector: (row: Donor) => row.name,
      sortable: true,
      minWidth: "220px",
      cell: (row: Donor) => (
        <div className="flex items-center gap-3 py-3">
          <div className="p-2 bg-pink-500/10 rounded-full text-pink-500"><Heart className="w-5 h-5 flex-shrink-0" /></div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{row.name}</span>
            <span className="text-xs text-muted-foreground">{row.phone}</span>
          </div>
        </div>
      )
    },
    {
        name: "Total Contributions",
        selector: (row: Donor) => row.total_money,
        sortable: true,
        minWidth: "180px",
        cell: (row: Donor) => (
          <div className="flex flex-col">
            {row.total_money > 0 ? (
              <span className="text-emerald-600 font-black text-lg">₹{row.total_money.toLocaleString()}</span>
            ) : (
              <span className="text-blue-600 font-bold text-sm bg-blue-50 px-2 py-0.5 rounded border border-blue-100 line-clamp-1">
                {row.material_summary || 'No contribution'}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground uppercase font-bold">{row.donations.length} total entries</span>
          </div>
        )
    },
    {
      name: "Last Contribution",
      selector: (row: Donor) => row.last_donation_date || "Never",
      sortable: true,
      cell: (row: Donor) => (
        <span className="text-sm font-medium">{row.last_donation_date ? new Date(row.last_donation_date).toLocaleDateString() : "N/A"}</span>
      )
    },
    {
      name: "Actions",
      width: "180px",
      cell: (row: Donor) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setSelectedDonorForHistory(row)} className="p-2 hover:bg-muted text-muted-foreground rounded-lg transition-colors border border-border" title="History"><History className="w-4 h-4" /></button>
          <button onClick={() => openModal(row)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-border" title="New Donation / Edit Profile"><Plus className="w-4 h-4" /></button>
          <button onClick={() => handleDeleteDonor(row.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors border border-border" title="Delete Account"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  const filteredDonors = donors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm)
  );

  const customStyles: TableStyles = {
    headRow: { style: { backgroundColor: 'var(--muted)', minHeight: '56px' } },
  };

  return (
    <Layout>
      <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Heart className="w-10 h-10 text-pink-500 fill-pink-500/20" />
              Donor Directory
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Unified records for contributors and their donation history.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            New Donation
          </button>
        </div>

        <div className="card-elevated p-0 overflow-hidden border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl rounded-2xl">
          <div className="p-4 border-b border-border bg-muted/20">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background"
                />
            </div>
          </div>
          
          <div className="overflow-x-auto w-full">
            <DataTable
              columns={columns}
              data={filteredDonors}
              pagination
              responsive
              highlightOnHover
              pointerOnHover
              customStyles={customStyles}
              progressPending={isLoading}
              progressComponent={
                <div className="p-12 flex items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span>Loading donors...</span>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Selected Donor History Modal */}
      <AnimatePresence>
        {selectedDonorForHistory && (
            <div className="fixed inset-0 z-[110] overflow-y-auto flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDonorForHistory(null)} className="fixed inset-0 bg-background/90 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-4xl bg-background border border-border rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-foreground">{selectedDonorForHistory.name}</h2>
                            <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1"><Phone className="w-4 h-4" /> {selectedDonorForHistory.phone} | <MapPin className="w-4 h-4" /> {selectedDonorForHistory.address || "No address"}</p>
                        </div>
                        <button onClick={() => setSelectedDonorForHistory(null)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Total Wealth Contributed</p>
                                <p className="text-3xl font-black text-emerald-600 mt-1">₹{selectedDonorForHistory.total_money.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Contribution Occurrences</p>
                                <p className="text-3xl font-black text-primary mt-1">{selectedDonorForHistory.donations.length}</p>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Full Contribution History</h3>
                        <div className="space-y-3">
                            {selectedDonorForHistory.donations.map((d: Donation) => (
                                <div key={d.id} className="p-4 border border-border rounded-xl bg-muted/10 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${d.donation_type === 'Money' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {d.donation_type === 'Money' ? <IndianRupee className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            {d.donation_type === 'Money' ? (
                                                <p className="font-bold text-emerald-600">Donated ₹{d.amount?.toLocaleString()}</p>
                                            ) : (
                                                <div>
                                                    <p className="font-bold text-blue-600">{d.material_details}</p>
                                                    <p className="text-xs text-muted-foreground italic">Qty: {d.material_quantity}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black">Logged by {d.added_by_name || 'Admin'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Log Donation / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-background border border-border rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">{editingDonor ? `Add Contribution for ${editingDonor.name}` : "Log New Donation"}</h2>
                  <button onClick={closeModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 tracking-wide text-foreground/80"><User className="w-4 h-4 text-primary" /> Donor Name</label>
                      <input {...register("name", { required: "Name is required" })} placeholder="Full name" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 tracking-wide text-foreground/80"><Phone className="w-4 h-4 text-primary" /> Phone Number</label>
                      <input {...register("phone", { required: "Phone is required" })} placeholder="Phone/Mobile" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 tracking-wide text-foreground/80"><Mail className="w-4 h-4 text-primary" /> Email</label>
                      <input type="email" {...register("email")} placeholder="Optional email" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 tracking-wide text-foreground/80"><Calendar className="w-4 h-4 text-primary" /> Date of Birth</label>
                      <input type="date" {...register("dob")} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-bold mb-1.5 flex items-center gap-2 tracking-wide text-foreground/80"><MapPin className="w-4 h-4 text-primary" /> Address</label>
                        <textarea {...register("address")} placeholder="Permanent address..." className="w-full px-4 py-2 rounded-lg border border-border bg-background resize-none h-16" />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2 bg-background p-2 rounded-lg border border-border mt-2">
                        <input 
                            type="checkbox" 
                            id="is_visitor" 
                            {...register("is_visitor")} 
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="is_visitor" className="text-sm font-bold text-foreground cursor-pointer">
                            Mark as Visitor (Log a visit record)
                        </label>
                    </div>
                  </div>

                  <div className="p-4 bg-pink-500/5 border border-pink-500/10 rounded-xl space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 flex items-center gap-2 uppercase tracking-tighter text-pink-700"> CONTRIBUTION DETAILS</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                            type="button" 
                            onClick={() => setValue("donation_type", "Money")}
                            className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${watchedDonationType === 'Money' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-background border-border'}`}
                        >
                            <IndianRupee className="w-4 h-4" /> Money
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setValue("donation_type", "Material")}
                            className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${watchedDonationType === 'Material' ? 'bg-blue-500 text-white border-blue-600' : 'bg-background border-border'}`}
                        >
                            <HelpCircle className="w-4 h-4" /> Material
                        </button>
                        <input type="hidden" {...register("donation_type", { required: true })} />
                      </div>
                    </div>

                    {watchedDonationType === "Money" ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <label className="block text-sm font-bold mb-1.5">Investment / Donation Amount (₹)</label>
                        <input type="number" {...register("amount")} placeholder="Enter amount..." className="w-full px-4 py-2 rounded-lg border border-border bg-background text-lg font-black text-emerald-600" />
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1.5">Material Name</label>
                                <input {...register("material_details")} placeholder="e.g. Rice, Medicine..." className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1.5">Quantity</label>
                                <input {...register("material_quantity")} placeholder="e.g. 10kg, 5 units..." className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                            </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-muted font-bold transition-all">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
                        {editingDonor ? "Update & Log" : "Log Contribution"}
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

export default DonorsPage;
