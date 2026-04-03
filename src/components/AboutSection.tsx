import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Heart, Users, Leaf } from "lucide-react";
import logo from "@/assets/logo.jpg";

const features = [
  {
    icon: Shield,
    title: "Rescue & Shelter",
    description: "We rescue abandoned and injured cows from streets and provide them safe shelter.",
  },
  {
    icon: Heart,
    title: "Medical Care",
    description: "24/7 veterinary care and treatment for sick and injured cows.",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Working with local communities to spread awareness about Gau Seva.",
  },
  {
    icon: Leaf,
    title: "Sustainable Living",
    description: "Promoting organic farming using cow-based products and natural fertilizers.",
  },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="section-padding bg-card" ref={ref}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-medium">About Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
              Dedicated to the Sacred Service of <span className="gradient-text text-white">Gau Mata</span>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Shree Jalaram Gau Seva Trust, Gandhinagar is a registered charitable trust 
              devoted to the protection and care of cows. Established with the blessings 
              of Shree Jalaram Bapa, we have been serving Gau Mata with utmost dedication.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Our Gaushala provides shelter to over 500 cows, including abandoned calves, 
              old cows, and those rescued from slaughterhouses. We believe in the ancient 
              Indian tradition that considers cow protection as one of the highest forms of service.
            </p>

            <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
              <img src={logo} alt="Trust Logo" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-foreground">Trust Reg. No: A/994/Gandhinagar</p>
                <p className="text-sm text-muted-foreground">PAN: ABITS0639N</p>
              </div>
            </div>
          </motion.div>

          {/* Right - Features grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="card-elevated group hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
