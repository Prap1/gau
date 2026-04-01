import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { fetchMedicineUsages, addMedicineUsage, updateMedicineUsage, deleteMedicineUsage, clearUsageMessage, clearUsageError } from "../redux/medicineUsageSlice";
import { fetchMedicines } from "../redux/medicineSlice";
import DataTable from "react-data-table-component";
import { 
  Plus, Search, Edit2, Trash2, X, PillIcon, 
  Hash, Calendar, Package, Info, Loader2,
  AlertTriangle, History, ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface MedicineUsage {
  id: string;
  medicine: string;
  medicine_name: string;
  batch_number: string;
  quantity: number;
  usage_date: string;
  usage_type: "Used" | "Defect" | "Expired";
  notes: string;
}

interface UsageFormData {
  medicine: string;
  quantity: number;
  usage_date: string;
  usage_type: "Used" | "Defect" | "Expired";
  notes: string;
}

const MedicineUsagePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { usages, loading, error, message } = useSelector((state: RootState) => state.medicineUsage);
  const { medicines } = useSelector((state: RootState) => state.medicine);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsage, setEditingUsage] = useState<MedicineUsage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UsageFormData>();

  useEffect(() => {
    dispatch(fetchMedicineUsages());
    dispatch(fetchMedicines());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearUsageMessage());
      setIsModalOpen(false);
    }
    if (error) {
      toast.error(error);
      dispatch(clearUsageError());
    }
  }, [message, error, dispatch]);

  const openModal = (usage?: MedicineUsage) => {
    if (usage) {
      setEditingUsage(usage);
      setValue("medicine", usage.medicine);
      setValue("quantity", usage.quantity);
      // Format datetime-local input
      const date = new Date(usage.usage_date);
      const formattedDate = date.toISOString().slice(0, 16);
      setValue("usage_date", formattedDate);
      setValue("usage_type", usage.usage_type);
      setValue("notes", usage.notes);
    } else {
      setEditingUsage(null);
      reset({
        usage_date: new Date().toISOString().slice(0, 16),
        usage_type: "Used",
        quantity: 1,
        notes: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUsage(null);
  };

  const onSubmit = (data: UsageFormData) => {
    // Robust search for the selected medicine item
    const selectedMedicine = medicines.find(m => String(m.id) === String(data.medicine));

    if (selectedMedicine) {
      const remainingStock = selectedMedicine.stock - Number(data.quantity);
      if (remainingStock <= 5) {
        toast.warning(`⚠️ Low Stock Alert: Only ${remainingStock} items left!`);
      }
    }

    if (editingUsage) {
      dispatch(updateMedicineUsage({ id: editingUsage.id, data }));
    } else {
      dispatch(addMedicineUsage(data));
      // Refresh medicines to show updated stock
      setTimeout(() => dispatch(fetchMedicines()), 500);
    }
  };

  const handleDeleteUsage = async (id: string) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This record will be permanently deleted and stock will be restored!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      dispatch(deleteMedicineUsage(id));
      setTimeout(() => dispatch(fetchMedicines()), 500);
      MySwal.fire({
        title: "Deleted!",
        text: "Usage record removed successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const filteredUsages = usages.filter(u => 
    u.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: "Medicine",
      selector: (row: MedicineUsage) => row.medicine_name,
      sortable: true,
      cell: (row: MedicineUsage) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{row.medicine_name}</span>
        </div>
      )
    },
    {
      name: "Quantity",
      selector: (row: MedicineUsage) => row.quantity,
      sortable: true,
      minWidth: "100px",
      cell: (row: MedicineUsage) => (
        <span className="px-2 py-1 rounded-lg bg-orange-100 text-orange-700 font-bold">
          {row.quantity}
        </span>
      )
    },
    {
      name: "Type",
      selector: (row: MedicineUsage) => row.usage_type,
      sortable: true,
      cell: (row: MedicineUsage) => (
        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
          row.usage_type === "Used" ? "bg-blue-100 text-blue-700" : 
          row.usage_type === "Defect" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
        }`}>
          {row.usage_type}
        </span>
      )
    },
    {
      name: "Date",
      selector: (row: MedicineUsage) => new Date(row.usage_date).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: MedicineUsage) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openModal(row)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDeleteUsage(row.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }
  ];

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-primary" />
              Medicine Usage Tracker
            </h1>
            <p className="text-muted-foreground mt-1">Record daily usage, defects, or expired medicine.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Record Usage
          </button>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-muted/30">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search usage records..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredUsages}
              pagination
              highlightOnHover
              responsive
              progressPending={loading}
              progressComponent={
                <div className="p-12 flex items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span>Loading records...</span>
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
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl p-6 text-left"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    {editingUsage ? "Edit Usage Record" : "Record New Usage"}
                  </h2>
                  <button onClick={closeModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><PillIcon className="w-4 h-4 text-primary" /> Select Medicine</label>
                    <select 
                      {...register("medicine", { required: "Medicine is required" })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition"
                    >
                      <option value="">Choose a medicine...</option>
                      {medicines.map(m => (
                        <option key={m.id} value={m.id}>{m.medicine_name} (Stock: {m.stock})</option>
                      ))}
                    </select>
                    {errors.medicine && <p className="text-destructive text-xs mt-1">{errors.medicine.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Quantity</label>
                      <input 
                        type="number" 
                        {...register("quantity", { required: "Quantity is required", min: 1 })}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Usage Type</label>
                      <select 
                        {...register("usage_type", { required: "Type is required" })}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition"
                      >
                        <option value="Used">Used (Treatment)</option>
                        <option value="Defect">Defect (Damaged)</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Date & Time</label>
                    <input 
                      type="datetime-local" 
                      {...register("usage_date", { required: "Date is required" })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1.5 flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Notes</label>
                    <textarea 
                      {...register("notes")}
                      placeholder="Optional details..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-lg border border-border font-medium hover:bg-muted transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all">
                      {editingUsage ? "Update Record" : "Save Record"}
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

export default MedicineUsagePage;
