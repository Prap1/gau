import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PageBanner from "@/components/PageBanner";
import { Copy, Check, Building, CreditCard, Smartphone, MapPin, Heart } from "lucide-react";
import { useState } from "react";
import img3 from "@/assets/image3.png";
import qrCodeImg from "@/assets/qr.jpg";

const donationOptions = [
  { amount: 500, label: "Feed a cow for 1 day", icon: "🌾" },
  { amount: 1100, label: "Feed a cow for 2 days", icon: "🥬" },
  { amount: 2100, label: "Feed a cow for 4 days", icon: "🌿" },
  { amount: 5000, label: "Feed a cow for 10 days", icon: "🏠" },
  { amount: 11000, label: "Monthly food sponsorship", icon: "📅" },
  { amount: 21000, label: "Quarterly care package", icon: "💚" },
  { amount: 51000, label: "Medical care support", icon: "💊" },
  { amount: 101000, label: "Yearly sponsorship", icon: "🌟" },
];

const bankDetails = {
  bank: "Kotak Mahindra Bank",
  name: "Shree Jalaram Gau Seva Trust Gandhinagar",
  account: "4549577313",
  ifsc: "KKBK0000879",
  upi: "jalaramgauseva@kotak",
};

const DonationPage = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Layout>
      <PageBanner
        title="Donate for Gau Seva"
        subtitle="Your generosity helps us care for our beloved Gau Mata"
        image={img3}
      />

      <section className="section-padding bg-background">
        <div className="container mx-auto">
          {/* Donation Options */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Choose Your <span className="gradient-text text-white">Donation Amount</span>
            </h2>
            <p className="text-muted-foreground">
              Every donation, big or small, makes a difference in the lives of our cows
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {donationOptions.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedAmount(option.amount)}
                className={`p-6 rounded-xl border-2 transition-all text-center ${selectedAmount === option.amount
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-card"
                  }`}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className="text-xl font-bold text-primary mb-1">₹{option.amount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{option.label}</div>
              </motion.button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Bank Transfer */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="card-elevated"
            >
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Bank Transfer Details
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Bank Name", value: bankDetails.bank, key: "bank" },
                  { label: "Account Name", value: bankDetails.name, key: "name" },
                  { label: "Account No.", value: bankDetails.account, key: "account" },
                  { label: "IFSC Code", value: bankDetails.ifsc, key: "ifsc" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-foreground">{item.value}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.value, item.key)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      {copiedField === item.key ? (
                        <Check className="w-5 h-5 text-forest" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* UPI & Other */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="card-elevated"
              >
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  UPI Payment
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* QR Code */}
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-border">
                    <img src={qrCodeImg} alt="UPI QR Code" className="w-40 h-40 object-contain" />
                  </div>

                  {/* Details & Copy Button */}
                  <div className="flex-1 w-full space-y-4 text-center sm:text-left">
                    <div className="p-4 bg-primary/10 rounded-lg flex flex-col items-center sm:items-start">
                      <p className="text-sm text-muted-foreground mb-1">Scan QR or use UPI ID</p>
                      <p className="font-bold text-primary text-lg break-all">{bankDetails.upi}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.upi, "upi")}
                      className="btn-primary w-full py-2 px-4 flex items-center justify-center gap-2 transition-all"
                    >
                      {copiedField === "upi" ? (
                        <>
                          <Check className="w-4 h-4" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy UPI ID
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="card-elevated"
              >
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Visit & Donate
                </h3>
                <a
                  href="https://maps.app.goo.gl/PsLTxw8yGjWSSgE96"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-forest/10 rounded-lg hover:bg-forest/20 transition-colors"
                >
                  <p className="font-medium text-forest">📍 Open in Google Maps</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visit our Gaushala and donate in person
                  </p>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="card-elevated bg-primary/5 border-2 border-primary/20"
              >
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Trust Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Trust Reg. No:</span> <span className="font-medium">A/994/Gandhinagar</span></p>
                  <p><span className="text-muted-foreground">PAN No:</span> <span className="font-medium">ABITS0639N</span></p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Why Donate */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-16 text-center"
          >
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Why <span className="gradient-text text-white">Donate to Us?</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: "🐄", title: "100% for Cows", desc: "Every rupee goes directly to cow care" },
                { icon: "📋", title: "Transparent", desc: "Regular updates on fund utilization" },
                { icon: "🏆", title: "10+ Years", desc: "Trusted service for over a decade" },
              ].map((item, i) => (
                <div key={i} className="card-elevated">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default DonationPage;
