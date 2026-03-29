import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { verifyOtp, resendOtp, clearError, clearMessage } from "@/redux/authSlice";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, message, isAuthenticated, pendingApproval } = useSelector((state: RootState) => state.auth);

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email") || "";
  const context = queryParams.get("context") || "";

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (pendingApproval) {
      navigate("/login");
    }
  }, [pendingApproval, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    if (context === "reset") {
      navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${code}`);
      return;
    }
    dispatch(verifyOtp({ email, code }));
  };

  const handleResendOtp = () => {
    if (!email) {
      toast.error("Email is missing. Cannot resend OTP.");
      return;
    }
    dispatch(resendOtp({ email }));
    setTimer(600);
  };

  return (
    <Layout>
      <div className="min-h-[90vh] flex items-center justify-center section-padding relative overflow-hidden bg-muted/30">
        {/* Decorative background blobs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="card-elevated p-10 border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
             {/* Progress line at top */}
             <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 600, ease: "linear" }}
                  className="h-full bg-primary"
                />
             </div>

            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-inner">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">Security Verification</h1>
              <p className="text-muted-foreground max-w-xs leading-relaxed">
                A 6-digit code has been sent to <span className="text-foreground font-bold">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-between gap-2 sm:gap-4">
                {otp.map((digit, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 max-w-[64px]"
                  >
                    <input
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      autoFocus={i === 0}
                      className={`w-full h-16 sm:h-20 text-center text-2xl font-black rounded-2xl border-2 ${
                        digit ? "border-primary bg-primary/5" : "border-border bg-background"
                      } text-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-sm`}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 py-2 text-sm">
                <div className={`flex items-center gap-1.5 py-1 px-3 rounded-full font-bold ${timer < 60 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-muted text-muted-foreground'}`}>
                   Expires in: <span className="tabular-nums">{formatTime(timer)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0" 
                disabled={loading || timer === 0}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                    Verifying...
                  </>
                ) : "Verify Account"}
              </button>

              <div className="space-y-4 pt-4 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  Didn't receive a code?{" "}
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    className="text-primary font-bold hover:underline disabled:opacity-50 inline-flex items-center"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                </p>

                <div className="w-12 h-1 bg-border/50 mx-auto rounded-full" />

                <Link to="/login" className="inline-block text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default VerifyOtpPage;
