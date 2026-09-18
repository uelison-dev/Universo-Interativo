const startButton = document.getElementById('start-btn');
const focusUpdatesButton = document.getElementById('focus-updates-btn');
const minimizeButton = document.getElementById('minimize-btn');
const closeButton = document.getElementById('close-btn');
const versionBadge = document.getElementById('version-badge');
const patchNotesContainer = document.getElementById('patch-notes');
const projectHighlightsContainer = document.getElementById('project-highlights');
const updatesPanel = document.getElementById('updates-panel');

const projectHighlights = [
  'Busca rápida por planetas, luas, TNOs, cometas e buracos negros.',
  'Zoom contextual, foco por objeto e overlays com informações técnicas.',
  'Transição entre escalas do Sistema Solar e visualização interestelar.',
  'Launcher nativo do app e distribuição em formato clicável para Windows.'
];

const patchNotes = [
  {
    version: '6.36.0',
    category: 'Viewer e Interação',
    title: 'Labels clicáveis e seletor de satélites',
    changes: [
      'Os nomes dos objetos na cena principal agora podem ser clicados para abrir a tela dedicada.',
      'Planetas e planetas anões com satélites exibem um contador e botões para alternar entre seus objetos.',
      'A troca de satélite acontece dentro da mesma janela dedicada, mantendo controles e visualização.'
    ]
  },
  {
    version: '6.35.0',
    category: 'Correção',
    title: 'Inicialização da cena restaurada após atualização do Sol',
    changes: [
      'Corrigida uma referência indevida ao mesh solar dentro da criação das luas.',
      'O Sol continua marcado corretamente para abrir a tela dedicada com suas informações.',
      'A cena principal volta a renderizar normalmente ao iniciar o projeto.'
    ]
  },
  {
    version: '6.34.0',
    category: 'Viewer',
    title: 'Sol disponível na tela dedicada',
    changes: [
      'O Sol agora é identificado corretamente pelo clique na cena principal.',
      'A janela dedicada exibe a textura do Sol e todas as informações catalogadas.',
      'O fluxo de seleção do Sol foi alinhado ao dos planetas, luas e demais objetos.'
    ]
  },
  {
    version: '6.33.0',
    category: 'Órbitas e Performance',
    title: 'Trails dinâmicos no lugar das linhas orbitais circulares',
    changes: [
      'Linhas orbitais estáticas deixaram de ser renderizadas para eliminar a marcação circular.',
      'Planetas, luas, planetas anões, TNOs e cometas agora usam trails luminosos baseados no movimento real.',
      'TNOs passaram a ter trails próprios e o cinturão de asteroides foi reduzido de 4.200 para 2.800 instâncias.',
      'A cena mantém a imersão visual com menor custo de carregamento e renderização.'
    ]
  },
  {
    version: '6.32.0',
    category: 'Navegação e Visual',
    title: 'Escala orbital, marcadores e trails luminosos revisados',
    changes: [
      'Órbitas padronizadas em escala astronômica de 100 unidades de cena por UA.',
      'Planetas, luas, planetas anões, TNOs, cometas e buracos negros receberam marcadores coloridos e identificáveis na navegação.',
      'Trails luminosos agora acompanham os objetos quando a categoria de órbita é ativada, incluindo cometas.',
      'Órbitas começam desmarcadas para manter a cena limpa e podem ser ativadas pelo menu de visibilidade.',
      'Retorno da janela dedicada restaura a câmera principal e a navegação livre sem deixar a cena preta.'
    ]
  },
  {
    version: '6.31.0',
    category: 'Experiência',
    title: 'Viewer dedicado para buracos negros, planetas e satélites',
    changes: [
      'Buracos negros agora usam um anel procedural por pixel com turbulência, temperatura e brilho assimétrico.',
      'Planetas, luas e satélites de planetas anões podem ser abertos em uma janela dedicada com textura, iluminação, atmosfera e anéis.',
      'Seleção de luas corrigida para abrir o objeto correto sem afetar a navegação da galáxia.'
    ]
  },
  {
    version: '6.30.1',
    category: 'Visual',
    title: 'Buracos negros aproximados da silhueta de Interestelar com brilho quantizado',
    changes: [
      'Composição visual refeita com arco superior e inferior mais próximos da referência cinematográfica.',
      'Disco equatorial e brilho em volta ajustados com leitura em pixel leve para reforçar textura.',
      'Efeito continua orientado para a câmera e preserva desempenho sem pós-processamento pesado.'
    ]
  },
  {
    version: '6.30.0',
    category: 'Visual',
    title: 'Buraco negro refeito com lente cinematográfica leve e sem bolha artificial',
    changes: [
      'Representação redesenhada para lembrar mais a leitura observacional de Interestelar.',
      'Efeito agora acompanha melhor a câmera do OrbitControls sem pós-processamento pesado.',
      'Brilho, disco e anel foram simplificados para manter realismo com boa performance.'
    ]
  },
  {
    version: '6.29.1',
    category: 'Visual',
    title: 'Buracos negros sem bolha externa e com leitura mais observacional',
    changes: [
      'Removidas a bolha azul e a casca envolvente que quebravam o realismo.',
      'Disco de acreção ajustado para uma assinatura mais quente, compacta e física.',
      'Detalhamento quantizado leve para melhorar textura visual sem pesar na performance.'
    ]
  },
  {
    version: '6.29.0',
    category: 'Visual',
    title: 'Buraco negro com representação mais convincente e cinematográfica',
    changes: [
      'Disco de acreção refeito com camadas, turbulência orbital e leitura visual mais realista.',
      'Horizonte de eventos, halo de lente e photon ring refinados para mais profundidade.',
      'Melhoria focada em realismo percebido sem comprometer a performance geral da cena.'
    ]
  },
  {
    version: '6.28.1',
    category: 'Launcher',
    title: 'Exibição reduzida para atualização atual e última versão',
    changes: [
      'Patch notes do launcher agora mostram apenas a entrada mais recente e a anterior.',
      'Leitura da tela inicial ficou mais objetiva e menos carregada visualmente.',
      'Histórico mais antigo permanece no código para uso futuro, sem poluir a interface.'
    ]
  },
  {
    version: '6.28.0',
    category: 'Launcher',
    title: 'Patch notes padronizados para futuras atualizações',
    changes: [
      'Estrutura organizada em versão, categoria, título e mudanças.',
      'Formato preparado para receber novos registros de forma consistente.',
      'Histórico do launcher refinado para leitura e manutenção profissional.'
    ]
  },
  {
    version: '6.26.2',
    category: 'Release',
    title: 'Aplicativo clicável e launcher nativo',
    changes: [
      'Geração do app em `.exe` para abrir o launcher sem usar `npm start`.',
      'Nova tela inicial em Electron com identidade visual própria.',
      'Fluxo de entrada mais profissional antes da exploração da cena.'
    ]
  },
  {
    version: '6.24',
    category: 'UI',
    title: 'Melhorias visuais na interface principal',
    changes: [
      'Refino dos botões, popovers e estados de seleção.',
      'Correções visuais no painel de visibilidade e no overlay lateral.',
      'Organização mais coerente dos controles contextuais.'
    ]
  },
  {
    version: '6.21',
    category: 'Overlay',
    title: 'Painel de objeto selecionado mais profissional',
    changes: [
      'Imagem ilustrativa maior e cabeçalho mais forte para o objeto focado.',
      'Informações em linhas melhor organizadas e mais legíveis.',
      'Tema escuro refinado para aumentar contraste e leitura.'
    ]
  }
];

function renderHighlights() {
  projectHighlightsContainer.innerHTML = '';

  projectHighlights.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    projectHighlightsContainer.appendChild(li);
  });
}

function renderPatchNotes() {
  patchNotesContainer.innerHTML = '';

  patchNotes.slice(0, 2).forEach((entry) => {
    const article = document.createElement('article');
    article.className = 'patch-item';

    const changesMarkup = entry.changes.map((change) => `<li>${change}</li>`).join('');

    article.innerHTML = `
      <div class="patch-meta">
        <div class="patch-field">
          <span class="patch-field-label">Versão</span>
          <span class="patch-version">${entry.version}</span>
        </div>
        <div class="patch-field patch-field-right">
          <span class="patch-field-label">Categoria</span>
          <span class="patch-tag">${entry.category}</span>
        </div>
      </div>
      <div class="patch-body">
        <span class="patch-field-label">Título</span>
        <h3 class="patch-title">${entry.title}</h3>
        <span class="patch-field-label">Mudanças</span>
        <ul>${changesMarkup}</ul>
      </div>
    `;

    patchNotesContainer.appendChild(article);
  });
}

async function initializeLauncher() {
  const meta = await window.launcherApi.getMeta();
  versionBadge.textContent = `${meta.version} pronto para iniciar`;
  renderHighlights();
  renderPatchNotes();
}

startButton.addEventListener('click', async () => {
  startButton.disabled = true;
  startButton.textContent = 'Abrindo experiência...';

  try {
    await window.launcherApi.startExperience();
  } catch (error) {
    startButton.disabled = false;
    startButton.textContent = 'Iniciar Exploração';
    versionBadge.textContent = 'Falha ao iniciar a experiência';
    console.error('Erro ao iniciar a experiência:', error);
  }
});

focusUpdatesButton.addEventListener('click', () => {
  updatesPanel.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  updatesPanel.animate(
    [
      { transform: 'translateY(0)', borderColor: 'rgba(255, 255, 255, 0.08)' },
      { transform: 'translateY(-4px)', borderColor: 'rgba(141, 213, 255, 0.24)' },
      { transform: 'translateY(0)', borderColor: 'rgba(255, 255, 255, 0.08)' }
    ],
    { duration: 550, easing: 'ease-out' }
  );
});

minimizeButton.addEventListener('click', () => {
  window.launcherApi.minimizeWindow();
});

closeButton.addEventListener('click', () => {
  window.launcherApi.closeWindow();
});

initializeLauncher().catch((error) => {
  versionBadge.textContent = 'Não foi possível carregar a versão';
  console.error('Erro ao inicializar o launcher:', error);
});
