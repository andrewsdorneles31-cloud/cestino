"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Gift, ArrowRight, QrCode, Info, Sparkles, XCircle } from "lucide-react";
import { databases, account, APPWRITE_CONFIG } from "@/lib/appwrite";
import { Query } from "appwrite";

export default function Home() {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();
  
  useEffect(() => {
    const initSession = async () => {
      try {
        await account.get();
      } catch {
        try {
          await account.createAnonymousSession();
        } catch (e) {
          console.error("Erro ao iniciar sessão anônima:", e);
        }
      }
    };
    initSession();
  }, []);

  const handleEntrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.cestas,
        [Query.equal('codigo_unico', codigo.trim().toUpperCase())]
      );

      const cesta = response.documents[0];

      if (!cesta) {
        setErro("Código inválido. Verifique o cartão da sua cesta.");
        setLoading(false);
        return;
      }

      if (cesta.status === "bloqueado") {
        setErro("Este acesso foi bloqueado. Entre em contato com o suporte.");
        setLoading(false);
        return;
      }

      if (cesta.contagem_acessos >= cesta.maximo_acessos) {
        setErro("Limite de acessos atingido para este código.");
        setLoading(false);
        return;
      }

      // Log de acesso
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.logs,
        'unique()',
        {
          id_cesta: cesta.$id,
          acessado_em: new Date().toISOString()
        }
      );

      // Atualizar contagem
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.cestas,
        cesta.$id,
        { contagem_acessos: cesta.contagem_acessos + 1 }
      );

      sessionStorage.setItem("cesta_id", cesta.$id);
      sessionStorage.setItem("codigo_valido", codigo.trim().toUpperCase());

      router.push("/painel");
    } catch (err: any) {
      setErro(err.message || "Ocorreu um erro ao validar o código.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden font-lato">
      <div className="fixed top-0 right-0 w-[70%] h-[70%] bg-verde/5 rounded-full blur-[160px] animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[50%] h-[50%] bg-vermelho/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 lg:p-24">
        
        <header className="w-full px-10 flex justify-between items-center max-w-7xl mb-12 md:mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <img src="/logo.png" alt="Cestino" className="h-28 md:h-40 object-contain" />
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="glass hidden md:flex items-center gap-3 px-6 py-3 rounded-2xl text-vermelho font-bold text-sm shadow-md"
          >
            <Info className="w-5 h-5 text-vermelho/60" />
            Como Funciona
          </motion.button>
        </header>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-12">
            <div className="space-y-6 md:space-y-8 lg:pr-10">
              <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/40 shadow-sm">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vermelho opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-vermelho"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-vermelho">Experiência Digital Premium</span>
              </div>
              
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-playfair font-bold text-vermelho tracking-tighter leading-[1.1]">
                O presente<br/>que <span className="italic font-light text-vermelho/80">fala.</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-cinza font-lato leading-relaxed max-w-xl">
                Crie uma página exclusiva com suas fotos, vídeos e uma carta narrada pela nossa IA. Um toque moderno para emocionar quem você ama.
              </p>
            </div>

            <div className="space-y-6 max-w-lg">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <QrCode className="h-6 w-6 text-vermelho/40 group-focus-within:text-vermelho transition-colors" />
                </div>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Digite o código da cesta..."
                  className="w-full pl-16 pr-8 py-6 rounded-[2rem] text-xl bg-white/80 backdrop-blur-md border-2 border-white focus:border-vermelho/30 focus:bg-white outline-none transition-all shadow-xl font-mono text-vermelho placeholder-vermelho/30"
                />
              </div>
              
              <button 
                onClick={handleEntrar}
                disabled={loading || !codigo}
                className="w-full bg-vermelho text-white py-6 rounded-[2rem] font-bold text-xl shadow-2xl shadow-vermelho/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-4 group"
              >
                {loading ? (
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Desbloquear Surpresa
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>

              {erro && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-600 p-5 rounded-2xl flex items-center gap-4 text-sm font-bold shadow-sm border border-red-100"
                >
                  <XCircle className="w-6 h-6 shrink-0" />
                  {erro}
                </motion.div>
              )}
            </div>
          </div>

          <div className="relative lg:h-[700px] flex items-center justify-center mt-12 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-vermelho/5 to-transparent rounded-[4rem] transform rotate-3 scale-105" />
            
            <motion.div 
              animate={{ y: [-20, 20, -20] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 glass p-8 rounded-[3rem] shadow-2xl border-white/60 max-w-sm w-full"
            >
              <div className="bg-white rounded-[2rem] overflow-hidden shadow-inner border border-gray-100">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop" alt="Mãe e filha" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <p className="text-white font-playfair text-2xl font-bold">Para a melhor mãe do mundo</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-vermelho/10 flex items-center justify-center"><Heart className="w-4 h-4 text-vermelho" /></div>
                    <div className="w-8 h-8 rounded-full bg-verde/10 flex items-center justify-center"><Sparkles className="w-4 h-4 text-verde" /></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-100 rounded-full w-full" />
                    <div className="h-2 bg-gray-100 rounded-full w-5/6" />
                    <div className="h-2 bg-gray-100 rounded-full w-4/6" />
                  </div>
                  <button className="w-full py-3 bg-vermelho/5 text-vermelho rounded-xl text-xs font-bold uppercase tracking-wider mt-4">Tocar Mensagem de Voz</button>
                </div>
              </div>
              
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -right-6 -top-6 bg-white p-4 rounded-2xl shadow-xl"
              >
                <Heart className="w-8 h-8 text-vermelho fill-current" />
              </motion.div>
              
              <div className="absolute -left-10 bottom-10 glass px-6 py-4 rounded-2xl flex items-center gap-4">
                <div className="w-3 h-3 bg-verde rounded-full animate-pulse" />
                <span className="text-sm font-bold text-cinza">IA Narrativa Ativa</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <footer className="fixed bottom-10 left-0 right-0 text-center z-50">
        <button 
          onClick={() => router.push("/admin/login")}
          className="text-vermelho/20 hover:text-vermelho/60 text-xs font-black uppercase tracking-[0.4em] transition-colors"
        >
          Área do Administrador
        </button>
      </footer>
    </main>
  );
}
