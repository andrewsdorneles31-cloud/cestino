import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { client };

export const APPWRITE_CONFIG = {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
    collections: {
        cestas: process.env.NEXT_PUBLIC_APPWRITE_CESTAS_COLLECTION_ID || '',
        mensagens: process.env.NEXT_PUBLIC_APPWRITE_MENSAGENS_COLLECTION_ID || '',
        logs: process.env.NEXT_PUBLIC_APPWRITE_LOGS_COLLECTION_ID || '',
    },
    buckets: {
        midia: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '',
    }
};
