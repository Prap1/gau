import { Link } from "react-router-dom";
import { Heart, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-earth text-cream py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & About */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Logo" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h3 className="font-bold text-lg">Shree Jalaram</h3>
                <p className="text-cream/70 text-sm">Gau Seva Trust</p>
              </div>
            </div>
            <p className="text-cream/80 text-sm leading-relaxed mb-4">
              Dedicated to the sacred service of Gau Mata since 2023.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Instagram, href: "https://www.instagram.com/jalaramgausevagandhinagar?igsh=NzM4eXhrcjMwenN1" },
                { Icon: Twitter, href: "#" },
                { Icon: Youtube, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target={href !== "#" ? "_blank" : undefined} rel={href !== "#" ? "noopener noreferrer" : undefined} className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-saffron transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "About Us", href: "/#about" },
                { name: "Donation", href: "/donation" },
                { name: "Gallery", href: "/gallery" },
                { name: "Blog", href: "/blog" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-cream/80 hover:text-saffron-light transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bank Details */}
          <div>
            <h4 className="font-bold mb-4">Bank Details</h4>
            <div className="text-sm text-cream/80 space-y-1">
              <p>Bank: Kotak Mahindra Bank</p>
              <p>A/C Name: Shree Jalaram Gau Seva Trust Gandhinagar</p>
              <p>A/C No: 4549577313</p>
              <p>IFSC: KKBK0000879</p>
              <p className="mt-3 text-saffron-light font-medium">UPI: jalaramgauseva@kotak</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <div className="text-sm text-cream/80 space-y-2">
              <p>📞 +91 94949 47108</p>
              <p>✉️ contact@jalaramgauseva.org</p>
              <p>📍 Sukhdeshwar Gau Dham Hospital, Pethapur</p>
              <p className="mt-3">
                <span className="text-muted-foreground">Visiting Hours:</span><br />
                Mon - Sun: 6:00 AM - 7:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cream/60 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-saffron" fill="currentColor" /> for Gau Seva
            </p>
            <p className="text-cream/60 text-sm text-center">
              Trust Reg. No: A/994/Gandhinagar | PAN: ABITS0639N
            </p>
            <p className="text-cream/40 text-xs">
              © {new Date().getFullYear()} Shree Jalaram Gau Seva Trust
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
