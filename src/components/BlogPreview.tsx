import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import img from "@/assets/image.png";
import img1 from "@/assets/image1.png";
import img2 from "@/assets/image2.png";
import img3 from "@/assets/image3.png";
import img4 from "@/assets/image4.png";
import img5 from "@/assets/image5.png";
import img6 from "@/assets/image6.png";

const blogPosts = [
  {
    id: 1,
    title: "गौ माता की सेवा का महत्व",
    excerpt: "जानिए हमारे शास्त्रों में गौ सेवा का क्या महत्व है और कैसे यह हमारे जीवन को प्रभावित करती है...",
    date: "March 5, 2026",
    image: img1,
  },
  {
    id: 2,
    title: "Our Journey: 10 Years of Gau Seva",
    excerpt: "A look back at our decade-long journey of serving Gau Mata and the milestones we have achieved...",
    date: "February 28, 2026",
    image: img3,
  },
  {
    id: 3,
    title: "Volunteer Spotlight: Meet Our Seva Team",
    excerpt: "Meet the dedicated volunteers who work tirelessly to ensure our cows receive the best care...",
    date: "February 20, 2026",
    image: img6,
  },
];

const BlogPreview = () => {
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
          <span className="text-primary font-medium">Blog</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Latest <span className="gradient-text text-white">News & Stories</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="card-elevated overflow-hidden group"
            >
              <div className="aspect-video overflow-hidden -mx-6 -mt-6 mb-4">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
            </motion.article>
          ))}
        </div>

        <div className="text-center">
          <Link to="/blog" className="btn-secondary inline-flex items-center gap-2">
            Read More Stories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
