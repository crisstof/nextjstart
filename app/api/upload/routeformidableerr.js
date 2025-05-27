// app/api/upload/route.js
import formidable from "formidable";
import fs from "fs";
import { Readable } from 'stream'; // Import Readable pour la gestion des streams
// Importez fetch directement si vous êtes dans un environnement Node.js moderne
// ou utilisez 'node-fetch' si vous êtes sur une version plus ancienne de Node.js
// const fetch = require('node-fetch'); // Si vous utilisez CommonJS ou Node < 18
// Ou assurez-vous que votre environnement supporte le fetch global

// IMPORTANT: Désactivez le bodyParser par défaut de Next.js pour cette route
// C'est crucial pour que formidable puisse traiter le corps de la requête multipart/form-data
export const config = {
  api: {
    bodyParser: false, // <-- TRÈS IMPORTANT : Dit à Next.js de ne PAS parser la requête, car formidable va le faire.
  },
};

// Fonction utilitaire pour convertir un ReadableStream en Buffer
// Utile si n8n attend un Buffer plutôt qu'un Stream direct
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export async function POST(req) {
  // Crée une instance de formidable pour parser la requête
  const form = formidable({
    // formidable va temporairement écrire le fichier sur le disque.
    // Par défaut, il utilise le répertoire temporaire du système d'exploitation.
    // Vous n'avez pas besoin de spécifier uploadDir si vous ne voulez pas de stockage permanent.
    // Si vous voulez un contrôle sur le répertoire temporaire, vous pouvez le définir ici:
    // uploadDir: './tmp', // Assurez-vous que ce dossier existe et est accessible en écriture
    keepExtensions: true, // Garde l'extension du fichier original
    maxFileSize: 10 * 1024 * 1024, // Limite la taille du fichier à 10MB (ajustez si besoin)
    filter: function ({ name, originalFilename, mimetype }) {
      // Filtre pour accepter uniquement les fichiers PDF
      return mimetype && mimetype.includes('application/pdf');
    },  //<-- Ici, on initialise formidable
  });

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {   // <-- formidable analyse la requête (req)
      if (err) {
        console.error("Erreur lors du parsing du formulaire:", err);
        let errorMessage = "Erreur lors du traitement du fichier.";
        if (err.code === formidable.errors.biggerThanMaxFileSize) {
          errorMessage = "Le fichier est trop volumineux.";
        } else if (err.code === formidable.errors.unsupportedMediaType) {
          errorMessage = "Type de fichier non supporté. Seuls les PDF sont acceptés.";
        }
        return resolve(new Response(JSON.stringify({ error: errorMessage }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
      }

      const pdfFile = files.pdf; // 'pdf' est le nom de l'input dans votre formulaire  // <-- formidable a trouvé le fichier 'pdf' et vous le donne

      // Vérifie si un fichier PDF valide a été uploadé
      if (!pdfFile || (Array.isArray(pdfFile) && pdfFile.length === 0)) {
        return resolve(new Response(JSON.stringify({ error: "Aucun fichier PDF n'a été envoyé ou le fichier n'est pas valide." }), { status: 400, headers: { 'Content-Type': 'application/json' } }));
      }

      // formidable peut retourner un tableau si plusieurs fichiers ont le même nom d'input
      const fileToProcess = Array.isArray(pdfFile) ? pdfFile[0] : pdfFile;

      // Crée un stream de lecture à partir du fichier temporaire
      const fileStream = fs.createReadStream(fileToProcess.filepath); // <-- formidable vous donne le chemin du fichier temporaire

      // URL de votre Webhook n8n (TRÈS IMPORTANT: REMPLACEZ PAR VOTRE VRAIE URL)
      //const n8nWebhookUrl = "https://ton-n8n.com/webhook/form-submission"; // <-- À REMPLACER !
        const n8nWebhookUrl = "https://n8nio.christophev.synology.me/webhook-test/dd0e5e1c-2e7a-483c-9525-3b65c0bd72d0";
      try {                   
        // Envoi du fichier à n8n via un Webhook
        // Le Content-Type est crucial pour n8n pour identifier le type de données
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": fileToProcess.mimetype || "application/pdf", // Utilise le mimetype détecté par formidable
            "X-File-Name": encodeURIComponent(fileToProcess.originalFilename), // Peut être utile pour n8n
          },
          body: fileStream, // Envoie le stream du fichier directement
          // n8nResponse = await fetch("...", { body: fileStream }); // <-- Vous envoyez le stream de ce fichier temporaire à n8n
        });

        // Supprime le fichier temporaire après l'envoi à n8n
        // formidable gère généralement le nettoyage, mais c'est une bonne pratique
        // de s'assurer qu'il est supprimé si vous le manipulez manuellement.
        // fs.unlink(fileToProcess.filepath, (unlinkErr) => {
        //   if (unlinkErr) console.error("Erreur lors de la suppression du fichier temporaire:", unlinkErr);
        // });

        if (n8nResponse.ok) {
          // Réponse réussie de n8n
          resolve(new Response(JSON.stringify({ success: true, message: "Fichier envoyé à n8n avec succès." }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        } else {
          // Erreur de n8n
          const n8nErrorText = await n8nResponse.text();
          console.error("Erreur de n8n:", n8nResponse.status, n8nErrorText);
          resolve(new Response(JSON.stringify({ error: `Erreur de n8n (${n8nResponse.status}): ${n8nErrorText.substring(0, 100)}...` }), { status: 500, headers: { 'Content-Type': 'application/json' } }));
        }
      } catch (fetchError) {
        console.error("Erreur lors de l'envoi à n8n:", fetchError);
        resolve(new Response(JSON.stringify({ error: "Impossible de se connecter au service n8n." }), { status: 500, headers: { 'Content-Type': 'application/json' } }));
      }
    });
  });
}


/*
**formidable**
formidable est l'outil qui permet à votre API de "comprendre" que vous avez envoyé un fichier PDF.
Il gère l'écriture de ce fichier sur le disque dans un emplacement temporaire.
Il vous donne le filepath (le chemin vers ce fichier temporaire) que vous utilisez ensuite avec fs.createReadStream pour créer un flux de données.
Ce flux est ensuite directement envoyé à votre webhook n8n, ce qui vous permet de ne pas stocker le PDF de manière permanente dans votre application Next.js.
En bref, formidable est le pont essentiel qui permet à votre serveur Node.js (via Next.js) de recevoir et de traiter les fichiers téléchargés par vos utilisateurs.

*/