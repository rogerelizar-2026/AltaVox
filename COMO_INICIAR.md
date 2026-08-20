# 🚀 COMO INICIAR O SISTEMA ALTA VOZ

## Método Mais Simples (Recomendado)

### Windows
1. **Dê um duplo clique** no arquivo `iniciar.bat`
2. O sistema instalará automaticamente todas as dependências (na primeira vez)
3. O navegador abrirá automaticamente com o sistema

### Linux / macOS
1. Abra o terminal na pasta do projeto
2. Execute: `./iniciar.sh`
3. O sistema instalará automaticamente todas as dependências (na primeira vez)
4. O navegador abrirá automaticamente com o sistema

---

## Pré-requisito Único

Você precisa ter o **Node.js** instalado no seu computador:

- **Windows/macOS**: Baixe em [https://nodejs.org/](https://nodejs.org/) (versão LTS recomendada)
- **Linux (Ubuntu/Debian)**: `sudo apt install nodejs npm`
- **macOS (com Homebrew)**: `brew install node`

---

## O que acontece quando você clica no arquivo de inicialização?

O script automático faz tudo por você:

1. ✅ Verifica se o Node.js está instalado
2. ✅ Detecta se as dependências já foram instaladas
3. ✅ Instala automaticamente todas as bibliotecas necessárias (apenas na primeira vez)
4. ✅ Inicia o servidor de desenvolvimento
5. ✅ Abre o sistema no seu navegador automaticamente

---

## Perguntas Frequentes

### "Preciso digitar comandos?"
**Não!** Basta clicar duas vezes no arquivo `iniciar.bat` (Windows) ou executar `./iniciar.sh` (Linux/Mac).

### "Demora muito?"
- **Primeira vez**: 2-5 minutos (para baixar e instalar todas as dependências)
- **Próximas vezes**: 5-10 segundos (apenas para iniciar o servidor)

### "Posso fechar a janela do terminal?"
**Não!** Mantenha a janela aberta enquanto estiver usando o sistema. Se fechar, o sistema para.

### "Como paro o sistema?"
Pressione `Ctrl+C` na janela do terminal ou simplesmente feche-a.

### "Preciso de internet?"
- **Para instalar** (primeira vez): Sim
- **Para usar** (depois de instalado): Não! O sistema funciona 100% offline.

---

## Estrutura dos Arquivos

```
AltaVoz/
├── iniciar.bat          ← Clique aqui (Windows)
├── iniciar.sh           ← Execute aqui (Linux/Mac)
├── index.html           ← NÃO abra diretamente!
├── package.json         ← Lista de dependências
└── src/                 ← Código fonte
```

---

## ⚠️ Importante

**NÃO abra o arquivo `index.html` diretamente no navegador!** 

Este é um projeto moderno que requer um servidor de desenvolvimento. Use sempre os arquivos `iniciar.bat` ou `iniciar.sh`.

---

## Suporte

Se encontrar algum erro:
1. Verifique se o Node.js está instalado (`node --version` no terminal)
2. Delete a pasta `node_modules` e execute o iniciador novamente
3. Certifique-se de ter conexão com internet na primeira execução
