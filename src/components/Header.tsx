import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Mail, User, LogOut, ChevronDown, UserCircle, ShoppingBag } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { logout, toggleSidebar } from "@/redux/authSlice";
import logo from "@/assets/logo.jpg";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = isAuthenticated 
    ? []
    : [
        { name: "Home", href: "/" },
        { name: "About", href: "/#about" },
        { name: "Donation", href: "/donation" },
        { name: "Gallery", href: "/gallery" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
      ];

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href.split("#")[0]);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4 shadow-sm">
        <div className="container mx-auto flex flex-col sm:flex-row flex-wrap justify-center sm:justify-between items-center gap-2 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-4">
            <a href="tel:+919494947108" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">+91 94949 47108</span>
            </a>
            <a href="mailto:contact@jalaramgauseva.org" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Shreejalaramgstg@gmail.com</span>
            </a>
          </div>
          <span className="tracking-wide text-[10px] xs:text-xs sm:text-sm">🙏 गौ सेवा परम धर्म 🙏</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 sm:gap-3">
              <img src={logo} alt="Shree Jalaram Gau Seva Trust" className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover flex-shrink-0" />
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight">Shree Jalaram</h1>
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Gau Seva Trust, Gandhinagar</p>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`font-medium transition-colors relative group ${
                  isActive(link.href) ? "text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                  isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors text-sm">
                  <User className="w-4 h-4" />
                  Login
                </Link>
                <Link to="/donation" className="btn-primary text-sm">
                  Donate Now
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border-2 border-primary/20 hover:border-primary transition-all bg-muted"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                    {user?.id ? (
                      <div className="text-primary font-bold text-sm">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-[60]"
                    >
                      <div className="px-4 py-3 border-b border-border bg-muted/30">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
                        <p className="text-sm font-medium text-foreground truncate">{user?.first_name} {user?.last_name}</p>
                      </div>
                      <div className="p-1">
                        <Link 
                          to="/profile" 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                        >
                          <UserCircle className="w-4 h-4" />
                          My Profile
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                dispatch(toggleSidebar());
              } else {
                setIsOpen(!isOpen);
              }
            }}
            className="lg:hidden p-2 text-foreground"
          >
            {isAuthenticated ? (
              <Menu className="w-6 h-6" />
            ) : (
              isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`font-medium transition-colors py-2 ${
                      isActive(link.href) ? "text-primary" : "text-foreground hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors" onClick={() => setIsOpen(false)}>
                      <User className="w-4 h-4" />
                      Login
                    </Link>
                    <Link to="/donation" className="btn-primary text-center" onClick={() => setIsOpen(false)}>
                      Donate Now
                    </Link>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link 
                      to="/profile" 


                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted text-foreground font-medium"
                    >
                      <UserCircle className="w-5 h-5" />
                      My Profile
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 py-3 rounded-lg border border-destructive/20 text-destructive font-bold hover:bg-destructive/5 transition-colors w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;
