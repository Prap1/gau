import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { 
  Stethoscope, Thermometer, Plus, Trash2, Loader2, Search, Activity, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchSymptoms, addSymptom, deleteSymptom, clearSymptomMessage, clearSymptomError } from "@/redux/symptomSlice";
import { fetchDiseases, addDisease, deleteDisease, clearDiseaseMessage, clearDiseaseError } from "@/redux/diseaseSlice";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const MedicalSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { symptoms, loading: sympLoading, message: sympMsg, error: sympErr } = useSelector((state: RootState) => state.symptom);
  const { diseases, loading: disLoading, message: disMsg, error: disErr } = useSelector((state: RootState) => state.disease);

  const [newSymptom, setNewSymptom] = useState("");
  const [newDisease, setNewDisease] = useState("");
  const [sympSearch, setSympSearch] = useState("");
  const [disSearch, setDisSearch] = useState("");

  useEffect(() => {
    dispatch(fetchSymptoms());
    dispatch(fetchDiseases());
  }, [dispatch]);

  useEffect(() => {
    if (sympMsg) {
      toast.success(sympMsg);
      dispatch(clearSymptomMessage());
      setNewSymptom("");
    }
    if (sympErr) {
      toast.error(sympErr);
      dispatch(clearSymptomError());
    }
  }, [sympMsg, sympErr, dispatch]);

  useEffect(() => {
    if (disMsg) {
      toast.success(disMsg);
      dispatch(clearDiseaseMessage());
      setNewDisease("");
    }
    if (disErr) {
      toast.error(disErr);
      dispatch(clearDiseaseError());
    }
  }, [disMsg, disErr, dispatch]);

  const handleAddSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymptom.trim()) return;
    dispatch(addSymptom({ name: newSymptom.trim() }));
  };

  const handleAddDisease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisease.trim()) return;
    dispatch(addDisease({ name: newDisease.trim() }));
  };

  const handleDeleteSymptom = async (id: string, name: string) => {
    const result = await MySwal.fire({
      title: "Delete Symptom?",
      text: `Are you sure you want to remove "${name}" from the list?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete",
    });
    if (result.isConfirmed) dispatch(deleteSymptom(id));
  };

  const handleDeleteDisease = async (id: string, name: string) => {
    const result = await MySwal.fire({
      title: "Delete Disease?",
      text: `Are you sure you want to remove "${name}" from the list?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete",
    });
    if (result.isConfirmed) dispatch(deleteDisease(id));
  };

  const filteredSymptoms = symptoms.filter(s => s.name.toLowerCase().includes(sympSearch.toLowerCase()));
  const filteredDiseases = diseases.filter(d => d.name.toLowerCase().includes(disSearch.toLowerCase()));

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="bg-background/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl w-fit">
              <Stethoscope className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
                Medical Settings
              </h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 font-medium text-base sm:text-lg italic line-clamp-2">
                Manage the master list of symptoms and diseases for cattle treatments
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Symptoms Column */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-background/60 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-xl">
                    <Thermometer className="w-6 h-6 text-orange-500" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground">Symptoms</h2>
                </div>
                <span className="text-[10px] sm:text-xs font-bold px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full border border-orange-500/20 uppercase tracking-widest w-fit">
                  Total: {symptoms.length}
                </span>
              </div>
              <form onSubmit={handleAddSymptom} className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  placeholder="Enter new symptom..." 
                  className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm" 
                />
                <button 
                  type="submit"
                  disabled={sympLoading || !newSymptom.trim()}
                  className="px-5 py-3 sm:py-0 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sympLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  <span className="font-bold">Add</span>
                </button>
              </form>

              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Filter symptoms..."
                  value={sympSearch}
                  onChange={(e) => setSympSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                />
              </div>

              <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                <AnimatePresence>
                  {filteredSymptoms.map((s) => (
                    <motion.div 
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-2xl hover:bg-muted/40 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-orange-400" />
                        <span className="font-bold text-foreground">{s.name}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteSymptom(s.id, s.name)} 
                        className="p-2 text-destructive sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                  {filteredSymptoms.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground italic font-medium bg-muted/10 rounded-2xl border border-dashed border-border">
                      No symptoms found...
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Diseases Column */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-background/60 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <ShieldAlert className="w-6 h-6 text-blue-500" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground">Diseases</h2>
                </div>
                <span className="text-[10px] sm:text-xs font-bold px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full border border-blue-500/20 uppercase tracking-widest w-fit">
                  Total: {diseases.length}
                </span>
              </div>
              <form onSubmit={handleAddDisease} className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  value={newDisease}
                  onChange={(e) => setNewDisease(e.target.value)}
                  placeholder="Enter new disease..." 
                  className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm" 
                />
                <button 
                  type="submit"
                  disabled={disLoading || !newDisease.trim()}
                  className="px-5 py-3 sm:py-0 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {disLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  <span className="font-bold">Add</span>
                </button>
              </form>

              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Filter diseases..."
                  value={disSearch}
                  onChange={(e) => setDisSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                <AnimatePresence>
                  {filteredDiseases.map((d) => (
                    <motion.div 
                      key={d.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-2xl hover:bg-muted/40 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-foreground">{d.name}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteDisease(d.id, d.name)} 
                        className="p-2 text-destructive sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                  {filteredDiseases.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground italic font-medium bg-muted/10 rounded-2xl border border-dashed border-border">
                      No diseases found...
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
};

export default MedicalSettings;
