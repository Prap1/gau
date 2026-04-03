import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";

const donationOptions = [
  { amount: 500, label: "Feed a cow for 1 day", icon: "🌾" },
  { amount: 5000, label: "Feed a cow for 10 days", icon: "🥬" },
  { amount: 11000, label: "Monthly food sponsorship", icon: "🏠" },
  { amount: 51000, label: "Medical care support", icon: "💊" },
];

const DonationPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding bg-background" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-primary font-medium">Support Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Your <span className="gradient-text text-white">Donation</span> Matters
          </h2>
          <p className="text-muted-foreground">
            Every rupee you donate goes directly towards the care and well-being of our Gau Mata
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {donationOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="card-elevated text-center hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="text-4xl mb-4">{option.icon}</div>
              <div className="text-2xl font-bold gradient-text text-white mb-2">₹{option.amount.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">{option.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <Link to="/donation" className="btn-primary inline-flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Donate Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default DonationPreview;
