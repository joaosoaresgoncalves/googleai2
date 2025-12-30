<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/115mZ45SJcEKkEzhC1OngQxBn7o8dd9eX

## Run Locally

**Prerequisites:**  Node.js

### Passo a Passo:

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar a API Key (IMPORTANTE - Proteção de Segurança):**
   
   Crie um arquivo `.env.local` na raiz do projeto (na mesma pasta do `package.json`) e adicione:
   ```
   GEMINI_API_KEY=sua_chave_da_api_gemini_aqui
   ```
   
   ⚠️ **NUNCA** commite o arquivo `.env.local` no git! Ele já está no `.gitignore` para sua proteção.
   
   A API key é carregada automaticamente pelo Vite e não fica exposta no código.

3. **Executar a aplicação:**
   ```bash
   npm run dev
   ```

   A aplicação estará disponível em `http://localhost:3000`

### Proteção da API Key

A API key está protegida através de:
- Arquivo `.env.local` (não versionado no git)
- Variáveis de ambiente injetadas pelo Vite
- Nenhuma chave hardcoded no código fonte
