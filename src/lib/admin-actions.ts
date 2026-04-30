"use server";

import { createAdminClient } from "./appwrite-server";
import { APPWRITE_CONFIG } from "./appwrite";
import { Query } from "node-appwrite";

/**
 * Deleta uma cesta e todas as mensagens associadas a ela usando o cliente administrativo.
 * Resolve o erro de "Unauthorized" (401) do Client SDK.
 */
export async function deletarCestaServer(idCesta: string) {
  try {
    const { databases } = await createAdminClient();

    // 1. Buscar mensagens associadas
    const mensagensRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.mensagens,
      [Query.equal('id_cesta', idCesta)]
    );

    // 2. Deletar mensagens encontradas
    for (const msg of mensagensRes.documents) {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.mensagens,
        msg.$id
      );
    }

    // 3. Deletar a cesta
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.cestas,
      idCesta
    );

    return { success: true };
  } catch (error: any) {
    console.error("Erro no servidor ao deletar cesta:", error);
    throw new Error(error.message || "Falha ao deletar cesta no servidor");
  }
}

/**
 * Modera uma mensagem (aprova ou reprova) usando o cliente administrativo.
 */
export async function moderarMensagemServer(idMensagem: string, aprovado: boolean) {
    try {
      const { databases } = await createAdminClient();
  
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.mensagens,
        idMensagem,
        { esta_aprovado: aprovado }
      );
  
      return { success: true };
    } catch (error: any) {
      console.error("Erro no servidor ao moderar mensagem:", error);
      throw new Error(error.message || "Falha ao moderar mensagem");
    }
  }

/**
 * Publica ou atualiza uma mensagem e muda o status da cesta para 'publicado'.
 */
export async function publicarMensagemServer(cestaId: string, messageData: any) {
  try {
    const { databases } = await createAdminClient();

    // 1. Verificar se já existe uma mensagem para esta cesta
    const existingDocs = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.mensagens,
      [Query.equal('id_cesta', cestaId)]
    );

    // 2. Criar ou Atualizar a mensagem
    if (existingDocs.documents.length > 0) {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.mensagens,
        existingDocs.documents[0].$id,
        {
          ...messageData,
          esta_aprovado: false // Sempre resetar para reprovado ao editar
        }
      );
    } else {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.mensagens,
        'unique()',
        {
          ...messageData,
          esta_aprovado: false
        }
      );
    }

    // 3. Atualizar o status da cesta
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.cestas,
      cestaId,
      { status: 'publicado' }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Erro no servidor ao publicar mensagem:", error);
    throw new Error(error.message || "Falha ao publicar mensagem no servidor");
  }
}
