"use client";

import { motion } from "framer-motion";
import { Heart, Music, Play, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface Props {
  mensagem: any;
}

const Petala = ({ delay }: { delay: number }) => {
  const [left, setLeft] = useState("50vw");
  const [duration, setDuration] = useState(12);

  useEffect(() => {
    setLeft(`${Math.random() * 100}vw`);
    setDuration(10 + Math.random() * 5);
  }, []);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, rotate: 0 }}
      animate={{ 
        y: "110vh", 
        opacity: [0, 1, 1, 0],
        rotate: 360,
        x: [0, 50, -50, 0]
      }}
      transition={{ 
        duration: duration, 
        repeat: Infinity, 
        delay: delay,
        ease: "linear"
      }}
      className="fixed text-vermelho/20 pointer-events-none z-0"
      style={{ left }}
    >
      🌸
    </motion.div>
  );
};

export default function RecipientClient({ mensagem }: Props) {
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden font-lato selection:bg-vermelho/10">
      {/* Decoração de Fundo Ampliada */}
      <div className="fixed top-0 right-0 w-[80%] h-[80%] bg-vermelho/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[60%] h-[60%] bg-verde/5 rounded-full blur-[160px] pointer-events-none" />
      
      {/* Header Premium Centralizado */}
      <header className="absolute top-10 left-0 right-0 flex justify-center z-50">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass px-6 md:px-10 py-3 md:py-5 rounded-full flex items-center border-white/60 shadow-2xl"
        >
          <img src="/logo.png" alt="Cestino" className="h-10 md:h-16 object-contain" />
        </motion.div>
      </header>

      {/* Animação de Pétala */}
      {mounted && [...Array(20)].map((_, i) => (
        <Petala key={i} delay={i * 1.5} />
      ))}

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="text-center space-y-24"
        >
          {/* Cabealho Emocional Ampliado */}
          <div className="space-y-10 pt-20">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
                y: [0, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="inline-block bg-white/60 backdrop-blur-md p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-3xl shadow-vermelho/10 border border-white"
            >
              <Heart className="w-10 h-10 md:w-16 md:h-16 text-vermelho fill-current" />
            </motion.div>
            <h1 className="text-4xl md:text-9xl font-playfair font-bold text-vermelho tracking-tight leading-[0.9] text-glow">
              Para quem faz <br/> <span className="italic font-normal text-3xl md:text-9xl">meu mundo</span> <br/> mais feliz.
            </h1>
          </div>

          {/* Galeria de Fotos Ampliada */}
          {mensagem.urls_imagens?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-24">
              {mensagem.urls_imagens.map((url: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, rotate: i % 2 === 0 ? -5 : 5 }}
                  animate={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -8 : 8 }}
                  whileHover={{ scale: 1.05, rotate: 0, zIndex: 30 }}
                  transition={{ delay: 0.4 * i, type: "spring", damping: 15 }}
                  className="aspect-[4/5] rounded-3xl md:rounded-[4rem] overflow-hidden shadow-4xl border-4 md:border-[12px] border-white glass hover:border-vermelho/20 transition-all duration-700 cursor-zoom-in"
                >
                  <img src={url} alt="Memória" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          )}

          {/* Bloco de Mensagem Principal Ampliado */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 md:p-12 lg:p-20 rounded-3xl md:rounded-[4rem] border-white/80 shadow-4xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-vermelho via-verde to-vermelho opacity-30" />
            
            <div className="absolute -left-10 -top-10 text-[15rem] text-vermelho/5 font-playfair leading-none pointer-events-none">“</div>
            
            <div className="relative z-10 space-y-12 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
                <div className="flex-1 space-y-10">
                  <div className="inline-flex items-center gap-3 bg-vermelho/5 px-6 py-3 rounded-full border border-vermelho/10">
                    <Sparkles className="w-5 h-5 text-vermelho" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-vermelho">Palavras do Coração</span>
                  </div>
                  
                  <p className="text-2xl md:text-3xl lg:text-5xl font-playfair text-gray-800 leading-relaxed italic border-l-4 border-vermelho/20 pl-6 md:pl-8 lg:pl-12">
                    {mensagem.texto_formatado || mensagem.texto_mensagem}
                  </p>
                </div>

                {/* Player de Áudio Destacado */}
                {mensagem.url_audio && (
                  <div className="w-full lg:w-96 glass-vermelho p-8 rounded-[3rem] shrink-0 border-vermelho/20 space-y-6">
                    <div className="flex items-center gap-4 text-vermelho">
                      <div className="bg-vermelho shadow-lg shadow-vermelho/30 p-4 rounded-2xl">
                        <Mic className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold font-playfair text-xl">Ouça a Voz</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-vermelho/50">Mensagem Narrada</p>
                      </div>
                    </div>
                    <div className="bg-white/50 p-4 rounded-2xl border border-white/40">
                      <audio src={mensagem.url_audio} controls className="w-full h-10" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Vídeo Ampliado com Header */}
          {mensagem.url_video && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-verde/10 p-5 rounded-full">
                  <Video className="w-8 h-8 text-verde" />
                </div>
                <h3 className="text-3xl md:text-5xl font-playfair font-bold text-cinza">Uma Memória em Vídeo</h3>
                <p className="text-cinza/60 font-lato text-lg">Um momento capturado para sempre</p>
              </div>

              <div className="rounded-3xl md:rounded-[5rem] overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,0.2)] border-4 md:border-[15px] border-white glass bg-black aspect-video flex items-center justify-center">
                <video src={mensagem.url_video} controls className="w-full max-h-full" />
              </div>
            </motion.div>
          )}

          <footer className="pt-40 pb-20 flex flex-col items-center gap-6">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="h-px w-32 bg-vermelho/20" 
            />
            <p className="text-vermelho/30 text-sm font-black uppercase tracking-[0.5em]">
              Uma Memória Eterna • Cestino
            </p>
          </footer>
        </motion.div>
      </div>

    </main>
  );
}
