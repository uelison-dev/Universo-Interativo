# Histórico de alterações

## 6.39.14 — 2026-09-30

- README passa a exibir a identidade visual oficial do aplicativo para apresentar o ícone do projeto aos visitantes.

## 6.39.13 — 2026-09-30

- Atalhos antigos são substituídos por arquivos `.lnk` novos, sem os metadados quebrados que mantinham o ícone em branco.
- Atalho da Área de Trabalho e do Menu Iniciar aponta para o executável instalado, em vez do `.ico` na pasta de desenvolvimento.
- Zoom In e Zoom Out ficam visíveis acima da coluna de ferramentas; nomes e rótulos acessíveis foram refinados.

## 6.39.12 — 2026-09-30

- Atalhos antigos com metadados inválidos são substituídos por arquivos `.lnk` novos, verificados antes da troca.
- Ícone e destino do atalho passam a apontar ao executável instalado.

## 6.39.11 — 2026-09-30

- Ajuste dos atalhos do instalador com diagnóstico de destino e ícone durante a instalação.
- Controles Zoom In e Zoom Out reposicionados para não ficarem ocultos pela barra lateral.
- Nomes e rótulos acessíveis das ferramentas principais refinados.

## 6.39.10 — 2026-09-30

- Atalhos Windows agora são escritos e verificados pelo Shell COM com destino e ícone apontando ao executável instalado.
- Corrigido o campo `IconLocation` inválido que persistia nos atalhos após a instalação NSIS.

## 6.39.9 — 2026-09-30

- Barra de zoom reposicionada acima das ferramentas laterais para que Zoom In e Zoom Out não fiquem encobertos.
- Ferramentas principais receberam nomes mais claros e consistentes, incluindo órbitas, simulação temporal, áudio, ajuda e inspeção detalhada.
- Instalador recria os atalhos com o executável instalado como fonte do ícone; o AppUserModelID continua definido pelo Electron.

## 6.39.8 — 2026-09-29

- Atalhos NSIS são recriados usando o executável instalado como destino e fonte de ícone, sem regravar o AppUserModelID do link.
- O AppUserModelID permanece definido pelo processo Electron; isso evita a localização de ícone inválida observada após a gravação pelo plugin de atalhos.

## 6.39.7 — 2026-09-29

- Atalhos instalados agora usam o executável dentro da pasta de instalação como fonte do ícone.
- Instalador recria os atalhos da Área de Trabalho e Menu Iniciar e reaplica o AppUserModelID em atualizações.
- Corrigida referência encontrada no atalho instalado que apontava para `logo_atom.ico` dentro da pasta de desenvolvimento.

## 6.39.6 — 2026-09-29

- Instalador NSIS e versão portátil agora usam nomes de arquivo diferentes para evitar sobrescrita e instalação do artefato errado.
- Atalho da área de trabalho continua configurado para ser recriado durante reinstalações.
- Auditoria da distribuição Windows confirmou o ícone multirresolução no executável e no instalador.

## 6.39.5 — 2026-09-29

- Ícone Windows continua incorporado diretamente ao executável do app após o empacotamento.
- Atalho da área de trabalho é recriado em reinstalações para receber o ícone atualizado.
- O ícone do executável empacotado foi conferido separadamente do ícone do instalador.

## 6.39.4 — 2026-09-29

- Recurso de ícone incorporado diretamente ao executável Windows durante a etapa de empacotamento.
- Logo do app e dos atalhos ganhou cantos arredondados e contorno cinza-claro.
- Caudas voltaram a partículas de pontos sem shaders personalizados: 208 pontos por cometa em um único lote, com atualização simples e sem alocações por partícula.
- Movimento das partículas limitado pelo tempo real do quadro; cauda reduzida e o núcleo e a coma preservados.

## 6.39.3 — 2026-09-29

- Logo ampliada e ajustada ao quadro do launcher sem cortar a arte.
- Ícone Windows gerado a partir da logo e aplicado ao executável, janelas, instalador, desinstalador e atalhos do app instalado.
- Pixels das caudas dos cometas agora fluem suavemente; o comprimento aparente foi reduzido e continua discretamente visível à distância.
- Núcleo e coma dos cometas foram preservados.

## 6.39.2 — 2026-09-29

- Caudas dos cometas voltaram ao estilo de partículas luminosas, agora renderizadas em nuvens compactas de pontos na GPU.
- As cores da poeira e dos íons seguem as paletas associadas às observações de cada cometa.
- Núcleos, coma, limite de tamanho aparente e ocultação à distância foram preservados.

## 6.39.1 — 2026-09-29

- Caudas dos cometas agora têm limite de tamanho aparente ao aproximar a câmera e diminuem com a distância.
- Caudas pequenas demais para serem percebidas ou fora do enquadramento deixam de ser desenhadas; núcleo e coma permanecem visíveis.
- O comportamento compartilhado foi aplicado à cena principal e à tela de inspeção dedicada.

## 6.39.0 — 2026-09-29

- Caudas dos cometas substituídas por fitas procedurais em shader, removendo a atualização de nuvens de partículas a cada quadro.
- Gradientes contínuos agora separam a cauda larga e quente de poeira da cauda estreita e azul de íons.
- Paletas visuais específicas foram associadas às aparições históricas de Halley, Hale-Bopp e Hyakutake; Borrelly usa uma interpretação discreta porque as imagens próximas disponíveis são monocromáticas ou em falsa cor.

## 6.38.0 — 2026-09-29

- Logo do launcher ajustada para mostrar o PNG inteiro sem cortes.
- Cometas redesenhados com núcleos irregulares, coma luminosa e duas caudas animadas: poeira curva e íons azulados.
- As caudas agora apontam para longe do Sol; a de poeira também se curva em relação ao movimento orbital.
- O visual de cometa foi compartilhado entre a cena principal e a inspeção dedicada.

## 6.37.0 — 2026-09-29

- Logo atual aplicada aos favicons, ao launcher e às janelas do aplicativo.
- Interface harmonizada com o tema grafite e âmbar da tela dedicada.
- Controles de afastar e aproximar organizados e player de áudio centralizado no rodapé.
- Painel temporal redesenhado, preservando os passos anuais, a comparação animada e o retorno ao presente.
- Iluminação dos cinturões de asteroides e de Kuiper reforçada sem substituir as texturas.
- Iluminação do Sol compartilhada entre as visualizações e rastros orbitais orientados para o trajeto percorrido.

## 6.36.1

- Ajustes nos imports e módulos para corrigir a abertura do executável distribuído.

## 6.36.0

- Labels clicáveis e seletor de satélites na visualização dedicada.
- Troca de satélite dentro da mesma janela de inspeção.
