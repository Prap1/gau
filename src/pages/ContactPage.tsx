import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PageBanner from "@/components/PageBanner";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import img1 from "@/assets/image1.png";
import img2 from "@/assets/image2.png";
import img3 from "@/assets/image3.png";
import img4 from "@/assets/image4.png";
import img5 from "@/assets/image5.png";
import img6 from "@/assets/image6.png";
import img7 from "@/assets/image7.png";
import img8 from "@/assets/image8.png";
import img9 from "@/assets/image9.png";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+91 94949 47108"],
    action: "tel:+919494947108",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["Shreejalaramgstg@gmail.com"],
    action: "mailto:Shreejalaramgstg@gmail.com",
  },
  {
    icon: MapPin,
    title: "Address",
    details: ["Shree Jalaram Gau Seva Trust", "Sukhdeshwar Gau Dham Hospital, Pethapur"],
    action: "https://maps.app.goo.gl/tHfRTExebkqXaRP18?g_st=iw",
  },
  {
    icon: Clock,
    title: "Visiting Hours",
    details: ["Monday - Sunday", "6:00 AM - 7:00 PM"],
  },
];

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <Layout>
      <PageBanner
        title="Contact Us"
        subtitle="We'd love to hear from you. Reach out for any queries or to plan a visit."
        image={img4}
      />

      <section className="section-padding bg-background">
        <div className="container mx-auto">
          {/* Contact Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((item, index) => (
              <motion.a
                key={index}
                href={item.action}
                target={item.action?.startsWith("http") ? "_blank" : undefined}
                rel={item.action?.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="card-elevated text-center hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors">
                  <item.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                {item.details.map((detail, i) => (
                  <p key={i} className="text-sm text-muted-foreground break-words">{detail}</p>
                ))}
              </motion.a>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="card-elevated"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-forest" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">Thank you for reaching out. We'll get back to you soon.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-secondary mt-4"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Subject *</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Subject"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Your message..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="rounded-xl overflow-hidden shadow-lg h-[400px]">
                <iframe
                  src="https://www.google.com/maps?q=Sukhdeshwar+Gau+Dham+Hospital+Pethapur&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Gaushala Location"
                ></iframe>
              </div>

              <a
                href="https://maps.app.goo.gl/tHfRTExebkqXaRP18?g_st=iw"
                target="_blank"
                rel="noopener noreferrer"
                className="card-elevated block hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Get Directions</h3>
                    <p className="text-sm text-muted-foreground">Open in Google Maps</p>
                  </div>
                </div>
              </a>

              <div className="card-elevated bg-primary/5 border-2 border-primary/20">
                <h3 className="font-bold text-foreground mb-4">Plan Your Visit</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Visiting hours: 6:00 AM - 7:00 PM (All days)</li>
                  <li>• Best time to visit: Morning (6-9 AM) for feeding</li>
                  <li>• Free entry for all visitors</li>
                  <li>• Volunteers welcome - contact us to register</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
