# Política de versionamento

O `package.json` é a fonte da versão do aplicativo. O número deve seguir o formato `MAJOR.MINOR.PATCH`:

- **PATCH** (`6.37.0` → `6.37.1`): correções e refinamentos compatíveis.
- **MINOR** (`6.37.0` → `6.38.0`): novas funcionalidades ou mudanças visuais relevantes compatíveis.
- **MAJOR** (`6.37.0` → `7.0.0`): mudanças incompatíveis ou uma revisão ampla que altere contratos do projeto.

Cada entrega deve atualizar a versão no `package.json` e no `package-lock.json`, gerar novamente `public/scripts/config.js` com `npm run prestart`, atualizar a versão atual no README, registrar as mudanças em `CHANGELOG.md` e adicionar uma nota no início da lista `patchNotes` em `public/scripts/launcher.js`.

O launcher recebe a versão exibida no selo diretamente dos metadados do pacote. As notas de atualização são mantidas junto ao código do launcher e as duas entradas mais recentes são mostradas na interface.

Em cada alteração futura do projeto, aplicar o incremento adequado e manter esses registros sincronizados antes de concluir a entrega.
