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
import { LayoutDashboard, Users, Heart, Star, Activity, Thermometer, BriefcaseMedical, IndianRupee, AlertTriangle, Stethoscope } from "lucide-react";

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

  useEffect(() => {
    if (isAuthenticated && user?.role === 'doctor') {
      dispatch(fetchDoctorDashboard());
    }

    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'member')) {
      const fetchOrgData = async () => {
        try {
          const [cowsRes, baseStatsRes, treatmentsRes] = await Promise.all([
            api.get('/cattle/'),
            api.get('/cattle/base-stats/').catch(() => ({ data: { total: 0 } })),
            api.get('/medical/')
          ]);

          let donorsRes = { data: [] };
          let medicinesRes = { data: [] };

          if (user?.role === 'admin') {
            donorsRes = await api.get('/management/donors/').catch(() => ({ data: [] }));
          }
          if (user?.role === 'member') {
            medicinesRes = await api.get('/inventory/medicines/').catch(() => ({ data: [] }));
          }

          const dynamicCowsCount = cowsRes.data?.length || 0;
          const baseCount = baseStatsRes.data?.total || 0;
          const totalCows = dynamicCowsCount + baseCount;

          const totalEarnings = (donorsRes.data || []).reduce((sum: number, d: any) => sum + (Number(d.total_money) || 0), 0);

          let recovered = 0;
          let deaths = 0;
          (treatmentsRes.data || []).forEach((t: any) => {
             if (t.status === 'Recovered') recovered++;
             if (t.status === 'Death') deaths++;
          });

          // Medicine inventory stock sum
          const totalMedicine = (medicinesRes.data || []).reduce((sum: number, m: any) => sum + (Number(m.stock) || 0), 0);

          setOrgStatsData({
            totalCows,
            totalEarnings,
            totalRecovers: recovered,
            totalDeath: deaths,
            totalMedicine,
            isLoading: false
          });
        } catch (error) {
          console.error("Failed to fetch dashboard stats", error);
          setOrgStatsData(prev => ({ ...prev, isLoading: false }));
        }
      };
      
      fetchOrgData();
    }
  }, [isAuthenticated, user, dispatch]);

  if (isAuthenticated) {
    const doctorDashboardItems = [
        { label: "Total Deaths", value: doctorStats?.total_deaths?.toString() ?? "0", icon: Activity, color: "text-red-500", bg: "bg-red-50" },
        { label: "Total Cows Count", value: doctorStats?.total_cows?.toString() ?? "0", icon: Thermometer, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Medicine Inventory", value: doctorStats?.total_medicines_stock?.toString() ?? "0 units", icon: BriefcaseMedical, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: "Work Status", value: "Hospital Admin", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
    ];

    const adminDashboardItems = [
        { label: "Total Earnings", value: orgStatsData.isLoading ? "..." : `₹ ${orgStatsData.totalEarnings.toLocaleString()}`, icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-50" },
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

          <div className="card-elevated p-8 text-center border-2 border-dashed border-border bg-muted/5 rounded-2xl">
            <p className="text-muted-foreground">Your recent activity will appear here. No updates at the moment.</p>
          </div>
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
