// black_hole_data.js

// Constantes físicas para cálculo:
// Raio de Schwarzschild (Rs) para 1 Massa Solar (M☉) é de ~2.95 km.
const RS_PER_SOLAR_MASS_KM = 2.95;

/**
 * Converte distância em Anos-Luz (AL) para Unidades de Cena (UC).
 * A escala é baseada na distância do Sol para o limite do Sistema Solar/Galáxia
 * definida em app.js.
 * Usaremos uma escala onde 1 Ano-Luz (AL) = 500 unidades de cena (UC)
 */
const _AU_TO_AL = 63241.077; // 1 AL em UA
const _SYSTEM_SCALE_FACTOR = 3011 / 30.11; // Fator de escala do sistema solar (Netuno)

// NOVO FATOR DE ESCALA GALÁCTICA:
const SCENE_UNITS_PER_LIGHT_YEAR = 500;

export const blackHoleData = [
  {
    name: 'Gaia BH1',
    type: 'Buraco Negro Estelar',
    massSolar: 9.62, // Massa em M☉ (Massas Solares)
    distanceLY: 1560, // Distância em Anos-Luz (AL)
    // Raio de Schwarzschild (Rs) em km = Massa em M☉ * 2.95 km
    // Tamanho na cena (Mesh) é apenas representacional. Usaremos 1000 UC
    sceneSize: 1000,
    // Posição: (X, Y, Z) na Galáxia em Unidades de Cena (UC)
    // Multiplica a distância em AL pelo fator de escala da cena
    position: {
      x: 1560 * SCENE_UNITS_PER_LIGHT_YEAR * 0.7,
      y: 1560 * SCENE_UNITS_PER_LIGHT_YEAR * 0.1, // Elevado
      z: 1560 * SCENE_UNITS_PER_LIGHT_YEAR * 0.7
    },
    info: {
      Tipo: 'Buraco Negro Estelar Binário',
      'Massa em M☉': '9.62 ± 0.18 M☉',
      'Raio de Schwarzschild (km)': (9.62 * RS_PER_SOLAR_MASS_KM).toFixed(2) + ' km',
      'Distância (Anos-Luz)': '1560 ± 10 AL',
      Companheira: 'Estrela do tipo G (0.93 M☉)',
      'Período Orbital (dias)': '185.59 dias',
      Status: 'Dormente'
    }
  },
  {
    name: 'Gaia BH2',
    type: 'Buraco Negro Estelar',
    massSolar: 8.9, // Estimativa, dados são menos precisos que BH1 e BH3
    distanceLY: 3800, // Estimativa aproximada de distância
    sceneSize: 1000,
    position: {
      x: -3800 * SCENE_UNITS_PER_LIGHT_YEAR * 0.5,
      y: -3800 * SCENE_UNITS_PER_LIGHT_YEAR * 0.2,
      z: 3800 * SCENE_UNITS_PER_LIGHT_YEAR * 0.8
    },
    info: {
      Tipo: 'Buraco Negro Estelar Binário',
      'Massa em M☉': '8.9 ± 0.6 M☉ (estimado)',
      'Raio de Schwarzschild (km)': (8.9 * RS_PER_SOLAR_MASS_KM).toFixed(2) + ' km',
      'Distância (Anos-Luz)': '3800 AL (aproximado)',
      Companheira: 'Estrela Gigante Vermelha',
      'Período Orbital (dias)': '1000 a 1200 dias (aproximado)',
      Status: 'Dormente'
    }
  },
  {
    name: 'Gaia BH3',
    type: 'Buraco Negro Estelar',
    massSolar: 32.7, // Massa em M☉
    distanceLY: 1920, // Distância em Anos-Luz (AL)
    sceneSize: 1000,
    position: {
      x: 1920 * SCENE_UNITS_PER_LIGHT_YEAR * 0.8,
      y: 1920 * SCENE_UNITS_PER_LIGHT_YEAR * 0.3,
      z: -1920 * SCENE_UNITS_PER_LIGHT_YEAR * 0.5
    },
    info: {
      Tipo: 'Buraco Negro Estelar (O mais massivo da Via Láctea conhecido por Gaia)',
      'Massa em M☉': '32.7 ± 0.7 M☉',
      'Raio de Schwarzschild (km)': (32.7 * RS_PER_SOLAR_MASS_KM).toFixed(2) + ' km',
      'Distância (Anos-Luz)': '1920 AL',
      Companheira: 'Estrela subgigante pobre em metais',
      Status: 'Dormente'
    }
  },
  // --- NOVO: Sagittarius A* (Centro Galáctico) ---
  {
    name: 'Sagittarius A*',
    type: 'Buraco Negro Supermassivo',
    massSolar: 4100000, // Aproximadamente 4.1 milhões M☉
    distanceLY: 26670, // Distância do Sol ao Centro
    sceneSize: 50000, // Tamanho visual ajustado para a escala da galáxia
    // Posição (0, 0, 0) para que o `app.js` calcule o offset
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    isGalacticCenter: true, // Flag para identificar o centro
    info: {
      Tipo: 'Buraco Negro Supermassivo',
      'Massa em M☉': '~4.1 milhões M☉',
      'Raio de Schwarzschild (km)': '12 milhões km',
      'Distância (Anos-Luz)': '26.670 AL',
      Status: 'Centro da Via Láctea'
    }
  }
];

// O fator de escala galáctica para converter a distância real em AL para unidades de cena (UC)
export const GALACTIC_SCALE_FACTOR = SCENE_UNITS_PER_LIGHT_YEAR;
