/* eslint-disable react/forbid-dom-props */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, Globe, Briefcase, Download, MessageSquare,
  Sparkles, ExternalLink, CheckCircle2, Building2,
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

  const infoRows = [
    contact.phone   && { icon: <Phone size={16}/>,   label: "Telepon",  value: contact.phone,   bg: "bg-green-50",  border: "border-green-200",  icon_bg: "bg-green-400" },
    contact.email   && { icon: <Mail size={16}/>,    label: "Email",    value: contact.email,   bg: "bg-blue-50",   border: "border-blue-200",   icon_bg: "bg-blue-400"  },
    contact.website && { icon: <Globe size={16}/>,   label: "Website",  value: contact.website, bg: "bg-purple-50", border: "border-purple-200", icon_bg: "bg-purple-400" },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; bg: string; border: string; icon_bg: string }[];

  const actions = [
    contact.phone   && { icon: <Phone size={18}/>,        label: "Telepon",   href: `tel:${contact.phone}`,                                                                        color: "bg-green-400"   },
    contact.phone   && { icon: <MessageSquare size={18}/>, label: "WhatsApp",  href: `https://wa.me/${contact.phone.replace(/[^0-9+]/g, "")}`,                                      color: "bg-[#25D366]"   },
    contact.email   && { icon: <Mail size={18}/>,          label: "Email",     href: `mailto:${contact.email}`,                                                                      color: "bg-[#2196f3]"   },
    contact.website && { icon: <Globe size={18}/>,         label: "Website",   href: contact.website.startsWith("http") ? contact.website : `https://${contact.website}`,           color: "bg-purple-500"  },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; href: string; color: string }[];

  const accentColor = contact.dots_color || "#000000";
  const accentColor2 = contact.gradient_color || "#333333";

  return (
    <main className="min-h-screen bg-[#fffbef] flex items-center justify-center p-4 md:p-8 font-sans selection:bg-yellow-300 relative overflow-hidden">
      {/* Background decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ y: [0, -18, 0], rotate: [12, 18, 12] }} transition={{ duration: 7, repeat: Infinity }}
          className="absolute top-[8%] right-[4%] w-28 h-28 bg-[#ffeb3b] border-4 border-black rounded-3xl rotate-12 opacity-10" />
        <motion.div animate={{ y: [0, 14, 0], rotate: [-6, -14, -6] }} transition={{ duration: 9, repeat: Infinity }}
          className="absolute bottom-[12%] left-[6%] w-20 h-20 bg-[#2196f3] border-4 border-black rounded-full opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-white border-[5px] border-black rounded-[2.5rem] shadow-[12px_12px_0px_0px_#000] overflow-hidden">

          {/* Gradient Header */}
          <div className="h-36 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor2})` }}>
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize: "18px 18px" }} />
            {contact.logo_url && (
              <div className="absolute top-4 left-5">
                <img src={contact.logo_url} alt="Logo" className="h-10 max-w-[80px] object-contain rounded-lg border-2 border-white/40 shadow-md" />
              </div>
            )}
            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5"><Sparkles size={10}/> BikinQR</span>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center -mt-14 relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.25, type: "spring", damping: 10, stiffness: 150 }}
              className="w-28 h-28 rounded-full border-[5px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center text-4xl font-black tracking-tighter"
              style={{ backgroundColor: accentColor === "#000000" ? "#ffeb3b" : accentColor + "22", color: accentColor === "#000000" ? "#000" : accentColor }}
            >
              {initials}
            </motion.div>
          </div>

          {/* Identity */}
          <div className="px-7 pt-4 pb-5 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="text-2xl font-black uppercase tracking-tight leading-tight"
            >
              {fullName}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-3"
            >
              {contact.position && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white rounded-full text-[11px] font-black uppercase tracking-wide">
                  <Briefcase size={11}/> {contact.position}
                </span>
              )}
              {contact.organization && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffeb3b] border-2 border-black rounded-full text-[11px] font-black uppercase tracking-wide">
                  <Building2 size={11}/> {contact.organization}
                </span>
              )}
            </motion.div>
          </div>

          {/* Divider */}
          <div className="mx-6 border-t-[3px] border-dashed border-black mb-5" />

          {/* Contact Info Rows */}
          {infoRows.length > 0 && (
            <div className="px-6 space-y-2.5 mb-5">
              {infoRows.map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                  className={`flex items-center gap-3 px-4 py-3 ${row.bg} border-2 ${row.border} rounded-2xl`}
                >
                  <div className={`w-9 h-9 ${row.icon_bg} border-2 border-black rounded-xl flex items-center justify-center shrink-0 text-white shadow-[2px_2px_0px_0px_#000]`}>
                    {row.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{row.label}</div>
                    <div className="text-sm font-bold text-black break-all leading-tight mt-0.5">{row.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Action Buttons Grid */}
          {actions.length > 0 && (
            <div className="px-6 mb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Hubungi via</p>
              <div className="grid grid-cols-2 gap-3">
                {actions.map((action, i) => (
                  <motion.a
                    key={i}
                    href={action.href}
                    target={action.label === "Website" ? "_blank" : undefined}
                    rel={action.label === "Website" ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 + i * 0.08 }}
                    className={`flex items-center justify-center gap-2 py-3.5 px-3 ${action.color} text-white border-[3px] border-black rounded-2xl font-black text-sm uppercase shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all`}
                  >
                    {action.icon} {action.label}
                  </motion.a>
                ))}
              </div>
            </div>
          )}

          {/* Save CTA */}
          <div className="px-6 pb-8">
            <motion.button
              onClick={handleSaveContact}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              className={`w-full py-5 rounded-2xl border-[4px] border-black font-black uppercase text-lg tracking-wider shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center justify-center gap-3 ${saved ? "bg-green-400 text-white" : "bg-[#ffeb3b] text-black"}`}
            >
              <AnimatePresence mode="wait">
                {saved
                  ? <motion.span key="saved" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2"><CheckCircle2 size={22}/> Tersimpan di HP!</motion.span>
                  : <motion.span key="save" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2"><Download size={22}/> Simpan Kontak</motion.span>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="text-center mt-5">
          <a href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-[3px_3px_0px_0px_#555]">
            <Sparkles size={12}/> Buat Kartu Digital Gratis <ExternalLink size={12}/>
          </a>
        </motion.div>
      </motion.div>
    </main>
  );
}
