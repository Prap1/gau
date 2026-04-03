import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchPosts } from "@/redux/blogSlice";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import {
  Calendar,
  User as UserIcon,
  Tag,
  ArrowLeft,
  Clock,
  Loader2,
  BookOpen,
} from "lucide-react";

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading } = useSelector((state: RootState) => state.blog);

  useEffect(() => {
    if (posts.length === 0) {
      dispatch(fetchPosts());
    }
  }, [dispatch, posts.length]);

  const post = posts.find((p) => p.id === Number(id));
  const relatedPosts = posts
    .filter((p) => p.id !== Number(id) && p.is_published && p.category === post?.category)
    .slice(0, 3);

  // Estimate reading time (~200 words/min)
  const readingTime = post
    ? Math.max(1, Math.ceil(post.content.split(" ").length / 200))
    : 1;

  if (loading && posts.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Post Not Found</h1>
          <p className="text-muted-foreground max-w-md">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blog" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="relative h-[50vh] md:h-[65vh] overflow-hidden">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-4 md:left-8 z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border text-sm font-bold hover:bg-background transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-6 right-4 md:right-8 z-10">
          <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest bg-primary text-primary-foreground shadow-lg">
            {post.category}
          </span>
        </div>

        {/* Title area */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-10 z-10">
          <div className="max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-4 drop-shadow"
            >
              {post.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">
                  {post.author_details?.first_name} {post.author_details?.last_name}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {new Date(post.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {readingTime} min read
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-primary" />
                {post.category}
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="card-elevated border border-border/50 shadow-2xl"
            >
              {/* Author row */}
              <div className="flex items-center gap-4 pb-8 mb-8 border-b border-border/50">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xl font-extrabold shadow-lg flex-shrink-0">
                  {post.author_details?.first_name?.[0] || "A"}
                </div>
                <div>
                  <p className="font-extrabold text-foreground text-base">
                    {post.author_details?.first_name} {post.author_details?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {post.author_details?.role || "Author"}
                  </p>
                </div>
                <div className="ml-auto text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Published</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(post.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Article body */}
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {post.content.split("\n").map((paragraph, idx) =>
                  paragraph.trim() ? (
                    <p
                      key={idx}
                      className="text-foreground/90 leading-relaxed text-base md:text-lg mb-5"
                    >
                      {paragraph}
                    </p>
                  ) : (
                    <div key={idx} className="h-2" />
                  )
                )}
              </div>

              {/* Footer tags */}
              <div className="mt-10 pt-6 border-t border-border/50 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-2">
                  Category:
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                  {post.category}
                </span>
              </div>
            </motion.div>

            {/* Navigation buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-bold hover:bg-muted transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <Link
                to="/blog"
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                <BookOpen className="w-4 h-4" />
                All Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-8">
                Related Articles
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((related, index) => (
                  <motion.article
                    key={related.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="card-elevated group overflow-hidden border border-border/50 hover:border-primary/50 transition-all flex flex-col"
                  >
                    <div className="aspect-video overflow-hidden -mx-6 -mt-6 mb-4 flex-shrink-0">
                      {related.cover_image_url ? (
                        <img
                          src={related.cover_image_url}
                          alt={related.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded w-fit">
                      {related.category}
                    </span>
                    <h3 className="font-bold text-foreground mt-3 mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-grow">
                      {related.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {related.content}
                    </p>
                    <Link
                      to={`/blog/${related.id}`}
                      className="text-sm font-bold text-primary hover:underline flex items-center gap-1 mt-auto"
                    >
                      Read Article →
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default BlogDetailPage;
