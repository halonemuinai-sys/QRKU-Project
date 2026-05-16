/* eslint-disable react/forbid-dom-props */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import axios from "axios";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { 
  QrCode, 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  Globe, 
  Palette, 
  Download, 
  RefreshCw,
  Sparkles,
  Upload,
  X,
  Star,
  Image as ImageIcon,
  CheckCircle2,
  Wifi,
  MapPin,
  Link as LinkIcon,
  Zap,
  Layout,
  Circle,
  Square,
  Navigation,
  MousePointer2,
  BarChart3,
  TrendingUp,
  Award,
  History,
  Trash2,
  ExternalLink,
  Edit3,
  MessageSquare,
  Camera,
  Play,
  Smartphone,
  LogOut
} from "lucide-react";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from "recharts";

// Dynamic import for Leaflet (must disable SSR since Leaflet needs 'window')
const MapWrapper = dynamic(() => import("./MapWrapper"), { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center font-bold">Loading Map...</div> });
const AnalyticsMap = dynamic(() => import("./AnalyticsMap"), { ssr: false });

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0, scale: 0.9 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", damping: 12, stiffness: 100 } }
};

const floatingVariants: Variants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 10, -10, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  }
};


export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Create axios instance with user_id header
  const api = axios.create({
    baseURL: "",
    headers: user ? { "x-user-id": user.id } : {},
  });
  const [formData, setFormData] = useState({
    firstName: "Aris",
    lastName: "Setiyono",
    organization: "Project Barcode",
    title: "Chief Happiness Officer",
    phone: "+628123456789",
    email: "hello@lucu.com",
    url: "https://lucu.com",
    dotsColor: "#ff4081",
    dotsType: "rounded",
    gradientColor2: "#ffeb3b",
    cornersSquareType: "extra-rounded",
    cornersSquareColor: "#000000",
    cornersDotType: "dot",
    cornersDotColor: "#000000",
    backgroundColor: "#ffffff",
    logoUrl: "",
    hideBackgroundDots: true
  });

  const [smartData, setSmartData] = useState({
    type: "link" as "link" | "wifi" | "maps" | "whatsapp" | "instagram" | "tiktok",
    url: "https://google.com",
    ssid: "Rumah Lucu",
    password: "password123",
    encryption: "WPA",
    lat: "-6.2088",
    lon: "106.8456",
    waNumber: "+62",
    waMessage: "Halo, saya tertarik dengan produk Anda.",
    igUsername: "",
    ttUsername: ""
  });

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [galleryData, setGalleryData] = useState<any[]>([]);
  const [showMapModal, setShowMapModal] = useState(false);

  const [frameConfig, setFrameConfig] = useState({
    style: "none" as "none" | "rounded" | "badge" | "banner" | "circle",
    label: "SCAN ME",
    frameColor: "#000000",
    labelColor: "#ffffff",
    customLabel: ""
  });

  const defaultLogos = [
    { name: 'Facebook', url: 'https://cdn.simpleicons.org/facebook/1877F2' },
    { name: 'Twitter', url: 'https://cdn.simpleicons.org/twitter/1DA1F2' },
    { name: 'WhatsApp', url: 'https://cdn.simpleicons.org/whatsapp/25D366' },
    { name: 'Instagram', url: 'https://cdn.simpleicons.org/instagram/E4405F' },
    { name: 'LinkedIn', url: 'https://cdn.simpleicons.org/linkedin/0A66C2' },
    { name: 'YouTube', url: 'https://cdn.simpleicons.org/youtube/FF0000' },
    { name: 'Google', url: 'https://cdn.simpleicons.org/google/4285F4' },
    { name: 'Bvlgari', url: '/uploads/bvlgari.png' },
    { name: 'Omega', url: '/uploads/omega.png' },
    { name: 'Cartier', url: '/uploads/cartier.png' },
  ];

  const [activeTab, setActiveTab] = useState<"qr" | "vcard" | "smart" | "analytics" | "gallery">("qr");
  const [selectedTemplate, setSelectedTemplate] = useState("minimalist");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [smartQrImage, setSmartQrImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const fetchAnalytics = async () => {
    try {
      const response = await api.get("/api/analytics");
      setAnalyticsData(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchGallery = async () => {
    try {
      const response = await api.get("/api/gallery");
      setGalleryData(response.data);
    } catch (error) { console.error(error); }
  };

  const deleteQR = async (id: string) => {
    const confirmed = window.confirm("Yakin mau hapus QR ini?");
    if (!confirmed) return;
    try {
      await api.delete(`/api/gallery/${id}`);
      setGalleryData(prev => prev.filter(item => item.id !== id));
      triggerConfetti();
    } catch (error: any) {
      console.error("Delete error:", error);
      alert("Gagal menghapus: " + (error?.response?.data?.error || error.message));
    }
  };

  const deleteAllQRs = async () => {
    if (galleryData.length === 0) return;
    if (!window.confirm("⚠️ BAHAYA! Anda akan menghapus SELURUH gallery. Yakin?")) return;
    if (!window.confirm("Ketik 'SAYA YAKIN' pun tidak perlu, tapi ini peringatan terakhir. Hapus semua?")) return;
    
    try {
      await api.delete("/api/gallery");
      setGalleryData([]);
      triggerConfetti();
    } catch (error: any) {
      console.error("Delete all error:", error);
      alert("Gagal menghapus semua: " + (error?.response?.data?.error || error.message));
    }
  };

  const restoreQR = (item: any) => {
    if (item.type === 'vcard') {
      setFormData({
        firstName: item.first_name,
        lastName: item.last_name,
        organization: item.organization,
        title: item.position,
        phone: item.phone,
        email: item.email,
        url: item.website,
        dotsColor: item.dots_color,
        dotsType: item.dots_type,
        gradientColor2: item.gradient_color,
        cornersSquareType: item.corners_square_type,
        cornersSquareColor: item.corners_square_color,
        cornersDotType: item.corners_dot_type,
        cornersDotColor: item.corners_dot_color,
        backgroundColor: item.background_color,
        logoUrl: item.logo_url,
        hideBackgroundDots: item.hide_background_dots
      });
      setActiveTab("qr");
    } else {
      setSmartData({
        type: item.type,
        url: item.raw_data?.content || "",
        ssid: item.raw_data?.ssid || "",
        password: item.raw_data?.password || "",
        encryption: item.raw_data?.encryption || "WPA",
        lat: item.raw_data?.lat || "",
        lon: item.raw_data?.lon || "",
        waNumber: item.raw_data?.waNumber || "+62",
        waMessage: item.raw_data?.waMessage || "Halo, saya tertarik dengan produk Anda.",
        igUsername: item.raw_data?.igUsername || "",
        ttUsername: item.raw_data?.ttUsername || ""
      });

      setFormData({
        ...formData,
        dotsColor: item.dots_color,
        dotsType: item.dots_type,
        gradientColor2: item.gradient_color,
        cornersSquareType: item.corners_square_type,
        cornersSquareColor: item.corners_square_color,
        cornersDotType: item.corners_dot_type,
        cornersDotColor: item.corners_dot_color,
        backgroundColor: item.background_color,
        logoUrl: item.logo_url,
        hideBackgroundDots: item.hide_background_dots
      });
      setActiveTab("smart");
    }
  };

  const triggerConfetti = () => {
    const end = Date.now() + 1000;
    const colors = ["#ffeb3b", "#2196f3", "#f44336", "#4caf50"];
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  const generateQR = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        let errorMessage = "Terjadi kesalahan pada server";
        try {
          const errData = await response.json();
          errorMessage = errData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server Error (${response.status})`;
        }
        throw new Error(errorMessage);
      }
      
      const blob = await response.blob();
      setQrImage(URL.createObjectURL(blob));
      triggerConfetti();
    } catch (error: any) {
      console.error("QR Generation Error:", error.message);
      alert("Gagal membuat QR: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartQR = async () => {
    setLoading(true);
    try {
      let finalData = "";
      let rawData = {};
      if (smartData.type === 'link') {
        finalData = smartData.url;
        rawData = { content: smartData.url };
      } else if (smartData.type === 'wifi') {
        finalData = `WIFI:S:${smartData.ssid};T:${smartData.encryption};P:${smartData.password};;`;
        rawData = { ssid: smartData.ssid, password: smartData.password, encryption: smartData.encryption };
      } else if (smartData.type === 'maps') {
        finalData = `https://www.google.com/maps/search/?api=1&query=${smartData.lat},${smartData.lon}`;
        rawData = { lat: smartData.lat, lon: smartData.lon };
      } else if (smartData.type === 'whatsapp') {
        const cleanNumber = smartData.waNumber.replace(/[^0-9+]/g, '');
        finalData = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(smartData.waMessage)}`;
        rawData = { waNumber: smartData.waNumber, waMessage: smartData.waMessage };
      } else if (smartData.type === 'instagram') {
        const cleanUsername = smartData.igUsername.replace('@', '').trim();
        finalData = `https://instagram.com/${cleanUsername}`;
        rawData = { igUsername: smartData.igUsername };
      } else if (smartData.type === 'tiktok') {
        const cleanUsername = smartData.ttUsername.replace('@', '').trim();
        finalData = `https://tiktok.com/@${cleanUsername}`;
        rawData = { ttUsername: smartData.ttUsername };
      }
      
      const response = await fetch("/api/generate-basic", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify({
          data: finalData,
          type: smartData.type,
          rawData,
          ...formData
        }),
      });
      
      if (!response.ok) {
        let errorMessage = "Gagal membuat Smart QR";
        try {
          const errData = await response.json();
          errorMessage = errData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server Error (${response.status})`;
        }
        throw new Error(errorMessage);
      }
      
      const blob = await response.blob();
      setSmartQrImage(URL.createObjectURL(blob));
      triggerConfetti();
    } catch (error: any) {
      console.error("Smart QR Error:", error.message);
      alert("Gagal membuat Smart QR: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("logo", file);
    try {
      const response = await api.post("/api/upload", uploadData);
      setFormData({ ...formData, logoUrl: response.data.url });
      triggerConfetti();
    } catch (error) { console.error(error); } finally { setUploading(false); }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setSmartData({ ...smartData, lat: position.coords.latitude.toFixed(6), lon: position.coords.longitude.toFixed(6) });
      triggerConfetti();
    });
  };

  useEffect(() => {
    // Only fetch analytics and gallery automatically on tab switch
    if (activeTab === "analytics") fetchAnalytics();
    if (activeTab === "gallery") fetchGallery();
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSmartInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSmartData({ ...smartData, [e.target.name]: e.target.value });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#fffbef] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-[5px] border-black border-t-[#ffeb3b] rounded-full"
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffbef] p-4 md:p-10 font-sans selection:bg-yellow-300 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
        <motion.div variants={floatingVariants} animate="animate" className="absolute top-[10%] left-[5%] w-24 h-24 bg-[#ffeb3b] border-4 border-black rounded-3xl rotate-12 opacity-20" />
        <motion.div variants={floatingVariants} animate="animate" className="absolute bottom-[15%] right-[8%] w-32 h-32 bg-[#2196f3] border-4 border-black rounded-full opacity-10" />
        <div className="absolute inset-0 opacity-[0.03] bg-dot-pattern" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] rounded-[2.5rem] p-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-[#ffeb3b] border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl"><QrCode size={36}/></div>
            <div><h1 className="text-4xl font-[900] tracking-tight text-black">BIKIN<span className="text-[#2196f3]">QR</span></h1><p className="text-sm font-bold uppercase tracking-widest text-gray-500">Bikin QR Jadi Seru! ✨</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-xs font-black uppercase text-gray-400">Logged in as</p>
              <p className="text-sm font-bold truncate max-w-[200px]">{user?.email}</p>
            </div>
            <button onClick={signOut} title="Logout" className="p-3 bg-red-100 border-2 border-black rounded-xl hover:bg-red-200 transition-all shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <nav className="flex flex-wrap gap-4 mb-10">
          <NavButton active={activeTab === "qr"} onClick={() => setActiveTab("qr")} icon={<User size={20}/>} label="vCard QR" color="#ffeb3b" />
          <NavButton active={activeTab === "smart"} onClick={() => setActiveTab("smart")} icon={<Zap size={20}/>} label="Smart QR" color="#4caf50" />
          <NavButton active={activeTab === "vcard"} onClick={() => setActiveTab("vcard")} icon={<Briefcase size={20}/>} label="Card Preview" color="#2196f3" />
          <NavButton active={activeTab === "gallery"} onClick={() => setActiveTab("gallery")} icon={<History size={20}/>} label="My Gallery" color="#ff9800" />
          <NavButton active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} icon={<BarChart3 size={20}/>} label="Analytics" color="#ff4081" />
        </nav>

        <AnimatePresence mode="wait">
          {activeTab === "qr" ? (
            <motion.div key="qr-tab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-10">
                <section className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-4 mb-10"><div className="w-12 h-12 bg-[#2196f3] border-[3px] border-black rounded-2xl flex items-center justify-center text-white"><User size={24} /></div><h2 className="text-3xl font-[900] uppercase text-black italic">Data Personal</h2></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CartoonInput id="firstName" label="Nama Depan" name="firstName" value={formData.firstName} onChange={handleInputChange} icon={<Star size={20} className="text-pink-500" />} />
                    <CartoonInput id="lastName" label="Nama Belakang" name="lastName" value={formData.lastName} onChange={handleInputChange} icon={<Star size={20} className="text-yellow-500" />} />
                    <CartoonInput id="organization" label="Organisasi" name="organization" value={formData.organization} onChange={handleInputChange} icon={<Briefcase size={20} className="text-blue-500" />} />
                    <CartoonInput id="title" label="Jabatan" name="title" value={formData.title} onChange={handleInputChange} icon={<Briefcase size={20} className="text-green-500" />} />
                    <CartoonInput id="phone" label="No. Telepon" name="phone" value={formData.phone} onChange={handleInputChange} icon={<Phone size={20} className="text-red-500" />} />
                    <CartoonInput id="email" label="Email" name="email" value={formData.email} onChange={handleInputChange} icon={<Mail size={20} className="text-purple-500" />} />
                    <CartoonInput id="url" label="Website" name="url" value={formData.url} onChange={handleInputChange} icon={<Globe size={20} className="text-cyan-500" />} className="md:col-span-2" />
                  </div>
                </section>
                <StyleSection formData={formData} handleInputChange={handleInputChange} uploading={uploading} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} defaultLogos={defaultLogos} setFormData={setFormData} />
              </div>
              <div className="lg:col-span-5"><PreviewSection title="vCard Siap! 👑" qrImage={qrImage} loading={loading} onGenerate={generateQR} buttonText="Update vCard" frameConfig={frameConfig} setFrameConfig={setFrameConfig} /></div>
            </motion.div>
          ) : activeTab === "smart" ? (
            <motion.div key="smart-tab" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-10">
                <section className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-4 mb-10"><div className="w-12 h-12 bg-[#4caf50] border-[3px] border-black rounded-2xl flex items-center justify-center text-white"><Zap size={24} /></div><h2 className="text-3xl font-[900] uppercase text-black italic">Smart QR Tools</h2></div>
                  <div className="flex flex-wrap gap-4 mb-10">
                    {[{ id: 'link', name: 'Link', icon: <LinkIcon /> }, { id: 'wifi', name: 'WiFi', icon: <Wifi /> }, { id: 'maps', name: 'Maps', icon: <MapPin /> }, { id: 'whatsapp', name: 'WhatsApp', icon: <MessageSquare /> }, { id: 'instagram', name: 'Instagram', icon: <Camera /> }, { id: 'tiktok', name: 'TikTok', icon: <Play /> }].map(type => (
                      <button key={type.id} onClick={() => setSmartData({...smartData, type: type.id as any})} className={`flex-1 md:flex-none px-6 py-3 rounded-xl border-[3px] border-black font-black uppercase flex items-center justify-center gap-2 transition-all ${smartData.type === type.id ? "bg-[#ffeb3b] shadow-[4px_4px_0px_0px_#000] translate-x-[-2px] translate-y-[-2px]" : "bg-white hover:bg-gray-50 shadow-[2px_2px_0px_0px_#000]"}`}>{type.icon}{type.name}</button>
                    ))}
                  </div>
                  <div className="space-y-8">
                    {smartData.type === 'link' && <CartoonInput id="url" label="Link Website" name="url" value={smartData.url} onChange={handleSmartInputChange} icon={<LinkIcon size={20} className="text-blue-500" />} />}
                    {smartData.type === 'wifi' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <CartoonInput id="ssid" label="Nama WiFi" name="ssid" value={smartData.ssid} onChange={handleSmartInputChange} icon={<Wifi size={20} className="text-green-500" />} />
                        <CartoonInput id="password" label="Password" name="password" value={smartData.password} onChange={handleSmartInputChange} icon={<X size={20} className="text-red-500" />} />
                      </div>
                    )}
                    {smartData.type === 'maps' && (
                      <div className="space-y-6">
                        <div className="flex gap-4"><button onClick={useMyLocation} className="flex-1 bg-[#2196f3] text-white border-[3px] border-black py-4 rounded-xl font-black uppercase flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_#000]"><Navigation size={20} /> Lokasi Saya</button><button onClick={() => setShowMapModal(true)} className="flex-1 bg-[#ffeb3b] border-[3px] border-black py-4 rounded-xl font-black uppercase flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_#000]"><MapPin size={20} /> Pilih Map</button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><CartoonInput id="lat" label="Latitude" name="lat" value={smartData.lat} onChange={handleSmartInputChange} icon={<MapPin size={20} className="text-red-500" />} /><CartoonInput id="lon" label="Longitude" name="lon" value={smartData.lon} onChange={handleSmartInputChange} icon={<MapPin size={20} className="text-blue-500" />} /></div>
                      </div>
                    )}
                    {smartData.type === 'whatsapp' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <CartoonInput id="waNumber" label="No. WhatsApp (ex: +62...)" name="waNumber" value={smartData.waNumber} onChange={handleSmartInputChange} icon={<Phone size={20} className="text-green-500" />} />
                        <CartoonInput id="waMessage" label="Pesan Otomatis" name="waMessage" value={smartData.waMessage} onChange={handleSmartInputChange} icon={<MessageSquare size={20} className="text-blue-500" />} />
                      </div>
                    )}
                    {smartData.type === 'instagram' && (
                      <CartoonInput id="igUsername" label="Username Instagram" name="igUsername" value={smartData.igUsername} onChange={handleSmartInputChange} icon={<Camera size={20} className="text-pink-500" />} placeholder="@username" />
                    )}
                    {smartData.type === 'tiktok' && (
                      <CartoonInput id="ttUsername" label="Username TikTok" name="ttUsername" value={smartData.ttUsername} onChange={handleSmartInputChange} icon={<Play size={20} className="text-black" />} placeholder="@username" />
                    )}
                  </div>
                </section>
                <StyleSection formData={formData} handleInputChange={handleInputChange} uploading={uploading} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} defaultLogos={defaultLogos} setFormData={setFormData} />
              </div>
              <div className="lg:col-span-5"><PreviewSection title="Smart QR Siap! 🚀" qrImage={smartQrImage} loading={loading} onGenerate={generateSmartQR} buttonText={`Simpan & Bikin QR ${smartData.type}!`} frameConfig={frameConfig} setFrameConfig={setFrameConfig} /></div>
            </motion.div>
          ) : activeTab === "analytics" ? (
            <motion.div key="analytics-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard title="Total Scans" value={analyticsData?.totalScans || 0} icon={<TrendingUp className="text-blue-500" />} color="bg-[#e3f2fd]" />
                <StatCard title="Active QRs" value={analyticsData?.topCards?.length || 0} icon={<QrCode className="text-green-500" />} color="bg-[#e8f5e9]" />
                <StatCard title="Top Performer" value={analyticsData?.topCards?.[0]?.first_name || "-"} icon={<Award className="text-yellow-500" />} color="bg-[#fffde7]" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10">
                  <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3"><BarChart3 /> Grafik Scan Harian</h3>
                  <div className="h-[400px] w-full">{analyticsData?.chartData ? (<ResponsiveContainer width="100%" height="100%"><BarChart data={analyticsData.chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontWeight: 'bold' }} /><YAxis axisLine={false} tickLine={false} tick={{ fontWeight: 'bold' }} /><Tooltip contentStyle={{ borderRadius: '1rem', border: '3px solid black', boxShadow: '4px 4px 0px 0px black' }} cursor={{ fill: '#f5f5f5' }} /><Bar dataKey="scans" radius={[10, 10, 0, 0]}>{analyticsData.chartData.map((e: any, i: number) => (<Cell key={`cell-${i}`} fill={['#ffeb3b', '#2196f3', '#f44336', '#4caf50'][i % 4]} stroke="black" strokeWidth={2} />))}</Bar></BarChart></ResponsiveContainer>) : (<div className="h-full flex items-center justify-center font-bold text-gray-300">Belum ada data...</div>)}</div>
                </div>
                <div className="lg:col-span-4 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10">
                  <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3"><Star /> Top vCards</h3>
                  <div className="space-y-6">{analyticsData?.topCards?.map((card: any, i: number) => (<div key={i} className="flex items-center justify-between p-4 bg-gray-50 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">{i+1}</div><span className="font-bold">{card.first_name}</span></div><span className="font-black text-[#2196f3]">{card.scan_count} Scans</span></div>))}</div>
                </div>

                {/* Map View */}
                <div className="lg:col-span-8 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10">
                  <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3"><Globe /> Lokasi Scan (Peta)</h3>
                  <div className="h-[400px] w-full border-2 border-black rounded-2xl overflow-hidden">
                    {analyticsData?.mapMarkers ? <AnalyticsMap markers={analyticsData.mapMarkers} /> : <div className="h-full flex items-center justify-center font-bold text-gray-300 italic">Memuat peta...</div>}
                  </div>
                </div>

                {/* Device Insights */}
                <div className="lg:col-span-4 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10">
                  <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3"><Smartphone /> Device Insights</h3>
                  <div className="h-[300px] w-full flex flex-col items-center justify-center">
                    {analyticsData?.osDistribution && analyticsData.osDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.osDistribution}
                            cx="50%" cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="#000"
                            strokeWidth={2}
                          >
                            {analyticsData.osDistribution.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={['#ffeb3b', '#2196f3', '#f44336', '#4caf50'][index % 4]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '1rem', border: '3px solid black', boxShadow: '4px 4px 0px 0px black' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="text-gray-300 font-bold">Belum ada data device...</div>}
                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                      {analyticsData?.osDistribution?.map((os: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border-2 border-black" style={{ backgroundColor: ['#ffeb3b', '#2196f3', '#f44336', '#4caf50'][i % 4] }}></div>
                          <span className="text-xs font-black uppercase italic">{os.name} ({os.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === "gallery" ? (
            <motion.div key="gallery-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="flex justify-between items-center bg-white border-[4px] border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_#000]">
                <div>
                  <h3 className="text-2xl font-black uppercase italic flex items-center gap-3"><History /> Riwayat QR</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase">Total {galleryData.length} QR tersimpan</p>
                </div>
                {galleryData.length > 0 && (
                  <button onClick={deleteAllQRs} className="bg-red-500 text-white border-[3px] border-black px-6 py-3 rounded-2xl font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2" title="Hapus Semua QR">
                    <Trash2 size={18} /> Delete All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {galleryData.length > 0 ? galleryData.map((item) => (
                <motion.div whileHover={{ scale: 1.02 }} key={item.id} className="bg-white border-[4px] border-black rounded-[2.5rem] shadow-[8px_8px_0px_0px_#000] p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`px-4 py-1 rounded-full border-2 border-black font-black text-xs uppercase ${item.type === 'vcard' ? 'bg-[#ffeb3b]' : 'bg-[#4caf50] text-white'}`}>{item.type || 'UNKNOWN'}</div>
                      <div className="flex gap-2">
                        <button onClick={() => restoreQR(item)} className="p-2 border-2 border-black rounded-lg bg-blue-100 hover:bg-blue-200" title="Edit Data QR"><Edit3 size={18}/></button>
                        <button onClick={() => deleteQR(item.id)} className="p-2 border-2 border-black rounded-lg bg-red-100 hover:bg-red-200" title="Hapus QR dari Galeri"><Trash2 size={18}/></button>
                      </div>
                    </div>
                    <h3 className="text-xl font-black uppercase mb-1">{item.type === 'vcard' ? `${item.first_name} ${item.last_name || ''}` : String(item.type || 'UNKNOWN').toUpperCase()}</h3>
                    <p className="text-xs font-bold text-gray-500 italic mb-4">{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                    <div className="bg-gray-50 border-2 border-black rounded-2xl p-4 flex items-center justify-center aspect-square mb-6 relative">
                      <QrCode size={120} className="opacity-20" />
                      <div className="absolute font-black text-xs uppercase opacity-30 tracking-widest">Preview QR</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setActiveTab(item.type === 'vcard' ? 'qr' : 'smart'); restoreQR(item); }} title="Buka QR" className="flex-1 bg-[#ffeb3b] border-2 border-black py-2 rounded-xl font-black text-sm shadow-[4px_4px_0px_0px_#000] hover:shadow-none translate-x-0 hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2">
                      <ExternalLink size={16}/> Buka
                    </button>
                    <div className="bg-black text-white px-4 py-2 rounded-xl font-black text-xs flex items-center justify-center">{item.scan_count} SCAN</div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-20 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-6 opacity-30"><History size={40}/></div>
                  <h3 className="text-2xl font-black uppercase text-gray-300">Belum ada QR yang disimpan</h3>
                  <p className="font-bold text-gray-300">Buat QR pertamamu untuk melihatnya di sini!</p>
                </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="vcard-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-8">
                <h3 className="text-2xl font-[900] mb-6 italic uppercase text-black"><Palette size={24} className="inline mr-3" /> Pilih Gaya</h3>
                <div className="space-y-4">
                  {[{ id: "minimalist", name: "The Minimalist", color: "#f8f9fa", icon: <Star />, desc: "Bersih & Modern" }, { id: "executive", name: "The Executive", color: "#1a1a1a", icon: <Briefcase />, desc: "Elegan & Mewah", dark: true }, { id: "creative", name: "The Creative", color: "#ffeb3b", icon: <Sparkles />, desc: "Berani & Unik" }].map((t) => {
                    const templateStyle = { backgroundColor: t.color, color: t.dark ? 'white' : 'black' };
                    return (
                      <button key={t.id} onClick={() => setSelectedTemplate(t.id)} title={`Pilih Template ${t.name}`} className={`w-full p-5 rounded-2xl border-[3px] border-black text-left transition-all flex items-center gap-4 ${selectedTemplate === t.id ? "bg-[#ffeb3b] shadow-[4px_4px_0px_0px_#000] translate-x-[-2px] translate-y-[-2px]" : "bg-white hover:bg-gray-50 shadow-[2px_2px_0px_0px_#000]"}`}>
                        <div className="w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center shrink-0" style={templateStyle}>{t.icon}</div>
                        <div><div className="font-black text-lg leading-tight">{t.name}</div><div className="text-xs font-bold opacity-60 uppercase">{t.desc}</div></div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="lg:col-span-8 bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_#000] rounded-[3rem] p-10 flex flex-col items-center">
                <div className="perspective-1000 w-full max-w-[500px] aspect-[1.75/1]">
                  <motion.div key={selectedTemplate} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ type: "spring", damping: 15 }} className={`w-full h-full border-[6px] border-black rounded-[2rem] shadow-[15px_15px_0px_0px_#000] overflow-hidden relative flex flex-col ${selectedTemplate === 'executive' ? 'bg-[#1a1a1a] text-white' : selectedTemplate === 'creative' ? 'bg-[#ffeb3b]' : 'bg-white'}`}>
                    <div className="p-10 flex-1 flex flex-col justify-between relative z-10">
                      <div className="flex justify-between items-start">
                        <div><h4 className={`text-3xl font-[900] uppercase tracking-tighter ${selectedTemplate === 'executive' ? 'text-[#ffeb3b]' : 'text-black'}`}>{formData.firstName} {formData.lastName}</h4><p className={`text-sm font-black italic opacity-70 ${selectedTemplate === 'executive' ? 'text-gray-300' : 'text-gray-600'}`}>{formData.title} @ {formData.organization}</p></div>
                        {formData.logoUrl && <img src={formData.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />}
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="space-y-2"><div className="flex items-center gap-3 text-xs font-black"><Phone size={14} /> {formData.phone}</div><div className="flex items-center gap-3 text-xs font-black"><Mail size={14} /> {formData.email}</div></div>
                        {qrImage && <div className="bg-white p-2 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_#000] rotate-3"><img src={qrImage} alt="QR" className="w-20 h-20" /></div>}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Picker Modal */}
        <AnimatePresence>
          {showMapModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMapModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white border-[4px] border-black rounded-[2.5rem] shadow-[15px_15px_0px_0px_#000] w-full max-w-3xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
                <div className="p-8 border-b-[4px] border-black flex justify-between items-center bg-[#ffeb3b]"><h3 className="text-2xl font-black uppercase italic">Pilih Lokasi</h3><button onClick={() => setShowMapModal(false)} className="p-2 border-2 border-black rounded-full bg-white" title="Tutup Map"><X /></button></div>
                <div className="flex-1 min-h-[400px]"><MapWrapper onLocationSelect={(lat, lon) => { setSmartData({...smartData, lat: lat.toFixed(6), lon: lon.toFixed(6)}); setShowMapModal(false); triggerConfetti(); }} /></div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// Helper components
function NavButton({ active, onClick, icon, label, color }: any) {
  const buttonStyle = { backgroundColor: active ? color : 'white', color: active && color !== '#ffeb3b' ? 'white' : 'black' };
  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} className={`flex-1 md:flex-none px-6 py-4 rounded-2xl border-[4px] border-black font-[900] uppercase italic tracking-wider transition-all flex items-center justify-center gap-3 ${active ? `shadow-[6px_6px_0px_0px_#000] translate-x-[-2px] translate-y-[-2px]` : `bg-white shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]`}`} style={buttonStyle}>{icon}{label}</motion.button>
  );
}
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className={`p-8 border-[4px] border-black rounded-[2rem] shadow-[8px_8px_0px_0px_#000] ${color} flex flex-col gap-2`}>
      <div className="flex justify-between items-center text-gray-500 uppercase font-black text-xs tracking-widest">{title} {icon}</div>
      <div className="text-4xl font-black italic">{value}</div>
    </div>
  );
}
// MapWrapper is dynamically imported at the top of the file
function StyleSection({ formData, handleInputChange, uploading, fileInputRef, handleFileUpload, defaultLogos, setFormData }: any) {
  const [activeStyleTab, setActiveStyleTab] = useState<"dots" | "corners" | "bg">("dots");
  return (
    <motion.section variants={itemVariants} initial="hidden" animate="visible" className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10 transition-all">
      <div className="flex items-center gap-4 mb-8"><div className="w-12 h-12 bg-[#ffeb3b] border-[3px] border-black rounded-2xl flex items-center justify-center text-black shadow-[4px_4px_0px_0px_#000]"><Palette size={24} /></div><h2 className="text-3xl font-[900] text-black italic uppercase tracking-tight">Gaya Kustom</h2></div>
      <div className="flex gap-2 mb-8 bg-gray-100 p-2 rounded-2xl border-2 border-black shadow-inner">
        {[{ id: 'dots', name: 'Titik', icon: <Circle size={16}/> }, { id: 'corners', name: 'Pojok', icon: <Square size={16}/> }, { id: 'bg', name: 'BG & Logo', icon: <Layout size={16}/> }].map(tab => (
          <button key={tab.id} onClick={() => setActiveStyleTab(tab.id as any)} title={`Tab ${tab.name}`} className={`flex-1 py-2 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all ${activeStyleTab === tab.id ? 'bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]' : 'text-gray-500 hover:text-black'}`}>{tab.icon}{tab.name}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {activeStyleTab === 'dots' && (
          <motion.div key="dots" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3"><label className="text-sm font-[900] uppercase ml-1">Bentuk Titik</label><select name="dotsType" value={formData.dotsType} onChange={handleInputChange} title="Pilih Bentuk Titik" className="w-full bg-white border-[3px] border-black rounded-2xl px-6 py-4 font-bold shadow-[4px_4px_0px_0px_#000] appearance-none"><option value="rounded">Rounded</option><option value="dots">Dots</option><option value="classy">Classy</option><option value="square">Square</option></select></div>
            <div className="space-y-3"><label className="text-sm font-[900] uppercase ml-1">Warna 1</label><div className="flex gap-4"><input type="color" name="dotsColor" value={formData.dotsColor} onChange={handleInputChange} title="Pilih Warna 1" className="h-14 w-14 bg-white border-[3px] border-black rounded-xl cursor-pointer p-1" /><div className="flex-1 bg-gray-50 border-[3px] border-black rounded-xl px-4 flex items-center font-black uppercase text-sm tracking-widest">{formData.dotsColor}</div></div></div>
            <div className="space-y-3"><label className="text-sm font-[900] uppercase ml-1">Warna 2</label><div className="flex gap-4"><input type="color" name="gradientColor2" value={formData.gradientColor2} onChange={handleInputChange} title="Pilih Warna 2" className="h-14 w-14 bg-white border-[3px] border-black rounded-xl cursor-pointer p-1" /><div className="flex-1 bg-gray-50 border-[3px] border-black rounded-xl px-4 flex items-center font-black uppercase text-sm tracking-widest">{formData.gradientColor2}</div></div></div>
          </motion.div>
        )}
        {activeStyleTab === 'corners' && (
          <motion.div key="corners" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3"><label className="text-sm font-[900] uppercase ml-1">Frame Pojok</label><select name="cornersSquareType" value={formData.cornersSquareType} onChange={handleInputChange} title="Pilih Frame Pojok" className="w-full bg-white border-[3px] border-black rounded-2xl px-6 py-4 font-bold shadow-[4px_4px_0px_0px_#000] appearance-none"><option value="square">Square</option><option value="dot">Dot</option><option value="extra-rounded">Extra Rounded</option></select></div>
            <div className="space-y-3"><label className="text-sm font-[900] uppercase ml-1">Warna Frame</label><input type="color" name="cornersSquareColor" value={formData.cornersSquareColor} onChange={handleInputChange} title="Pilih Warna Frame" className="h-14 w-full bg-white border-[3px] border-black rounded-xl cursor-pointer p-1" /></div>
            <div className="space-y-3"><label className="text-sm font-[900] uppercase ml-1">Titik Pojok</label><select name="cornersDotType" value={formData.cornersDotType} onChange={handleInputChange} title="Pilih Titik Pojok" className="w-full bg-white border-[3px] border-black rounded-2xl px-6 py-4 font-bold shadow-[4px_4px_0px_0px_#000] appearance-none"><option value="square">Square</option><option value="dot">Dot</option></select></div>
            <div className="space-y-3"><label className="text-sm font-[900] uppercase ml-1">Warna Titik Pojok</label><input type="color" name="cornersDotColor" value={formData.cornersDotColor} onChange={handleInputChange} title="Pilih Warna Titik Pojok" className="h-14 w-full bg-white border-[3px] border-black rounded-xl cursor-pointer p-1" /></div>
          </motion.div>
        )}
        {activeStyleTab === 'bg' && (
          <motion.div key="bg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3"><label className="text-sm font-[900] uppercase ml-1">Warna Background</label><input type="color" name="backgroundColor" value={formData.backgroundColor} onChange={handleInputChange} title="Pilih Warna Background" className="h-14 w-full bg-white border-[3px] border-black rounded-xl p-1 shadow-[3px_3px_0px_0px_#000]" /></div>
              <div className="flex flex-col justify-end pb-1"><label className="flex items-center gap-3 cursor-pointer group"><input type="checkbox" className="appearance-none w-7 h-7 border-[3px] border-black rounded-lg cursor-pointer checked:bg-[#ffeb3b]" checked={formData.hideBackgroundDots} onChange={(e) => setFormData({...formData, hideBackgroundDots: e.target.checked})} title="Hapus Titik di Logo" /><span className="font-[900] text-sm group-hover:text-[#2196f3] uppercase transition-colors">Hapus Titik di Logo</span></label></div>
            </div>
            <div className="space-y-4 border-t-2 border-black pt-6">
              <div className="flex flex-wrap gap-3 mt-4">
                {defaultLogos.map((logo: any) => (<button key={logo.name} onClick={() => setFormData({...formData, logoUrl: logo.url})} title={`Gunakan Logo ${logo.name}`} className={`w-12 h-12 rounded-xl border-[2px] border-black bg-white p-2 shadow-[2px_2px_0px_0px_#000] ${formData.logoUrl === logo.url ? 'bg-yellow-100 ring-2 ring-blue-500' : ''}`}><img src={logo.url} alt={logo.name} className="w-full h-full object-contain" /></button>))}
                <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-xl border-2 border-black bg-blue-500 text-white flex items-center justify-center shadow-[2px_2px_0px_0px_#000]" title="Upload Logo"><Upload size={20}/></button>
                {formData.logoUrl && (
                  <button onClick={() => setFormData({...formData, logoUrl: ""})} className="w-12 h-12 rounded-xl border-2 border-black bg-red-500 text-white flex items-center justify-center shadow-[2px_2px_0px_0px_#000]" title="Hapus Logo"><Trash2 size={20}/></button>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} title="File Logo" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function PreviewSection({ title, qrImage, loading, onGenerate, buttonText, frameConfig, setFrameConfig }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelPresets = ["SCAN ME", "FOLLOW US", "CONNECT WITH ME", "ORDER NOW", "VISIT US", "SAVE CONTACT"];
  const frameStyles = [
    { id: "none", name: "Tanpa Frame", icon: <X size={14}/> },
    { id: "rounded", name: "Rounded", icon: <Square size={14}/> },
    { id: "badge", name: "Badge", icon: <Star size={14}/> },
    { id: "banner", name: "Banner", icon: <Layout size={14}/> },
    { id: "circle", name: "Circle", icon: <Circle size={14}/> }
  ];

  const downloadFramedQR = async () => {
    if (!qrImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const qrSize = 800;
      const padding = 60;
      const labelHeight = frameConfig.style !== "none" ? 80 : 0;
      const totalW = qrSize + padding * 2;
      const totalH = qrSize + padding * 2 + labelHeight;
      const radius = 40;

      canvas.width = totalW;
      canvas.height = totalH;
      ctx.clearRect(0, 0, totalW, totalH);

      if (frameConfig.style === "none") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, totalW, totalH);
        ctx.drawImage(img, padding, padding, qrSize, qrSize);
      } else if (frameConfig.style === "rounded") {
        ctx.fillStyle = frameConfig.frameColor;
        ctx.beginPath();
        ctx.roundRect(0, 0, totalW, totalH, radius);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(padding - 10, padding - 10, qrSize + 20, qrSize + 20, radius - 10);
        ctx.fill();
        ctx.drawImage(img, padding, padding, qrSize, qrSize);
        ctx.fillStyle = frameConfig.labelColor;
        ctx.font = "bold 36px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(frameConfig.customLabel || frameConfig.label, totalW / 2, qrSize + padding + 50);
      } else if (frameConfig.style === "badge") {
        ctx.fillStyle = frameConfig.frameColor;
        ctx.beginPath();
        ctx.roundRect(0, 0, totalW, totalH, radius);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(padding - 10, padding - 10, qrSize + 20, qrSize + 20, 20);
        ctx.fill();
        ctx.drawImage(img, padding, padding, qrSize, qrSize);
        const badgeW = 320;
        const badgeH = 55;
        const badgeX = (totalW - badgeW) / 2;
        const badgeY = qrSize + padding + 10;
        ctx.fillStyle = frameConfig.frameColor;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
        ctx.stroke();
        ctx.fillStyle = frameConfig.labelColor;
        ctx.font = "bold 26px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(frameConfig.customLabel || frameConfig.label, totalW / 2, badgeY + 37);
      } else if (frameConfig.style === "banner") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, totalW, totalH);
        ctx.drawImage(img, padding, padding, qrSize, qrSize);
        ctx.fillStyle = frameConfig.frameColor;
        ctx.fillRect(0, qrSize + padding + 10, totalW, 70);
        ctx.fillStyle = frameConfig.labelColor;
        ctx.font = "bold 32px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(frameConfig.customLabel || frameConfig.label, totalW / 2, qrSize + padding + 55);
      } else if (frameConfig.style === "circle") {
        const centerX = totalW / 2;
        const outerR = totalW / 2;
        canvas.height = totalW + labelHeight;
        ctx.clearRect(0, 0, totalW, totalW + labelHeight);
        ctx.fillStyle = frameConfig.frameColor;
        ctx.beginPath();
        ctx.arc(centerX, centerX, outerR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(centerX, centerX, outerR - 30, 0, Math.PI * 2);
        ctx.fill();
        const innerQR = qrSize - 100;
        ctx.drawImage(img, (totalW - innerQR) / 2, (totalW - innerQR) / 2, innerQR, innerQR);
        ctx.fillStyle = frameConfig.frameColor;
        ctx.beginPath();
        ctx.roundRect((totalW - 280) / 2, totalW - 20, 280, 50, 25);
        ctx.fill();
        ctx.fillStyle = frameConfig.labelColor;
        ctx.font = "bold 24px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(frameConfig.customLabel || frameConfig.label, centerX, totalW + 15);
      }

      const link = document.createElement("a");
      link.download = "BikinQR-Framed.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = qrImage;
  };

  return (
    <div className="sticky top-10 space-y-10">
      <canvas ref={canvasRef} className="hidden" />
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white border-[5px] border-black rounded-[3.5rem] p-12 shadow-[15px_15px_0px_0px_#000] relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 left-0 w-full h-5 bg-[#2196f3] border-b-[5px] border-black"></div>
        <div className="mb-8 mt-6 bg-[#ffeb3b] border-[3px] border-black px-6 py-2 rounded-full text-sm font-[900] uppercase shadow-[4px_4px_0px_0px_#000] italic">{title}</div>

        {/* QR with Frame Preview */}
        {(() => {
          const frameContainerStyle = { padding: frameConfig.style !== "none" ? "20px" : "0" };
          const frameBgStyle = { backgroundColor: frameConfig.frameColor, border: '4px solid black', boxShadow: '10px 10px 0px 0px black' };
          const labelStyle = { backgroundColor: frameConfig.style === 'badge' ? frameConfig.frameColor : 'transparent', color: frameConfig.style === 'badge' ? frameConfig.labelColor : frameConfig.frameColor };
          
          return (
            <div className="relative" style={frameContainerStyle}>
              {frameConfig.style !== "none" && (
                <div className={`absolute inset-0 ${frameConfig.style === 'circle' ? 'rounded-full' : 'rounded-[2.5rem]'}`} style={frameBgStyle} />
              )}
              <div className={`bg-white p-8 border-[4px] border-black rounded-[2rem] shadow-[6px_6px_0px_0px_#000] relative z-10 ${frameConfig.style === 'circle' ? 'rounded-full overflow-hidden' : ''}`}>
                <AnimatePresence mode="wait">
                  {qrImage ? <motion.img key={qrImage} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={qrImage} className={`w-full max-w-[280px] aspect-square object-contain`} /> : (
                    <div className="w-72 h-72 flex flex-col items-center justify-center gap-4">
                      {/* Animated Printing Machine */}
                      <div className="relative w-40 h-48">
                        {/* Machine Body */}
                        <motion.div 
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute bottom-12 left-0 right-0"
                        >
                          {/* Printer top */}
                          <div className="mx-auto w-36 h-8 bg-[#333] border-[3px] border-black rounded-t-2xl relative">
                            <div className="absolute top-1.5 right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <div className="absolute top-1.5 left-3 flex gap-1">
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                            </div>
                          </div>
                          {/* Printer slot */}
                          <div className="mx-auto w-36 h-3 bg-[#222] border-x-[3px] border-black" />
                          {/* Printer body */}
                          <div className="mx-auto w-36 h-14 bg-[#444] border-[3px] border-black rounded-b-xl relative overflow-hidden">
                            <motion.div
                              animate={{ x: [-40, 40, -40] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-[#ffeb3b] rounded-full"
                            />
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-3">
                              <div className="w-3 h-3 bg-[#f44336] rounded-sm border border-black" />
                              <div className="w-3 h-3 bg-[#2196f3] rounded-sm border border-black" />
                              <div className="w-3 h-3 bg-[#ffeb3b] rounded-sm border border-black" />
                            </div>
                          </div>
                        </motion.div>
                        {/* Paper coming out */}
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: [0, 60, 30, 60], opacity: 1 }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 bg-white border-[2px] border-black rounded-b-lg overflow-hidden"
                        >
                          <div className="p-2 flex items-center justify-center h-full">
                            <motion.div
                              animate={{ opacity: [0.2, 0.6, 0.2] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <QrCode size={30} className="text-gray-300" />
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                      {/* Progress bar */}
                      <div className="w-40 h-3 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                        <motion.div
                          animate={{ width: ["0%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-full bg-[#ffeb3b] rounded-full"
                        />
                      </div>
                      {/* Fun status text */}
                      <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-xs font-black uppercase tracking-widest text-gray-400"
                      >
                        <motion.span
                          key="text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          Mencetak QR...
                        </motion.span>
                      </motion.p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
              {frameConfig.style !== "none" && (
                <div className="relative z-10 mt-3 text-center">
                  <span className={`inline-block px-6 py-2 font-[900] uppercase text-sm tracking-[0.2em] ${frameConfig.style === 'badge' ? 'border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000]' : ''}`} style={labelStyle}>
                    {frameConfig.customLabel || frameConfig.label}
                  </span>
                </div>
              )}
            </div>
          );
        })()}

        {/* Frame Options */}
        <div className="mt-8 w-full space-y-5">
          <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl border-2 border-black">
            {frameStyles.map(f => (
              <button key={f.id} onClick={() => setFrameConfig({...frameConfig, style: f.id})} title={`Gaya Frame: ${f.name}`} className={`flex-1 py-2 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-1 transition-all ${frameConfig.style === f.id ? 'bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]' : 'text-gray-400 hover:text-black'}`}>{f.icon}{f.name}</button>
            ))}
          </div>
          {frameConfig.style !== "none" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {labelPresets.map(label => (
                  <button key={label} onClick={() => setFrameConfig({...frameConfig, label, customLabel: ""})} title={`Preset Label: ${label}`} className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-[10px] uppercase transition-all ${frameConfig.label === label && !frameConfig.customLabel ? 'bg-[#ffeb3b] shadow-[2px_2px_0px_0px_#000]' : 'bg-white hover:bg-gray-50 shadow-[1px_1px_0px_0px_#000]'}`}>{label}</button>
                ))}
              </div>
              <input type="text" value={frameConfig.customLabel} onChange={(e) => setFrameConfig({...frameConfig, customLabel: e.target.value})} title="Kustom Label Frame" placeholder="Atau tulis label sendiri..." className="w-full bg-white border-[3px] border-black rounded-xl px-4 py-3 font-[900] text-sm shadow-[3px_3px_0px_0px_#000] outline-none placeholder:text-gray-300" />
              <div className="flex gap-4">
                <div className="flex-1 space-y-1"><label className="text-[10px] font-black uppercase">Warna Frame</label><input type="color" value={frameConfig.frameColor} onChange={(e) => setFrameConfig({...frameConfig, frameColor: e.target.value})} title="Pilih Warna Frame" className="h-10 w-full bg-white border-2 border-black rounded-lg p-1" /></div>
                <div className="flex-1 space-y-1"><label className="text-[10px] font-black uppercase">Warna Label</label><input type="color" value={frameConfig.labelColor} onChange={(e) => setFrameConfig({...frameConfig, labelColor: e.target.value})} title="Pilih Warna Label" className="h-10 w-full bg-white border-2 border-black rounded-lg p-1" /></div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-6 w-full">
          <button onClick={onGenerate} disabled={loading} className={`w-full border-[4px] border-black py-6 rounded-[2rem] font-[900] text-2xl shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] transition-all flex items-center justify-center gap-4 uppercase ${loading ? 'bg-gray-300 cursor-wait' : 'bg-[#ffeb3b]'}`}>{loading ? <><Sparkles size={28} className="animate-spin" /> Sedang Mencetak...</> : <><RefreshCw size={28} /> {buttonText}</>}</button>
          {qrImage && (
            <div className="flex gap-4">
              <a href={qrImage} download="BikinQR.png" className="flex-1 bg-[#2196f3] text-white border-[4px] border-black py-5 rounded-[2rem] font-[900] text-lg shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center justify-center gap-3 uppercase"><Download size={24} /> QR Only</a>
              {frameConfig.style !== "none" && (
                <button onClick={downloadFramedQR} className="flex-1 bg-[#4caf50] text-white border-[4px] border-black py-5 rounded-[2rem] font-[900] text-lg shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center justify-center gap-3 uppercase"><Download size={24} /> + Frame</button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function CartoonInput({ id, label, name, value, onChange, icon, className = "", placeholder = "" }: any) {
  return (
    <div className={`space-y-3 ${className}`}>
      <label htmlFor={id} className="text-sm font-[900] uppercase ml-1 tracking-wider">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">{icon}</div>
        <input id={id} type="text" name={name} value={value} onChange={onChange} title={label} placeholder={placeholder || `Isi ${label.toLowerCase()}...`} className="w-full bg-white border-[3px] border-black rounded-2xl pl-14 pr-6 py-5 font-[900] text-lg shadow-[6px_6px_0px_0px_#000] focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none transition-all outline-none placeholder:text-gray-300 tracking-tight" />
      </div>
    </div>
  );
}
