// uploadpdf/page.tsx
'use client'; // Indique que ce composant est côté client, nécessaire pour useState et les événements DOM

import React, { useState } from 'react';
import Head from 'next/head'; // Pour gérer le <head> de la page
import styles from './uploadpdf.module.css'; // Importez votre fichier CSS

export default function Uploadpdf() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Gère la sélection du fichier par l'utilisateur
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setMessage(''); // Efface les messages précédents
    } else {
      setSelectedFile(null);
    }
  };

  // Gère l'envoi du formulaire
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Empêche le rechargement de la page par défaut
    if (!selectedFile) {
      setMessage('Veuillez sélectionner un fichier PDF.');
      return;
    }

    setIsLoading(true); // Active l'indicateur de chargement
    setMessage('Envoi en cours...');

    const formData = new FormData();
    formData.append('pdf', selectedFile); // 'pdf' doit correspondre au nom attendu par votre API

    try {
      // Envoie le fichier à votre API Next.js
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('Fichier PDF envoyé avec succès à n8n !');
        setSelectedFile(null); // Réinitialise la sélection après l'envoi
      } else {
        const errorData = await response.json();
        setMessage(`Erreur lors de l'envoi à n8n : ${errorData.error || 'Une erreur inconnue est survenue.'}`);
      }
    } catch (error) {
      console.error('Erreur réseau ou du serveur:', error);
      setMessage('Une erreur est survenue lors de la connexion au serveur.');
    } finally {
      setIsLoading(false); // Désactive l'indicateur de chargement
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Traitement du PDF</title>
        <meta name="description" content="Envoyer un PDF pour traitement via n8n" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Traitement du PDF</h1>

        <p className={styles.description}>
          Sélectionnez un fichier PDF à envoyer. Il sera transmis à votre workflow n8n.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fileInputWrapper}>
            <input
              type="file"
              name="pdf"
              accept="application/pdf"
              onChange={handleFileChange}
              required
              className={styles.fileInput}
              id="pdf-upload" // ID pour l'accessibilité avec le label
              disabled={isLoading} // Désactive l'input pendant l'envoi
            />
            <label htmlFor="pdf-upload" className={styles.fileInputLabel}>
              {selectedFile ? selectedFile.name : 'Choisir un fichier PDF'}
            </label>
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={!selectedFile || isLoading} // Désactive le bouton si pas de fichier ou envoi en cours
          >
            {isLoading ? 'Envoi en cours...' : 'Envoyer le PDF'}
          </button>
        </form>

        {message && (
          <p className={`${styles.message} ${message.includes('succès') ? styles.success : styles.error}`}>
            {message}
          </p>
        )}
      </main>
    </div>
  );
}