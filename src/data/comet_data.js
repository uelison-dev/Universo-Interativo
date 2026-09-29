// comet_data.js
export const cometData = [
  {
    name: 'Halley',
    designation: '1P/Halley',
    type: 'Cometa Periódico',
    iconPath: 'assets/icons/halley.jpg',
    a: 17.834,
    q: 0.587,
    Q: 35.2,
    e: 0.967,
    i: 162.26,
    period: 75.32, // Período orbital em anos
    visual: { dust: 0xf2dfb9, ion: 0x75baff, coma: 0x9bd7e8, core: 0xfff4d9 }, // Paleta da aparição de 1986
    location: 'Interior do Sistema Solar',
    info: {
      Descoberta: 'Conhecido desde a antiguidade',
      'Última aparição': '1986',
      'Próxima aparição': '2061'
    }
  },
  {
    name: 'Hale-Bopp',
    designation: 'C/1995 O1',
    type: 'Cometa de Longo Período',
    iconPath: 'assets/icons/hale-bopp.jpg',
    a: 180.79,
    q: 0.914,
    Q: 360.67,
    e: 0.995,
    i: 89.4,
    period: 2533,
    visual: { dust: 0xffe9c5, ion: 0x4a8fff, coma: 0x9fe6a2, core: 0xffffff }, // Paleta da aparição de 1997
    location: 'Nuvem de Oort',
    info: {
      Descoberta: '1995',
      'Última aparição': '1997',
      'Próxima aparição': '~4385'
    }
  },
  {
    name: 'Borrelly',
    designation: '19P/Borrelly',
    type: 'Cometa da Família de Júpiter',
    iconPath: 'assets/icons/borrelly.jpg',
    a: 3.652,
    q: 1.358,
    Q: 5.945,
    e: 0.628,
    i: 30.5,
    period: 6.85,
    visual: { dust: 0xdac9ad, ion: 0x93bada, coma: 0xb9d6d5, core: 0xf7ead3 }, // Referência de 2001 em tons neutros: imagens monocromáticas/falsa cor
    location: 'Cinturão de Asteroides/Júpiter',
    info: {
      Descoberta: '1904',
      'Última aparição': '2022',
      'Próxima aparição': '2028'
    }
  },
  {
    name: 'Hyakutake',
    designation: 'C/1996 B2',
    type: 'Cometa de Longo Período',
    iconPath: 'assets/icons/hyakutake.jpg',
    a: 1100,
    q: 0.23,
    Q: 2200,
    e: 0.999,
    i: 124.9,
    period: 70000,
    visual: { dust: 0xe7a56b, ion: 0x55b8ff, coma: 0x91e5f6, core: 0xffefd8 }, // Paleta da aparição de 1996
    location: 'Nuvem de Oort',
    info: {
      Descoberta: '1996',
      'Última aparição': '1996',
      'Próxima aparição': '~72000'
    }
  }
];
