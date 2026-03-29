import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import DataTable, { TableStyles } from "react-data-table-component";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, X, Eye,Search, Loader2, User, Hash, Calendar, MapPin, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/redux/api";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface Cow {
  id: string;
  caller_of_rescue: string;
  caller_of_rescue_number: string;
  rescuer_name: string;
  gender: "Male" | "Female";
  breed: string;
  token_no: string;
  place_of_rescue: string;
  admission_date: string;
  diseases: string;
  symptoms: string;
  history: string;
  mode_of_transport: string;
  colour: string;
  other_details: string;
  condition: "Normal" | "Serious";
  category: "Cow" | "Bull" | "Calf" | "Heifer" | "Nandi";
}

interface CowFormData {
  caller_of_rescue: string;
  caller_of_rescue_number: string;
  rescuer_name: string;
  gender: "Male" | "Female";
  breed: string;
  token_no: string;
  place_of_rescue: string;
  admission_date: string;
  diseases: string;
  symptoms: string;
  history: string;
  mode_of_transport: string;
  colour: string;
  other_details: string;
  condition: "Normal" | "Serious";
  category: "Cow" | "Bull" | "Calf" | "Heifer" | "Nandi";
}

const CowManagement = () => {
  const [cows, setCows] = useState<Cow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingCow, setViewingCow] = useState<Cow | null>(null);
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CowFormData>();

  useEffect(() => {
    fetchCows();
  }, []);

  const fetchCows = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/cattle/");
      setCows(response.data);
    } catch (error) {
      toast.error("Failed to fetch cow records.");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (cow?: Cow) => {
    if (cow) {
      setEditingCow(cow);
      setValue("caller_of_rescue", cow.caller_of_rescue);
      setValue("caller_of_rescue_number", cow.caller_of_rescue_number);
      setValue("rescuer_name", cow.rescuer_name);
      setValue("gender", cow.gender);
      setValue("breed", cow.breed);
      setValue("token_no", cow.token_no);
      setValue("place_of_rescue", cow.place_of_rescue);
      setValue("admission_date", cow.admission_date);
      setValue("diseases", cow.diseases);
      setValue("symptoms", cow.symptoms);
      setValue("history", cow.history);
      setValue("mode_of_transport", cow.mode_of_transport);
      setValue("colour", cow.colour);
      setValue("other_details", cow.other_details);
      setValue("condition", cow.condition);
      setValue("category", cow.category);
    } else {
      setEditingCow(null);
      reset({
        admission_date: new Date().toISOString().split('T')[0],
        caller_of_rescue: "",
        caller_of_rescue_number: "",
        rescuer_name: "",
        breed: "",
        token_no: "",
        place_of_rescue: "",
        diseases: "",
        symptoms: "",
        history: "",
        mode_of_transport: "",
        colour: "",
        other_details: "",
        condition: "Normal",
        category: "Cow"
      });
    }
    setIsModalOpen(true);
  };

  const openViewModal = (cow: Cow) => {
    setViewingCow(cow);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingCow(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCow(null);
    reset();
  };

  const onSubmit = async (data: CowFormData) => {
    try {
      if (editingCow) {
        const response = await api.put(`/cattle/${editingCow.id}/`, data);
        setCows(cows.map(c => c.id === editingCow.id ? response.data : c));
        toast.success("Cow record updated successfully!");
      } else {
        const response = await api.post("/cattle/", data);
        setCows([...cows, response.data]);
        toast.success("New cow record added successfully!");
      }
      closeModal();
    } catch (error) {
      toast.error("Failed to save cow record.");
    }
  };

  const deleteCow = async (id: string) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This record will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/cattle/${id}/`);
        setCows(cows.filter(c => c.id !== id));
        toast.success("Record deleted successfully!");
        MySwal.fire({
          title: "Deleted!",
          text: "Record removed successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        toast.error("Failed to delete record.");
      }
    }
  };

  const columns = [
    {
        name: "Id",
      selector: (row: Cow) => row.id,
      hide: 'sm' as any,
    },
    {
      name: "Tag No",
      selector: (row: Cow) => row.token_no,
      sortable: true,
      minWidth: "100px",
      cell: (row: Cow) => <span className="font-bold text-primary truncate">{row.token_no}</span>
    },
    {
      name: "Category",
      selector: (row: Cow) => row.category,
      sortable: true,
      minWidth: "100px",
      cell: (row: Cow) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
          row.category === 'Bull' ? 'bg-blue-100 text-blue-700' :
          row.category === 'Calf' ? 'bg-green-100 text-green-700' :
          row.category === 'Cow' ? 'bg-orange-100 text-orange-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {row.category}
        </span>
      )
    },
    {
      name: "Caller of Rescue",
      selector: (row: Cow) => row.caller_of_rescue,
      sortable: true,
      minWidth: "150px",
      hide: 'sm' as any,
    },
    {
      name: "Admission Date",
      selector: (row: Cow) => row.admission_date,
      sortable: true,
      hide: 'md' as any,
      minWidth: "120px",
    },
    {
      name: "Breed",
      selector: (row: Cow) => row.breed,
      sortable: true,
      hide: 'md' as any,
      minWidth: "100px",
    },
    {
      name: "Gender",
      selector: (row: Cow) => row.gender,
      sortable: true,
      hide: 'lg' as any,
      minWidth: "100px",
    },
     
    {
      name: "Actions",
      cell: (row: Cow) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openViewModal(row)}
            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            onClick={() => openModal(row)}
            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => deleteCow(row.id)}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredCows = cows.filter(cow => 
    cow.caller_of_rescue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cow.token_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cow.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customStyles: TableStyles = {
    header: { style: { minHeight: '56px' } },
    headRow: { style: { borderTopStyle: 'solid' as any, borderTopWidth: '1px', borderTopColor: 'var(--border)', backgroundColor: 'var(--muted)' } },
    headCells: { style: { '&:not(:last-child)': { borderRightStyle: 'solid', borderRightWidth: '1px', borderRightColor: 'var(--border)' }, color: 'var(--foreground)', fontWeight: 'bold' } },
    cells: { style: { '&:not(:last-child)': { borderRightStyle: 'solid', borderRightWidth: '1px', borderRightColor: 'var(--border)' }, color: 'var(--foreground)' } },
    pagination: { style: { borderTopStyle: 'solid' as any, borderTopWidth: '1px', borderTopColor: 'var(--border)' } },
  };

  return (
    <Layout>
      <div className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="overflow-hidden">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight truncate">Cow Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">Manage cows, tags, and admission records</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-xl text-sm sm:text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all w-full sm:w-auto flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
            Add New Cow
          </button>
        </div>

        <div className="card-elevated p-0 overflow-hidden border border-border bg-background">
          <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by token, owner, or breed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto w-full">
            <DataTable
            columns={columns}
            data={filteredCows}
            pagination
            responsive
            highlightOnHover
            pointerOnHover
            customStyles={customStyles}
            progressPending={isLoading}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-background border border-border rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">{editingCow ? "Edit Cow Record" : "Add New Cow Record"}</h2>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5 font-bold"><Hash className="w-4 h-4 text-primary" /> Tag Number</label>
                    <input {...register("token_no", { required: "Token number is required" })} placeholder="e.g. COW-123" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5 font-bold"><User className="w-4 h-4 text-primary" /> Caller of Rescue</label>
                    <input {...register("caller_of_rescue", { required: "Caller name is required" })} placeholder="Enter caller's name" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5 font-bold"><User className="w-4 h-4 text-primary" /> Caller Number</label>
                    <input {...register("caller_of_rescue_number")} placeholder="e.g. +91 98765 43210" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5 font-bold"><User className="w-4 h-4 text-primary" /> Rescuer Name</label>
                    <input {...register("rescuer_name")} placeholder="Enter rescuer's name" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5 font-bold"><Calendar className="w-4 h-4 text-primary" /> Admission Date</label>
                    <input type="date" {...register("admission_date", { required: "Admission date is required" })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 font-bold">Gender</label>
                    <select {...register("gender")} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 font-bold">Breed</label>
                    <input {...register("breed", { required: "Breed is required" })} placeholder="e.g. Gir, Sahiwal" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 font-bold">Category</label>
                    <select {...register("category")} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition font-bold">
                      <option value="Cow">Cow</option>
                      <option value="Bull">Bull</option>
                      <option value="Calf">Calf</option>
                      <option value="Heifer">Heifer</option>
                      <option value="Nandi">Nandi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 font-bold">Colour</label>
                    <input {...register("colour")} placeholder="e.g. White, Brown" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5 font-bold"><MapPin className="w-4 h-4 text-primary" /> Place of Rescue</label>
                    <input {...register("place_of_rescue")} placeholder="Enter rescue location" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 font-bold">Mode of Transport</label>
                    <input {...register("mode_of_transport")} placeholder="e.g. Truck, Tractor" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5 font-bold"><ClipboardList className="w-4 h-4 text-primary" /> Medical Condition</label>
                    <div className="flex items-center gap-4 p-2.5 rounded-lg border border-border bg-background">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="Normal" {...register("condition")} className="w-4 h-4 text-primary focus:ring-primary" />
                        <span className="text-sm font-medium">Normal</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="Serious" {...register("condition")} className="w-4 h-4 text-destructive focus:ring-destructive" />
                        <span className="text-sm font-medium text-destructive font-bold">Serious</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5 font-bold"><ClipboardList className="w-4 h-4 text-primary" /> Diseases</label>
                    <textarea {...register("diseases")} placeholder="Current diseases..." className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition h-20 resize-none" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5 font-bold"><ClipboardList className="w-4 h-4 text-primary" /> Symptoms</label>
                    <textarea {...register("symptoms")} placeholder="Current symptoms..." className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition h-20 resize-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 font-bold">Medical History</label>
                  <textarea {...register("history")} placeholder="Past medical history..." className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition h-20 resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 font-bold">Other Details</label>
                  <textarea {...register("other_details")} placeholder="Any other information..." className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition h-20 resize-none" />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">{editingCow ? "Update Record" : "Save Record"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewingCow && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeViewModal} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Cow Details</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-primary font-bold">{viewingCow.token_no}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${viewingCow.condition === 'Serious' ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-green-500/20 text-green-600'}`}>
                      {viewingCow.condition}
                    </span>
                  </div>
                </div>
                <button onClick={closeViewModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Rescue Information</h3>
                    <p className="text-foreground font-medium flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {viewingCow.caller_of_rescue}</p>
                    {viewingCow.caller_of_rescue_number && (
                      <p className="text-foreground flex items-center gap-2 mt-1 text-sm"><span className="text-muted-foreground">Caller No:</span> {viewingCow.caller_of_rescue_number}</p>
                    )}
                    {viewingCow.rescuer_name && (
                      <p className="text-foreground flex items-center gap-2 mt-1 text-sm"><span className="text-muted-foreground">Rescuer:</span> {viewingCow.rescuer_name}</p>
                    )}
                    <p className="text-foreground flex items-center gap-2 mt-1"><MapPin className="w-4 h-4 text-primary" /> {viewingCow.place_of_rescue || "N/A"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Cow Profile</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Breed:</span> <span className="font-medium">{viewingCow.breed}</span></div>
                      <div><span className="text-muted-foreground">Category:</span> <span className="font-medium text-primary font-bold">{viewingCow.category}</span></div>
                      <div><span className="text-muted-foreground">Gender:</span> <span className="font-medium">{viewingCow.gender}</span></div>
                      <div><span className="text-muted-foreground">Colour:</span> <span className="font-medium">{viewingCow.colour || "N/A"}</span></div>
                      <div><span className="text-muted-foreground">Admitted:</span> <span className="font-medium">{viewingCow.admission_date}</span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Logistics</h3>
                    <p className="text-foreground"><span className="text-muted-foreground text-sm italic">Mode of Transport:</span> {viewingCow.mode_of_transport || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-muted/30 rounded-lg border border-border">
                    <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-2"><ClipboardList className="w-4 h-4" /> Medical Condition</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground">DISEASES</p>
                        <p className="text-sm text-foreground">{viewingCow.diseases || "None reported"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground">SYMPTOMS</p>
                        <p className="text-sm text-foreground">{viewingCow.symptoms || "None reported"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">History</h3>
                    <div className="text-sm text-foreground bg-muted/20 p-3 rounded-lg border border-dashed border-border">
                      {viewingCow.history || "No history recorded"}
                    </div>
                  </div>
                </div>
              </div>

              {viewingCow.other_details && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Other Details</h3>
                  <p className="text-sm text-foreground">{viewingCow.other_details}</p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button onClick={closeViewModal} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default CowManagement;
