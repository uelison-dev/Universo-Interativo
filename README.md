# 🌌 Universo Interativo — Versão Beta

<p align="center">
  <img src="https://img.shields.io/badge/Tecnologia-Three.js-blue?style=for-the-badge&logo=threedots&logoColor=white" />
  <img src="https://img.shields.io/badge/Linguagem-JavaScript%20(ES6)-yellow?style=for-the-badge&logo=javascript" />
  <img src="https://img.shields.io/badge/Modelo%20de%20Luz-Físico%20(AM0)-brightgreen?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em_Desenvolvimento-orange.svg" />
</p>

O **Universo Interativo** é um projeto de simulação e exploração 3D do Sistema Solar em desenvolvimento, utilizando **Three.js** para visualização e renderização.

O objetivo é oferecer uma experiência interativa e imersiva, combinando visualização 3D, dados astronômicos, navegação livre e recursos de exploração espacial, com atenção à iluminação e às escalas utilizadas na experiência.

---

## 🚀 Destaques da Versão Beta

### ☀️ Modelo de Iluminação Fisicamente Preciso
- Irradiância realista com base na constante solar.
- Materiais PBR com albedo físico.
- Representação em condição AM0.

### 🛰️ Navegação e Interatividade
- Câmera com foco suave em objetos selecionados.
- Alternância entre câmera guiada e câmera livre.
- Labels dinâmicos com oclusão por raycasting.
- Exploração de diferentes regiões e objetos da cena.

### 🌌 Conteúdo Astronômico
- Planetas, luas, TNOs, cometas e buracos negros.
- Overlays informativos com dados astronômicos.
- Transição entre escala do Sistema Solar e escala interestelar.

---

## 🛠️ Tecnologias

- **JavaScript (ES6)**
- **Three.js**
- **Electron**
- **HTML5 / CSS3**
- **Node.js / npm**
- **WebGL**

---

## 💻 Instalação e Uso

### 🪟 Windows — Usuários

Para utilizar o **Universo Interativo**, baixe o instalador da versão desejada na página de **Releases** do GitHub.

1. Acesse a página de [Releases](https://github.com/uelison-dev/Universo-Interativo/releases).
2. Escolha a versão que deseja instalar.
3. Baixe o arquivo `.exe` disponibilizado nos arquivos da release.
4. Execute o instalador e siga as instruções apresentadas.
5. Após a instalação, abra o **Universo Interativo** pelo atalho criado no Windows.

> **Importante:** o instalador é destinado aos usuários finais. O código-fonte disponibilizado neste repositório é apresentado publicamente para fins de portfólio, visualização e avaliação, conforme os termos definidos no arquivo `LICENSE`.

### 🧑‍💻 Desenvolvimento

O projeto utiliza **Electron, Node.js e npm**. Os comandos abaixo são destinados ao desenvolvimento e à geração do aplicativo, não sendo necessários para o usuário final.

#### Instalar dependências

```bash
npm install
```

#### Executar em modo de desenvolvimento

```bash
npm start
```

A janela inicial do aplicativo permite iniciar a experiência principal por meio do launcher.

#### Gerar o instalador para Windows

```bash
npm run dist:win
```

Os arquivos de distribuição serão gerados na pasta `dist/`, conforme a configuração do projeto.

> A pasta `dist/` contém arquivos gerados durante o processo de build. Para distribuição aos usuários, recomenda-se publicar o instalador como um **asset de uma GitHub Release**, em vez de versionar todo o conteúdo de `dist/` no repositório.

---

## 📦 Downloads e Releases

As versões distribuíveis do **Universo Interativo** são disponibilizadas por meio das **GitHub Releases**.

Cada release representa uma versão específica do aplicativo e pode conter o instalador correspondente para Windows.

Exemplo:

```text
Releases
└── v6.36.0
    └── Universo-Interativo-Setup-6.36.0.exe
```

> **Observação:** `Releases` não é uma pasta que precisa ser criada dentro do projeto. É uma área própria do GitHub associada ao repositório. Os arquivos de instalação são anexados diretamente à release.

---

## 📁 Estrutura do Código

| Arquivo | Função principal |
| :--- | :--- |
| `main.js` | Inicializa o Electron, abre o launcher e carrega a experiência principal. |
| `public/launcher.html` | Estrutura do launcher nativo do aplicativo. |
| `public/index.html` | Estrutura principal da experiência 3D. |
| `public/style.css` | Estilos da interface sobreposta à cena 3D. |
| `public/scripts/app.js` | Núcleo da cena, câmera, seleção e overlays. |
| `src/data/*.js` | Catálogo astronômico utilizado pelos objetos da cena. |

---

## 🖼️ Créditos e Recursos de Terceiros

O projeto utiliza uma combinação de **código e recursos originais** e **materiais de terceiros**. As condições de uso de cada material devem ser respeitadas individualmente.

### 🌍 Solar System Scope

Algumas texturas planetárias utilizadas no projeto foram obtidas do **Solar System Scope — Solar Textures**.

Segundo a página oficial do recurso, essas texturas são distribuídas sob a **Creative Commons Attribution 4.0 International (CC BY 4.0)**, que permite uso, adaptação e compartilhamento, inclusive comercial, desde que a atribuição correspondente seja mantida.

- Fonte: https://www.solarsystemscope.com/textures/
- Licença: https://creativecommons.org/licenses/by/4.0/

### 🤖 Imagens geradas com Google Gemini

Algumas imagens e elementos visuais utilizados no projeto foram gerados com auxílio do **Google Gemini**, a partir de prompts desenvolvidos durante a criação do Universo Interativo.

O uso, publicação e eventual comercialização de conteúdo gerado deve observar os termos aplicáveis ao serviço utilizado e os direitos de terceiros.

Além disso, imagens geradas pelos aplicativos Gemini podem conter mecanismos de procedência, como **SynthID** e **Content Credentials (C2PA)**.

- Gemini: https://gemini.google.com/
- Termos do Google: https://policies.google.com/terms
- Informações sobre geração de imagens: https://support.google.com/gemini/answer/14286560

> **Importante:** a indicação de que uma imagem foi gerada com IA não significa, por si só, que todos os direitos sobre elementos representados na imagem pertençam ao projeto. Recursos que reproduzam personagens, marcas, obras ou outros elementos protegidos de terceiros devem ser avaliados separadamente.

Para uma descrição mais detalhada dos materiais de terceiros, consulte [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).

---

## 📄 Licença

O **código-fonte e os materiais originais do Universo Interativo são proprietários**.

Este repositório público é disponibilizado principalmente para **portfólio, visualização e avaliação do projeto**. A publicação do código no GitHub não concede autorização para copiar, modificar, redistribuir, comercializar ou incorporar o projeto em outros produtos ou serviços.

Os materiais de terceiros presentes no projeto **não estão abrangidos pela licença proprietária do projeto** e permanecem sujeitos às suas respectivas licenças e termos de uso.

Consulte o arquivo [`LICENSE`](LICENSE) para os termos completos e [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) para os créditos e licenças de terceiros.

---

## 👨‍💻 Desenvolvimento

**Uelison Ferreira**  
GitHub: https://github.com/uelison-dev

---

**Versão atual:** 6.36.0

© 2026 Uelison Ferreira. Todos os direitos reservados.
