import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchVisitors } from "@/redux/visitorSlice";
import { fetchDonors } from "@/redux/donorSlice";
import Layout from "@/components/Layout";
import PageBanner from "@/components/PageBanner";
import api from "@/redux/api";
import { toast } from "sonner";
import { MessageSquare, Send, Users, CheckSquare, Square, Smartphone, AlertCircle, Image as ImageIcon, X } from "lucide-react";
import img5 from "@/assets/image5.png";

const CampaignsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { visitors } = useSelector((state: RootState) => state.visitor);
  const { donors } = useSelector((state: RootState) => state.donor);

  const [target, setTarget] = useState<"donors" | "visitors" | "both" | "specific">("both");
  const [message, setMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchVisitors());
    dispatch(fetchDonors());
  }, [dispatch]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const hasEmoji = (text: string) => {
    // Regex to detect Emojis
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
    return emojiRegex.test(text);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSend = async () => {
    if (!message && !imageFile) {
      toast.error("Message content or image is required.");
      return;
    }
    if (message.length > 1000) {
      toast.error("Message must be less than 1000 characters.");
      return;
    }
    if (target === "specific" && selectedIds.length === 0) {
      toast.error("Please select at least one recipient.");
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("target", target);
      formData.append("message", message);
      formData.append("specific_ids", JSON.stringify(selectedIds));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await api.post("/management/send-campaign/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(response.data.message || "Messages sent successfully!");
      if (target === "specific") setSelectedIds([]);
      setMessage("");
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send messages");
    } finally {
      setIsSending(false);
    }
  };

  // Combining list for specific view with deduplication by phone
  const rawList = [
    ...donors.map(d => ({ id: `donor_${d.id}`, name: d.name, type: 'Donor', phone: d.phone })),
    ...visitors.map(v => ({ id: `visitor_${v.id}`, name: v.name, type: 'Visitor', phone: v.phone }))
  ].filter(p => p.phone);

  const deduplicatedMap = new Map();
  rawList.forEach(item => {
    let cleanPhone = item.phone.replace(/\D/g, '');
    if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }
    // If phone already exists, prioritize 'Donor' type over 'Visitor'
    if (!deduplicatedMap.has(cleanPhone) || item.type === 'Donor') {
      deduplicatedMap.set(cleanPhone, item);
    }
  });
  
  const combinedList = Array.from(deduplicatedMap.values());

  return (
    <Layout>
      <PageBanner
        title="WhatsApp Campaigns"
        subtitle="Send WhatsApp notifications to donors and visitors"
        image={img5}
      />
      <div className="container py-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Compose Message
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Audience</label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as any)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="both">Both Donors & Visitors</option>
                    <option value="donors">All Donors</option>
                    <option value="visitors">All Visitors</option>
                    <option value="specific">Select Specific People</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium">Message Content</label>
                    <span className={`text-xs font-medium ${message.length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {message.length}/1000
                    </span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your WhatsApp message here..."
                    rows={6}
                    maxLength={1000}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y"
                  ></textarea>
                  <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-lg space-y-2">
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      WhatsApp Message Info:
                    </p>
                    <ul className="text-[11px] text-emerald-700/80 dark:text-emerald-400 space-y-1 list-disc pl-4">
                      <li>Standard Fast2SMS WhatsApp rates apply.</li>
                      <li>Regional languages and Emojis are fully supported.</li>
                      <li>Rich text and longer messages are allowed.</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium mb-2">Attach Photo (Optional)</label>
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-input border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload photo</span> or drag and drop</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  ) : (
                    <div className="relative inline-block border border-border rounded-lg p-1 bg-muted/20">
                      <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded-md" />
                      <button onClick={removeImage} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSend}
                    disabled={isSending}
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {isSending ? "Sending..." : "Send WhatsApp message"}
                  </button>
                </div>
              </div>
            </div>

            {target === "specific" && (
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[600px]">
                <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                  <h3 className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Select Recipients ({selectedIds.length} selected)
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedIds(combinedList.map(item => item.id))} className="text-xs text-primary hover:underline">Select All</button>
                    <button onClick={() => setSelectedIds([])} className="text-xs text-destructive hover:underline">Clear</button>
                  </div>
                </div>
                <div className="overflow-y-auto p-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left bg-muted/50">
                        <th className="p-3 w-10">Select</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedList.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <tr key={item.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                            <td className="p-3 text-center cursor-pointer" onClick={() => toggleSelection(item.id)}>
                              {isSelected ? <CheckSquare className="w-5 h-5 text-primary inline-block" /> : <Square className="w-5 h-5 text-muted-foreground inline-block" />}
                            </td>
                            <td className="p-3 font-medium">{item.name}</td>
                            <td className="p-3 font-mono text-xs">{item.phone}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${item.type === 'Donor' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                                {item.type}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                      {combinedList.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-muted-foreground">No contacts with valid phone numbers found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="font-semibold flex justify-center items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-emerald-500" /> WhatsApp Preview
              </h3>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 h-[450px] flex flex-col relative overflow-hidden">
                <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm px-4 py-2 text-center text-xs text-muted-foreground rounded-full mb-4 w-max mx-auto shadow-sm">
                  Today
                </div>
                {message ? (
                  <div className="bg-emerald-500 text-white p-2 rounded-2xl rounded-tr-sm shadow-sm w-[85%] self-end break-words text-sm relative">
                    {imagePreview && (
                      <img src={imagePreview} alt="Attached message preview" className="w-full max-h-[200px] object-cover rounded-lg mb-2" />
                    )}
                    <div className="px-1 py-0.5 whitespace-pre-wrap">{message}</div>
                    <span className="text-[10px] text-emerald-100 block text-right mt-1 pr-1">12:00 PM</span>
                  </div>
                ) : ( imagePreview ? (
                  <div className="bg-emerald-500 text-white p-2 rounded-2xl rounded-tr-sm shadow-sm w-[85%] self-end break-words text-sm relative">
                    <img src={imagePreview} alt="Attached message preview" className="w-full max-h-[200px] object-cover rounded-lg" />
                    <span className="text-[10px] text-emerald-100 block text-right mt-1 pr-1">12:00 PM</span>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-sm mt-10">
                    Type a message or attach a photo to preview
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CampaignsPage;
