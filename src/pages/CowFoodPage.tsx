import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import DataTable, { TableStyles } from "react-data-table-component";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, X, Search, Wheat, Loader2, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchFoodStocks,
  addFoodStock,
  updateFoodStock,
  deleteFoodStock,
  clearInventoryMessage,
  clearInventoryError,
  FoodStock,
} from "@/redux/inventorySlice";

interface FoodFormData {
  food_name: string;
  quantity_kg: string;
  supplier: string;
  bill_number?: string;
  price_per_kg: string;
  total_amount?: string;
  purchase_date: string;
  notes: string;
}

const CowFoodPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { foodStocks, loading, error, message } = useSelector((state: RootState) => state.inventory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<FoodStock | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FoodFormData>();
  const watchedQuantity = watch("quantity_kg");
  const watchedPricePerKg = watch("price_per_kg");

  useEffect(() => {
    const qty = parseFloat(watchedQuantity || "0");
    const price = parseFloat(watchedPricePerKg || "0");
    if (!isNaN(qty) && !isNaN(price)) {
      setValue("total_amount", (qty * price).toFixed(2));
    }
  }, [watchedQuantity, watchedPricePerKg, setValue]);

  useEffect(() => {
    dispatch(fetchFoodStocks());
  }, [dispatch]);

  useEffect(() => {
    if (message) { toast.success(message); dispatch(clearInventoryMessage()); }
    if (error) { toast.error(error); dispatch(clearInventoryError()); }
  }, [message, error, dispatch]);

  const openModal = (stock?: FoodStock) => {
    if (stock) {
      setEditingStock(stock);
      setValue("food_name", stock.food_name);
      setValue("quantity_kg", stock.quantity_kg);
      setValue("supplier", stock.supplier || "");
      setValue("price_per_kg", stock.price_per_kg);
      setValue("bill_number", stock.bill_number || "");
      setValue("total_amount", stock.total_amount || "0");
      setValue("purchase_date", stock.purchase_date);
      setValue("notes", stock.notes || "");
    } else {
      setEditingStock(null);
      reset({ purchase_date: new Date().toISOString().split("T")[0] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingStock(null); reset(); };

  const onSubmit = (data: FoodFormData) => {
    if (editingStock) {
      dispatch(updateFoodStock({ id: editingStock.id, data }));
    } else {
      dispatch(addFoodStock(data));
    }
    closeModal();
  };

  const handleDelete = async (id: number) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "Delete this food stock entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      dispatch(deleteFoodStock(id));
      MySwal.fire({
        title: "Deleted!",
        text: "Stock record removed successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const filtered = foodStocks.filter(
    (f) =>
      f.food_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalKg = filtered.reduce((sum, f) => sum + parseFloat(f.quantity_kg || "0"), 0);

  const columns = [
    {
      name: "Food / Fodder",
      selector: (row: FoodStock) => row.food_name,
      sortable: true,
      minWidth: "160px",
      cell: (row: FoodStock) => (
        <div className="flex items-center gap-2 py-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center border border-amber-200 shrink-0">
            <Wheat className="w-4 h-4 text-amber-600" />
          </div>
          <span className="font-bold text-foreground">{row.food_name}</span>
        </div>
      ),
    },
    {
      name: "Quantity (kg)",
      selector: (row: FoodStock) => row.quantity_kg,
      sortable: true,
      minWidth: "130px",
      cell: (row: FoodStock) => (
        <span className="font-bold text-primary text-lg">{parseFloat(row.quantity_kg).toFixed(1)} <span className="text-xs text-muted-foreground font-normal">kg</span></span>
      ),
    },
    {
      name: "Supplier",
      selector: (row: FoodStock) => row.supplier || "—",
      sortable: true,
      minWidth: "140px",
      cell: (row: FoodStock) => <span className="text-muted-foreground">{row.supplier || "—"}</span>,
    },
    {
      name: "Rate (₹/kg)",
      selector: (row: FoodStock) => row.price_per_kg,
      sortable: true,
      minWidth: "110px",
      cell: (row: FoodStock) => <span className="font-medium">₹{parseFloat(row.price_per_kg).toFixed(2)}</span>,
    },
    {
      name: "Total (₹)",
      selector: (row: FoodStock) => row.total_amount || 0,
      sortable: true,
      minWidth: "110px",
      cell: (row: FoodStock) => <span className="font-bold text-emerald-600">₹{parseFloat(row.total_amount || "0").toFixed(2)}</span>,
    },
    {
      name: "Bill No",
      selector: (row: FoodStock) => row.bill_number || "—",
      sortable: true,
      minWidth: "120px",
      cell: (row: FoodStock) => <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{row.bill_number || "—"}</span>,
    },
    {
      name: "Purchase Date",
      selector: (row: FoodStock) => row.purchase_date,
      sortable: true,
      minWidth: "130px",
      hide: "sm" as any,
    },
    {
      name: "Actions",
      width: "100px",
      cell: (row: FoodStock) => (
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => openModal(row)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  const customStyles: TableStyles = {
    table: { style: { backgroundColor: "transparent" } },
    headRow: {
      style: {
        backgroundColor: "hsl(var(--muted) / 0.5)",
        borderBottom: "1px solid hsl(var(--border))",
        borderTopLeftRadius: "0.75rem",
        borderTopRightRadius: "0.75rem",
        minHeight: "48px",
      },
    },
    headCells: { style: { color: "hsl(var(--muted-foreground))", fontWeight: "bold", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" } },
    rows: {
      style: {
        backgroundColor: "transparent",
        borderBottomColor: "hsl(var(--border) / 0.5)",
        minHeight: "64px",
        "&:hover": { backgroundColor: "hsl(var(--muted) / 0.3)", transition: "all 0.2s" },
      },
    },
    cells: { style: { color: "hsl(var(--foreground))" } },
    pagination: { style: { backgroundColor: "transparent", borderTopColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" } },
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/80 backdrop-blur-xl p-6 rounded-2xl border border-border/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl border border-amber-200"><Wheat className="w-8 h-8 text-amber-600" /></div>
              Cow Food Stocks
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">Manage fodder, feed, and food inventory for the sanctuary</p>
          </div>
          <button onClick={() => openModal()} className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 flex items-center justify-center gap-2 relative z-10">
            <Plus className="w-5 h-5" />
            Add Stock
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 p-5 shadow-lg">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Entries</p>
            <p className="text-4xl font-black text-primary mt-1">{filtered.length}</p>
          </div>
          <div className="bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 p-5 shadow-lg">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Stock (kg)</p>
            <p className="text-4xl font-black text-amber-600 mt-1">{totalKg.toFixed(1)}</p>
          </div>
        </div>

        {/* Table */}
        <div className="border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/20 border-b border-border/50">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input type="text" placeholder="Search food or supplier..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm" />
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filtered}
            customStyles={customStyles}
            pagination
            highlightOnHover
            pointerOnHover
            progressPending={loading}
            progressComponent={<div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
            noDataComponent={
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-2 border border-amber-100">
                  <Package className="w-8 h-8 text-amber-400" />
                </div>
                <p className="font-semibold text-lg">No food stock records</p>
                <p className="text-sm">Add your first stock entry to get started.</p>
              </div>
            }
          />
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-lg border border-amber-200"><Wheat className="w-5 h-5 text-amber-600" /></div>
                    {editingStock ? "Edit Stock Entry" : "Add Food Stock"}
                  </h2>
                  <button onClick={closeModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1.5">Food / Fodder Name</label>
                    <input {...register("food_name", { required: "Food name is required" })} placeholder="e.g., Hay, Silage, Wheat Bran" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                    {errors.food_name && <p className="text-xs text-destructive mt-1">{errors.food_name.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5">Quantity (kg)</label>
                      <input {...register("quantity_kg", { required: "Quantity is required", min: { value: 0, message: "Must be positive" } })} type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                      {errors.quantity_kg && <p className="text-xs text-destructive mt-1">{errors.quantity_kg.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5">Rate (₹/kg)</label>
                      <input {...register("price_per_kg", { required: "Rate is required" })} type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                      {errors.price_per_kg && <p className="text-xs text-destructive mt-1">{errors.price_per_kg.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5">Total Amount (₹)</label>
                      <input {...register("total_amount")} type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted/50 text-foreground focus:outline-none cursor-not-allowed" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5">Bill Number</label>
                      <input {...register("bill_number")} placeholder="Bill #" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5">Supplier</label>
                      <input {...register("supplier")} placeholder="Supplier name" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1.5">Purchase Date</label>
                      <input {...register("purchase_date", { required: "Date is required" })} type="date" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                      {errors.purchase_date && <p className="text-xs text-destructive mt-1">{errors.purchase_date.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-1.5">Notes</label>
                    <textarea {...register("notes")} rows={3} placeholder="Any additional notes..." className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none" />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border/50">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-border font-bold text-foreground hover:bg-muted transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingStock ? "Save Changes" : "Add Stock")}
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

export default CowFoodPage;
