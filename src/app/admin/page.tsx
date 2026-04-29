"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Download,
  Trash2,
  RefreshCw,
  Eye,
  Heart
} from "lucide-react";
import QRCodeStyling from "qr-code-styling";
import { refinarMensagem } from "@/lib/ai-actions";
import { databases, account, APPWRITE_CONFIG } from "@/lib/appwrite";
import { Query, ID, Models } from "appwrite";

interface Cesta extends Models.Document {
  codigo_unico: string;
  token_qr: string;
  maximo_acessos: number;
  contagem_acessos?: number;
  status: string;
  id: string;
  criado_em: string;
}

interface Mensagem extends Models.Document {
  id_cesta: string;
  texto_mensagem: string;
  texto_formatado?: string;
  esta_aprovado: boolean;
  id: string;
  criado_em: string;
  cestas?: {
    token_qr: string;
    codigo_unico: string;
  } | null;
}

export default function AdminDashboard() {
  const [cestas, setCestas] = useState<Cesta[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<"cestas" | "moderacao">("cestas");
  const [processandoIA, setProcessandoIA] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const verificarSessao = async () => {
      try {
        await account.get();
        carregarDados();
      } catch (error) {
        console.error("Sessão não encontrada:", error);
        router.push("/admin/login");
      }
    };
    verificarSessao();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const cestasRes = await databases.listDocuments<Cesta>(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.cestas,
        [Query.orderDesc('$createdAt')]
      );

      const mensagensRes = await databases.listDocuments<Mensagem>(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.mensagens,
        [Query.orderDesc('$createdAt')]
      );
      
      // Mapear dados para manter compatibilidade com o resto do código
      const cestasFormatadas: Cesta[] = cestasRes.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        criado_em: doc.$createdAt
      }));

      const mensagensFormatadas: Mensagem[] = mensagensRes.documents.map(doc => {
        const cesta = cestasFormatadas.find(c => c.$id === doc.id_cesta);
        return {
          ...doc,
          id: doc.$id,
          criado_em: doc.$createdAt,
          cestas: cesta ? { token_qr: cesta.token_qr, codigo_unico: cesta.codigo_unico } : null
        };
      });

      setCestas(cestasFormatadas);
      setMensagens(mensagensFormatadas);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const gerarCesta = async () => {
    const codigo = `MAE-2025-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const token = Math.random().toString(36).substring(2, 15);
    
    try {
      // Garantir que a sessão está ativa antes de tentar criar
      console.log("Verificando sessão antes de gerar cesta...");
      await account.get();
      
      console.log("Tentando criar documento na coleção cestas...");
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.cestas,
        ID.unique(),
        {
          codigo_unico: codigo,
          token_qr: token,
          maximo_acessos: 3,
          status: "ativo"
        }
      );
      console.log("Cesta gerada com sucesso!");
      carregarDados();
    } catch (error: any) {
      console.error("ERRO DETALHADO AO GERAR CESTA:", error);
      alert(`Erro ao gerar cesta: ${error.message || "Erro desconhecido"}. Verifique as permissões da coleção 'cestas' no Appwrite.`);
    }
  };

  const baixarQR = (token: string) => {
    const qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      data: `${window.location.origin}/mensagem/${token}`,
      dotsOptions: { color: "#CD212A", type: "rounded" },
      backgroundOptions: { color: "#ffffff" },
      imageOptions: { crossOrigin: "anonymous", margin: 10 }
    });
    qrCode.download({ name: `QR-Cesta-${token}`, extension: "png" });
  };

  const moderarMensagem = async (id: string, aprovado: boolean) => {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.mensagens,
        id,
        { esta_aprovado: aprovado }
      );
      carregarDados();
    } catch (error) {
      alert("Erro ao moderar mensagem.");
    }
  };

  const handleRefinarIA = async (id: string, textoOriginal: string) => {
    setProcessandoIA(id);
    try {
      const textoRefinado = await refinarMensagem(textoOriginal);
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.mensagens,
        id,
        { texto_formatado: textoRefinado }
      );
      carregarDados();
    } catch (error) {
      alert("Erro ao refinar mensagem com IA.");
    } finally {
      setProcessandoIA(null);
    }
  };

  return (
    <div className="min-h-screen bg-vermelho/5 font-lato pb-20">
      {/* Header Premium Expandido */}
      <header className="glass sticky top-0 z-50 px-10 py-8 border-b border-vermelho/5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <motion.img 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              src="/logo.png" 
              alt="Cestino" 
              className="h-24 object-contain" 
            />
            <div className="h-10 w-px bg-vermelho/10 mx-2" />
            <div>
              <h1 className="font-playfair font-bold text-4xl text-cinza tracking-tight">Portal Administrativo</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="h-2 w-2 rounded-full bg-verde animate-pulse" />
                <p className="text-cinza/60 text-xs font-black uppercase tracking-[0.4em]">SISTEMA ONLINE • GESTÃO DE SURPRESAS</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            <button 
              onClick={carregarDados}
              className="p-4 hover:bg-vermelho/5 rounded-2xl text-vermelho transition-all"
            >
              <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={async () => { try { await account.deleteSession('current'); } catch {} router.push("/admin/login"); }}
              className="group bg-white/50 hover:bg-vermelho hover:text-white px-8 py-4 rounded-2xl text-vermelho font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center gap-3"
            >
              Sair do Sistema <Search className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-10 lg:p-20 space-y-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border-4 border-vermelho/10 border-t-vermelho rounded-full animate-spin" />
            <p className="text-vermelho font-black uppercase tracking-[0.5em] text-sm">Sincronizando Dados...</p>
          </div>
        ) : (
          <>
            {/* Métricas Monumentais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { label: "Cestas Registradas", value: cestas.length, icon: Plus, color: "text-cinza", bg: "bg-gray-100" },
                { label: "Mensagens Totais", value: mensagens.length, icon: Heart, color: "text-vermelho", bg: "bg-vermelho/10" },
                { label: "Aguardando Aprovação", value: mensagens.filter(m => !m.esta_aprovado).length, icon: RefreshCw, color: "text-yellow-600", bg: "bg-yellow-50" },
                { label: "Cestas Ativas", value: cestas.filter(c => c.status === 'ativo').length, icon: CheckCircle, color: "text-verde", bg: "bg-verde/10" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="glass p-12 rounded-[4rem] border-white shadow-4xl group cursor-default"
                >
                  <div className={`${stat.bg} ${stat.color} w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
                    <stat.icon className="w-10 h-10" />
                  </div>
                  <p className="text-cinza/60 text-xs font-black uppercase tracking-[0.4em]">{stat.label}</p>
                  <p className="text-6xl font-playfair font-bold text-cinza mt-2 tracking-tighter">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Seção Principal de Gestão */}
            <div className="space-y-12">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                  <h2 className="text-5xl md:text-7xl font-playfair font-bold text-cinza tracking-tight leading-none">Centro de Controle</h2>
                  <p className="text-gray-500 text-2xl max-w-2xl font-lato">Gerencie as surpresas do Dia das Mães e garanta que cada detalhe seja perfeito.</p>
                </div>

                <div className="flex bg-white/40 p-3 rounded-[2.5rem] border border-white shadow-xl">
                  <button 
                    onClick={() => setAbaAtiva('cestas')}
                    className={`px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all ${abaAtiva === 'cestas' ? 'bg-vermelho text-white shadow-2xl' : 'text-vermelho/40 hover:text-vermelho'}`}
                  >
                    Gestão de Cestas
                  </button>
                  <button 
                    onClick={() => setAbaAtiva('moderacao')}
                    className={`px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all ${abaAtiva === 'moderacao' ? 'bg-vermelho text-white shadow-2xl' : 'text-vermelho/40 hover:text-vermelho'}`}
                  >
                    Moderação ({mensagens.filter(m => !m.esta_aprovado).length})
                  </button>
                </div>
              </div>

              <motion.div
                key={abaAtiva}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full"
              >
                {abaAtiva === 'cestas' ? (
                  <div className="space-y-10">
                    <div className="flex justify-end">
                      <button 
                        onClick={gerarCesta}
                        className="bg-verde text-white px-12 py-6 rounded-[2rem] font-bold text-xl shadow-2xl shadow-verde/20 hover:scale-105 transition-all flex items-center gap-4"
                      >
                        <Plus className="w-8 h-8" /> Gerar Nova Cesta Premium
                      </button>
                    </div>
                    
                    <div className="glass rounded-[4rem] overflow-hidden border-white shadow-5xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-vermelho/5">
                            <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-cinza/60">Cesta / Identificação</th>
                            <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-cinza/60 text-center">Token QR (UUID)</th>
                            <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-cinza/60 text-center">Acessos</th>
                            <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-cinza/60 text-center">Estado</th>
                            <th className="px-12 py-10 text-[11px] font-black uppercase tracking-[0.4em] text-cinza/60 text-right">Controle</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-vermelho/5">
                          {cestas.map(cesta => (
                            <motion.tr 
                              key={cesta.id} 
                              whileHover={{ backgroundColor: "rgba(205, 33, 42, 0.02)" }}
                              className="group transition-colors"
                            >
                              <td className="px-12 py-10">
                                <div className="flex items-center gap-6">
                                  <div className="bg-vermelho/10 w-5 h-5 rounded-full group-hover:bg-vermelho transition-colors" />
                                  <div>
                                    <div className="font-bold text-cinza text-2xl tracking-tight">{cesta.codigo_unico}</div>
                                    <div className="text-cinza/40 text-xs font-black uppercase tracking-widest mt-1">Cesta Dia das Mães</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-12 py-10 text-center font-mono text-xs text-gray-400 group-hover:text-vermelho transition-colors">{cesta.token_qr}</td>
                              <td className="px-12 py-10 text-center">
                                <span className="text-2xl font-bold text-cinza/80">{cesta.contagem_acessos || 0} <span className="text-xs font-black text-cinza/40">/ {cesta.maximo_acessos}</span></span>
                              </td>
                              <td className="px-12 py-10 text-center">
                                <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ${cesta.status === 'ativo' ? 'bg-verde/10 text-verde' : 'bg-red-100 text-red-700'}`}>
                                  {cesta.status}
                                </span>
                              </td>
                              <td className="px-12 py-10 text-right">
                                <div className="flex justify-end gap-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                  <button 
                                    onClick={() => baixarQR(cesta.token_qr)}
                                    className="bg-cinza/10 p-4 rounded-2xl text-cinza hover:bg-cinza hover:text-white transition-all hover:scale-110" title="Download QR"
                                  >
                                    <Download className="w-8 h-8" />
                                  </button>
                                  <button className="bg-red-50 p-4 rounded-2xl text-vermelho hover:bg-vermelho hover:text-white transition-all hover:scale-110">
                                    <Trash2 className="w-8 h-8" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-12">
                    {mensagens.filter(m => !m.esta_aprovado).length === 0 ? (
                      <div className="col-span-full glass p-32 rounded-[5rem] text-center space-y-6">
                        <div className="bg-verde/5 w-40 h-40 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-20 h-20 text-verde/40" />
                        </div>
                        <p className="text-cinza/60 font-black uppercase text-sm tracking-[0.5em]">Tudo sob controle • Nenhuma mensagem pendente</p>
                      </div>
                    ) : (
                      mensagens.filter(m => !m.esta_aprovado).map(msg => (
                        <motion.div 
                          key={msg.id} 
                          layout
                          whileHover={{ y: -20 }}
                          className="glass p-12 rounded-[4rem] space-y-10 flex flex-col group border-white/80 hover:shadow-5xl transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <div className="bg-vermelho/10 px-6 py-3 rounded-2xl border border-vermelho/5">
                              <span className="text-[11px] font-black text-vermelho uppercase tracking-widest">{msg.cestas?.codigo_unico || 'S/N'}</span>
                            </div>
                            <div className="h-4 w-4 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
                          </div>

                          <div className="flex-1 space-y-8">
                            <div className="space-y-3">
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Sussurro do Coração</span>
                              <p className="text-xl text-gray-700 italic bg-gray-50/50 p-8 rounded-[2.5rem] border border-dashed border-gray-200 line-clamp-6">{msg.texto_mensagem}</p>
                            </div>

                            {msg.texto_formatado && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <RefreshCw className="w-4 h-4 text-verde animate-spin-slow" />
                                  <span className="text-[10px] font-black text-verde uppercase tracking-[0.4em]">Lapidação IA</span>
                                </div>
                                <p className="text-xl text-cinza font-medium bg-verde/5 p-8 rounded-[2.5rem] border border-verde/10 line-clamp-6 leading-relaxed">{msg.texto_formatado}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-4 pt-8 border-t border-vermelho/5">
                            <button 
                              onClick={() => handleRefinarIA(msg.id, msg.texto_mensagem)}
                              disabled={processandoIA === msg.id}
                              className={`flex-1 bg-cinza text-white p-6 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${processandoIA === msg.id ? 'opacity-50' : 'hover:bg-cinza/80'}`}
                            >
                              <RefreshCw className={`w-4 h-4 ${processandoIA === msg.id ? 'animate-spin' : ''}`} />
                              {processandoIA === msg.id ? 'Processando...' : 'Refinar IA'}
                            </button>
                            <button 
                              onClick={() => window.open(`/mensagem/${msg.cestas?.token_qr}`, '_blank')}
                              className="flex-1 glass border-vermelho/10 text-vermelho p-6 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-vermelho/5 transition-all"
                            >
                              Prévia
                            </button>
                            <button 
                              onClick={() => moderarMensagem(msg.id, true)}
                              className="flex-1 bg-verde text-white p-6 rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-verde/20 hover:scale-105 transition-all"
                            >
                              Liberar
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
