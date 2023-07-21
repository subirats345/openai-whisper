require("dotenv").config();
const fs = require("fs");
const express = require("express");
const axios = require("axios");
const multer = require("multer"); // para el manejo de archivos multipart/form-data

const upload = multer({ dest: "uploads/" }); // guarda los archivos subidos en el directorio 'uploads/'

const app = express();
const port = 3000;

async function transcribe(file, language = "en") {
  const response = await axios.post(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      file,
      model: "whisper-1",
      language: language,
    },
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  return response.data.text;
}

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  const file = fs.createReadStream(req.file.path);
  try {
    const transcript = await transcribe(file);
    res.json({ transcript: transcript });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al transcribir el archivo" });
  } finally {
    fs.unlinkSync(req.file.path); // Elimina el archivo después de usarlo
  }
});

app.listen(port, () => {
  console.log(
    `API de transcripción de audio escuchando en http://localhost:${port}`
  );
});
