// update-version.js
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json'); // 1. CORREÇÃO AQUI: Caminho relativo do root
const version = packageJson.version;

// 2. CORREÇÃO AQUI: Removida a subida de diretório ('..') do path.join
// O script agora está no root e precisa apenas entrar em 'public'
const targetPath = path.join(__dirname, 'public', 'scripts', 'config.js'); 

// Conteúdo do arquivo de configuração a ser criado
const content = `
// Arquivo gerado automaticamente por 'npm run prestart'
export const APP_VERSION = 'Versão ${version}';
`;

fs.writeFileSync(targetPath, content.trim());
console.log(`[Versão] Versão ${version} injetada em ${targetPath}`);