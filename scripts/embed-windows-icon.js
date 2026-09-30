const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

module.exports.default = async function embedWindowsIcon(context) {
  if (context.electronPlatformName !== 'win32') return;

  const executablePath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.exe`
  );
  const iconPath = path.join(context.packager.projectDir, 'logo_atom.ico');
  const installerTools = path.dirname(require.resolve('electron-winstaller'));
  const resourceEditor = path.resolve(installerTools, '..', 'vendor', 'rcedit.exe');

  for (const filePath of [executablePath, iconPath, resourceEditor]) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Recurso necessário para incorporar o ícone não encontrado: ${filePath}`);
    }
  }

  execFileSync(resourceEditor, [executablePath, '--set-icon', iconPath], {
    stdio: 'inherit'
  });
  console.log(`[Ícone Windows] ${iconPath} incorporado em ${executablePath}`);
};
