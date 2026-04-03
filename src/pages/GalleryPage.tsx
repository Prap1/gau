import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PageBanner from "@/components/PageBanner";
import { X, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchGallery } from "@/redux/gallerySlice";

const galleryCategories = ["All", "Cows", "Feeding", "Medical", "Events", "Volunteers"];

const GalleryPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { images, loading } = useSelector((state: RootState) => state.gallery);
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchGallery());
  }, [dispatch]);

  const filteredImages = (activeCategory === "All" 
    ? images 
    : images.filter(img => img.category === activeCategory)).filter(img => img.is_approved);

  return (
    <Layout>
      <PageBanner
        title="Photo Gallery"
        subtitle="Glimpses of our Gaushala and the beautiful moments we share with Gau Mata"
        image="https://images.unsplash.com/photo-1548256925-6afac6bb7e4c?w=1920&h=400&fit=crop"
      />

      <section className="section-padding bg-background">
        <div className="container mx-auto">
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {galleryCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-primary/10"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Gallery Grid */}
          {loading && images.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.05 * index }}
                  className="group relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer shadow-lg"
                  onClick={() => setLightboxImage(image.image_url)}
                >
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div>
                      <p className="text-primary-foreground font-semibold">{image.title}</p>
                      <p className="text-primary-foreground/70 text-sm uppercase tracking-wider text-[10px] font-bold">{image.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-primary-foreground hover:text-primary transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxImage}
            alt="Gallery Image"
            className="max-w-full max-h-[90vh] rounded-lg"
          />
        </motion.div>
      )}
    </Layout>
  );
};

export default GalleryPage;
