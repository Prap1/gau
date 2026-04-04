import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import DataTable, { TableStyles } from "react-data-table-component";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, X, Search, Eye, Loader2, Stethoscope, Calendar, Activity, ClipboardList, User, Hash, Pill } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchTreatments, fetchCows, addTreatment, updateTreatment, deleteTreatment, clearTreatmentMessage, clearTreatmentError } from "@/redux/treatmentSlice";
import { fetchMedicines } from "@/redux/medicineSlice";
import { fetchSymptoms } from "@/redux/symptomSlice";
import CreatableSelect from "react-select/creatable";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface Treatment {
  id: string;
  cow: string;
  cow_token_no?: string;
  cow_admission_date?: string;
  checkup_date: string;
  symptoms: string;
  medicine: string;
  status: "Ongoing" | "Recovered" | "Death";
  doctor_name?: string;
  notes: string;
  cow_history?: string;
  cow_diseases?: string;
  cow_condition?: "Normal" | "Serious";
}

interface Cow {
  id: string;
  token_no: string;
  caller_of_rescue: string;
  symptoms?: string;
}

interface TreatmentFormData {
  cow: string;
  cow_token_no_input?: string;
  symptoms: string;
  medicine: string;
  status: "Ongoing" | "Recovered" | "Death";
  notes: string;
}

const TreatmentPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { treatments, cows, loading: isLoading, error, message } = useSelector((state: RootState) => state.treatment);
  const { medicines: availableMedicines } = useSelector((state: RootState) => state.medicine);
  const { symptoms: availableSymptoms } = useSelector((state: RootState) => state.symptom);

  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [medicineInput, setMedicineInput] = useState("");
  const [cowSearch, setCowSearch] = useState("");
  const [isCowDropdownOpen, setIsCowDropdownOpen] = useState(false);
  const [cowInputMode, setCowInputMode] = useState<"manual" | "dropdown">("dropdown");
  const [manualToken, setManualToken] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingTreatment, setViewingTreatment] = useState<Treatment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TreatmentFormData>();

  const selectedCowId = watch("cow");
  const previousTreatment = treatments
    .filter(t => (String(t.cow) === String(selectedCowId) || t.cow_token_no === selectedCowId) && (!editingTreatment || t.id !== editingTreatment.id))
    .sort((a, b) => new Date(b.checkup_date).getTime() - new Date(a.checkup_date).getTime())[0];

  useEffect(() => {
    if (!editingTreatment && selectedCowId) {
      if (previousTreatment) {
        // High priority: last checkup data
        setValue("symptoms", previousTreatment.symptoms);
        if (previousTreatment.medicine) {
          setSelectedMedicines(previousTreatment.medicine.split("; ").filter(m => m));
        }
      } else {
        // Fallback: look for the cow entry record (initial rescue symptoms)
        const selectedCow = cows.find(c => String(c.id) === String(selectedCowId) || c.token_no.toLowerCase() === String(selectedCowId).toLowerCase());
        if (selectedCow && selectedCow.symptoms) {
          setValue("symptoms", selectedCow.symptoms);
          setSelectedMedicines([]); // No medicines yet for new cows
        }
      }
    }
  }, [selectedCowId, editingTreatment, previousTreatment, cows, setValue]);

  useEffect(() => {
    dispatch(fetchTreatments());
    dispatch(fetchCows());
    dispatch(fetchMedicines());
    dispatch(fetchSymptoms());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearTreatmentMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearTreatmentError());
    }
  }, [message, error, dispatch]);

  const openModal = (treatment?: Treatment) => {
    if (treatment) {
      setEditingTreatment(treatment);
      setValue("cow", treatment.cow);
      const selCow = cows.find(c => c.id === treatment.cow);
      setCowSearch(selCow ? `${selCow.token_no} (${selCow.caller_of_rescue})` : "");
      setValue("symptoms", treatment.symptoms);
      const meds = treatment.medicine ? treatment.medicine.split("; ").filter(m => m) : [];
      setSelectedMedicines(meds);
      setValue("status", treatment.status);
      setValue("notes", treatment.notes);
    } else {
      setEditingTreatment(null);
      setSelectedMedicines([]);
      setMedicineInput("");
      setCowSearch("");
      setManualToken("");
      setCowInputMode("dropdown");
      reset();
    }
    setIsCowDropdownOpen(false);
    setIsModalOpen(true);
  };

  const openViewModal = (treatment: Treatment) => {
    setViewingTreatment(treatment);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingTreatment(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTreatment(null);
    setSelectedMedicines([]);
    setMedicineInput("");
    setCowSearch("");
    setManualToken("");
    setCowInputMode("dropdown");
    reset();
  };

  const uniqueMedicineNames = Array.from(new Set(availableMedicines.map((m: any) => m.medicine_name.trim()))).sort();

  const onSubmit = async (data: TreatmentFormData) => {
    // Build payload depending on input mode
    let cowPayload: Record<string, string>;
    if (cowInputMode === "manual") {
      if (!manualToken.trim()) {
        toast.error("Please enter a token number.");
        return;
      }
      // Send token string; backend resolves or creates the Cow
      cowPayload = { cow_token_no_input: manualToken.trim() };
    } else {
      // Dropdown mode sends the actual cow PK
      cowPayload = { cow: data.cow };
    }

    // Destructure `cow` out so it is never accidentally sent as a raw string.
    // cowPayload is the sole authority: it has either { cow: pkId } or { cow_token_no_input: token }.
    const { cow: _discardedCow, ...restData } = data;
    const formattedData = {
      ...restData,
      ...cowPayload,
      medicine: selectedMedicines.join("; ")
    };
    if (editingTreatment) {
      dispatch(updateTreatment({ id: editingTreatment.id, data: formattedData }));
    } else {
      dispatch(addTreatment(formattedData));
    }
    closeModal();
  };

  const handleDeleteTreatment = async (id: string) => {
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
      dispatch(deleteTreatment(id));
      MySwal.fire({
        title: "Deleted!",
        text: "Record removed successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const columns = [
    {
      name: "Id",
      selector: (row: Treatment) => row.id,
      width: "60px",
      hide: 'md' as any,
    },
    {
      name: "Tag No",
      selector: (row: Treatment) => row.cow_token_no || "N/A",
      sortable: true,
      minWidth: "100px",
      cell: (row: Treatment) => <span className="font-bold text-primary truncate">{row.cow_token_no}</span>
    },
    {
      name: "Admission Date",
      selector: (row: Treatment) => row.cow_admission_date || "N/A",
      sortable: true,
      minWidth: "130px",
      hide: 'md' as any,
    },

    {
      name: "Medicines",
      selector: (row: Treatment) => row.medicine,
      sortable: true,
      wrap: true,
      minWidth: "150px",
    },
    {
      name: "Symptoms",
      selector: (row: Treatment) => row.symptoms,
      sortable: true,
      wrap: true,
      minWidth: "150px",
      hide: 'sm' as any,
    },
    {
      name: "Diseases",
      selector: (row: Treatment) => row.cow_diseases || "None",
      sortable: true,
      wrap: true,
      hide: 'lg' as any,
      minWidth: "150px",
    },
    // {
    //   name: "History",
    //   selector: (row: Treatment) => row.cow_history || "None",
    //   sortable: true,
    //   wrap: true,
    //   hide: 'lg' as any,
    //   minWidth: "150px",
    // },
    {
      name: "Status",
      selector: (row: Treatment) => row.status,
      sortable: true,
      minWidth: "120px",
      cell: (row: Treatment) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center justify-center min-w-[80px] ${row.status === "Recovered" ? "bg-green-100 text-green-700" :
          row.status === "Death" ? "bg-red-100 text-red-700" :
            "bg-blue-100 text-blue-700"
          }`}>
          {row.status === "Ongoing" ? "Recovering" : row.status}
        </span>
      )
    },
    {
      name: "Doctor",
      selector: (row: Treatment) => row.doctor_name || "Assigned",
      sortable: true,
      hide: 'lg' as any,
      minWidth: "120px",
    },
    {
      name: "Checkup Time",
      selector: (row: Treatment) => new Date(row.checkup_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      sortable: true,
      hide: 'lg' as any,
      minWidth: "140px",
    },
    {
      name: "Actions",
      cell: (row: Treatment) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openViewModal(row)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => openModal(row)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDeleteTreatment(row.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredTreatments = treatments.filter(t => {
    const matchesSearch = t.cow_token_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const uniqueCowsStats = new Set();
  const stats = filteredTreatments.reduce((acc, t) => {
    const token = t.cow_token_no || t.cow;
    if (token && !uniqueCowsStats.has(token)) {
      uniqueCowsStats.add(token);
      if (t.status === "Ongoing") acc.recovering++;
      else if (t.status === "Recovered") acc.recovered++;
      else if (t.status === "Death") acc.death++;
    }
    return acc;
  }, { recovering: 0, recovered: 0, death: 0 });

  const customStyles: TableStyles = {
    headRow: { style: { borderTopStyle: 'solid' as any, borderTopWidth: '1px', borderTopColor: 'var(--border)', backgroundColor: 'var(--muted)' } },
    pagination: { style: { borderTopStyle: 'solid' as any, borderTopWidth: '1px', borderTopColor: 'var(--border)' } },
  };

  return (
    <Layout>
      <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="overflow-hidden">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight truncate">Treatment Records</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">Manage daily checkups and cow health status.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-xl text-sm sm:text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all w-full sm:w-auto flex-shrink-0"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            New Daily Checkup
          </button>
        </div>

        {/* Treatment Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg"><Activity className="w-6 h-6" /></div>
            <div>
              <h4 className="text-sm font-bold text-blue-700 uppercase tracking-widest">Recovering</h4>
              <p className="text-2xl font-black text-foreground">{stats.recovering}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg"><Stethoscope className="w-6 h-6" /></div>
            <div>
              <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Recovered</h4>
              <p className="text-2xl font-black text-foreground">{stats.recovered}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-red-500 text-white rounded-xl shadow-lg"><Trash2 className="w-6 h-6" /></div>
            <div>
              <h4 className="text-sm font-bold text-red-700 uppercase tracking-widest">Death</h4>
              <p className="text-2xl font-black text-foreground">{stats.death}</p>
            </div>
          </motion.div>
        </div>

        <div className="card-elevated p-0 overflow-hidden border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl">
          <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStatusFilter("All")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === "All" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("Ongoing")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === "Ongoing" ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
              >
                Recovering
              </button>
              <button
                onClick={() => setStatusFilter("Recovered")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === "Recovered" ? "bg-green-500 text-white" : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
              >
                Recovered
              </button>
              <button
                onClick={() => setStatusFilter("Death")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === "Death" ? "bg-red-500 text-white" : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
              >
                Death
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by token or symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <DataTable
              columns={columns}
              data={filteredTreatments}
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

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewingTreatment && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeViewModal} className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Treatment Details</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-primary font-bold">{viewingTreatment.cow_token_no}</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${viewingTreatment.cow_condition === 'Serious' ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-green-500/20 text-green-600'}`}>
                        {viewingTreatment.cow_condition || "Normal"}
                      </span>
                    </div>
                  </div>
                  <button onClick={closeViewModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                      <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-2"><Activity className="w-4 h-4" /> Current Treatment</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase">Symptoms</p>
                          <p className="text-sm text-foreground">{viewingTreatment.symptoms}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase">Medicine Prescribed</p>
                          <p className="text-sm text-foreground">{viewingTreatment.medicine || "None recorded"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase">Treatment Status</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${viewingTreatment.status === "Recovered" ? "bg-green-100 text-green-700" :
                            viewingTreatment.status === "Death" ? "bg-red-100 text-red-700" :
                              "bg-blue-100 text-blue-700"
                            }`}>
                            {viewingTreatment.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Doctor Notes</h3>
                      <div className="text-sm text-foreground bg-muted/20 p-3 rounded-lg border border-dashed border-border">
                        {viewingTreatment.notes || "No additional notes recorded"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <h3 className="text-sm font-bold text-blue-600 flex items-center gap-2 mb-2"><ClipboardList className="w-4 h-4" /> Cow Medical History</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-blue-400 uppercase">Existing Diseases</p>
                          <p className="text-sm text-foreground">{viewingTreatment.cow_diseases || "No known diseases"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-400 uppercase">General History</p>
                          <p className="text-sm text-foreground">{viewingTreatment.cow_history || "No history recorded"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Doctor:</span>
                        <span className="font-bold text-foreground">{viewingTreatment.doctor_name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Checkup Date:</span>
                        <span className="text-foreground">{new Date(viewingTreatment.checkup_date).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Admission Date:</span>
                        <span className="text-foreground">{viewingTreatment.cow_admission_date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={closeViewModal} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors">Close</button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">{editingTreatment ? "Update Checkup" : "Log Daily Checkup"}</h2>
                  <button onClick={closeModal} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      {/* Label + mode toggle */}
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-primary" /> Cow Tag No.
                        </label>
                        <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              setCowInputMode("manual");
                              setCowSearch("");
                              setManualToken("");
                              setValue("cow", "", { shouldValidate: true });
                            }}
                            className={`px-2.5 py-1 rounded-md transition-all ${cowInputMode === "manual"
                                ? "bg-primary text-primary-foreground shadow"
                                : "text-muted-foreground hover:text-foreground"
                              }`}
                          >
                            Manual
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCowInputMode("dropdown");
                              setManualToken("");
                              setCowSearch("");
                              setValue("cow", "", { shouldValidate: true });
                            }}
                            className={`px-2.5 py-1 rounded-md transition-all ${cowInputMode === "dropdown"
                                ? "bg-primary text-primary-foreground shadow"
                                : "text-muted-foreground hover:text-foreground"
                              }`}
                          >
                            Select
                          </button>
                        </div>
                      </div>

                      <input type="hidden" {...register("cow", { required: "Please select a cow" })} />

                      {/* ── Manual entry mode ── */}
                      <AnimatePresence mode="wait">
                        {cowInputMode === "manual" ? (
                          <motion.div key="manual" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}>
                            <input
                              type="text"
                              placeholder="Type token number manually…"
                              value={manualToken}
                              onChange={(e) => {
                                const val = e.target.value;
                                setManualToken(val);
                                // try to match an existing cow by token, otherwise store raw value
                                const matched = cows.find(c => c.token_no.toLowerCase() === val.toLowerCase());
                                setValue("cow", matched ? matched.id : val, { shouldValidate: true });
                              }}
                              className={`w-full px-4 py-2.5 rounded-lg border ${errors.cow ? "border-destructive" : "border-border"
                                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                            />
                            {manualToken && (() => {
                              const matched = cows.find(c => c.token_no.toLowerCase() === manualToken.toLowerCase());
                              return matched ? (
                                <p className="text-xs text-emerald-600 font-medium mt-1">✓ Matched: {matched.caller_of_rescue}</p>
                              ) : (
                                <p className="text-xs text-amber-500 font-medium mt-1">⚠ No existing match — will be saved as-is</p>
                              );
                            })()}
                          </motion.div>
                        ) : (
                          /* ── Dropdown / search mode ── */
                          <motion.div key="dropdown" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} className="relative">
                            <input
                              type="text"
                              placeholder="Type token no. or caller name…"
                              value={cowSearch}
                              onFocus={() => setIsCowDropdownOpen(true)}
                              onBlur={() => setTimeout(() => setIsCowDropdownOpen(false), 200)}
                              onChange={(e) => {
                                setCowSearch(e.target.value);
                                setValue("cow", "", { shouldValidate: true });
                                setIsCowDropdownOpen(true);
                              }}
                              className={`w-full px-4 py-2.5 rounded-lg border ${errors.cow ? "border-destructive" : "border-border"
                                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition`}
                            />
                            <AnimatePresence>
                              {isCowDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                  className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto top-full left-0 p-1"
                                >
                                  {cows
                                    .filter(c => `${c.token_no} ${c.caller_of_rescue}`.toLowerCase().includes(cowSearch.toLowerCase()))
                                    .map(cow => (
                                      <div
                                        key={cow.id}
                                        onClick={() => {
                                          setValue("cow", cow.id, { shouldValidate: true });
                                          setCowSearch(`${cow.token_no} (${cow.caller_of_rescue})`);
                                          setIsCowDropdownOpen(false);
                                        }}
                                        className="px-3 py-2.5 rounded-md hover:bg-muted cursor-pointer text-sm mb-1 last:mb-0 transition-colors"
                                      >
                                        <span className="font-bold text-primary">{cow.token_no}</span> — {cow.caller_of_rescue}
                                      </div>
                                    ))}
                                  {cows.filter(c => `${c.token_no} ${c.caller_of_rescue}`.toLowerCase().includes(cowSearch.toLowerCase())).length === 0 && (
                                    <div className="px-4 py-4 text-sm text-center text-muted-foreground italic">No cows found matching "{cowSearch}"</div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {errors.cow && <p className="text-xs text-destructive mt-1 font-medium">{errors.cow.message as string}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5 font-bold">Health Status</label>
                      <select {...register("status")} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition">
                        <option value="Ongoing">Recovering</option>
                        <option value="Recovered">Recovered</option>
                        <option value="Death">Death</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 font-bold">Symptoms</label>
                    <CreatableSelect
                      isMulti
                      placeholder="Select or type symptoms..."
                      options={availableSymptoms.map(s => ({ value: s.name, label: s.name }))}
                      value={watch("symptoms") ? watch("symptoms").split(", ").map(val => ({ value: val, label: val })) : []}
                      onChange={(selected) => {
                        const val = selected ? selected.map(s => s.value).join(", ") : "";
                        setValue("symptoms", val);
                      }}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base) => ({
                          ...base,
                          backgroundColor: 'transparent',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.5rem',
                          padding: '0.125rem',
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
                          color: 'hsl(var(--foreground))',
                        }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: 'hsl(var(--primary) / 0.1)',
                          borderRadius: '9999px',
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: 'hsl(var(--primary))',
                          fontWeight: 'bold',
                        }),
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 font-bold">Medicines Prescribed</label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 bg-muted/30 rounded-lg border border-border">
                        {selectedMedicines.length === 0 && (
                          <span className="text-xs text-muted-foreground italic p-1">No medicines added yet...</span>
                        )}
                        {selectedMedicines.map((med, index) => (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={index}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20"
                          >
                            {med}
                            <button
                              type="button"
                              onClick={() => setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index))}
                              className="hover:text-destructive transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        ))}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          list="medicine-options"
                          placeholder="Select or type medicine name and press Enter..."
                          value={medicineInput}
                          onChange={(e) => setMedicineInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = medicineInput.trim();
                              if (val && !selectedMedicines.includes(val)) {
                                setSelectedMedicines([...selectedMedicines, val]);
                                setMedicineInput("");
                              }
                            }
                          }}
                          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition pr-10"
                        />
                        <datalist id="medicine-options">
                          {uniqueMedicineNames.map((name: string) => (
                            <option key={name} value={name} />
                          ))}
                        </datalist>
                        <button
                          type="button"
                          onClick={() => {
                            const val = medicineInput.trim();
                            if (val && !selectedMedicines.includes(val)) {
                              setSelectedMedicines([...selectedMedicines, val]);
                              setMedicineInput("");
                            }
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all underline-none"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">Type and press Enter to add manual medicines.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 font-bold">Additional Notes</label>
                    <textarea {...register("notes")} placeholder="General observations..." className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition h-20 resize-none" />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">{editingTreatment ? "Update Record" : "Log Checkup"}</button>
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

export default TreatmentPage;
