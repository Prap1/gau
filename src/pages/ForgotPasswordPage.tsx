import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, KeyRound } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { forgotPassword, clearError, clearMessage } from "@/redux/authSlice";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, message } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&context=reset`);
    }
  }, [error, message, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(forgotPassword({ email }));
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center section-padding">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="card-elevated text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Forgot Password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="card-elevated space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full text-center">
                Send Reset Link
              </button>

              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Back to Login
                </Link>
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-elevated text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Check Your Email</h2>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-primary font-medium hover:underline"
              >
                Try a different email
              </button>
              <p className="text-sm text-muted-foreground">
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Back to Login
                </Link>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
