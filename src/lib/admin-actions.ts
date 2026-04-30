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
