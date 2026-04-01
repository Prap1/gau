import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import DataTable, { TableStyles } from "react-data-table-component";
import { useForm } from "react-hook-form";
import { 
  Plus, Edit2, Trash2, X, Search, Loader2, Calendar, 
  CreditCard, Hash, User, Package, Pill as PillIcon,
  Activity, History, Phone, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchMedicines, addMedicine, updateMedicine, deleteMedicine, clearMedicineMessage, clearMedicineError } from "@/redux/medicineSlice";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface MedicineUsage {
  id: string | number;
  usage_date: string;
  usage_type: string;
  quantity: number;
  notes: string;
}

interface Medicine {
  id: string;
  medicine_name: string;
  number: string;
  stock: number;
  expiry_date: string;
  store_phone_number: string;
  date_time: string;
  bill_number: string;
  stia_name: string;
  total_price: number;
  paid: number;
  usages?: MedicineUsage[];
}

interface MedicineFormData {
  medicine_name: string;
  number: string;
  stock: number;
  expiry_date: string;
  store_phone_number: string;
  date_time: string;
  bill_number: string;
  stia_name: string;
  total_price: number;
  paid: number;
}

const MedicineManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { medicines, loading: isLoading, error, message } = useSelector((state: RootState) => state.medicine);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedMedicineForHistory, setSelectedMedicineForHistory] = useState<Medicine | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MedicineFormData>();

  useEffect(() => {
    dispatch(fetchMedicines());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearMedicineMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearMedicineError());
    }
  }, [message, error, dispatch]);

  const openModal = (medicine?: Medicine) => {
    if (medicine) {
      setEditingMedicine(medicine);
      setValue("medicine_name", medicine.medicine_name);
      setValue("number", medicine.number);
      setValue("stock", medicine.stock);
      setValue("expiry_date", medicine.expiry_date || "");
      setValue("store_phone_number", medicine.store_phone_number || "");
      const date = new Date(medicine.date_time);
      const formattedDate = date.toISOString().slice(0, 16);
      setValue("date_time", formattedDate);
      setValue("bill_number", medicine.bill_number);
      setValue("stia_name", medicine.stia_name);
      setValue("total_price", medicine.total_price);
      setValue("paid", medicine.paid);
    } else {
      setEditingMedicine(null);
      reset({
        date_time: new Date().toISOString().slice(0, 16),
        stock: 0,
        expiry_date: "",
        store_phone_number: "",
        medicine_name: "",
        number: "",
        bill_number: "",
        stia_name: "",
        total_price: 0,
        paid: 0
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMedicine(null);
    reset();
  };

  const openHistoryModal = (medicine: Medicine) => {
    setSelectedMedicineForHistory(medicine);
    setIsHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedMedicineForHistory(null);
  };

  const onSubmit = async (data: MedicineFormData) => {
    if (editingMedicine) {
      dispatch(updateMedicine({ id: editingMedicine.id, data }));
    } else {
      dispatch(addMedicine(data));
    }
    closeModal();
  };

  const handleDeleteMedicine = async (id: string) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This medicine record will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      dispatch(deleteMedicine(id));
      MySwal.fire({
        title: "Deleted!",
        text: "Medicine record removed successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const columns = [
    {
      name: "Medicine",
      selector: (row: Medicine) => row.medicine_name,
      sortable: true,
      minWidth: "200px",
      cell: (row: Medicine) => (
        <div className="flex flex-col py-2">
          <span className="font-bold text-primary text-base truncate">{row.medicine_name}</span>
        </div>
      )
    },
    {
      name: "Stock Left",
      selector: (row: Medicine) => row.stock,
      sortable: true,
      width: "110px",
      cell: (row: Medicine) => (
        <span className={`px-3 py-1 rounded-xl font-black transition-all ${
          row.stock <= 5 ? "animate-blink-red border-2 border-red-500 shadow-lg shadow-red-500/50" :
          row.stock > 10 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}>
          {row.stock}
        </span>
      )
    },
    {
      name: "Entry Date",
      selector: (row: Medicine) => row.date_time,
      sortable: true,
      width: "130px",
      cell: (row: Medicine) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground">{new Date(row.date_time).toLocaleDateString()}</span>
          <span className="text-[10px] text-muted-foreground">{new Date(row.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      name: "Bill / Store",
      selector: (row: Medicine) => row.bill_number,
      sortable: true,
      minWidth: "200px",
      cell: (row: Medicine) => (
        <div className="flex flex-col py-1">
          <span className="text-sm font-bold text-foreground">#{row.bill_number} - {row.stia_name}</span>
          {row.store_phone_number && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
              <Phone className="w-3 h-3" /> {row.store_phone_number}
            </span>
          )}
        </div>
      )
    },
    {
      name: "Expiry Date",
      selector: (row: Medicine) => row.expiry_date || "-",
      sortable: true,
      width: "130px",
      cell: (row: Medicine) => {
        if (!row.expiry_date) return <span className="text-muted-foreground text-xs italic">Not Set</span>;
        const isExpired = new Date(row.expiry_date) < new Date();
        return (
          <div className="flex flex-col">
            <span className={`text-xs font-bold ${isExpired ? "text-red-600" : "text-emerald-600"}`}>
                {new Date(row.expiry_date).toLocaleDateString()}
            </span>
            {isExpired && <span className="text-[8px] font-black uppercase text-red-500">Expired</span>}
          </div>
        );
      }
    },
    {
      name: "Payment",
      selector: (row: Medicine) => row.paid,
      sortable: true,
      minWidth: "150px",
      cell: (row: Medicine) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">₹{row.paid} / ₹{row.total_price}</span>
          <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
             <div 
                className={`h-full transition-all ${Number(row.paid) >= Number(row.total_price) ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                style={{ width: `${Math.min((row.paid / row.total_price) * 100, 100)}%` }}
             />
          </div>
        </div>
      )
    },
    {
      name: "Action",
      width: "140px",
      cell: (row: Medicine) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openHistoryModal(row)} className="p-2 hover:bg-orange-100 text-orange-600 rounded-xl transition-colors"><History className="w-4 h-4" /></button>
          <button onClick={() => openModal(row)} className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => handleDeleteMedicine(row.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.bill_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const medDate = new Date(medicine.date_time);
    const matchesMonth = selectedMonth === "all" || (medDate.getMonth() + 1).toString() === selectedMonth;
    const matchesYear = selectedYear === "all" || medDate.getFullYear().toString() === selectedYear;

    return matchesSearch && matchesMonth && matchesYear;
  });

  const summaryStats = filteredMedicines.reduce((acc, med) => {
    acc.totalStock += Number(med.stock);
    acc.totalInvestment += Number(med.total_price);
    acc.totalPaid += Number(med.paid);
    return acc;
  }, { totalStock: 0, totalInvestment: 0, totalPaid: 0 });

  const outstanding = summaryStats.totalInvestment - summaryStats.totalPaid;

  const availableYears = Array.from(new Set(medicines.map(m => new Date(m.date_time).getFullYear()))).sort((a, b) => b - a);
  const months = [
    { value: "1", label: "January" }, { value: "2", label: "February" }, { value: "3", label: "March" },
    { value: "4", label: "April" }, { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" }, { value: "9", label: "September" },
    { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" }
  ];

  const customStyles: TableStyles = {
    header: { style: { minHeight: '56px' } },
    headRow: { style: { borderTopStyle: 'solid' as any, borderTopWidth: '1px', borderTopColor: 'var(--border)', backgroundColor: 'var(--muted)' } },
    headCells: { style: { '&:not(:last-child)': { borderRightStyle: 'solid', borderRightWidth: '1px', borderRightColor: 'var(--border)' }, color: 'var(--foreground)', fontWeight: 'bold' } },
    cells: { style: { '&:not(:last-child)': { borderRightStyle: 'solid', borderRightWidth: '1px', borderRightColor: 'var(--border)' }, color: 'var(--foreground)' } },
    pagination: { style: { borderTopStyle: 'solid' as any, borderTopWidth: '1px', borderTopColor: 'var(--border)' } },
  };

  return (
    <Layout>
      <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="overflow-hidden">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <PillIcon className="w-10 h-10 text-primary" />
              Medicine Inventory
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage medicine stocks, bills, and track usage incidents.</p>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={() => openModal()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                Add New Stock
              </button>
          </div>
        </div>

        {/* Monthly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg"><Package className="w-6 h-6" /></div>
                <div>
                    <h4 className="text-sm font-bold text-blue-700 uppercase tracking-widest">Total Stock</h4>
                    <p className="text-2xl font-black text-foreground">{summaryStats.totalStock}</p>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg"><CreditCard className="w-6 h-6" /></div>
                <div>
                    <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Total Investment</h4>
                    <p className="text-2xl font-black text-foreground">₹{summaryStats.totalInvestment.toFixed(2)}</p>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-red-500 text-white rounded-xl shadow-lg"><Activity className="w-6 h-6" /></div>
                <div>
                    <h4 className="text-sm font-bold text-red-700 uppercase tracking-widest">Outstanding</h4>
                    <p className="text-2xl font-black text-foreground">₹{outstanding.toFixed(2)}</p>
                </div>
            </motion.div>
        </div>

        <div className="card-elevated p-0 overflow-hidden border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl rounded-2xl">
          <div className="p-4 border-b border-border bg-muted/20">
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full justify-between">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search medicine..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">All Months</option>
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">All Years</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>
          </div>
          
          <div className="overflow-x-auto w-full">
            <DataTable
              columns={columns}
              data={filteredMedicines}
              pagination
              responsive
              highlightOnHover
              pointerOnHover
              customStyles={customStyles}
              progressPending={isLoading}
              progressComponent={
                <div className="p-12 flex items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span>Loading inventory...</span>
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
                  <h2 className="text-xl font-bold text-foreground">{editingMedicine ? "Edit Medicine Record" : "Add New Stock"}</h2>
                  <button onClick={closeModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><PillIcon className="w-4 h-4 text-primary" /> Medicine Name</label>
                    <input {...register("medicine_name", { required: "Required" })} placeholder="e.g. Paracetamol" className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Stock</label>
                      <input type="number" {...register("stock", { required: true })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Entry Date</label>
                      <input type="datetime-local" {...register("date_time", { required: true })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Expiry Date <span className="text-xs font-normal text-muted-foreground">(optional)</span></label>
                      <input type="date" {...register("expiry_date")} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> Store Phone</label>
                      <input {...register("store_phone_number")} placeholder="e.g. +91 987..." className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><Hash className="w-4 h-4 text-primary" /> Bill Number</label>
                      <input {...register("bill_number", { required: true })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Store/Staff</label>
                      <input {...register("stia_name", { required: true })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Total Price</label>
                      <input type="number" step="0.01" {...register("total_price", { required: true })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Paid</label>
                      <input type="number" step="0.01" {...register("paid", { required: true })} className="w-full px-4 py-2 rounded-lg border border-border bg-background" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 rounded-lg border border-border">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold">Save</button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal (Incidents) */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedMedicineForHistory && (
          <div className="fixed inset-0 z-[130] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeHistoryModal} className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <History className="w-6 h-6 text-primary" />
                      Usage History: {selectedMedicineForHistory.medicine_name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Showing all recorded usage, defects, and expiry events.</p>
                  </div>
                  <button onClick={closeHistoryModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {!selectedMedicineForHistory.usages || selectedMedicineForHistory.usages.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                      <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground italic">No usage incidents recorded for this medicine.</p>
                    </div>
                  ) : (
                    selectedMedicineForHistory.usages.map((usage) => (
                      <div key={usage.id} className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/30 bg-muted/10 transition-colors">
                        <div className={`p-2 rounded-lg mt-1 ${
                          usage.usage_type === 'Used' ? 'bg-blue-100 text-blue-600' :
                          usage.usage_type === 'Defect' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Activity className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-foreground capitalize">{usage.usage_type}</span>
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(usage.usage_date).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-sm font-bold text-primary flex items-center gap-1">
                              <Hash className="w-3 h-3" /> Quantity: -{usage.quantity}
                            </span>
                          </div>
                          {usage.notes && (
                            <div className="text-sm text-muted-foreground bg-background/50 p-2 rounded-md border border-border/50 flex items-start gap-2">
                              <Info className="w-3 h-3 mt-1 flex-shrink-0" />
                              <p className="italic">{usage.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border flex justify-end">
                  <button onClick={closeHistoryModal} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all">
                    Close Details
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default MedicineManagement;
