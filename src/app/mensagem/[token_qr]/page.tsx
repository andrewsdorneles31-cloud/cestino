import { createAdminClient } from "@/lib/appwrite-server";
import { APPWRITE_CONFIG } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import RecipientClient from "./RecipientClient";
import { notFound } from "next/navigation";

export default async function PaginaMensagem({
  params,
}: {
  params: Promise<{ token_qr: string }>;
}) {
  const { token_qr } = await params;
  const { databases } = await createAdminClient();

  // Mock para teste local
  if (token_qr === "teste") {
    const mockMensagem = {
      texto_mensagem: "Feliz Dia das Mães! Você é a pessoa mais especial do mundo.",
      texto_formatado: "Querida Mãe,\n\nNeste dia tão especial, quero expressar todo o meu amor e gratidão. Você é o meu porto seguro, a minha inspiração e a pessoa mais importante da minha vida.\n\nCom todo o meu amor.",
      urls_imagens: [
        "https://images.unsplash.com/photo-1544174845-703565e3c162?q=80&w=500",
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=500"
      ],
      url_audio: null,
      url_video: null,
      esta_aprovado: true
    };
    return <RecipientClient mensagem={mockMensagem} />;
  }

  try {
    // Buscar a cesta pelo token_qr
    const baskets = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.cestas,
      [Query.equal('token_qr', token_qr)]
    );

    const cesta = baskets.documents[0];

    if (!cesta) {
      notFound();
    }

    // Buscar a mensagem vinculada
    const messages = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.mensagens,
      [Query.equal('id_cesta', cesta.$id)]
    );

    const mensagem = messages.documents[0];

    // Se não existir mensagem ou não estiver aprovada, mostrar tela de "quase pronta"
    if (!mensagem || !mensagem.esta_aprovado) {
      return (
        <main className="min-h-screen bg-vermelho/5 flex items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            <div className="text-6xl">💐</div>
            <h1 className="text-3xl font-playfair font-bold text-vermelho">
              Sua surpresa está quase pronta!
            </h1>
            <p className="text-cinza font-lato">
              Estamos preparando cada detalhe com muito carinho. Volte em alguns minutos para ver o que preparamos para você.
            </p>
          </div>
        </main>
      );
    }

    return <RecipientClient mensagem={mensagem} />;
  } catch (error) {
    console.error("Erro ao carregar mensagem:", error);
    notFound();
  }
}
