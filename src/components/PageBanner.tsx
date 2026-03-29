import { motion } from "framer-motion";

interface PageBannerProps {
  title: string;
  subtitle?: string;
  image: string;
}

const PageBanner = ({ title, subtitle, image }: PageBannerProps) => {
  return (
    <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/40" />
      
      <div className="relative z-10 text-center text-primary-foreground px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-bold mb-4"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default PageBanner;
