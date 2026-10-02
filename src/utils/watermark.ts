// src/utils/watermark.ts

interface WatermarkData {
  file: File;
  locationText?: string; // misal: "Lat: -6.200, Long: 106.816"
  label?: string;        // misal: "K3 INSPECTION - TOWER CRANE A"
}

export function addWatermarkToImage({ file, locationText, label }: WatermarkData): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject("Canvas context tidak tersedia");
          return;
        }

        // Set ukuran canvas sesuai gambar asli
        canvas.width = img.width;
        canvas.height = img.height;

        // 1. Gambar foto asli
        ctx.drawImage(img, 0, 0);

        // 2. Tentukan ukuran font proporsional berdasarkan lebar gambar
        const fontSize = Math.max(16, Math.floor(canvas.width / 35));
        ctx.font = `bold ${fontSize}px Arial`;

        // Data Waktu
        const now = new Date();
        const timeStamp = now.toLocaleString("id-ID", {
          dateStyle: "full",
          timeStyle: "medium",
        });

        const lines = [
          label ? `[ ${label.toUpperCase()} ]` : "",
          `Waktu : ${timeStamp}`,
          locationText ? `Lokasi: ${locationText}` : "",
        ].filter(Boolean);

        // 3. Gambar background overlay hitam transparan di bagian bawah foto
        const padding = fontSize;
        const lineHeight = fontSize * 1.3;
        const boxHeight = lines.length * lineHeight + padding * 2;

        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, canvas.height - boxHeight, canvas.width, boxHeight);

        // 4. Tulis teks watermark warna putih/kuning
        ctx.fillStyle = "#FFD700"; // Warna teks (Gold/Kuning K3)
        let yPos = canvas.height - boxHeight + padding + fontSize / 1.2;

        lines.forEach((line) => {
          ctx.fillText(line, padding, yPos);
          yPos += lineHeight;
        });

        // 5. Konversi Canvas kembali ke File Gambar
        canvas.toBlob((blob) => {
          if (!blob) {
            reject("Gagal memproses gambar");
            return;
          }
          const stampedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(stampedFile);
        }, file.type);
      };
    };

    reader.onerror = (error) => reject(error);
  });
}