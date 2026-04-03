import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export const FullScreenLoader = () => {
  const { isLoggingOut, isAuthActionLoading, authActionMessage } = useSelector((state: RootState) => state.auth);
  const showLoader = isLoggingOut || isAuthActionLoading;

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">
                {authActionMessage || (isLoggingOut ? "Logging Out..." : "Please wait...")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoggingOut ? "Securing your session, please wait." : "Securing your data, please wait."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenLoader;
