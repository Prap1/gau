import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  UserCircle, 
  LogOut, 
  User,
  Heart,
  Users,
  Stethoscope,
  Map,
  PlusCircle,
  Settings,
  Image as ImageIcon,
  FileText,
  Database,
  Pill,
  Wheat,
  UserPlus,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { logout, setSidebarOpen } from "@/redux/authSlice";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isSidebarOpen } = useSelector((state: RootState) => state.auth);

  const role = user?.role;

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/", roles: ["admin", "doctor", "member"] },
    // { name: "Cows", icon: Database, href: "/cows", roles: ["admin", "member","doctor"] },
     { name: "Cows", icon: Database, href: "/cows", roles: ["member","doctor"] },
    { name: "Donors", icon: Heart, href: "/donors", roles: [ "doctor", "member"] },
    { name: "Visitors", icon: User, href: "/visitors", roles: [ "doctor", "member"] },
    { name: "Cow Food", icon: Wheat, href: "/cow-food", roles: [ "member"] },
    { name: "Medicine", icon: Pill, href: "/medicine", roles: [ "doctor"] },
    { name: "Medicine Usage", icon: ClipboardList, href: "/medicine-usage", roles: ["doctor", "member"] },
    { name: "Treatment", icon: Stethoscope, href: "/treatment", roles: [ "doctor"] },
    { name: "Doctors", icon: UserPlus, href: "/doctors", roles: ["admin"] },
    // { name: "Members", icon: Users, href: "/members", roles: ["admin"] },
    // { name: "My Blogs", icon: FileText, href: "/my-blogs", roles: ["admin", "member"] },
    // { name: "My Gallery", icon: ImageIcon, href: "/my-gallery", roles: ["admin", "member"] },
    { name: "My Profile", icon: UserCircle, href: "/profile", roles: [ "doctor", "member"] },
  ].filter(item => !role || item.roles.includes(role));

  const handleLogout = () => {
    dispatch(logout());
    dispatch(setSidebarOpen(false));
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setSidebarOpen(false))}
            className="fixed inset-0 bg-black/50 z-[45] lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside 
        className={`fixed left-0 top-[120px] bottom-0 w-64 bg-background border-r border-border flex flex-col z-[50] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
              {user?.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-primary font-bold">{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-foreground truncate" title={`${user?.first_name || ""} ${user?.last_name || ""}`.trim()}>
                {(() => {
                  const name = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
                  return name.length > 20 ? name.substring(0, 20) + "..." : name || "User";
                })()}
              </span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role || 'Member'}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => dispatch(setSidebarOpen(false))}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "group-hover:text-primary transition-colors"}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-pill">
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
