import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DonationPage from "./pages/DonationPage";
import GalleryPage from "./pages/GalleryPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import MemberBlogPage from "./pages/MemberBlogPage";
import MemberGalleryPage from "./pages/MemberGalleryPage";
import CowManagement from "./pages/CowManagement";
import MedicineManagement from "./pages/MedicineManagement";
import TreatmentPage from "./pages/TreatmentPage";
import DoctorsPage from "./pages/DoctorsPage";
import MembersPage from "./pages/MembersPage";
import CowFoodPage from "./pages/CowFoodPage";
import MedicineUsagePage from "./pages/MedicineUsagePage";
import VisitorsPage from "./pages/VisitorsPage";
import DonorsPage from "./pages/DonorsPage";
import MedicalSettings from "./pages/MedicalSettings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/donation" element={<DonationPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
         {/* <Route path="/register" element={<RegisterPage />} /> 
         <Route path="/verify-otp" element={<VerifyOtpPage />} /> 
         <Route path="/forgot-password" element={<ForgotPasswordPage />} />  */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/my-blogs" element={<ProtectedRoute allowedRoles={["admin", "member"]}><MemberBlogPage /></ProtectedRoute>} />
          <Route path="/my-gallery" element={<ProtectedRoute allowedRoles={["admin", "member"]}><MemberGalleryPage /></ProtectedRoute>} />
          <Route path="/cows" element={<ProtectedRoute allowedRoles={["admin", "member", "doctor"]}><CowManagement /></ProtectedRoute>} />
          <Route path="/cow-food" element={<ProtectedRoute allowedRoles={["admin", "member", "doctor"]}><CowFoodPage /></ProtectedRoute>} />
          <Route path="/medicine" element={<ProtectedRoute allowedRoles={["admin", "doctor"]}><MedicineManagement /></ProtectedRoute>} />
          <Route path="/medicine-usage" element={<ProtectedRoute allowedRoles={["admin", "member", "doctor"]}><MedicineUsagePage /></ProtectedRoute>} />
          <Route path="/treatment" element={<ProtectedRoute allowedRoles={["admin", "doctor"]}><TreatmentPage /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute allowedRoles={["admin"]}><DoctorsPage /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute allowedRoles={["admin"]}><MembersPage /></ProtectedRoute>} />
          <Route path="/visitors" element={<ProtectedRoute allowedRoles={["admin", "doctor", "member"]}><VisitorsPage /></ProtectedRoute>} />
          <Route path="/donors" element={<ProtectedRoute allowedRoles={["admin", "doctor", "member"]}><DonorsPage /></ProtectedRoute>} />
          <Route path="/medical-settings" element={<ProtectedRoute allowedRoles={["admin", "doctor"]}><MedicalSettings /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
