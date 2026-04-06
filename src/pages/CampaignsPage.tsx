import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchVisitors } from "@/redux/visitorSlice";
import { fetchDonors } from "@/redux/donorSlice";
import Layout from "@/components/Layout";
import PageBanner from "@/components/PageBanner";
import api from "@/redux/api";
import { toast } from "sonner";
import { MessageSquare, Send, Users, CheckSquare, Square, Smartphone, Image as ImageIcon } from "lucide-react";

const CampaignsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { visitors } = useSelector((state: RootState) => state.visitor);
  const { donors } = useSelector((state: RootState) => state.donor);

  const [apiKey, setApiKey] = useState("");
  const [target, setTarget] = useState<"donors" | "visitors" | "both" | "specific">("both");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    dispatch(fetchVisitors());
    dispatch(fetchDonors());
    const savedKey = localStorage.getItem("fast2sms_api_key");
    if (savedKey) setApiKey(savedKey);
  }, [dispatch]);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    localStorage.setItem("fast2sms_api_key", e.target.value);
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSend = async () => {
    if (!apiKey) {
      toast.error("Please provide your Fast2SMS API Key");
      return;
    }
    if (!message && !imageFile) {
      toast.error("Message content or image attachment is required.");
      return;
    }
    if (target === "specific" && selectedIds.length === 0) {
      toast.error("Please select at least one recipient.");
      return;
    }

    setIsSending(true);
    try {
      let response;
      if (imageFile) {
        const formData = new FormData();
        formData.append("target", target);
        formData.append("message", message);
        formData.append("api_key", apiKey);
        formData.append("specific_ids", JSON.stringify(selectedIds));
        formData.append("image", imageFile);

        response = await api.post("/management/send-campaign/", formData, {
          headers: {
             "Content-Type": "multipart/form-data",
          }
        });
      } else {
        response = await api.post("/management/send-campaign/", {
          target,
          message,
          api_key: apiKey,
          specific_ids: selectedIds
        });
      }

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

  // Combining list for specific view
  const combinedList = [
    ...donors.map(d => ({ id: `donor_${d.id}`, name: d.name, type: 'Donor', phone: d.phone })),
    ...visitors.map(v => ({ id: `visitor_${v.id}`, name: v.name, type: 'Visitor', phone: v.phone }))
  ].filter(p => p.phone); // only show those with phone

  return (
    <Layout>
      <PageBanner
        title="WhatsApp Campaigns"
        subtitle="Send WhatsApp notifications to donors and visitors"
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
                  <label className="block text-sm font-medium mb-1">Fast2SMS API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={handleKeyChange}
                    placeholder="Enter your Fast2SMS authorization key"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">This key is saved locally in your browser.</p>
                </div>

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
                  <label className="block text-sm font-medium mb-1">Message Content</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your WhatsApp message here..."
                    rows={6}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Attach Image (Optional)</label>
                  <label className="flex items-center gap-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{imageFile ? imageFile.name : "Choose an image file..."}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        } else {
                          setImageFile(null);
                          setImagePreview(null);
                        }
                      }}
                    />
                  </label>
                  {imagePreview && (
                    <div className="mt-2 relative inline-block p-1 bg-muted rounded-md w-fit">
                      <img src={imagePreview} alt="Preview" className="h-24 w-auto rounded border border-border object-cover" />
                      <button 
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/90 shadow-sm"
                      >
                       ✕
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
                              {isSelected ? <CheckSquare className="w-5 h-5 text-primary inline-block"/> : <Square className="w-5 h-5 text-muted-foreground inline-block"/>}
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
                <Smartphone className="w-5 h-5 text-green-500" /> WhatsApp Preview
              </h3>
              <div className="bg-[#e5ddd5] rounded-lg p-4 h-[450px] flex flex-col relative overflow-hidden">
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 text-center text-xs text-muted-foreground rounded-full mb-4 w-max mx-auto shadow-sm">
                  Today
                </div>
                {(message || imagePreview) ? (
                  <div className="bg-green-100 p-2 rounded-lg rounded-tr-none shadow-sm w-[85%] self-end break-words text-sm relative">
                    {imagePreview && (
                       <img src={imagePreview} alt="Attachment" className="w-full rounded mb-2 border border-green-200 object-cover max-h-[160px]" />
                    )}
                    {message && <div className="px-1 py-0.5 whitespace-pre-wrap">{message}</div>}
                    <span className="text-[10px] text-green-800/60 block text-right mt-1 pr-1">12:00 PM</span>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-sm mt-10">
                    Type a message or attach an image to preview
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CampaignsPage;
