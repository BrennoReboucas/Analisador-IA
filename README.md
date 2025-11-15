<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Li441CEIXleKojMVEBTf_wUPfQ6XNp8B

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy no GitHub Pages

Este projeto está configurado para fazer deploy automático no GitHub Pages.

📖 **Para um guia passo a passo completo, veja [DEPLOY.md](./DEPLOY.md)**

### Resumo Rápido

1. **Criar repositório no GitHub** (via site)
2. **Conectar e enviar código:**
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
   git push -u origin main
   ```
3. **Configurar Secrets** (Settings → Secrets → Actions): adicione `GEMINI_API_KEY`
4. **Habilitar Pages** (Settings → Pages → Source: "GitHub Actions")
5. **Aguardar deploy automático** (Actions → verificar progresso)
6. **Acessar:** `https://SEU-USUARIO.github.io/NOME-DO-REPO`

A partir daí, todo push na branch `main` faz deploy automático! 🚀
