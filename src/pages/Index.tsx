import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import HeroBanner from "@/components/HeroBanner";
import AboutSection from "@/components/AboutSection";
import DonationPreview from "@/components/DonationPreview";
import GalleryPreview from "@/components/GalleryPreview";
import BlogPreview from "@/components/BlogPreview";
import ContactPreview from "@/components/ContactPreview";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchDoctorDashboard } from "@/redux/authSlice";
import api from "@/redux/api";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Heart, Star, Activity, Thermometer, BriefcaseMedical, IndianRupee, AlertTriangle, Stethoscope, Cake, Gift } from "lucide-react";
import { toast } from "sonner";
const Index = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, doctorStats } = useSelector((state: RootState) => state.auth);

  const [orgStatsData, setOrgStatsData] = useState({
    totalCows: 0,
    totalEarnings: 0,
    totalRecovers: 0,
    totalDeath: 0,
    totalMedicine: 0,
    isLoading: true
  });
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [isWishing, setIsWishing] = useState<string | null>(null);
  const [sentWishes, setSentWishes] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem(`sentBirthdays_${today}`);
    if (stored) {
      try {
        setSentWishes(JSON.parse(stored));
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'doctor') {
      dispatch(fetchDoctorDashboard());
    }

    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'member')) {
      const fetchOrgData = async () => {
        try {
          const endpoint = user.role === 'admin'
            ? '/auth/dashboard/admin/'
            : '/auth/dashboard/member/';

          const res = await api.get(endpoint);
          const stats = res.data?.stats || {};

          setOrgStatsData({
            totalCows: stats.total_cows || 0,
            totalEarnings: stats.total_earnings || 0,
            totalRecovers: stats.total_recovered || 0,
            totalDeath: stats.total_deaths || 0,
            totalMedicine: stats.total_medicine_stock || 0,
            isLoading: false
          });
        } catch (error) {
          console.error("Failed to fetch dashboard stats", error);
          setOrgStatsData(prev => ({ ...prev, isLoading: false }));
        }
      };

      fetchOrgData();
    }

    if (isAuthenticated) {
      const fetchBirthdays = async () => {
        try {
          const res = await api.get('/management/birthdays/');
          setBirthdays(res.data);
        } catch (error) {
          console.error("Failed to fetch birthdays", error);
        }
      };
      fetchBirthdays();
    }
  }, [isAuthenticated, user, dispatch]);

  const handleSendWish = async (person: any) => {
    setIsWishing(person.id);
    try {
      const wishMessage = `સુખડેશ્વર ગૌ ધામ

🌻 ગૌ સેવા🌻

🌸 જય શ્રી કૃષ્ણ 🌸
💐 આજના શુભ દિવસે ${person.name}ને જન્મદિવસની હાર્દિક શુભેચ્છાઓ 💐
 ભગવાન શ્રી કૃષ્ણ અને ગૌમાતા આપને સદાય સુખ, શાંતિ, આરોગ્ય અને સમૃદ્ધિ આપે તેવી હાર્દિક પ્રાર્થના.🙏
                 
શ્રી જલારામ ગૌ સેવા ટ્રસ્ટ ગાંધીનગર ને સર્વે મનોકામના પૂર્ણ કર ગૌમાતા ની અપાર કૃપા બની રહે તેવી ગૌમાતા ને હૃદયપુર્વક પ્રાર્થના. 🙏

🌻  જય ગૌમાતા  🌻
🌻  જય ગોપાલ   🌻
🌻 જય જલારામ 🌻
🛕  જય શ્રી રામ   🛕

શ્રી જલારામ ગૌ સેવા ટ્રસ્ટ ગાંધીનગર`;

      await api.post('/management/send-campaign/', {
        target: 'specific',
        message: wishMessage,
        specific_ids: [person.id]
      });
      toast.success(`WhatsApp Birthday wish sent to ${person.name}!`);
      const newSent = [...sentWishes, person.id];
      setSentWishes(newSent);
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(`sentBirthdays_${today}`, JSON.stringify(newSent));
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send wish");
    } finally {
      setIsWishing(null);
    }
  };

  if (isAuthenticated) {
    const doctorDashboardItems = [
      { label: "Total Deaths", value: doctorStats?.total_deaths?.toString() ?? "0", icon: Activity, color: "text-red-500", bg: "bg-red-50" },
      { label: "Total Cows Count", value: doctorStats?.total_cows?.toString() ?? "0", icon: Thermometer, color: "text-blue-500", bg: "bg-blue-50" },
      { label: "Medicine Inventory", value: doctorStats?.total_medicines_stock?.toString() ?? "0 units", icon: BriefcaseMedical, color: "text-emerald-500", bg: "bg-emerald-50" },
      { label: "Work Status", value: "Hospital Admin", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
    ];

    const adminDashboardItems = [
      { label: "Total Donations", value: orgStatsData.isLoading ? "..." : `₹ ${orgStatsData.totalEarnings.toLocaleString()}`, icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-50" },
      { label: "Total Cows", value: orgStatsData.isLoading ? "..." : orgStatsData.totalCows.toString(), icon: LayoutDashboard, color: "text-blue-500", bg: "bg-blue-50" },
      { label: "Total Recovers", value: orgStatsData.isLoading ? "..." : orgStatsData.totalRecovers.toString(), icon: Stethoscope, color: "text-green-500", bg: "bg-green-50" },
      { label: "Total Death", value: orgStatsData.isLoading ? "..." : orgStatsData.totalDeath.toString(), icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
    ];

    const memberDashboardItems = [
      { label: "Total Cows", value: orgStatsData.isLoading ? "..." : orgStatsData.totalCows.toString(), icon: Thermometer, color: "text-blue-500", bg: "bg-blue-50" },
      { label: "Total Death", value: orgStatsData.isLoading ? "..." : orgStatsData.totalDeath.toString(), icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
      { label: "Medicine Inventory", value: orgStatsData.isLoading ? "..." : `${orgStatsData.totalMedicine} units`, icon: BriefcaseMedical, color: "text-emerald-500", bg: "bg-emerald-50" },
      { label: "My Role", value: "Community Member", icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
    ];

    const standardStats = [
      { label: "My Contributions", value: "₹ 5,000", icon: Heart, color: "text-red-500", bg: "bg-red-50" },
      { label: "Community Members", value: "1,240", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
      { label: "Active Programs", value: "8", icon: LayoutDashboard, color: "text-indigo-500", bg: "bg-indigo-50" },
      { label: "Total Blessings", value: "450", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
    ];

    const dashboardStats =
      user?.role === 'doctor' ? doctorDashboardItems :
        user?.role === 'admin' ? adminDashboardItems :
          user?.role === 'member' ? memberDashboardItems :
            standardStats;

    return (
      <Layout>
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.first_name}! 👋</h1>
            <p className="text-muted-foreground">
              {user?.role === 'doctor'
                ? "Your medical dashboard for Shree Jalaram Gau Seva is ready."
                : "Here's what's happening today at Shree Jalaram Gau Seva."}
            </p>
          </motion.div>

          {/* Quick Stats / Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow group cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {birthdays.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-6 h-6 text-pink-500" />
                <h2 className="text-xl font-bold">Today's Birthdays 🎂</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {birthdays.map((person) => (
                  <div key={person.id} className="p-4 rounded-xl bg-background border border-border shadow-sm flex items-center justify-between group hover:border-pink-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
                        <Cake className="w-5 h-5 text-pink-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{person.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{person.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendWish(person)}
                      disabled={isWishing === person.id || sentWishes.includes(person.id)}
                      className="text-xs bg-pink-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50"
                    >
                      {sentWishes.includes(person.id) ? "Sent ✓" : isWishing === person.id ? "Sending..." : "Send WhatsApp"}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!birthdays.length && (
            <div className="card-elevated p-8 text-center border-2 border-dashed border-border bg-muted/5 rounded-2xl">
              <p className="text-muted-foreground font-medium italic">No birthdays today.</p>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="-mt-[120px]">
        <HeroBanner />
      </div>
      <AboutSection />
      <DonationPreview />
      <GalleryPreview />
      <BlogPreview />
      <ContactPreview />
    </Layout>
  );
};

export default Index;
