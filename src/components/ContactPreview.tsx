import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";

const ContactPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding bg-card" ref={ref}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-medium">Contact Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6 break-words">
              Visit Our <span className="gradient-text text-white inline-block">Gaushala</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              We welcome visitors to our Gaushala. Come and see our beloved cows,
              participate in seva, and experience the joy of Gau Seva firsthand.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">+91 94949 47108</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground break-all">Shreejalaramgstg@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">Sukhdeshwar Gau Dham Hospital, Pethapur</p>
                </div>
              </div>
            </div>

            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              Get in Touch
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="rounded-xl overflow-hidden shadow-lg"
          >
            <iframe
              src="https://www.google.com/maps?q=Sukhdeshwar+Gau+Dham+Hospital+Pethapur&output=embed"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Gaushala Location"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactPreview;
