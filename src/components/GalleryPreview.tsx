import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import img from "@/assets/image.png";
import img1 from "@/assets/image1.png";
import img2 from "@/assets/image2.png";
import img3 from "@/assets/image3.png";

const galleryImages = [
  { url: img, title: "Our Cows" },
  { url: img1, title: "Feeding Time" },
  { url: img2, title: "Healthy Calves" },
  { url: img3, title: "Green Pastures" },
];

const GalleryPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding bg-card" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-primary font-medium">Gallery</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Glimpses of <span className="gradient-text text-white">Our Gaushala</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="group relative overflow-hidden rounded-xl aspect-square"
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-primary-foreground font-medium">{image.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/gallery" className="btn-secondary inline-flex items-center gap-2">
            View Full Gallery
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreview;
