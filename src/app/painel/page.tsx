"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { refinarMensagem } from "@/lib/ai-actions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Camera,
  Mic,
  Video,
  Type,
  Sparkles,
  Check,
  Trash2,
  Upload,
  Play,
  Pause,
  Save,
  Send,
  ArrowRight
} from "lucide-react";
import { databases, storage, APPWRITE_CONFIG } from "@/lib/appwrite";
import { Query, ID } from "appwrite";

export default function PainelPresenteador() {
  const [etapa, setEtapa] = useState(1);
  const [cestaId, setCestaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Estados de conteúdo
  const [texto, setTexto] = useState("");
  const [textoIA, setTextoIA] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [iaLoading, setIaLoading] = useState(false);

  // Referências para áudio
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [gravando, setGravando] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const router = useRouter();

  useEffect(() => {
    const id = sessionStorage.getItem("cesta_id");
    const codigo = sessionStorage.getItem("codigo_valido");

    if (!id || !codigo) {
      router.push("/");
      return;
    }

    setCestaId(id);
    carregarDados(id);
  }, []);

  const carregarDados = async (id: string) => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.mensagens,
        [Query.equal('id_cesta', id)]
      );

      const data = response.documents[0];

      if (data) {
        setTexto(data.texto_mensagem || "");
        setTextoIA(data.texto_formatado || "");
        setImagens(data.urls_imagens || []);
        setAudioUrl(data.url_audio || null);
        setVideoUrl(data.url_video || null);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  // --- Lógica de Upload ---
  const handleUploadMidia = async (file: File) => {
    setUploading(true);
    try {
      const response = await storage.createFile(
        APPWRITE_CONFIG.buckets.midia,
        ID.unique(),
        file
      );

      const url = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_CONFIG.buckets.midia}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

      setUploading(false);
      return url;
    } catch (error) {
      alert("Erro ao enviar arquivo.");
      setUploading(false);
      return null;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const urls: string[] = [...imagens];
    for (const file of Array.from(e.target.files)) {
      const url = await handleUploadMidia(file);
      if (url) urls.push(url);
    }
    setImagens(urls);
  };

  // --- Lógica de áudio ---
  const iniciarGravacao = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.current.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
    };

    mediaRecorder.current.start();
    setGravando(true);
  };

  const pararGravacao = () => {
    mediaRecorder.current?.stop();
    setGravando(false);
  };

  const salvarAudio = async () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], "audio.webm", { type: "audio/webm" });
    const url = await handleUploadMidia(file);
    if (url) setAudioUrl(url);
  };

  // --- Lógica de IA ---
  const formatarComIA = async () => {
    if (!texto) return;

    setIaLoading(true);
    try {
      const resultado = await refinarMensagem(texto);
      setTextoIA(resultado);
    } catch (err) {
      alert("Erro ao chamar a IA.");
    } finally {
      setIaLoading(false);
    }
  };

  // --- Salvar Final ---
  const handlePublicar = async () => {
    if (!cestaId) {
      alert("Sessão expirada. Por favor, valide seu código novamente.");
      router.push("/");
      return;
    }

    setLoading(true);

    try {
      // Verificar se já existe uma mensagem para esta cesta
      const existingDocs = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.mensagens,
        [Query.equal('id_cesta', cestaId || '')]
      );

      const messageData = {
        id_cesta: cestaId,
        texto_mensagem: texto,
        texto_formatado: textoIA,
        urls_imagens: imagens,
        url_audio: audioUrl,
        url_video: videoUrl,
        esta_aprovado: false
      };

      if (existingDocs.documents.length > 0) {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.mensagens,
          existingDocs.documents[0].$id,
          messageData
        );
      } else {
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.mensagens,
          ID.unique(),
          messageData
        );
      }

      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.cestas,
        cestaId!,
        { status: 'publicado' }
      );

      alert("Sua mensagem foi enviada! Ela será revisada e liberada em breve.");
      router.push("/");
    } catch (error: any) {
      alert("Erro ao salvar mensagem: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-lato overflow-x-hidden">
      {/* Decoração de Fundo Ampliada */}
      <div className="fixed top-0 right-0 w-[80%] h-[80%] bg-vermelho/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[60%] h-[60%] bg-verde/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Header Premium */}
      <header className="glass sticky top-0 z-50 px-4 md:px-10 py-3 md:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <img src="/logo.png" alt="Cestino" className="h-12 md:h-20 object-contain" />
          </motion.div>

          <div className="flex flex-col items-end gap-1 md:gap-2">
            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-vermelho/50">Progresso</span>
            <div className="flex gap-1 md:gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 md:h-2 w-8 md:w-12 rounded-full transition-all duration-700 ${etapa >= i ? 'bg-vermelho shadow-[0_0_15px_rgba(205,33,42,0.4)]' : 'bg-vermelho/10'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-10 lg:p-20 relative z-10">
        <AnimatePresence mode="wait">
          {/* ETAPA 1: IMAGENS */}
          {etapa === 1 && (
            <motion.div
              key="etapa1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              <div className="text-center md:text-left space-y-4">
                <h2 className="text-4xl md:text-7xl font-playfair font-bold text-vermelho tracking-tight leading-tight">Galeria de Memórias</h2>
                <p className="text-cinza/60 text-lg md:text-2xl font-lato max-w-3xl">Selecione os momentos mais marcantes para eternizar nesta surpresa especial.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {imagens.map((url, i) => (
                  <motion.div
                    key={i}
                    layoutId={`img-${i}`}
                    whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? -2 : 2 }}
                    className="relative aspect-square rounded-2xl md:rounded-[3rem] overflow-hidden group shadow-2xl border-4 md:border-8 border-white glass"
                  >
                    <img src={url} alt="Memória" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125" />
                    <div className="absolute inset-0 bg-vermelho/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                      <button
                        onClick={() => setImagens(imagens.filter((_, idx) => idx !== i))}
                        className="bg-white text-vermelho p-5 rounded-3xl hover:bg-vermelho/10 transition-all transform hover:rotate-12"
                      >
                        <Trash2 className="w-10 h-10" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                <label className="aspect-square glass border-2 md:border-4 border-dashed border-vermelho/20 rounded-2xl md:rounded-[3rem] flex flex-col items-center justify-center gap-4 md:gap-6 cursor-pointer hover:bg-vermelho/5 hover:border-vermelho/40 transition-all group overflow-hidden relative">
                  <div className="bg-vermelho/10 p-4 md:p-6 rounded-2xl md:rounded-3xl group-hover:scale-110 group-hover:bg-vermelho group-hover:text-white transition-all duration-500">
                    <Camera className="w-8 h-8 md:w-12 md:h-12" />
                  </div>
                  <span className="text-sm md:text-xl font-black text-vermelho/40 uppercase tracking-[0.2em] group-hover:text-vermelho transition-colors">Adicionar Foto</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              <div className="flex justify-center md:justify-end pt-10 md:pt-20 border-t border-vermelho/5">
                <button
                  onClick={() => setEtapa(2)}
                  className="w-full md:w-auto bg-vermelho text-white px-10 md:px-16 py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-bold text-lg md:text-2xl flex items-center justify-center gap-4 md:gap-6 shadow-3xl shadow-vermelho/30 hover:scale-105 transition-all group"
                >
                  Continuar para Áudio/Vídeo
                  <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-3 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ETAPA 2: ÁUDIO E VÍDEO */}
          {etapa === 2 && (
            <motion.div
              key="etapa2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-16"
            >
              <div className="text-center md:text-left space-y-4">
                <h2 className="text-4xl md:text-7xl font-playfair font-bold text-vermelho tracking-tight leading-tight">Voz e Vídeo</h2>
                <p className="text-cinza/60 text-lg md:text-2xl font-lato max-w-3xl">Nada substitui o brilho no olhar e o som da sua voz ao dizer "Eu te amo".</p>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                {/* Audio Card Ampliado */}
                <motion.div
                  whileHover={{ y: -10 }}
                  className="glass p-8 md:p-12 lg:p-16 rounded-3xl md:rounded-[4rem] space-y-8 md:space-y-10 border-white/60 shadow-3xl"
                >
                  <div className="flex items-center gap-6 text-vermelho">
                    <div className="bg-vermelho shadow-lg shadow-vermelho/10 p-5 rounded-3xl">
                      <Mic className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold font-playfair tracking-tight text-cinza">Mensagem de Voz</h3>
                  </div>

                  {audioUrl ? (
                    <div className="space-y-6">
                      <div className="bg-vermelho/5 p-8 rounded-[2rem] border border-vermelho/10">
                        <audio src={audioUrl} controls className="w-full h-14" />
                      </div>
                      <button
                        onClick={() => setAudioUrl(null)}
                        className="text-red-500 text-lg font-black uppercase tracking-widest flex items-center gap-3 hover:underline px-4"
                      >
                        <Trash2 className="w-6 h-6" /> Remover Gravação
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-10 gap-10">
                      <button
                        onMouseDown={iniciarGravacao}
                        onMouseUp={pararGravacao}
                        onTouchStart={iniciarGravacao}
                        onTouchEnd={pararGravacao}
                        className={`w-40 h-40 rounded-[3rem] flex items-center justify-center transition-all relative group ${gravando ? 'scale-110' : 'hover:scale-110'}`}
                      >
                        {gravando && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0.6 }}
                            animate={{ scale: 1.8, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-red-500 rounded-[3rem]"
                          />
                        )}
                        <div className={`absolute inset-0 rounded-[3rem] shadow-2xl transition-all duration-500 ${gravando ? 'bg-verde' : 'bg-vermelho group-hover:shadow-vermelho/40'}`} />
                        <Mic className="w-16 h-16 text-white relative z-10" />
                      </button>
                      <div className="text-center space-y-2">
                        <p className="font-bold text-cinza text-2xl">{gravando ? 'Gravando sua voz...' : 'Mantenha pressionado para gravar'}</p>
                        <p className="text-xs text-cinza/40 uppercase tracking-[0.4em] font-black">ou envie um arquivo pronto</p>
                      </div>

                      <label className="text-vermelho font-black text-sm uppercase tracking-[0.3em] cursor-pointer hover:bg-vermelho/5 px-8 py-4 rounded-2xl transition-all border-2 border-vermelho/10 hover:border-vermelho/30">
                        Upload de Áudio
                        <input type="file" accept="audio/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleUploadMidia(file);
                            if (url) setAudioUrl(url);
                          }
                        }} />
                      </label>
                    </div>
                  )}
                </motion.div>

                {/* Video Card Ampliado */}
                <motion.div
                  whileHover={{ y: -10 }}
                  className="glass p-8 md:p-12 lg:p-16 rounded-3xl md:rounded-[4rem] space-y-8 md:space-y-10 border-white/60 shadow-3xl"
                >
                  <div className="flex items-center gap-6 text-vermelho">
                    <div className="bg-vermelho shadow-lg shadow-vermelho/10 p-5 rounded-3xl">
                      <Video className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold font-playfair tracking-tight text-cinza">Vídeo Especial</h3>
                  </div>

                  {videoUrl ? (
                    <div className="space-y-6">
                      <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group relative">
                        <video src={videoUrl} controls className="w-full" />
                      </div>
                      <button
                        onClick={() => setVideoUrl(null)}
                        className="text-red-500 text-lg font-black uppercase tracking-widest flex items-center gap-3 hover:underline px-4"
                      >
                        <Trash2 className="w-6 h-6" /> Substituir Vídeo
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center py-10 md:py-20 gap-6 md:gap-8 border-4 border-dashed border-vermelho/10 rounded-3xl md:rounded-[4rem] cursor-pointer hover:bg-vermelho/5 hover:border-vermelho/30 transition-all group">
                      <div className="bg-vermelho/10 p-6 md:p-8 rounded-2xl md:rounded-3xl group-hover:scale-110 group-hover:bg-vermelho group-hover:text-white transition-all duration-500">
                        <Upload className="w-12 h-12 md:w-16 md:h-16" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="font-bold text-cinza text-xl md:text-2xl">Escolha um vídeo incrível</p>
                        <p className="text-[10px] md:text-[11px] text-cinza/40 font-black uppercase tracking-[0.4em]">Limite de 100MB • MP4, MOV, WEBM</p>
                      </div>
                      <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 100 * 1024 * 1024) return alert("Vídeo muito grande!");
                          const url = await handleUploadMidia(file);
                          if (url) setVideoUrl(url);
                        }
                      }} />
                    </label>
                  )}
                </motion.div>
              </div>

              <div className="flex justify-between items-center pt-20 border-t border-vermelho/5">
                <button onClick={() => setEtapa(1)} className="text-cinza/40 font-black uppercase tracking-widest hover:text-vermelho transition-all text-sm">Voltar: Fotos</button>
                <button
                  onClick={() => setEtapa(3)}
                  className="bg-vermelho text-white px-16 py-8 rounded-[2.5rem] font-bold text-2xl flex items-center gap-6 shadow-3xl shadow-vermelho/30 hover:scale-105 transition-all group"
                >
                  Continuar para Carta
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ETAPA 3: TEXTO E IA */}
          {etapa === 3 && (
            <motion.div
              key="etapa3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-16"
            >
              <div className="text-center md:text-left space-y-4">
                <h2 className="text-4xl md:text-7xl font-playfair font-bold text-vermelho tracking-tight leading-tight">Sua Carta</h2>
                <p className="text-cinza/60 text-lg md:text-2xl font-lato max-w-4xl">Escreva com a alma. Se as palavras faltarem, nossa IA ajuda a polir seus sentimentos.</p>
              </div>

              <div className="space-y-10">
                <div className="relative group">
                  <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Comece a escrever sua mensagem aqui..."
                    className="w-full h-[400px] md:h-[500px] p-8 md:p-12 lg:p-20 rounded-[2.5rem] md:rounded-[5rem] glass focus:bg-white focus:ring-0 outline-none resize-none font-lato text-xl md:text-2xl lg:text-3xl leading-relaxed shadow-inner border-4 border-vermelho/5 focus:border-vermelho/20 transition-all group-hover:shadow-2xl text-cinza"
                  />
                  <div className="absolute bottom-12 right-12">
                    <button
                      onClick={formatarComIA}
                      disabled={iaLoading || !texto}
                      className="bg-verde text-white px-12 py-6 rounded-[2rem] font-bold text-xl flex items-center gap-4 shadow-3xl shadow-verde/40 hover:scale-105 transition-all disabled:opacity-50 group overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <Sparkles className="w-7 h-7 relative z-10" />
                      <span className="relative z-10">{iaLoading ? 'Aprimorando...' : 'Lapidar Texto com IA'}</span>
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {textoIA && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      className="glass-verde p-12 lg:p-16 rounded-[4rem] border-verde/30 space-y-8 shadow-4xl"
                    >
                      <div className="flex items-center gap-4 text-verde font-black text-sm lg:text-base uppercase tracking-[0.4em]">
                        <Sparkles className="w-6 h-6 animate-pulse" /> Sugestão Criativa da IA
                      </div>
                      <p className="text-cinza italic leading-relaxed text-2xl lg:text-3xl font-playfair whitespace-pre-wrap">{textoIA}</p>
                      <div className="flex justify-end gap-6 pt-6">
                        <button onClick={() => setTextoIA("")} className="text-cinza/40 text-sm font-black uppercase tracking-widest px-8 py-4 hover:bg-black/5 rounded-2xl transition-all">Descartar</button>
                        <button
                          onClick={() => { setTexto(textoIA); setTextoIA(""); }}
                          className="bg-verde text-white px-12 py-4 rounded-[1.5rem] text-sm lg:text-base font-black uppercase tracking-[0.2em] shadow-2xl shadow-verde/30 hover:scale-105 transition-all"
                        >
                          Usar esta Versão
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-between items-center pt-20 border-t border-vermelho/5">
                <button onClick={() => setEtapa(2)} className="text-cinza/40 font-black uppercase tracking-widest hover:text-vermelho transition-all text-sm">Voltar: Mídia</button>
                <button
                  onClick={() => setEtapa(4)}
                  className="bg-vermelho text-white px-16 py-8 rounded-[2.5rem] font-bold text-2xl flex items-center gap-6 shadow-3xl shadow-vermelho/30 hover:scale-105 transition-all group"
                >
                  Revisar Surpresa Final
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ETAPA 4: REVISÃO AMPLIAÇÃO */}
          {etapa === 4 && (
            <motion.div
              key="etapa4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-16"
            >
              <div className="text-center md:text-left space-y-4">
                <h2 className="text-4xl md:text-7xl font-playfair font-bold text-vermelho tracking-tight leading-tight">Tudo Pronto!</h2>
                <p className="text-cinza/60 text-lg md:text-2xl font-lato max-w-4xl">Confira se cada detalhe está refletindo o seu amor.</p>
              </div>

              <div className="glass p-8 md:p-16 lg:p-24 rounded-[2.5rem] md:rounded-[5rem] space-y-10 md:space-y-16 border-white/80 shadow-4xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 border-b border-vermelho/5 pb-16">
                  <div className="space-y-4">
                    <span className="text-[12px] font-black uppercase tracking-[0.4em] text-vermelho/40">Resumo dos Momentos</span>
                    <div className="flex flex-wrap gap-10 mt-6">
                      <div className="flex items-center gap-4 text-vermelho font-black text-xl lg:text-2xl">
                        <Camera className="w-8 h-8" /> {imagens.length} Fotos
                      </div>
                      {audioUrl && (
                        <div className="flex items-center gap-4 text-vermelho font-black text-xl lg:text-2xl">
                          <Mic className="w-8 h-8" /> Áudio Gravado
                        </div>
                      )}
                      {videoUrl && (
                        <div className="flex items-center gap-4 text-vermelho font-black text-xl lg:text-2xl">
                          <Video className="w-8 h-8" /> Vídeo Anexado
                        </div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setEtapa(1)} className="text-vermelho text-sm font-black uppercase tracking-[0.3em] hover:underline bg-vermelho/5 px-8 py-4 rounded-2xl hover:bg-vermelho/10 transition-all">Editar Tudo</button>
                </div>

                <div className="space-y-8">
                  <span className="text-[12px] font-black uppercase tracking-[0.4em] text-vermelho/40">Sua Mensagem</span>
                  <div className="relative">
                    <div className="absolute -left-10 top-0 text-9xl text-vermelho/5 font-playfair">“</div>
                    <p className="text-xl md:text-3xl lg:text-5xl text-cinza font-playfair italic leading-[1.4] border-l-4 md:border-l-8 border-vermelho/10 pl-6 md:pl-12 py-4">{texto}</p>
                  </div>
                </div>

                <div className="glass-vermelho p-12 lg:p-16 rounded-[4rem] flex flex-col lg:flex-row gap-10 items-center">
                  <div className="bg-vermelho shadow-3xl shadow-vermelho/40 p-8 rounded-[2.5rem] transform -rotate-3">
                    <Send className="w-12 h-12 text-white" />
                  </div>
                  <div className="text-center lg:text-left space-y-4">
                    <p className="font-bold text-vermelho text-3xl">Lançamento da Surpresa</p>
                    <p className="text-vermelho/60 text-xl leading-relaxed lg:max-w-2xl">Ao publicar, sua mensagem será guardada com carinho e estará disponível assim que sua mãe ler o QR Code do presente.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-20 border-t border-vermelho/5">
                <button onClick={() => setEtapa(3)} className="text-cinza/40 font-black uppercase tracking-widest hover:text-vermelho transition-all text-sm">Voltar: Texto</button>
                <button
                  onClick={handlePublicar}
                  disabled={loading}
                  className="bg-vermelho text-white px-20 py-10 rounded-[3rem] font-bold text-3xl shadow-4xl shadow-vermelho/40 hover:scale-105 transition-all flex items-center gap-6 disabled:opacity-50 group"
                >
                  {loading ? (
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Publicar Surpresa Eterna
                      <Heart className="w-10 h-10 fill-current animate-pulse" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {uploading && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-10 right-10 glass-vermelho px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 z-50 border-vermelho/30"
        >
          <div className="w-6 h-6 border-3 border-vermelho/20 border-t-vermelho rounded-full animate-spin" />
          <span className="text-vermelho font-bold tracking-tight">Sincronizando mídia...</span>
        </motion.div>
      )}
    </div>
  );
}
