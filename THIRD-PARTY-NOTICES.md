# THIRD-PARTY-NOTICES

Este arquivo registra recursos de terceiros utilizados no projeto **Universo Interativo**.

Os recursos listados aqui não são abrangidos pela licença proprietária do código e dos materiais originais do projeto e permanecem sujeitos às suas respectivas licenças e termos de uso.

---

## 1. Solar System Scope — Solar Textures

Algumas texturas planetárias e/ou espaciais utilizadas no projeto foram obtidas do:

**Solar System Scope — Solar Textures**

Fonte:

https://www.solarsystemscope.com/textures/

O Solar System Scope informa que as texturas disponibilizadas nessa coleção são distribuídas sob a licença:

**Creative Commons Attribution 4.0 International (CC BY 4.0)**

Licença:

https://creativecommons.org/licenses/by/4.0/

A licença permite copiar, adaptar e compartilhar o material, inclusive para fins comerciais, desde que sejam cumpridas as condições de atribuição previstas pela licença.

As texturas utilizadas no projeto permanecem sujeitas à licença CC BY 4.0 e não passam a ser abrangidas pela licença proprietária do Universo Interativo.

### Atribuição

**Solar System Scope — Solar Textures**

https://www.solarsystemscope.com/textures/

**Licença:** Creative Commons Attribution 4.0 International (CC BY 4.0)

https://creativecommons.org/licenses/by/4.0/

---

## 2. Imagens geradas com Google Gemini

Algumas imagens e elementos visuais utilizados no projeto foram gerados com auxílio do **Google Gemini**, a partir de prompts desenvolvidos durante a criação do Universo Interativo.

Fonte:

https://gemini.google.com/

O uso, publicação, distribuição ou eventual comercialização de conteúdo gerado com auxílio do Gemini deve observar os termos aplicáveis ao serviço utilizado, bem como a legislação e os direitos de terceiros eventualmente envolvidos no conteúdo gerado.

Os Termos de Serviço do Google informam que, em serviços que permitem a geração de conteúdo original, o Google não reivindica a propriedade desse conteúdo. Isso, entretanto, não significa que todo conteúdo gerado esteja automaticamente livre de direitos de terceiros ou que qualquer elemento representado na imagem possa ser utilizado sem restrições.

Termos do Google:

https://policies.google.com/terms

Informações sobre geração e edição de imagens no Gemini:

https://support.google.com/gemini/answer/14286560

### Observação sobre procedência

Imagens geradas ou editadas por ferramentas do Google podem conter mecanismos de procedência e identificação, incluindo **SynthID** e **Content Credentials (C2PA)**.

A presença desses mecanismos não altera, por si só, as demais obrigações relacionadas aos direitos autorais, marcas, propriedade intelectual ou outros direitos de terceiros.

---

## 3. Outras dependências e recursos

O projeto também utiliza bibliotecas, frameworks e outros componentes de terceiros.

Esses componentes permanecem sujeitos às suas respectivas licenças e termos de uso e não são abrangidos pela licença proprietária do código original do Universo Interativo.

Entre os componentes utilizados no projeto estão, conforme aplicável:

- **Three.js**
- **satellite.js** — propagação orbital SGP4/SDP4 a partir de elementos TLE/OMM; licença MIT.
- **Electron**
- **Express**
- **Solar System Scope — Solar Textures**
- **Google Gemini**, utilizado na geração de determinados recursos visuais

As licenças e termos específicos de cada dependência devem ser considerados separadamente.

Para bibliotecas e pacotes instalados por meio do npm, consulte também o `package.json`, o `package-lock.json` e os respectivos arquivos de licença distribuídos com cada dependência.

### Dados orbitais

Quando a camada de satélites artificiais é ativada na inspeção dedicada da Terra, o aplicativo consulta os elementos GP/OMM do grupo ACTIVE publicados pelo [CelesTrak](https://celestrak.org/NORAD/elements/). A coleta é armazenada em cache local e segue a [política de uso do CelesTrak](https://celestrak.org/usage-policy.php). As posições exibidas são cálculos estimados a partir dos elementos orbitais, não telemetria em tempo real.

---

## 4. Separação entre materiais proprietários e materiais de terceiros

A licença proprietária do **Universo Interativo** aplica-se somente ao código-fonte e aos materiais originais sobre os quais o titular do projeto possui os direitos correspondentes.

Materiais de terceiros, incluindo texturas, imagens, bibliotecas, frameworks, fontes, ícones, modelos e outros recursos, permanecem sujeitos às suas próprias licenças e condições de uso.

Nenhuma disposição da licença proprietária do projeto deve ser interpretada como uma tentativa de relicenciar, restringir ou alterar os direitos concedidos pelos respectivos titulares de materiais de terceiros.

---

## 5. Responsabilidade pelo uso dos materiais

A utilização de materiais de terceiros deve respeitar as condições das respectivas licenças e os direitos aplicáveis.

Em particular:

- materiais licenciados sob **CC BY 4.0** devem manter a atribuição exigida pela licença;
- conteúdo gerado por ferramentas de inteligência artificial deve ser utilizado de acordo com os termos aplicáveis ao serviço utilizado;
- elementos de terceiros presentes em conteúdo gerado, como personagens, marcas, obras ou outros materiais protegidos, podem estar sujeitos a direitos adicionais;
- a licença proprietária do Universo Interativo não se estende a materiais que não sejam de propriedade ou controle do titular do projeto.

---

## 6. Fontes principais

**Solar System Scope — Solar Textures**

https://www.solarsystemscope.com/textures/

**Creative Commons — Attribution 4.0 International**

https://creativecommons.org/licenses/by/4.0/

**Google — Termos de Serviço**

https://policies.google.com/terms

**Google Gemini**

https://gemini.google.com/

**Google Gemini — Informações sobre geração de imagens**

https://support.google.com/gemini/answer/14286560

---

## 7. Fontes orbitais e critérios de classificação

### Dados de entrada

Os elementos Orbit Mean-Elements Message (OMM) usados na camada são publicados pelo [CelesTrak](https://celestrak.org/NORAD/elements/). O formato e os campos GP/OMM estão descritos na [documentação GP/OMM do CelesTrak](https://celestrak.org/NORAD/documentation/gp-data-formats.php), e a coleta segue a [política de uso do CelesTrak](https://celestrak.org/usage-policy.php). O OMM não fornece um rótulo oficial de geração ou shell para cada Starlink.

### Referências científicas

- A [Agência Espacial Europeia (ESA), Types of orbits](https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits), descreve LEO como órbita abaixo de 2.000 km e apresenta órbitas polares tipicamente entre 200 e 1.000 km, admitindo desvio de até 10° dos polos.
- A [NASA Earth Observatory, Catalog of Earth Satellite Orbits](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/), descreve altitude, excentricidade e inclinação como parâmetros que determinam a geometria orbital e define a inclinação em relação ao equador.
- A estimativa de altitude nominal por movimento médio usa o modelo SGP4 e as constantes WGS-72 fornecidas por [satellite.js](https://github.com/shashwatak/satellite-js), dependência licenciada sob MIT.

### Método e limites

Para uma órbita aproximadamente circular, a altitude nominal é estimada por `h = (μ / n²)^(1/3) − Rₑ`, usando `n = MEAN_MOTION × 2π / 86400`, `μ = 398600,8 km³/s²` e `Rₑ = 6378,135 km` (constantes WGS-72 do satellite.js). Esse valor derivado do movimento médio não é a altitude instantânea nem substitui uma avaliação osculante completa.

As sete faixas de inclinação/altitude são: `40–50° / 300–400 km`, `40–50° / 400–500 km`, `50–60° / 300–400 km`, `50–60° / 400–500 km`, `60–70° / 500–600 km`, `70–80° / 400–500 km` e `70–80° / 500–600 km`; cada intervalo inclui o limite inferior e exclui o superior. A classe polar usa `80–100°` e `200–1000 km`, conforme a faixa típica descrita pela ESA. Os intervalos foram escolhidos a partir dos agrupamentos encontrados no catálogo ACTIVE em 2026-10-06; são uma classificação visual própria e podem variar com novas posições ou mudanças na população ativa. A classe polar não afirma sincronismo solar: SSO exige verificar também a precessão do plano orbital. As faixas não são designações oficiais da SpaceX.

O site [satellitemap.space](https://satellitemap.space/) foi consultado somente como referência comparativa fornecida para a interface. O projeto não reutiliza seu código, imagens, dados, paleta ou rótulos de shell, e não declara afiliação com o serviço. A referência não é fonte dos dados orbitais nem concede licença para reutilizar materiais do site.

---

© 2026 Uelison Ferreira. Todos os direitos reservados para os materiais originais do projeto.
