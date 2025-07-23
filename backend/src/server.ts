// backend-test/src/server.ts

import cors from 'cors'
import express, { Request, Response } from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'

const app = express()
const port = 5000

app.use(
  cors({
    origin: 'http://localhost:5173', // Confirme sua porta do frontend Vite
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

const uploadDir = path.join(__dirname, 'uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({ storage: storage })

// Para upload.array(), req.files é um array de Express.Multer.File
app.post('/api/upload-yolo', upload.array('yoloFiles'), (req: Request, res: Response) => {
  // O tipo de req.files será Express.Multer.File[] | undefined
  // Você pode fazer um cast seguro ou verificar a existência
  const files = req.files as Express.Multer.File[] // Faz um cast explícito

  if (!files || files.length === 0) {
    // Verifica se files é válido e não está vazio
    return res.status(400).json({ message: 'Nenhum arquivo enviado.' })
  }

  const uploadedFileNames = files.map((file) => file.filename)
  console.log(`[${new Date().toLocaleTimeString()}] Arquivos YOLO recebidos:`, uploadedFileNames)

  setTimeout(() => {
    console.log('Delayed message after 2 seconds')
    res.status(200).json({
      message: 'Arquivos YOLO recebidos com sucesso!',
      uploadedFiles: uploadedFileNames,
      count: uploadedFileNames.length,
    })
  }, 200000) // 2000 milliseconds = 2 seconds
})

app.get('/api/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API de simulação está funcionando!' })
})

app.listen(port, () => {
  console.log(`Servidor de simulação rodando em http://localhost:${port}`)
  console.log(`Os arquivos enviados serão salvos em: ${uploadDir}`)
})
