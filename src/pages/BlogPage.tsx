import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PageBanner from "@/components/PageBanner";
import { Calendar, User as UserIcon, ArrowRight, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchPosts } from "@/redux/blogSlice";
import img4 from "@/assets/image4.png";

const blogCategories = ["All", "Cows", "Feeding", "Medical", "Events", "Volunteers", "General"];

const BlogPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading } = useSelector((state: RootState) => state.blog);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && post.is_published;
  });

  const featuredPost = filteredPosts[0]; // Take the first published post as featured for now

  return (
    <Layout>
      <PageBanner
        title="Blog & Stories"
        subtitle="Read about our journey, events, and the spiritual significance of Gau Seva"
        image={img4}
      />

      <section className="section-padding bg-background">
        <div className="container mx-auto">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-12">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {blogCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:bg-primary/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Post */}
          {loading && posts.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : (
            <>
              {featuredPost && activeCategory === "All" && !searchQuery && (
                <motion.article
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="mb-12 card-elevated overflow-hidden"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="aspect-video md:aspect-auto overflow-hidden -m-6 md:-ml-6 md:-my-6 md:mr-0">
                      <img
                        src={featuredPost.cover_image_url || ""}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-primary font-medium text-sm mb-2">{featuredPost.category}</span>
                      <h2 className="text-2xl font-bold text-foreground mb-3">{featuredPost.title}</h2>
                      <p className="text-muted-foreground mb-4 line-clamp-3">{featuredPost.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(featuredPost.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><UserIcon className="w-4 h-4" />{featuredPost.author_details?.first_name} {featuredPost.author_details?.last_name}</span>
                      </div>
                      <Link to={`/blog/${featuredPost.id}`} className="btn-primary inline-flex items-center gap-2 w-fit">
                        Read More <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              )}

              {/* Blog Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.filter(p => p.id !== featuredPost?.id || activeCategory !== "All" || searchQuery).map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 * index }}
                    className="card-elevated overflow-hidden group border border-border/50 hover:border-primary/50 transition-all flex flex-col h-full shadow-lg"
                  >
                    <div className="aspect-video overflow-hidden -mx-6 -mt-6 mb-4 flex-shrink-0">
                      <img
                        src={post.cover_image_url || ""}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">{post.category}</span>
                    <h3 className="font-bold text-foreground mt-3 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.content}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(post.created_at).toLocaleDateString()}</span>
                      <Link to={`/blog/${post.id}`} className="text-primary hover:underline flex items-center gap-1 font-bold">
                        Read <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            </>
          )}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;
