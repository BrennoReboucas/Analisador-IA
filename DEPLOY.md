# 🚀 Guia Completo: Deploy no GitHub Pages

Este guia vai te levar do zero até ter seu projeto rodando no GitHub Pages.

## 📋 Pré-requisitos

- Conta no GitHub
- Git instalado no seu computador
- Node.js instalado (para testar localmente)

---

## Passo 1: Criar o Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"+"** no canto superior direito → **"New repository"**
3. Preencha:
   - **Repository name**: escolha um nome (ex: `analisador-documentos`)
   - **Description**: descrição opcional
   - **Visibility**: escolha **Public** (GitHub Pages gratuito requer repositório público) ou **Private** (se tiver GitHub Pro)
   - ⚠️ **NÃO marque** "Add a README file", "Add .gitignore" ou "Choose a license" (já temos esses arquivos)
4. Clique em **"Create repository"**

---

## Passo 2: Inicializar Git no Projeto (se ainda não fez)

Abra o terminal na pasta do projeto e execute:

```bash
# Verificar se já é um repositório Git
git status

# Se der erro, inicialize o Git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Initial commit"
```

---

## Passo 3: Conectar com o Repositório do GitHub

No terminal, execute (substitua `SEU-USUARIO` e `NOME-DO-REPO` pelos seus valores):

```bash
# Adicionar o repositório remoto
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git

# Verificar se foi adicionado corretamente
git remote -v
```

**Exemplo:**
```bash
git remote add origin https://github.com/brenno/analisador-documentos.git
```

---

## Passo 4: Enviar o Código para o GitHub

```bash
# Verificar em qual branch você está
git branch

# Se não estiver na main, crie ou mude para main
git checkout -b main
# OU se já estiver em outra branch:
# git branch -M main

# Enviar o código para o GitHub
git push -u origin main
```

Se pedir autenticação:
- **Username**: seu usuário do GitHub
- **Password**: use um **Personal Access Token** (não sua senha normal)
  - Para criar: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
  - Marque a opção `repo` e gere o token

---

## Passo 5: Configurar a API Key no GitHub (Se necessário)

Se seu projeto precisa da `GEMINI_API_KEY`:

1. No repositório do GitHub, vá em **Settings** (no topo do repositório)
2. No menu lateral, clique em **"Secrets and variables"** → **"Actions"**
3. Clique em **"New repository secret"**
4. Preencha:
   - **Name**: `GEMINI_API_KEY`
   - **Secret**: cole sua chave da API Gemini
5. Clique em **"Add secret"**

> 💡 **Nota**: Se você não configurar isso e o build precisar da API key, o deploy pode falhar. Mas você pode testar primeiro sem configurar.

---

## Passo 6: Habilitar GitHub Pages

1. Ainda nas **Settings** do repositório
2. No menu lateral, role até **"Pages"** (na seção "Code and automation")
3. Em **"Source"**, selecione: **"GitHub Actions"**
4. Não precisa fazer mais nada aqui, apenas selecionar essa opção

---

## Passo 7: Fazer o Primeiro Deploy

O workflow já está configurado! Agora é só fazer um push:

```bash
# Se você já fez o push inicial, pode fazer uma pequena alteração ou apenas:
git push origin main
```

Ou, se quiser garantir que tudo está commitado:

```bash
# Verificar status
git status

# Se houver mudanças, adicionar e commitar
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

---

## Passo 8: Acompanhar o Deploy

1. No repositório do GitHub, clique na aba **"Actions"** (no topo)
2. Você verá um workflow chamado **"Deploy to GitHub Pages"** rodando
3. Clique nele para ver os detalhes
4. Aguarde alguns minutos enquanto:
   - Instala as dependências
   - Faz o build do projeto
   - Faz o deploy

5. Quando aparecer um ✅ verde, o deploy foi concluído!

---

## Passo 9: Acessar seu Site

Após o deploy concluir:

1. Volte em **Settings** → **Pages**
2. Você verá a URL do seu site, algo como:
   - `https://SEU-USUARIO.github.io/NOME-DO-REPO`
   - Ou `https://SEU-USUARIO.github.io` (se o repositório for `SEU-USUARIO.github.io`)

3. Clique na URL ou copie e cole no navegador
4. Seu site deve estar funcionando! 🎉

> ⏱️ **Atenção**: Pode levar alguns minutos para o site ficar disponível após o deploy concluir.

---

## 🔄 Deploys Automáticos

A partir de agora, **toda vez que você fizer push na branch `main`**, o GitHub Actions vai:
1. Detectar automaticamente
2. Fazer o build
3. Fazer o deploy no GitHub Pages

Você não precisa fazer mais nada manualmente!

---

## ❓ Troubleshooting

### O deploy falhou?
- Verifique a aba **Actions** para ver os erros
- Certifique-se de que a `GEMINI_API_KEY` está configurada (se necessário)
- Verifique se todos os arquivos foram commitados

### O site não está aparecendo?
- Aguarde alguns minutos (pode levar até 10 minutos)
- Verifique em **Settings** → **Pages** se está configurado como "GitHub Actions"
- Limpe o cache do navegador (Ctrl+F5)

### Erro de autenticação no Git?
- Use um Personal Access Token em vez da senha
- Ou configure SSH keys no GitHub

### Quer fazer deploy manual?
```bash
npm run build
# Depois faça push da pasta dist para a branch gh-pages
```

---

## 📝 Resumo Rápido

```bash
# 1. Criar repo no GitHub (via site)
# 2. Conectar local
git remote add origin https://github.com/USUARIO/REPO.git
git push -u origin main

# 3. Configurar Secrets (via site): Settings → Secrets → GEMINI_API_KEY
# 4. Habilitar Pages (via site): Settings → Pages → GitHub Actions
# 5. Aguardar deploy automático
# 6. Acessar: https://USUARIO.github.io/REPO
```

Pronto! Seu projeto está no ar! 🚀

