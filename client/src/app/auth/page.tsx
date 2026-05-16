/* eslint-disable react/forbid-dom-props */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  QrCode,
  Mail,
  Lock,
  Sparkles,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password minimal 6 karakter!");
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err.message === "Invalid login credentials" ? "Email atau password salah!" : err.message);
      } else {
        router.push("/");
      }
    } else {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err.message);
      } else {
        setSuccess("Akun berhasil dibuat! Silakan cek email untuk verifikasi, atau langsung login.");
        setMode("login");
      }
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#fffbef] flex items-center justify-center p-4 md:p-10 font-sans selection:bg-yellow-300 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
        <motion.div animate={{ y: [0, -30, 0], rotate: [12, 20, 12] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-[8%] left-[5%] w-28 h-28 bg-[#ffeb3b] border-4 border-black rounded-3xl rotate-12 opacity-20" />
        <motion.div animate={{ y: [0, 20, 0], rotate: [-6, -14, -6] }} transition={{ duration: 9, repeat: Infinity }} className="absolute bottom-[10%] right-[8%] w-20 h-20 bg-[#2196f3] border-4 border-black rounded-full opacity-20" />
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-[50%] right-[3%] w-16 h-16 bg-[#f44336] border-4 border-black rounded-2xl rotate-45 opacity-15" />
        <motion.div animate={{ x: [0, 15, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-[30%] left-[10%] w-12 h-12 bg-[#4caf50] border-4 border-black rounded-xl opacity-15" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 bg-black text-white px-6 py-3 rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_#ffeb3b] mb-4">
            <div className="bg-[#ffeb3b] p-1.5 rounded-lg">
              <QrCode size={20} className="text-black" />
            </div>
            <span className="text-xl font-black tracking-tight">BIKIN<span className="text-[#ffeb3b]">QR</span></span>
          </div>
          <p className="text-sm font-bold text-gray-400 italic">Bikin QR jadi Seru! ✨</p>
        </motion.div>

        {/* Auth Card */}
        <div className="bg-white border-[5px] border-black rounded-[2.5rem] shadow-[12px_12px_0px_0px_#000] overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b-[4px] border-black">
            <button
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-4 font-black uppercase text-sm flex items-center justify-center gap-2 transition-all ${
                mode === "login"
                  ? "bg-[#ffeb3b] text-black"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              <LogIn size={18} /> Masuk
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
              className={`flex-1 py-4 font-black uppercase text-sm flex items-center justify-center gap-2 transition-all border-l-[4px] border-black ${
                mode === "register"
                  ? "bg-[#2196f3] text-white"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              <UserPlus size={18} /> Daftar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                className="space-y-5"
              >
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-black uppercase">
                    {mode === "login" ? "Selamat Datang!" : "Buat Akun Baru"}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 mt-1">
                    {mode === "login"
                      ? "Login untuk mengakses QR Code kamu"
                      : "Daftar gratis dan mulai bikin QR!"}
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase ml-1 tracking-wider">Email</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Mail size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="nama@email.com"
                      className="w-full bg-white border-[3px] border-black rounded-2xl pl-12 pr-5 py-4 font-bold text-base shadow-[4px_4px_0px_0px_#000] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase ml-1 tracking-wider">Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Lock size={20} className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-white border-[3px] border-black rounded-2xl pl-12 pr-14 py-4 font-bold text-base shadow-[4px_4px_0px_0px_#000] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none placeholder:text-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 text-red-600 text-sm font-bold"
              >
                <AlertCircle size={18} /> {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-green-50 border-2 border-green-300 rounded-xl px-4 py-3 text-green-600 text-sm font-bold"
              >
                <CheckCircle2 size={18} /> {success}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl border-[4px] border-black font-black uppercase text-lg tracking-wider shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center justify-center gap-3 ${
                loading
                  ? "bg-gray-300 cursor-wait"
                  : mode === "login"
                  ? "bg-[#ffeb3b] text-black"
                  : "bg-[#2196f3] text-white"
              }`}
            >
              {loading ? (
                <><Sparkles size={22} className="animate-spin" /> Memproses...</>
              ) : mode === "login" ? (
                <><LogIn size={22} /> Masuk</>
              ) : (
                <><UserPlus size={22} /> Daftar Sekarang</>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs font-bold text-gray-400 mt-6"
        >
          Powered by <span className="text-black font-black">BikinQR</span> • Neo-Brutalist Style ✨
        </motion.p>
      </motion.div>
    </main>
  );
}
