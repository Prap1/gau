import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import img from "@/assets/image.png";
import img1 from "@/assets/image1.png";
import img2 from "@/assets/image2.png";
import img3 from "@/assets/image3.png";
import img4 from "@/assets/image4.png";
import img5 from "@/assets/image5.png";
import img6 from "@/assets/image6.png";

const bannerSlides = [
  {
    image: img1,
    title: "गौ माता की सेवा में समर्पित",
    subtitle: "Dedicated to the Service of Gau Mata",
    description: "Join us in our sacred mission to protect and care for our beloved cows",
  },
  {
    image: img3,
    title: "500+ गौ माताओं का आश्रय",
    subtitle: "Shelter for 500+ Cows",
    description: "Providing food, medical care, and love to abandoned and injured cows",
  },
  {
    image: img2,
    title: "आपका दान, गौ माता का आशीर्वाद",
    subtitle: "Your Donation, Gau Mata's Blessings",
    description: "Every contribution helps us continue our sacred seva",
  },
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);

  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={bannerSlides[currentSlide].image}
            alt={bannerSlides[currentSlide].subtitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-primary-foreground"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-2 text-saffron-light">
              {bannerSlides[currentSlide].title}
            </h2>
            <h3 className="text-xl md:text-3xl font-semibold mb-4">
              {bannerSlides[currentSlide].subtitle}
            </h3>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              {bannerSlides[currentSlide].description}
            </p>
            <a href="/donation" className="btn-primary inline-block">
              Donate Now
            </a>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-primary/80 text-primary-foreground hover:bg-primary transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-primary/80 text-primary-foreground hover:bg-primary transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-primary w-8" : "bg-primary-foreground/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
