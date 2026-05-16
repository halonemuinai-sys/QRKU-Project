"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import confetti from "canvas-confetti";
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
  CheckCircle2
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
} as const;

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.9 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", damping: 12, stiffness: 100 } }
} as const;

const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
} as const;


export default function Home() {
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
    logoUrl: "",
    hideBackgroundDots: true
  });

  const defaultLogos = [
    { name: 'Facebook', url: 'https://cdn.simpleicons.org/facebook/1877F2' },
    { name: 'Twitter', url: 'https://cdn.simpleicons.org/twitter/1DA1F2' },
    { name: 'WhatsApp', url: 'https://cdn.simpleicons.org/whatsapp/25D366' },
    { name: 'Instagram', url: 'https://cdn.simpleicons.org/instagram/E4405F' },
    { name: 'LinkedIn', url: 'https://cdn.simpleicons.org/linkedin/0A66C2' },
    { name: 'YouTube', url: 'https://cdn.simpleicons.org/youtube/FF0000' },
    { name: 'Google', url: 'https://cdn.simpleicons.org/google/4285F4' },
    { name: 'Bvlgari', url: 'http://localhost:3001/uploads/bvlgari.png' },
    { name: 'Omega', url: 'http://localhost:3001/uploads/omega.png' },
    { name: 'Cartier', url: 'http://localhost:3001/uploads/cartier.png' },
  ];

  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerConfetti = () => {
    const end = Date.now() + 1000;
    const colors = ["#ffeb3b", "#2196f3", "#f44336", "#4caf50"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const generateQR = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error("Failed to generate QR");
      
      const blob = await response.blob();
      setQrImage(URL.createObjectURL(blob));
      triggerConfetti();
    } catch (error) {
      console.error(error);
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
      const response = await axios.post("http://localhost:3001/upload", uploadData);
      setFormData({ ...formData, logoUrl: response.data.url });
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    generateQR();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-[#fffbef] p-4 md:p-10 font-sans selection:bg-yellow-300 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div variants={floatingVariants} animate="animate" className="absolute top-[10%] left-[5%] w-24 h-24 bg-[#ffeb3b] border-4 border-black rounded-3xl rotate-12 opacity-20" />
        <motion.div variants={floatingVariants} animate="animate" className="absolute bottom-[15%] right-[8%] w-32 h-32 bg-[#2196f3] border-4 border-black rounded-full opacity-10" />
        <motion.div variants={floatingVariants} animate="animate" className="absolute top-[40%] right-[5%] w-16 h-16 bg-[#f44336] border-4 border-black rotate-45 opacity-15" />
        <div className="absolute inset-0 opacity-[0.03] bg-dot-pattern" />
      </div>


      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] rounded-[2.5rem] p-8">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-5">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className="p-4 bg-[#ffeb3b] border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl">
              <QrCode size={36} className="text-black" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-[900] tracking-tight text-black">
                BIKIN<span className="text-[#2196f3]">QR</span>
              </h1>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                Bikin QR Jadi Seru! <Sparkles size={16} className="text-[#ffeb3b]" />
              </p>
            </div>
          </motion.div>
          <div className="flex gap-4">
            {[ '#f44336', '#2196f3', '#ffeb3b' ].map((color, i) => (
              <motion.div key={color} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} className="w-12 h-12 rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_#000]" style={{ backgroundColor: color }} />
            ))}
          </div>
        </header>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-10">
            <motion.section variants={itemVariants} className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_#000] transition-all">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-[#2196f3] border-[3px] border-black rounded-2xl flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#000]">
                  <User size={24} />
                </div>
                <h2 className="text-3xl font-[900] text-black italic uppercase tracking-tight">Siapa Kamu?</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CartoonInput id="firstName" label="Nama Depan" name="firstName" value={formData.firstName} onChange={handleInputChange} icon={<Star size={20} className="text-pink-500" />} />
                <CartoonInput id="lastName" label="Nama Belakang" name="lastName" value={formData.lastName} onChange={handleInputChange} icon={<Star size={20} className="text-yellow-500" />} />
                <CartoonInput id="organization" label="Organisasi" name="organization" value={formData.organization} onChange={handleInputChange} icon={<Briefcase size={20} className="text-blue-500" />} />
                <CartoonInput id="title" label="Jabatan" name="title" value={formData.title} onChange={handleInputChange} icon={<Briefcase size={20} className="text-green-500" />} />
                <CartoonInput id="phone" label="No. Telepon" name="phone" value={formData.phone} onChange={handleInputChange} icon={<Phone size={20} className="text-red-500" />} />
                <CartoonInput id="email" label="Email" name="email" value={formData.email} onChange={handleInputChange} icon={<Mail size={20} className="text-purple-500" />} />
                <CartoonInput id="url" label="Website" name="url" value={formData.url} onChange={handleInputChange} icon={<Globe size={20} className="text-cyan-500" />} className="md:col-span-2" />
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_#000] transition-all">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-[#ffeb3b] border-[3px] border-black rounded-2xl flex items-center justify-center text-black shadow-[4px_4px_0px_0px_#000]">
                  <Palette size={24} />
                </div>
                <h2 className="text-3xl font-[900] text-black italic uppercase tracking-tight">Bikin Gaya!</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label htmlFor="dotsType" className="text-sm font-[900] uppercase ml-1 flex items-center gap-2">
                    Bentuk Titik <Sparkles size={14} className="text-yellow-500" />
                  </label>
                  <select 
                    id="dotsType"
                    name="dotsType" 
                    value={formData.dotsType} 
                    onChange={handleInputChange}
                    className="w-full bg-white border-[3px] border-black rounded-2xl px-6 py-5 font-bold shadow-[6px_6px_0px_0px_#000] focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none transition-all outline-none appearance-none"
                  >
                    <option value="rounded">Bulat Lucu</option>
                    <option value="dots">Titik Kecil</option>
                    <option value="classy">Gaya Mewah</option>
                    <option value="square">Kotak Biasa</option>
                    <option value="extra-rounded">Super Mulus</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <label htmlFor="dotsColor" className="text-sm font-[900] uppercase ml-1">Warna Utama</label>
                  <div className="flex gap-4">
                    <motion.input 
                      whileHover={{ scale: 1.05 }}
                      id="dotsColor"
                      type="color" 
                      name="dotsColor" 
                      value={formData.dotsColor} 
                      onChange={handleInputChange}
                      className="h-20 w-24 bg-white border-[3px] border-black rounded-2xl cursor-pointer p-2 shadow-[6px_6px_0px_0px_#000]"
                    />
                    <div className="flex-1 bg-gray-50 border-[3px] border-black rounded-2xl px-6 flex items-center font-black text-2xl">
                      {formData.dotsColor.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="gradientColor2" className="text-sm font-[900] uppercase ml-1">Warna Ke-2</label>
                  <div className="flex gap-4">
                    <motion.input 
                      whileHover={{ scale: 1.05 }}
                      id="gradientColor2"
                      type="color" 
                      name="gradientColor2" 
                      value={formData.gradientColor2} 
                      onChange={handleInputChange}
                      className="h-20 w-24 bg-white border-[3px] border-black rounded-2xl cursor-pointer p-2 shadow-[6px_6px_0px_0px_#000]"
                    />
                    <div className="flex-1 bg-gray-50 border-[3px] border-black rounded-2xl px-6 flex items-center font-black text-2xl">
                      {formData.gradientColor2.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2 mt-4">
                  <label className="text-sm font-[900] uppercase ml-1 border-b-[3px] border-black pb-2 inline-block">Logo Kartu & Galeri</label>
                  
                  {/* Selected Logo Area */}
                  <div className="flex flex-col sm:flex-row gap-6 bg-white border-[4px] border-black p-6 rounded-[2rem] shadow-[6px_6px_0px_0px_#000]">
                    <div className="w-28 h-28 bg-gray-50 border-[3px] border-black rounded-[1.5rem] flex items-center justify-center p-3 shadow-inner shrink-0">
                      {formData.logoUrl ? (
                        <motion.img initial={{ scale: 0 }} animate={{ scale: 1 }} src={formData.logoUrl} className="w-full h-full object-contain" alt="Selected Logo" />
                      ) : (
                        <ImageIcon size={40} className="text-gray-300" />
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-4 justify-center">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex-1 bg-[#2196f3] text-white border-[3px] border-black rounded-xl px-4 py-3 font-[900] shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 uppercase text-sm tracking-tight"
                        >
                          {uploading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
                          Upload Image
                        </motion.button>
                        
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({...formData, logoUrl: ""})}
                          className="flex-1 bg-white border-[3px] border-black rounded-xl px-4 py-3 font-[900] shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 uppercase text-sm tracking-tight"
                        >
                          <X size={18} />
                          Remove Logo
                        </motion.button>
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer group mt-1">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="appearance-none w-7 h-7 border-[3px] border-black rounded-lg cursor-pointer checked:bg-[#ffeb3b] transition-colors"
                            checked={formData.hideBackgroundDots}
                            onChange={(e) => setFormData({...formData, hideBackgroundDots: e.target.checked})}
                          />
                          {formData.hideBackgroundDots && <CheckCircle2 size={18} className="absolute text-black pointer-events-none" />}
                        </div>
                        <span className="font-[900] text-sm group-hover:text-[#2196f3] transition-colors uppercase tracking-tight">Remove Background Behind Logo</span>
                      </label>
                    </div>
                  </div>

                  {/* Logo Gallery */}
                  <div className="bg-[#fffbef] border-[4px] border-black p-6 rounded-[2rem] shadow-inner mt-4">
                    <p className="text-xs font-black uppercase text-gray-500 mb-4 tracking-widest flex items-center gap-2">
                      <Sparkles size={14} className="text-pink-500"/> Pilih dari Galeri
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {defaultLogos.map((logo) => (
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          key={logo.name}
                          onClick={() => setFormData({...formData, logoUrl: logo.url})}
                          title={logo.name}
                          className={`w-14 h-14 rounded-2xl border-[3px] border-black bg-white p-2.5 flex items-center justify-center transition-all shadow-[3px_3px_0px_0px_#000]
                            ${formData.logoUrl === logo.url ? 'bg-[#ffeb3b] translate-y-[-4px] shadow-[6px_6px_0px_0px_#000] ring-4 ring-[#2196f3] ring-offset-2' : ''}
                          `}
                        >
                          <img src={logo.url} alt={logo.name} className="w-full h-full object-contain" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} title="Upload Logo" />
                </div>

              </div>
            </motion.section>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-10 space-y-10">
              <motion.div variants={itemVariants} className="bg-white border-[5px] border-black rounded-[3.5rem] p-12 shadow-[15px_15px_0px_0px_#000] relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-5 bg-[#2196f3] border-b-[5px] border-black"></div>
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="mb-8 mt-6 inline-block bg-[#ffeb3b] border-[3px] border-black px-6 py-2 rounded-full text-sm font-[900] uppercase shadow-[4px_4px_0px_0px_#000] italic">
                  Ganteng Banget! 😎
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="bg-white p-8 border-[4px] border-black rounded-[2.5rem] shadow-[10px_10px_0px_0px_#000] relative group cursor-pointer"
                >
                  <AnimatePresence mode="wait">
                    {qrImage ? (
                      <motion.img key={qrImage} initial={{ rotate: -10, scale: 0.5, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 10 }} src={qrImage} alt="QR Code" className="w-full max-w-[320px] aspect-square object-contain" />
                    ) : (
                      <div className="w-72 h-72 flex items-center justify-center">
                        <RefreshCw className="animate-spin text-gray-200" size={80} />
                      </div>
                    )}
                  </AnimatePresence>
                  <motion.div className="absolute -top-4 -right-4 bg-pink-500 text-white p-3 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_#000] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles size={20} />
                  </motion.div>
                </motion.div>

                <div className="mt-12 flex flex-col gap-6 w-full">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateQR} disabled={loading} className="w-full bg-[#ffeb3b] border-[4px] border-black py-6 rounded-[2rem] font-[900] text-2xl shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] transition-all flex items-center justify-center gap-4 uppercase tracking-tighter">
                    <RefreshCw size={28} className={loading ? "animate-spin" : ""} />
                    {loading ? "Sabar..." : "Bikin QR!"}
                  </motion.button>
                  <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href={qrImage || "#"} download="BikinQR-kartu.png" className="w-full bg-[#2196f3] text-white border-[4px] border-black py-6 rounded-[2rem] font-[900] text-2xl shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] transition-all flex items-center justify-center gap-4 uppercase tracking-tighter">
                    <Download size={28} />
                    Download
                  </motion.a>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-[#4caf50] border-[4px] border-black p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_#000] text-white text-center font-black italic uppercase">
                Udah scan belum? Langsung save ke kontak loh! 📱
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

interface CartoonInputProps {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  className?: string;
  placeholder?: string;
}

function CartoonInput({ id, label, name, value, onChange, icon, className = "", placeholder = "" }: CartoonInputProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <label htmlFor={id} className="text-sm font-[900] uppercase ml-1 tracking-wider">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">{icon}</div>
        <input id={id} type="text" name={name} value={value} onChange={onChange} placeholder={placeholder || `Isi ${label.toLowerCase()}...`} className="w-full bg-white border-[3px] border-black rounded-2xl pl-14 pr-6 py-5 font-[900] text-lg shadow-[6px_6px_0px_0px_#000] focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none transition-all outline-none placeholder:text-gray-300 tracking-tight" />
      </div>
    </div>
  );
}

