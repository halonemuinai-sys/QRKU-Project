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
  LogOut,
  Crown
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


const processLogoForLuxury = (logo: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = logo.width;
  canvas.height = logo.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  
  ctx.drawImage(logo, 0, 0);
  
  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    
    // Detect if the logo has a white/light background.
    // Check 4 corners.
    const corners = [
      { x: 0, y: 0 },
      { x: canvas.width - 1, y: 0 },
      { x: 0, y: canvas.height - 1 },
      { x: canvas.width - 1, y: canvas.height - 1 }
    ];
    let lightCornersCount = 0;
    for (const corner of corners) {
      const idx = (corner.y * canvas.width + corner.x) * 4;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      const a = data[idx+3];
      if (a > 50 && r > 200 && g > 200 && b > 200) {
        lightCornersCount++;
      }
    }
    const hasWhiteBackground = lightCornersCount >= 2;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const a = data[i+3];
      
      if (a === 0) continue;
      
      if (hasWhiteBackground) {
        // White background: turn white pixels transparent, and dark/colored elements white
        if (r > 215 && g > 215 && b > 215) {
          data[i+3] = 0; // Transparent
        } else {
          data[i] = 255;
          data[i+1] = 255;
          data[i+2] = 255;
        }
      } else {
        // Transparent background: turn dark elements white
        const brightness = (r + g + b) / 3;
        if (brightness < 160) {
          data[i] = 255;
          data[i+1] = 255;
          data[i+2] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.warn("Failed to process logo pixels due to CORS/security, using filter fallback:", e);
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'brightness(0) invert(1)';
      ctx.drawImage(logo, 0, 0);
      ctx.filter = 'none';
    } catch (filterError) {
      ctx.drawImage(logo, 0, 0);
    }
  }
  
  return canvas;
};

const applyLogoToBlob = (blob: Blob, logoUrl: string, bgColor: string = '#ffffff', frameStyle: string = 'none'): Promise<string> => {
  return new Promise((resolve) => {
    const rawUrl = URL.createObjectURL(blob);
    if (!logoUrl) return resolve(rawUrl);
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Only set crossOrigin if logoUrl is a remote URL and not same-origin
    if (rawUrl.startsWith('http') && !rawUrl.startsWith('blob:') && !rawUrl.startsWith(window.location.origin)) {
      img.crossOrigin = "anonymous";
    }
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const logo = new Image();
      if (logoUrl.startsWith('http') && !logoUrl.startsWith('blob:') && !logoUrl.startsWith(window.location.origin)) {
        logo.crossOrigin = "anonymous";
      }
      
      logo.onload = () => {
        const maxLogoSize = img.width * 0.32;
        
        let targetWidth = maxLogoSize;
        let targetHeight = maxLogoSize;
        
        if (logo.width > logo.height) {
          targetHeight = maxLogoSize * (logo.height / logo.width);
        } else if (logo.height > logo.width) {
          targetWidth = maxLogoSize * (logo.width / logo.height);
        }
        
        const padding = 24;
        const bgWidth = targetWidth + padding * 2;
        const bgHeight = targetHeight + padding * 2;
        
        const bgX = (img.width - bgWidth) / 2;
        const bgY = (img.height - bgHeight) / 2;
        
        const logoX = (img.width - targetWidth) / 2;
        const logoY = (img.height - targetHeight) / 2;
        
        if (ctx) {
          if (frameStyle === 'luxury') {
            // Dark gray box for luxury
            ctx.fillStyle = '#111111';
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 16);
            } else {
              ctx.rect(bgX, bgY, bgWidth, bgHeight);
            }
            ctx.fill();
            
            // White outline for the box
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            // Process the logo to fit on the black background nicely (invert/remove white background)
            const processedLogo = processLogoForLuxury(logo);
            ctx.drawImage(processedLogo, logoX, logoY, targetWidth, targetHeight);
          } else {
            // Standard background box
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 16);
            } else {
              ctx.rect(bgX, bgY, bgWidth, bgHeight);
            }
            ctx.fill();
            ctx.drawImage(logo, logoX, logoY, targetWidth, targetHeight);
          }
        }
        resolve(canvas.toDataURL("image/png"));
      };
      logo.onerror = () => {
        console.warn("Failed to load logo image:", logoUrl);
        resolve(rawUrl);
      };
      logo.src = logoUrl;
    };
    img.onerror = () => {
      console.warn("Failed to load QR base blob image");
      resolve(rawUrl);
    };
    img.src = rawUrl;
  });
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

  const [editingId, setEditingId] = useState<string | null>(null);

  const cancelEdit = () => {
    setEditingId(null);
    setQrImage(null);
    setSmartQrImage(null);
  };

  const [smartData, setSmartData] = useState({
    title: "",
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
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryFilter, setGalleryFilter] = useState<"all" | "vcard" | "smart">("all");

  const [frameConfig, setFrameConfig] = useState({
    style: "none" as "none" | "rounded" | "badge" | "banner" | "circle" | "luxury",
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
    { name: 'Bvlgari', url: 'http://localhost:3001/uploads/bvlgari.png' },
    { name: 'Omega', url: 'http://localhost:3001/uploads/omega.png' },
    { name: 'Cartier', url: 'http://localhost:3001/uploads/cartier.png' },
  ];

  const presetLinks = [
    { brand: "EDOX", title: "Mode emploi EDOX EN web (Bahasa)", url: "https://chronologie-manual-book.vercel.app/download/mode-emploi-edox-en-web-bahasa" },
    { brand: "HAMILTON", title: "Hamilton 1000 ID Garansi Internasional", url: "https://chronologie-manual-book.vercel.app/download/1000-id-garansi-internasional" },
    { brand: "HAMILTON", title: "Hamilton 1001 ID Manual Winding Bahasa", url: "https://chronologie-manual-book.vercel.app/download/1001-id-manual-winding-bahasa" },
    { brand: "HAMILTON", title: "Hamilton 1002 ID Jam Tangan Quartz", url: "https://chronologie-manual-book.vercel.app/download/1002-id-jam-tangan-quartz" },
    { brand: "HAMILTON", title: "Hamilton 1003 ID Kronograf", url: "https://chronologie-manual-book.vercel.app/download/1003-id-kronograf-dengan-pemutaran-otomatis-atau-manual" },
    { brand: "HAMILTON", title: "Hamilton 1004 ID Kronograf Quartz", url: "https://chronologie-manual-book.vercel.app/download/1004-idkronograf-quartz" },
    { brand: "HAMILTON", title: "Hamilton 1007 ID Khaki Navy Scuba GMT", url: "https://chronologie-manual-book.vercel.app/download/1007-idkhaki-navy-scuba-gmt" },
    { brand: "HAMILTON", title: "Hamilton 1008 ID PSR", url: "https://chronologie-manual-book.vercel.app/download/1008-id-psr" },
    { brand: "HAMILTON", title: "Hamilton 1011 ID Jazzmaster Face 2 Face III", url: "https://chronologie-manual-book.vercel.app/download/1011-idjazzmaster-face-2-face-iii" },
    { brand: "HAMILTON", title: "Hamilton 1012 ID Ventura Edge Dune", url: "https://chronologie-manual-book.vercel.app/download/1012-idventura-edge-dune" },
    { brand: "HAMILTON", title: "Hamilton 1016 ID PSR 74", url: "https://chronologie-manual-book.vercel.app/download/1016-idpsr-74" },
    { brand: "YEMA", title: "Yema CMM.10 Caliber", url: "https://chronologie-manual-book.vercel.app/download/sistem-opersional-cmm-10-caliber" },
    { brand: "YEMA", title: "Yema CMM.20 Caliber", url: "https://chronologie-manual-book.vercel.app/download/sistem-opersional-cmm-20-caliber" },
    { brand: "YEMA", title: "Yema CMM.30 Caliber", url: "https://chronologie-manual-book.vercel.app/download/sistem-opersional-cmm-30-caliber" },
    { brand: "YEMA", title: "Yema SW200-1 Caliber", url: "https://chronologie-manual-book.vercel.app/download/sistem-opersional-sw200-1-caliber" },
    { brand: "YEMA", title: "Yema VH.31 Caliber", url: "https://chronologie-manual-book.vercel.app/download/sistem-opersional-vh-31-caliber" },
    { brand: "YEMA", title: "Yema VK-64 & VK-61 Caliber", url: "https://chronologie-manual-book.vercel.app/download/sistem-opersional-vk-64-vk-61-caliber" },
  ];

  const [activeTab, setActiveTab] = useState<"qr" | "vcard" | "smart" | "analytics" | "gallery">("qr");
  const [selectedTemplate, setSelectedTemplate] = useState("minimalist");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [smartQrImage, setSmartQrImage] = useState<string | null>(null);


  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qrSaved, setQrSaved] = useState(false);
  const [smartQrSaved, setSmartQrSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await api.get(`/api/analytics?t=${Date.now()}`);
      setAnalyticsData(response.data);
    } catch (error) { console.error(error); }
    finally { setAnalyticsLoading(false); }
  };

  const exportToCSV = () => {
    if (!analyticsData?.rawLogs || analyticsData.rawLogs.length === 0) {
      alert("Belum ada data scan yang bisa ditarik!");
      return;
    }

    // Define CSV headers
    const headers = ["Waktu Scan", "Nama QR", "Short ID", "Kota", "Negara", "Sistem Operasi (OS)", "Browser"];
    
    // Map data rows
    const rows = analyticsData.rawLogs.map((log: any) => [
      new Date(log.scanned_at).toLocaleString('id-ID'),
      log.qr_name,
      log.short_id,
      log.city,
      log.country,
      log.os,
      log.browser
    ]);

    // Construct CSV content with BOM for proper Excel encoding of special characters
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map((row: any) => row.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Create a Blob and download it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BikinQR_Laporan_Analitik_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchGallery = async () => {
    setGalleryLoading(true);
    try {
      const response = await api.get(`/api/gallery?t=${Date.now()}`);
      setGalleryData(response.data);
    } catch (error) { console.error(error); }
    finally { setGalleryLoading(false); }
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

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadGalleryQR = async (item: any) => {
    setDownloadingId(item.id);
    try {
      const shortUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/v/${item.short_id}` 
        : `/v/${item.short_id}`;

      const smartBody = {
        data: shortUrl,
        type: item.type,
        smartTitle: item.first_name,
        rawData: item.raw_data,
        previewOnly: true,
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
      };
      
      const response = await fetch("/api/generate-basic", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify(smartBody),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate base QR`);
      }
      
      const blob = await response.blob();
      const finalUrl = await applyLogoToBlob(blob, item.logo_url, item.background_color, 'none');
      
      const link = document.createElement("a");
      const name = item.type === "vcard" 
        ? `${item.first_name || ""} ${item.last_name || ""}`.trim() || "vCard"
        : item.first_name || item.type || "QR";
      link.download = `QR-${name.replace(/\s+/g, "_")}.png`;
      link.href = finalUrl;
      link.click();
      triggerConfetti();
    } catch (error: any) {
      alert("Gagal mengunduh QR: " + error.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const [bulkDownloading, setBulkDownloading] = useState(false);

  const downloadBulkQR = async () => {
    const itemsToDownload = galleryData.filter(item => {
      const matchFilter = galleryFilter === "all" || (galleryFilter === "vcard" && item.type === "vcard") || (galleryFilter === "smart" && item.type !== "vcard");
      const name = item.type === "vcard" ? `${item.first_name || ""} ${item.last_name || ""}`.trim() : item.first_name || item.type || "";
      const matchSearch = !gallerySearch || name.toLowerCase().includes(gallerySearch.toLowerCase());
      return matchFilter && matchSearch;
    });

    if (itemsToDownload.length === 0) {
      alert("Tidak ada QR Code untuk diunduh.");
      return;
    }

    const confirmed = window.confirm(`Unduh ${itemsToDownload.length} QR Code dalam file ZIP?`);
    if (!confirmed) return;

    setBulkDownloading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      
      let txtContent = "DAFTAR QR CODE & TAUTAN CHRONOLOGIE\n";
      txtContent += "========================================\n\n";

      for (let i = 0; i < itemsToDownload.length; i++) {
        const item = itemsToDownload[i];
        
        const shortUrl = typeof window !== "undefined" 
          ? `${window.location.origin}/v/${item.short_id}` 
          : `/v/${item.short_id}`;

        const smartBody = {
          data: shortUrl,
          type: item.type,
          smartTitle: item.first_name,
          rawData: item.raw_data,
          previewOnly: true,
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
        };
        
        const response = await fetch("/api/generate-basic", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
          body: JSON.stringify(smartBody),
        });

        if (!response.ok) {
          console.warn(`Gagal generate QR untuk ${item.first_name}`);
          continue;
        }

        const blob = await response.blob();
        const finalUrl = await applyLogoToBlob(blob, item.logo_url, item.background_color, 'none');
        const base64Data = finalUrl.split(',')[1];
        
        const name = item.type === "vcard" 
          ? `${item.first_name || ""} ${item.last_name || ""}`.trim() || "vCard"
          : item.first_name || item.type || "QR";
        
        const cleanName = name.replace(/[\/\\?%*:|"<>]/g, '-');
        zip.file(`${cleanName}.png`, base64Data, { base64: true });

        txtContent += `Judul: ${name}\n`;
        txtContent += `Short Link (Versi QR): ${shortUrl}\n`;
        txtContent += `Tautan Asli: ${item.raw_data?.content || "-"}\n`;
        txtContent += `----------------------------------------\n\n`;
      }

      zip.file("daftar_tautan.txt", txtContent);

      const content = await zip.generateAsync({ type: "blob" });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(content);
      downloadLink.download = `BikinQR_Bulk_${new Date().toISOString().slice(0,10)}.zip`;
      downloadLink.click();
      
      triggerConfetti();
    } catch (error: any) {
      alert("Gagal mengunduh bulk QR: " + error.message);
    } finally {
      setBulkDownloading(false);
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
    setEditingId(item.id);
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
        title: item.first_name || "",
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
    setQrSaved(false);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify({ ...formData, previewOnly: true }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server Error (${response.status})`);
      }
      const blob = await response.blob();
      const finalUrl = await applyLogoToBlob(blob, formData.logoUrl, formData.backgroundColor, frameConfig.style);
      setQrImage(finalUrl);
    } catch (error: any) {
      alert("Gagal preview QR: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveQR = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify({ ...formData, editingId }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server Error (${response.status})`);
      }
      await response.blob(); // consume body, we don't need the image after save
      setQrSaved(true);
      setEditingId(null);
      triggerConfetti();
      setTimeout(() => {
        setQrSaved(false);
        setQrImage(null);
      }, 2500);
    } catch (error: any) {
      alert("Gagal menyimpan QR: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const generateSmartQR = async () => {
    setLoading(true);
    setSmartQrSaved(false);
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
        body: JSON.stringify({ data: finalData, type: smartData.type, smartTitle: smartData.title, rawData, previewOnly: true, ...formData }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server Error (${response.status})`);
      }
      const blob = await response.blob();
      const finalUrl = await applyLogoToBlob(blob, formData.logoUrl, formData.backgroundColor, frameConfig.style);
      setSmartQrImage(finalUrl);
    } catch (error: any) {
      alert("Gagal preview Smart QR: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSmartQR = async () => {
    setSaving(true);
    try {
      let finalData = "";
      let rawData = {};
      if (smartData.type === 'link') { finalData = smartData.url; rawData = { content: smartData.url }; }
      else if (smartData.type === 'wifi') { finalData = `WIFI:S:${smartData.ssid};T:${smartData.encryption};P:${smartData.password};;`; rawData = { ssid: smartData.ssid, password: smartData.password, encryption: smartData.encryption }; }
      else if (smartData.type === 'maps') { finalData = `https://www.google.com/maps/search/?api=1&query=${smartData.lat},${smartData.lon}`; rawData = { lat: smartData.lat, lon: smartData.lon }; }
      else if (smartData.type === 'whatsapp') { const n = smartData.waNumber.replace(/[^0-9+]/g, ''); finalData = `https://wa.me/${n}?text=${encodeURIComponent(smartData.waMessage)}`; rawData = { waNumber: smartData.waNumber, waMessage: smartData.waMessage }; }
      else if (smartData.type === 'instagram') { const u = smartData.igUsername.replace('@', '').trim(); finalData = `https://instagram.com/${u}`; rawData = { igUsername: smartData.igUsername }; }
      else if (smartData.type === 'tiktok') { const u = smartData.ttUsername.replace('@', '').trim(); finalData = `https://tiktok.com/@${u}`; rawData = { ttUsername: smartData.ttUsername }; }

      const response = await fetch("/api/generate-basic", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
        body: JSON.stringify({ data: finalData, type: smartData.type, smartTitle: smartData.title, editingId, rawData, ...formData }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server Error (${response.status})`);
      }
      await response.blob();
      setSmartQrSaved(true);
      setEditingId(null);
      triggerConfetti();
      setTimeout(() => {
        setSmartQrSaved(false);
        setSmartQrImage(null);
      }, 2500);
    } catch (error: any) {
      alert("Gagal menyimpan Smart QR: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 2MB to prevent huge DB payloads)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran logo maksimal 2MB!");
      return;
    }

    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setFormData({ ...formData, logoUrl: base64Url });
      setUploading(false);
      triggerConfetti();
    };
    reader.onerror = () => {
      alert("Gagal membaca file gambar.");
      setUploading(false);
    };
    
    reader.readAsDataURL(file);
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
          <NavButton active={activeTab === "gallery"} onClick={() => {
            if (activeTab === "gallery") {
              fetchGallery();
            } else {
              setActiveTab("gallery");
            }
          }} icon={<History size={20}/>} label="My Gallery" color="#ff9800" />
          <NavButton active={activeTab === "analytics"} onClick={() => {
            if (activeTab === "analytics") {
              fetchAnalytics();
            } else {
              setActiveTab("analytics");
            }
          }} icon={<BarChart3 size={20}/>} label="Analytics" color="#ff4081" />
        </nav>

        <AnimatePresence mode="wait">
          {activeTab === "qr" ? (
            <motion.div key="qr-tab" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-10">
                <section className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-4 mb-10"><div className="w-12 h-12 bg-[#2196f3] border-[3px] border-black rounded-2xl flex items-center justify-center text-white"><User size={24} /></div><h2 className="text-3xl font-[900] uppercase text-black italic">Data Personal</h2></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 space-y-3 bg-[#fffbef] border-[4px] border-black p-6 rounded-[2rem] shadow-inner mb-2">
                      <label className="text-sm font-[900] uppercase ml-1 flex items-center gap-2">
                        Galeri Link Manual Book <Sparkles size={16} className="text-pink-500" />
                      </label>
                      <p className="text-xs font-bold text-gray-500 mb-3 ml-1">Pilih manual untuk auto-fill Website, Jabatan, dan Organisasi!</p>
                      <select 
                        onChange={(e) => {
                          if(!e.target.value) return;
                          const preset = presetLinks.find(p => p.url === e.target.value);
                          if(preset) {
                            setFormData({...formData, url: preset.url, title: preset.title, organization: preset.brand});
                          }
                        }}
                        className="w-full bg-white border-[3px] border-black rounded-2xl px-6 py-4 font-bold shadow-[6px_6px_0px_0px_#000] focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="">-- Pilih Manual Book --</option>
                        <optgroup label="EDOX">
                          {presetLinks.filter(p => p.brand === "EDOX").map(p => <option key={p.url} value={p.url}>{p.title}</option>)}
                        </optgroup>
                        <optgroup label="HAMILTON">
                          {presetLinks.filter(p => p.brand === "HAMILTON").map(p => <option key={p.url} value={p.url}>{p.title}</option>)}
                        </optgroup>
                        <optgroup label="YEMA">
                          {presetLinks.filter(p => p.brand === "YEMA").map(p => <option key={p.url} value={p.url}>{p.title}</option>)}
                        </optgroup>
                      </select>
                    </div>
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
              <div className="lg:col-span-5"><PreviewSection title="vCard QR" qrImage={qrImage} loading={loading} saving={saving} onGenerate={generateQR} onSave={saveQR} saved={qrSaved} saveButtonText={editingId ? "Update ke Gallery" : "Simpan ke Gallery"} onCancelEdit={editingId ? cancelEdit : undefined} frameConfig={frameConfig} setFrameConfig={setFrameConfig} /></div>
            </motion.div>
          ) : activeTab === "smart" ? (
            <motion.div key="smart-tab" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-10">
                <section className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10">
                  <div className="flex items-center gap-4 mb-10"><div className="w-12 h-12 bg-[#4caf50] border-[3px] border-black rounded-2xl flex items-center justify-center text-white"><Zap size={24} /></div><h2 className="text-3xl font-[900] uppercase text-black italic">Smart QR Tools</h2></div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-10">
                    {[
                      { id: 'link', name: 'Link', icon: <LinkIcon size={22}/>, color: '#2196f3' },
                      { id: 'wifi', name: 'WiFi', icon: <Wifi size={22}/>, color: '#4caf50' },
                      { id: 'maps', name: 'Maps', icon: <MapPin size={22}/>, color: '#f44336' },
                      { id: 'whatsapp', name: 'WA', icon: <MessageSquare size={22}/>, color: '#25D366' },
                      { id: 'instagram', name: 'IG', icon: <Camera size={22}/>, color: '#E4405F' },
                      { id: 'tiktok', name: 'TikTok', icon: <Play size={22}/>, color: '#000000' },
                    ].map(type => {
                      const isActive = smartData.type === type.id;
                      return (
                        <button
                          type="button"
                          key={type.id}
                          onClick={() => setSmartData({...smartData, type: type.id as any})}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-[3px] border-black font-black uppercase text-xs transition-all ${isActive ? "shadow-[4px_4px_0px_0px_#000] -translate-x-[2px] -translate-y-[2px] text-white" : "bg-white hover:bg-gray-50 shadow-[2px_2px_0px_0px_#000] text-black"}`}
                          style={isActive ? { backgroundColor: type.color } : {}}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-black text-white`} style={{ backgroundColor: type.color }}>
                            {type.icon}
                          </div>
                          {type.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-8">
                    <div className="bg-[#ffeb3b] border-[3px] border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000]">
                      <CartoonInput 
                        id="smartTitle" 
                        label="Judul QR (Biar rapi di Gallery)" 
                        name="title" 
                        value={smartData.title} 
                        onChange={handleSmartInputChange} 
                        icon={<Edit3 size={20} className="text-black" />} 
                        placeholder="Contoh: WA Toko Pusat, WiFi Rumah..." 
                      />
                    </div>
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
              <div className="lg:col-span-5"><PreviewSection title="Smart QR" qrImage={smartQrImage} loading={loading} saving={saving} onGenerate={generateSmartQR} onSave={saveSmartQR} saved={smartQrSaved} saveButtonText={editingId ? `Update ke Gallery` : `Simpan ke Gallery`} onCancelEdit={editingId ? cancelEdit : undefined} frameConfig={frameConfig} setFrameConfig={setFrameConfig} /></div>
            </motion.div>
          ) : activeTab === "analytics" ? (
            <motion.div key="analytics-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
              {/* Header */}
              <div className="bg-white border-[4px] border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase italic flex items-center gap-3"><BarChart3 /> Dashboard Analytics</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase mt-1">Real-time Scan Insights</p>
                </div>
                <div>
                  <button 
                    type="button" 
                    onClick={fetchAnalytics} 
                    className="bg-[#ffeb3b] text-black border-[3px] border-black px-5 py-2.5 rounded-2xl font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={16} className={analyticsLoading ? "animate-spin" : ""} /> Perbarui
                  </button>
                </div>
              </div>
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

                {/* Regional Demographics List */}
                <div className="lg:col-span-8 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10">
                  <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3"><MapPin /> Daftar Demografi Wilayah</h3>
                  
                  {analyticsData?.regionalDistribution && analyticsData.regionalDistribution.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-[3px] border-black text-left text-xs font-black uppercase tracking-wider text-gray-500">
                            <th className="pb-3 pr-4">Negara</th>
                            <th className="pb-3 px-4">Kota / Daerah</th>
                            <th className="pb-3 pl-4 text-right">Scan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.regionalDistribution.map((region: any, i: number) => (
                            <tr key={i} className="border-b-2 border-gray-100 hover:bg-gray-50 font-bold text-sm">
                              <td className="py-4 pr-4 uppercase tracking-wider">{region.country}</td>
                              <td className="py-4 px-4 text-black">{region.city}</td>
                              <td className="py-4 pl-4 text-right font-black text-blue-500">{region.scans}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-10 text-center font-bold text-gray-300 italic">Belum ada data demografi wilayah...</div>
                  )}
                </div>

                {/* Tarik Laporan / CSV Export */}
                <div className="lg:col-span-4 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] rounded-[2.5rem] p-10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-black uppercase italic mb-6 flex items-center gap-3"><Download /> Tarik Data</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase leading-relaxed mb-6">
                      Unduh seluruh riwayat data scan QR Anda dalam format file Microsoft Excel / CSV untuk analisis lebih lanjut.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 border-2 border-black rounded-2xl p-4 text-center">
                      <div className="text-3xl font-black text-black">{analyticsData?.rawLogs?.length || 0}</div>
                      <div className="text-[10px] font-black uppercase text-gray-400 mt-1">Baris Data Siap Diunduh</div>
                    </div>
                    
                    <button 
                      onClick={exportToCSV}
                      disabled={!analyticsData?.rawLogs || analyticsData.rawLogs.length === 0}
                      className="w-full bg-[#ffeb3b] text-black border-[3px] border-black py-4 rounded-2xl font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_#000] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                    >
                      <Download size={18} /> Tarik Laporan (CSV)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === "gallery" ? (
            <motion.div key="gallery-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              {/* Header */}
              <div className="bg-white border-[4px] border-black rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_#000] space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black uppercase italic flex items-center gap-3"><History /> My Gallery</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase mt-1">{galleryData.length} QR Tersimpan</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={fetchGallery} 
                      className="bg-[#ffeb3b] text-black border-[3px] border-black px-5 py-2.5 rounded-2xl font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2"
                    >
                      <RefreshCw size={16} className={galleryLoading ? "animate-spin" : ""} /> Perbarui
                    </button>
                    {galleryData.length > 0 && (
                      <button 
                        type="button" 
                        disabled={bulkDownloading}
                        onClick={downloadBulkQR} 
                        className="bg-[#2196f3] text-white border-[3px] border-black px-5 py-2.5 rounded-2xl font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <Download size={16} /> {bulkDownloading ? "Menyiapkan..." : "Unduh Bulk (ZIP)"}
                      </button>
                    )}
                    {galleryData.length > 0 && (
                      <button type="button" onClick={deleteAllQRs} className="bg-red-500 text-white border-[3px] border-black px-5 py-2.5 rounded-2xl font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2">
                        <Trash2 size={16} /> Hapus Semua
                      </button>
                    )}
                  </div>
                </div>
                {/* Search + Filter */}
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><QrCode size={18}/></div>
                    <input
                      type="text"
                      placeholder="Cari QR..."
                      value={gallerySearch}
                      onChange={e => setGallerySearch(e.target.value)}
                      className="w-full bg-white border-[3px] border-black rounded-2xl pl-11 pr-5 py-3 font-bold text-sm shadow-[3px_3px_0px_0px_#000] outline-none placeholder:text-gray-300"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(["all", "vcard", "smart"] as const).map(f => (
                      <button type="button" key={f} onClick={() => setGalleryFilter(f)}
                        className={`px-5 py-3 rounded-2xl border-[3px] border-black font-black uppercase text-xs transition-all ${galleryFilter === f ? "bg-black text-white shadow-[3px_3px_0px_0px_#000] -translate-x-[1px] -translate-y-[1px]" : "bg-white hover:bg-gray-50 shadow-[2px_2px_0px_0px_#000]"}`}>
                        {f === "all" ? "Semua" : f === "vcard" ? "vCard" : "Smart"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gallery List */}
              <div className="flex flex-col gap-4">
                {(() => {
                  const filtered = galleryData.filter(item => {
                    const matchFilter = galleryFilter === "all" || (galleryFilter === "vcard" && item.type === "vcard") || (galleryFilter === "smart" && item.type !== "vcard");
                    const name = item.type === "vcard" ? `${item.first_name || ""} ${item.last_name || ""}`.trim() : item.first_name || item.type || "";
                    const matchSearch = !gallerySearch || name.toLowerCase().includes(gallerySearch.toLowerCase());
                    return matchFilter && matchSearch;
                  });

                  if (filtered.length === 0) return (
                    <div className="py-24 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-6 opacity-30"><History size={40}/></div>
                      <h3 className="text-2xl font-black uppercase text-gray-300">{galleryData.length === 0 ? "Belum ada QR yang disimpan" : "Tidak ada hasil"}</h3>
                      <p className="font-bold text-gray-300 mt-2">{galleryData.length === 0 ? "Buat QR pertamamu untuk melihatnya di sini!" : "Coba ubah filter atau kata kunci pencarian."}</p>
                    </div>
                  );

                  return filtered.map((item) => {
                    const name = item.type === "vcard"
                      ? `${item.first_name || ""} ${item.last_name || ""}`.trim() || "vCard"
                      : item.first_name || String(item.type || "UNKNOWN").toUpperCase();
                    const isVcard = item.type === "vcard";
                    const typeColors: Record<string, string> = { link: "#2196f3", wifi: "#4caf50", maps: "#f44336", whatsapp: "#25D366", instagram: "#E4405F", tiktok: "#000000", vcard: "#ffeb3b" };
                    const typeColor = typeColors[item.type] || "#888";
                    const typeLabel = item.type?.toUpperCase() || "QR";

                    return (
                      <motion.div whileHover={{ scale: 1.005 }} key={item.id}
                        className="bg-white border-[4px] border-black rounded-[2rem] shadow-[6px_6px_0px_0px_#000] p-5 flex flex-col md:flex-row items-center gap-5 transition-all">

                        {/* QR Thumbnail */}
                        <div className="flex-shrink-0 border-[3px] border-black rounded-2xl overflow-hidden bg-white p-2 shadow-[4px_4px_0px_0px_#000]">
                          <QRThumbnail item={item} size={80} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="px-2.5 py-1 rounded-full border-2 border-black font-black text-[10px] uppercase tracking-wider text-white" style={{ backgroundColor: typeColor }}>{typeLabel}</span>
                            <span className="text-xs font-bold text-gray-400 italic">{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <h3 className="text-xl font-black uppercase truncate leading-tight">{name}</h3>
                          {isVcard && item.organization && <p className="text-xs font-bold text-gray-500 truncate mt-0.5">{item.organization} {item.position ? `· ${item.position}` : ""}</p>}
                          {!isVcard && item.raw_data?.content && <p className="text-xs font-bold text-gray-500 truncate mt-0.5">{item.raw_data.content}</p>}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="bg-black text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><TrendingUp size={10}/>{item.scan_count} Scan</span>
                            {item.short_id && <span className="bg-gray-100 border border-gray-200 text-gray-500 px-2 py-1 rounded-lg text-[10px] font-bold uppercase">{item.short_id}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 w-full md:w-auto">
                          <button 
                            type="button" 
                            disabled={downloadingId === item.id}
                            onClick={() => downloadGalleryQR(item)} 
                            className="flex-1 md:flex-none bg-[#4caf50] hover:bg-[#43a047] text-white border-[3px] border-black px-5 py-3 rounded-xl font-black text-sm shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {downloadingId === item.id ? (
                              <>Loading...</>
                            ) : (
                              <><Download size={15}/> Unduh</>
                            )}
                          </button>
                          <button type="button" onClick={() => { setActiveTab(isVcard ? "qr" : "smart"); restoreQR(item); }} className="flex-1 md:flex-none bg-[#ffeb3b] border-[3px] border-black px-5 py-3 rounded-xl font-black text-sm shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-2">
                            <Edit3 size={15}/> Edit
                          </button>
                          <button type="button" onClick={() => deleteQR(item.id)} className="flex-1 md:flex-none px-5 py-3 border-[3px] border-black rounded-xl bg-red-100 hover:bg-red-200 text-red-700 shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-2 font-black text-sm">
                            <Trash2 size={15}/> Hapus
                          </button>
                        </div>
                      </motion.div>
                    );
                  });
                })()}
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

function PreviewSection({ title, qrImage, loading, saving, onGenerate, onSave, saved, saveButtonText, onCancelEdit, frameConfig, setFrameConfig }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelPresets = ["SCAN ME", "FOLLOW US", "CONNECT WITH ME", "ORDER NOW", "VISIT US", "SAVE CONTACT"];
  const frameStyles = [
    { id: "none", name: "Tanpa Frame", icon: <X size={14}/> },
    { id: "rounded", name: "Rounded", icon: <Square size={14}/> },
    { id: "badge", name: "Badge", icon: <Star size={14}/> },
    { id: "banner", name: "Banner", icon: <Layout size={14}/> },
    { id: "circle", name: "Circle", icon: <Circle size={14}/> },
    { id: "luxury", name: "Luxury Gold", icon: <Crown size={14}/> }
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
      } else if (frameConfig.style === "luxury") {
        const luxuryRadius = 40;
        
        ctx.fillStyle = "#a88645"; // Gold color
        ctx.beginPath();
        ctx.roundRect(0, 0, totalW, totalH, luxuryRadius);
        ctx.fill();
        
        const innerBorder = 14;
        ctx.fillStyle = "#111111"; // Black inner frame
        ctx.beginPath();
        ctx.roundRect(innerBorder, innerBorder, totalW - innerBorder*2, totalH - innerBorder*2, luxuryRadius - 6);
        ctx.fill();
        
        ctx.fillStyle = "#f4f4f4"; // Soft background
        ctx.beginPath();
        ctx.roundRect(padding, padding, qrSize, qrSize, luxuryRadius - 15);
        ctx.fill();
        
        ctx.drawImage(img, padding, padding, qrSize, qrSize);
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
          const isLuxury = frameConfig.style === "luxury";
          const frameContainerStyle = { padding: frameConfig.style !== "none" ? (isLuxury ? "28px" : "20px") : "0" };
          const frameBgStyle = { backgroundColor: frameConfig.frameColor, border: '4px solid black', boxShadow: '10px 10px 0px 0px black' };
          const labelStyle = { backgroundColor: frameConfig.style === 'badge' ? frameConfig.frameColor : 'transparent', color: frameConfig.style === 'badge' ? frameConfig.labelColor : frameConfig.frameColor };
          
          return (
            <div className="relative" style={frameContainerStyle}>
              {frameConfig.style !== "none" && (
                <div className={`absolute inset-0 ${frameConfig.style === 'circle' ? 'rounded-full' : 'rounded-[2.5rem]'}`} style={frameBgStyle}>
                  {isLuxury && <div className="absolute inset-2.5 border-[6px] border-[#111111] rounded-[2rem]"></div>}
                </div>
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

        <div className="mt-8 flex flex-col gap-4 w-full">
          {onCancelEdit && (
            <button type="button" onClick={onCancelEdit} className="w-full bg-[#f44336] text-white border-[4px] border-black py-4 rounded-[1.5rem] font-[900] text-lg shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-3 uppercase">
              <X size={22} /> Batal Edit
            </button>
          )}

          {/* Step 1: Preview */}
          <button type="button" onClick={onGenerate} disabled={loading || saving} className={`w-full border-[4px] border-black py-5 rounded-[2rem] font-[900] text-xl shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] transition-all flex items-center justify-center gap-4 uppercase ${loading ? 'bg-gray-300 cursor-wait' : 'bg-[#ffeb3b]'}`}>
            {loading ? <><Sparkles size={26} className="animate-spin" /> Memproses...</> : <><RefreshCw size={26} /> Preview QR</>}
          </button>

          {/* Step 2: Save — shown after preview, collapses when saved */}
          <AnimatePresence>
            {qrImage && !saved && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={onSave}
                disabled={saving || loading}
                className={`w-full border-[4px] border-black py-5 rounded-[2rem] font-[900] text-xl shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] transition-all flex items-center justify-center gap-4 uppercase text-white ${saving ? 'bg-gray-400 cursor-wait' : 'bg-[#2196f3]'}`}
              >
                {saving ? <><Sparkles size={26} className="animate-spin" /> Menyimpan...</> : <><Star size={26} /> {saveButtonText}</>}
              </motion.button>
            )}
            {qrImage && saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-[#4caf50] text-white border-[4px] border-black py-4 rounded-[2rem] font-[900] text-lg flex items-center justify-center gap-3 uppercase shadow-[4px_4px_0px_0px_#000]"
              >
                <CheckCircle2 size={24} /> Tersimpan di Gallery!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Download buttons */}
          {qrImage && (
            <div className="flex gap-3">
              <a href={qrImage} download="BikinQR.png" className="flex-1 bg-white border-[3px] border-black py-4 rounded-[1.5rem] font-[900] text-sm shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 uppercase"><Download size={20} /> Unduh QR</a>
              {frameConfig.style !== "none" && (
                <button type="button" onClick={downloadFramedQR} className="flex-1 bg-white border-[3px] border-black py-4 rounded-[1.5rem] font-[900] text-sm shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 uppercase"><Download size={20} /> + Frame</button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function QRThumbnail({ item, size = 80 }: { item: any; size?: number }) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    let content = "";
    const t = item.type;
    if (t === "vcard") {
      content = typeof window !== "undefined" ? `${window.location.origin}/v/${item.short_id}` : `/v/${item.short_id}`;
    } else if (t === "link") {
      content = item.raw_data?.content || "";
    } else if (t === "wifi") {
      content = `WIFI:S:${item.raw_data?.ssid};T:${item.raw_data?.encryption || "WPA"};P:${item.raw_data?.password};;`;
    } else if (t === "maps") {
      content = `https://www.google.com/maps/search/?api=1&query=${item.raw_data?.lat},${item.raw_data?.lon}`;
    } else if (t === "whatsapp") {
      content = `https://wa.me/${(item.raw_data?.waNumber || "").replace(/[^0-9+]/g, "")}`;
    } else if (t === "instagram") {
      content = `https://instagram.com/${(item.raw_data?.igUsername || "").replace("@", "")}`;
    } else if (t === "tiktok") {
      content = `https://tiktok.com/@${(item.raw_data?.ttUsername || "").replace("@", "")}`;
    }
    if (!content) return;
    import("qrcode").then((mod) => {
      const QRCode = mod.default ?? mod;
      (QRCode as any).toDataURL(content, { width: size, margin: 1, errorCorrectionLevel: "M" })
        .then((dataUrl: string) => setUrl(dataUrl))
        .catch(() => {});
    });
  }, [item, size]);

  if (!url) return (
    <div className="rounded-lg bg-gray-100 animate-pulse flex items-center justify-center" style={{ width: size, height: size }}>
      <QrCode size={size / 3} className="text-gray-300" />
    </div>
  );
  return <img src={url} alt="QR Preview" width={size} height={size} className="rounded-lg" />;
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
