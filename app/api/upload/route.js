// app/api/upload/route.js
import { NextResponse } from 'next/server';

// IMPORTANT : Pas besoin d'importer 'formidable', ni 'fs' pour le parsing.
// Pas besoin de 'export const config = { api: { bodyParser: false } };' non plus.

export async function POST(req) {
  // 1. Utilisez req.formData() pour parser le corps de la requête
  // C'est la méthode native et recommandée pour l'App Router.
  const formData = await req.formData();

  // 2. Récupérez le fichier PDF du FormData
  // 'pdf' doit correspondre au 'name' de votre input file dans le formulaire côté client
  const pdfFile = formData.get('pdf');
  const originalFileName = pdfFile.name || "document_sans_nom.pdf"; // Définition de la variable
  // Vérifiez si un fichier a été envoyé et s'il est du bon type
  if (!pdfFile || !(pdfFile instanceof Blob) || pdfFile.type !== 'application/pdf') {
    return NextResponse.json({ error: "Veuillez envoyer un fichier PDF valide." }, { status: 400 });
  }

  // Vous pouvez accéder aux métadonnées du fichier (nom, taille, type)
  // const fileName = pdfFile.name;
  // const fileType = pdfFile.type;
  // const fileSize = pdfFile.size;

  // 3. Obtenez un stream du fichier (Web ReadableStream)
  const fileStream = pdfFile.stream();

  // URL de votre Webhook n8n (TRÈS IMPORTANT: REMPLACEZ PAR VOTRE VRAIE URL)
  //const n8nWebhookUrl = "https://n8nio.christophev.synology.me/webhook-test/dd0e5e1c-2e7a-483c-9525-3b65c0bd72d0"; // <-- À REMPLACER !
  const n8nWebhookUrl = "https://n8nio.christophev.synology.me/webhook/dd0e5e1c-2e7a-483c-9525-3b65c0bd72d0";
  try {
    // 4. Envoi du stream du fichier directement à n8n via fetch
    // La fonction `Workspace` de Node.js peut prendre un ReadableStream comme corps de requête.
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": pdfFile.type, // Utilise le type MIME détecté du fichier
        "X-File-Name": encodeURIComponent(originalFileName), // Encodé le nom du fichier pour éviter les problèmes avec les caractères spéciaux
        //"X-File-Name": encodeURIComponent(pdfFile.name || "untitled.pdf"), // Encode le nom du fichier pour l'en-tête
      },
      body: fileStream, // Envoie le stream direct du fichier
      duplex: 'half', // Nécessaire pour les corps de requête en streaming avec Node.js fetch
    });

    if (n8nResponse.ok) {
      return NextResponse.json({ success: true, message: "Fichier PDF envoyé à n8n avec succès !" }, { status: 200 });
    } else {
      const n8nErrorText = await n8nResponse.text();
      console.error("Erreur de n8n:", n8nResponse.status, n8nErrorText);
      return NextResponse.json({ error: `Erreur de n8n (${n8nResponse.status}): ${n8nErrorText.substring(0, 100)}...` }, { status: 500 });
    }
  } catch (fetchError) {
    console.error("Erreur lors de l'envoi à n8n:", fetchError);
    return NextResponse.json({ error: "Impossible de se connecter au service n8n." }, { status: 500 });
  }
}