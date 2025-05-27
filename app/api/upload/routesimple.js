import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch"; // ou global fetch selon ta version

export const POST = async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Erreur upload" });

    const pdfFile = files.pdf;
    const fileStream = fs.createReadStream(pdfFile.filepath);

    // Envoi à n8n via un Webhook (adapte l'URL)
    const n8nResponse = await fetch("https://ton-n8n.com/webhook/form-submission", {
      method: "POST",
      headers: { "Content-Type": "application/pdf" },
      body: fileStream,
    });

    if (n8nResponse.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: "Erreur n8n" });
    }
  });
};
