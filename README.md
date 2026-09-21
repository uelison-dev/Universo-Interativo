# Projeto Solar Interativo - Versão Beta

<p align="center">
  <img src="https://img.shields.io/badge/Tecnologia-Three.js-blue?style=for-the-badge&logo=threedots&logoColor=white" />
  <img src="https://img.shields.io/badge/Linguagem-JavaScript%20(ES6)-yellow?style=for-the-badge&logo=javascript" />
  <img src="https://img.shields.io/badge/Modelo%20de%20Luz-Físico%20(AM0)-brightgreen?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em_Desenvolvimento-orange.svg" />
</p>

Este projeto é um modelo de simulação 3D do Sistema Solar em desenvolvimento, utilizando Three.js para visualização e renderização. O objetivo é oferecer uma experiência interativa e imersiva, com ênfase na precisão física da iluminação e das órbitas.

---

## Destaques da Versão Beta

### 1. Modelo de Iluminação Fisicamente Preciso
- Irradiância realista com base na constante solar.
- Materiais PBR com albedo físico.
- Representação em condição AM0.

### 2. Navegação e Interatividade
- Câmera com foco suave em objetos selecionados.
- Alternância entre câmera guiada e câmera livre.
- Labels dinâmicos com oclusão por raycasting.

### 3. Conteúdo Astronômico Detalhado
- Planetas, luas, TNOs, cometas e buracos negros.
- Overlays informativos com dados astronômicos.
- Transição entre escala do Sistema Solar e escala interestelar.

---

## Como Executar o Projeto

O projeto agora utiliza um launcher nativo em Electron, sem dependência de Python para iniciar a experiência.

1. Clone o repositório:
```bash
git clone https://github.com/uelison-dev/Universo-Interativo.git
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o aplicativo:
```bash
npm start
```

4. Use o launcher inicial:
A janela de abertura do app permite iniciar a experiência principal com um clique em `Iniciar Exploração`.

5. Gere o aplicativo clicável do Windows:
```bash
npm run dist:win
```

Os arquivos `.exe` serão gerados na pasta `dist/`, incluindo uma versão portátil e um instalador.

---

## Estrutura do Código

| Arquivo | Função Principal |
| :--- | :--- |
| `main.js` | Inicializa o Electron, abre o launcher inicial e carrega a experiência principal. |
| `public/launcher.html` | Estrutura do novo launcher nativo do aplicativo. |
| `public/index.html` | Estrutura principal da experiência 3D. |
| `public/style.css` | Interface sobreposta à cena 3D. |
| `public/scripts/app.js` | Núcleo da cena, da câmera, da seleção e dos overlays. |
| `src/data/*.js` | Catálogo astronômico usado pelos objetos da cena. |

---

## Desenvolvedor

- Uelison Couto - https://github.com/uelison-dev

Versão atual: 6.36.0
