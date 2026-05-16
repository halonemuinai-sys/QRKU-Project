/* eslint-disable react/forbid-dom-props */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, Globe, Briefcase, Download, MessageSquare,
  Sparkles, ExternalLink, CheckCircle2,
} from "lucide-react";

export default function ProfileClient({ contact }: { contact: any }) {
  const [saved, setSaved] = useState(false);
  const shortId = contact.short_id;

  const handleSaveContact = () => {
    setSaved(true);
    window.open(`/api/contact/${shortId}/download`, "_blank");
    setTimeout(() => setSaved(false), 3000);
  };

  const fullName = `${contact.first_name || ""} ${contact.last_name || ""}`.trim();
  const initials = `${(contact.first_name || "?")[0]}${(contact.last_name || "")[0] || ""}`.toUpperCase();

  const actions = [
    contact.phone && { icon: <Phone size={20} />, label: "Telepon", value: contact.phone, href: `tel:${contact.phone}`, color: "bg-green-400" },
    contact.phone && { icon: <MessageSquare size={20} />, label: "WhatsApp", value: contact.phone, href: `https://wa.me/${contact.phone.replace(/[^0-9+]/g, "")}`, color: "bg-[#25D366]" },
    contact.email && { icon: <Mail size={20} />, label: "Email", value: contact.email, href: `mailto:${contact.email}`, color: "bg-blue-400" },
    contact.website && { icon: <Globe size={20} />, label: "Website", value: contact.website, href: contact.website.startsWith("http") ? contact.website : `https://${contact.website}`, color: "bg-purple-400" },
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#fffbef] flex items-center justify-center p-4 md:p-10 font-sans selection:bg-yellow-300 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <motion.div animate={{ y: [0, -20, 0], rotate: [12, 18, 12] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-[10%] right-[5%] w-32 h-32 bg-[#ffeb3b] border-4 border-black rounded-3xl rotate-12 opacity-20" />
        <motion.div animate={{ y: [0, 15, 0], rotate: [-6, -12, -6] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-[15%] left-[8%] w-24 h-24 bg-[#2196f3] border-4 border-black rounded-full opacity-20" />
      </div>

      <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", damping: 15, stiffness: 100 }} className="w-full max-w-md relative z-10">
        <div className="bg-white border-[5px] border-black rounded-[2.5rem] shadow-[12px_12px_0px_0px_#000] overflow-hidden">
          <div className="h-32 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${contact.dots_color || '#000'}, ${contact.gradient_color || '#333'})` }}>
            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1"><Sparkles size={10} /> BikinQR</span>
            </div>
          </div>

          <div className="flex justify-center -mt-16 relative z-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", damping: 10, stiffness: 150 }} className="w-28 h-28 rounded-full border-[5px] border-black bg-[#ffeb3b] shadow-[4px_4px_0px_0px_#000] flex items-center justify-center">
              <span className="text-4xl font-black tracking-tighter">{initials}</span>
            </motion.div>
          </div>

          <div className="px-8 pt-5 pb-4 text-center">
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-black uppercase tracking-tight">{fullName}</motion.h1>
            {contact.position && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-sm font-bold text-gray-500 uppercase mt-1 flex items-center justify-center gap-2"><Briefcase size={14} /> {contact.position}</motion.p>}
            {contact.organization && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="inline-block mt-3 px-4 py-1.5 bg-[#ffeb3b] border-2 border-black rounded-full shadow-[3px_3px_0px_0px_#000]"><span className="text-xs font-black uppercase tracking-wider">{contact.organization}</span></motion.div>}
          </div>

          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {actions.map((action: any, i: number) => (
                <motion.a key={i} href={action.href} target={action.label === "Website" ? "_blank" : undefined} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="flex items-center gap-3 p-4 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
                  <div className={`w-10 h-10 ${action.color} border-2 border-black rounded-xl flex items-center justify-center shrink-0 text-white group-hover:scale-110 transition-transform`}>{action.icon}</div>
                  <div className="min-w-0"><div className="text-[10px] font-black uppercase text-gray-400">{action.label}</div><div className="text-xs font-bold truncate">{action.value}</div></div>
                </motion.a>
              ))}
            </div>
          </div>

          <div className="px-6 pb-8 pt-2">
            <motion.button onClick={handleSaveContact} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className={`w-full py-5 rounded-2xl border-[4px] border-black font-black uppercase text-lg tracking-wider shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center justify-center gap-3 ${saved ? "bg-green-400 text-white" : "bg-[#ffeb3b] text-black"}`}>
              <AnimatePresence mode="wait">
                {saved ? <motion.span key="saved" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2"><CheckCircle2 size={22} /> Tersimpan!</motion.span>
                  : <motion.span key="save" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2"><Download size={22} /> Simpan Kontak</motion.span>}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-center mt-6">
          <a href="/" className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-gray-800 transition-colors"><Sparkles size={12} /> Buat Kartu Digital Gratis <ExternalLink size={12} /></a>
        </motion.div>
      </motion.div>
    </main>
  );
}
