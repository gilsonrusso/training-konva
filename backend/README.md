# API de Simulação de Upload YOLO

Esta é uma API de exemplo simples construída com Node.js, Express e TypeScript, projetada para simular o recebimento de arquivos de anotação YOLO (`.zip` ou `.txt`) de um frontend. É ideal para testar a integração de upload de arquivos antes de ter um backend completo.

## 🚀 Tecnologias Utilizadas

* **Node.js**: Ambiente de execução JavaScript.
* **Express**: Framework web para Node.js para construir APIs RESTful.
* **TypeScript**: Superconjunto tipado de JavaScript para código mais robusto e manutenível.
* **Multer**: Middleware para Express que lida com `multipart/form-data`, usado para processar uploads de arquivos.
* **CORS**: Middleware para habilitar o Cross-Origin Resource Sharing.
* **Nodemon**: Ferramenta para reiniciar o servidor automaticamente durante o desenvolvimento.
* **ts-node**: Permite executar arquivos TypeScript diretamente no Node.js.

---

## 📦 Estrutura do Projeto

backend-test/
├── src/
│   └── server.ts           # Código fonte da API
├── uploads/                # Diretório onde os arquivos uploaded são salvos
├── .gitignore              # Ignora arquivos e pastas que não devem ser versionados
├── package.json            # Configurações do projeto Node.js e scripts
├── tsconfig.json           # Configurações do compilador TypeScript
└── README.md               # Este arquivo


---

## ⚙️ Configuração e Instalação

Siga os passos abaixo para configurar e executar a API de simulação.

1.  **Navegue até a pasta `backend-test`:**
    ```bash
    cd backend-test
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou yarn install
    ```
    Isso instalará todas as dependências listadas no `package.json`.

3.  **Configurações de CORS:**
    Certifique-se de que a origem do seu frontend está configurada corretamente no `src/server.ts`. A linha `origin` no middleware `cors` deve corresponder à URL onde seu frontend está sendo executado (por exemplo, `http://localhost:5173`).

    ```typescript
    // backend-test/src/server.ts
    app.use(cors({
      origin: 'http://localhost:5173', // <-- Altere se o seu frontend estiver em outra porta
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    ```

---

## ▶️ Como Executar

### Modo Desenvolvimento (com `nodemon`)

Para iniciar o servidor em modo de desenvolvimento (monitora mudanças e reinicia automaticamente):

```bash
npm run dev
# ou yarn dev
O servidor estará disponível em http://localhost:5000. Os arquivos enviados serão salvos na pasta uploads/ dentro do diretório backend-test/.

Modo Produção (Compilado)
Compile o código TypeScript para JavaScript:

Bash

npm run build
Isso criará uma pasta dist/ com o arquivo server.js compilado.

Inicie o servidor compilado:

Bash

npm start
🧪 Endpoints da API
POST /api/upload-yolo

Descrição: Recebe arquivos de anotação YOLO (arquivos .txt ou um arquivo .zip contendo-os).

Tipo de Conteúdo: multipart/form-data.

Campo do Arquivo: O frontend deve enviar os arquivos usando o nome de campo yoloFiles.

Resposta de Sucesso (200 OK):

JSON

{
  "message": "Arquivos YOLO recebidos com sucesso!",
  "uploadedFiles": ["nome_do_arquivo1.zip", "nome_do_arquivo2.txt"],
  "count": 2
}
Resposta de Erro (400 Bad Request):

JSON

{
  "message": "Nenhum arquivo enviado."
}
GET /api/test

Descrição: Um endpoint simples para verificar se a API está online.

Resposta de Sucesso (200 OK):

JSON

{
  "message": "API de simulação está funcionando!"
}
🤝 Contribuições
Sinta-se à vontade para clonar este repositório e adaptá-lo às suas necessidades.