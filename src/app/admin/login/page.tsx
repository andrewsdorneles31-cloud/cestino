"use client";

import { useState } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      await account.createEmailPasswordSession(email, senha);
      router.push("/admin");
    } catch (error: any) {
      setErro(error.message || "Login inválido. Verifique suas credenciais.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8"
      >
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.png" alt="Cestino" className="h-24 object-contain mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Acesso Restrito</h1>
          <div className="h-1 w-12 bg-vermelho/20 rounded-full mt-2" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-gray-900"
              required
            />
          </div>

          {erro && <p className="text-red-500 text-sm font-medium">{erro}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Acessar'}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
