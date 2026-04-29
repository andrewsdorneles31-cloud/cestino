"use server";

export async function refinarMensagem(textoOriginal: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    // Retorno de fallback caso não haja chave, para teste
    return `[IA Mock] Uma versão lapidada de: ${textoOriginal}. (Por favor, configure OPENROUTER_API_KEY no seu .env para usar a IA real)`;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://cestino.vercel.app", // Opcional, para o OpenRouter saber de onde vem
        "X-Title": "Cestino", // Opcional
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        "messages": [
          {
            "role": "system",
            "content": "Você é um assistente poético especializado em mensagens de Dia das Mães para a marca 'Cestino'. Sua tarefa é pegar uma mensagem bruta e simples escrita por um cliente e transformá-la em uma homenagem emocionante, elegante e sofisticada. Regras: 1. Mantenha o sentimento original. 2. Use um tom carinhoso e premium. 3. Não ultrapasse 400 caracteres. 4. Retorne apenas o texto refinado, sem aspas ou comentários."
          },
          {
            "role": "user",
            "content": textoOriginal
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      console.error("Resposta inesperada do OpenRouter:", data);
      throw new Error("Resposta da IA vazia");
    }
  } catch (error) {
    console.error("Erro na IA (OpenRouter):", error);
    throw new Error("Falha ao refinar mensagem com IA");
  }
}
