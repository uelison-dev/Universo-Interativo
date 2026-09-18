export const celestialData = [
    {
        name: 'Sol',
        size: 15,
        texturePath: 'assets/textures/8k_sun.jpg', // Corrigido: Removida a barra inicial
        iconPath: 'assets/icons/sol.jpg', // Corrigido
        positionX: 0,
        // Rotação: ~25.05 dias. Velocidade ajustada para Mercúrio ter a órbita mais rápida.
        rotationSpeed: 0.00018, 
        orbitSpeed: 0, // O sol não orbita o centro da cena
        info: {
            "Tipo": "Estrela (Anã Amarela)",
            "Idade": "4.6 Bilhões de anos",
            "Diâmetro": "1.392.700 km",
            "Massa": "1.989 × 10³⁰ kg",
            "Temperatura da Superfície": "5.500 °C",
            "Composição Principal": "Hidrogênio e Hélio"
        }
    },
    {
        name: 'Mercúrio',
        size: 0.2,
        albedo: 0.088,
        texturePath: 'assets/textures/2k_mercury.jpg', // Corrigido
        iconPath: 'assets/icons/mercurio.jpg', // Corrigido
        positionX: 38.7,
        // Rotação: 58.65 dias (LENTO) -> Fator: 0.0005 * (1 dia / 58.65 dias)
        rotationSpeed: 0.0000085, 
        // Órbita: 87.97 dias (RÁPIDO) -> Fator: 0.004 * (365.26 / 87.97) = ~0.016
        orbitSpeed: 0.0166,
        info: {
            "Tipo": "Planeta Terrestre",
            "Idade": "4.6 Bilhões de anos",
            "Diâmetro": "4.879 km",
            "Massa": "3.285 × 10²³ kg",
            "Temperatura da Superfície": "167 °C (média)",
            "Composição Principal": "Ferro e Silicatos",
            "Ressonância orbital com Netuno": "3:2",
            "Distância orbital média (UA)": 0.387,
            "Periélio (UA)": 0.307,
            "Afélio (UA)": 0.467,
            "Excentricidade orbital": 0.205,
            "Inclinação orbital em graus": 7.00,
            "Magnitude absoluta": -0.61
        }
    },
    {
        name: 'Vênus',
        size: 0.5,
        albedo: 0.76,
        texturePath: 'assets/textures/2k_venus_surface.jpg', // Corrigido
        iconPath: 'assets/icons/venus.jpg', // Corrigido
        positionX: 72.3,
        // Rotação: 243.02 dias (MUITO LENTO, RETRÓGRADA) -> NEGATIVO!
        rotationSpeed: -0.000002, 
        // Órbita: 224.7 dias
        orbitSpeed: 0.0065,
        info: {
            "Tipo": "Planeta Terrestre",
            "Idade": "4.6 Bilhões de anos",
            "Diâmetro": "12.104 km",
            "Massa": "4.867 × 10²⁴ kg",
            "Temperatura da Superfície": "462 °C (média)",
            "Composição Principal": "Silicatos e Dióxido de Carbono",
            "Ressonância orbital com Netuno": "Sem ressonância",
            "Distância orbital média (UA)": 0.723,
            "Periélio (UA)": 0.718,
            "Afélio (UA)": 0.728,
            "Excentricidade orbital": 0.007,
            "Inclinação orbital em graus": 3.39,
            "Magnitude absoluta": -4.4
        }
    },
    {
        name: 'Terra',
        size: 0.5,
        albedo: 0.306,
        texturePath: 'assets/textures/2k_earth_daymap.jpg', // Corrigido
        iconPath: 'assets/icons/terra.jpg', // Corrigido
        positionX: 100,
        // Rotação: 0.997 dias (RÁPIDO) -> Fator base para planetas internos
        rotationSpeed: 0.0003,
        // Órbita: 365.26 dias (BASE)
        orbitSpeed: 0.004,
        info: {
            "Tipo": "Planeta Terrestre",
            "Idade": "4.6 Bilhões de anos",
            "Diâmetro": "12.742 km",
            "Massa": "5.972 × 10²⁴ kg",
            "Temperatura da Superfície": "15 °C (média)",
            "Composição Principal": "Nitrogênio e Oxigênio",
            "Ressonância orbital com Netuno": "Sem ressonância",
            "Distância orbital média (UA)": 1.000,
            "Periélio (UA)": 0.983,
            "Afélio (UA)": 1.017,
            "Excentricidade orbital": 0.0167,
            "Inclinação orbital em graus": 0.00,
            "Magnitude absoluta": -3.99
        }
    },
    {
        name: 'Marte',
        size: 0.3,
        albedo: 0.25,
        texturePath: 'assets/textures/2k_mars.jpg', // Corrigido
        iconPath: 'assets/icons/marte.jpg', // Corrigido
        positionX: 152.4,
        // Rotação: 1.026 dias (SIMILAR À TERRA)
        rotationSpeed: 0.00029, 
        // Órbita: 686.98 dias
        orbitSpeed: 0.003,
        info: {
            "Tipo": "Planeta Terrestre",
            "Idade": "4.6 Bilhões de anos",
            "Diâmetro": "6.779 km",
            "Massa": "6.39 × 10²³ kg",
            "Temperatura da Superfície": "-63 °C (média)",
            "Composição Principal": "Silicatos e Dióxido de Carbono",
            "Ressonância orbital com Netuno": "Sem ressonância",
            "Distância orbital média (UA)": 1.524,
            "Periélio (UA)": 1.381,
            "Afélio (UA)": 1.666,
            "Excentricidade orbital": 0.0934,
            "Inclinação orbital em graus": 1.85,
            "Magnitude absoluta": -1.52
        }
    },
    {
        name: 'Júpiter',
        size: 5.5,
        albedo: 0.50,
        texturePath: 'assets/textures/2k_jupiter.jpg', // Corrigido
        iconPath: 'assets/icons/jupiter.jpg', // Corrigido
        positionX: 520.4,
        // Rotação: 0.41 dias (MUITO RÁPIDA) -> Fator: 0.0001 * (1 / 0.41) * 3 = ~0.00075
        rotationSpeed: 0.00075,
        // Órbita: 11.86 anos
        orbitSpeed: 0.00045,
        info: {
            "Tipo": "Gigante Gasoso",
            "Idade": "4.6 Bilhões de anos",
            "Diâmetro": "139.820 km",
            "Massa": "1.898 × 10²⁷ kg",
            "Temperatura da Superfície": "-145 °C (média)",
            "Composição Principal": "Hidrogênio e Hélio",
            "Ressonância orbital com Netuno": "Sem ressonância",
            "Distância orbital média (UA)": 5.204,
            "Periélio (UA)": 4.950,
            "Afélio (UA)": 5.458,
            "Excentricidade orbital": 0.0489,
            "Inclinação orbital em graus": 1.31,
            "Magnitude absoluta": -9.40
        }
    },
    {
        name: 'Saturno',
        size: 4.5,
        albedo: 0.34,
        texturePath: 'assets/textures/2k_saturn.jpg', // Corrigido
        iconPath: 'assets/icons/saturno.jpg', // Corrigido
        positionX: 958.2,
        // Rotação: 0.44 dias (MUITO RÁPIDA)
        rotationSpeed: 0.00069,
        // Órbita: 29.46 anos
        orbitSpeed: 0.00035,
        ring: {
            texturePath: 'assets/textures/saturn_ring.png', // Corrigido
            innerRadius: 5.5,
            outerRadius: 10
        },
        info: {
            "Tipo": "Gigante Gasoso",
            "Idade": "4.6 Bilhões de anos",
            "Diâmetro": "116.460 km",
            "Massa": "5.683 × 10²⁶ kg",
            "Temperatura da Superfície": "-178 °C (média)",
            "Composição Principal": "Hidrogênio e Hélio",
            "Ressonância orbital com Netuno": "Sem ressonância",
            "Distância orbital média (UA)": 9.582,
            "Periélio (UA)": 9.048,
            "Afélio (UA)": 10.124,
            "Excentricidade orbital": 0.0565,
            "Inclinação orbital em graus": 2.49,
            "Magnitude absoluta": -8.88
        }
    },
    {
        name: 'Urano',
        size: 3.5,
        albedo: 0.30,
        texturePath: 'assets/textures/2k_uranus.jpg', // Corrigido
        iconPath: 'assets/icons/urano.jpg', // Corrigido
        positionX: 1922.9,
        // Rotação: 0.718 dias (Média) -> NEGATIVO (rotação lateral)
        rotationSpeed: -0.00043,
        // Órbita: 84.01 anos
        orbitSpeed: 0.00015,
        info: {
            "Tipo": "Gigante de Gelo",
            "Idade": "4.6 Bilhões de anos",
            "Diâmetro": "50.724 km",
            "Massa": "8.681 × 10²⁵ kg",
            "Temperatura da Superfície": "-224 °C (média)",
            "Composição Principal": "Hidrogênio, Hélio e Metano",
            "Ressonância orbital com Netuno": "1:2",
            "Distância orbital média (UA)": 19.229,
            "Periélio (UA)": 18.330,
            "Afélio (UA)": 20.100,
            "Excentricidade orbital": 0.0464,
            "Inclinação orbital em graus": 0.77,
            "Magnitude absoluta": -7.19
        }
    },
    {
        name: 'Netuno',
        size: 3.5,
        albedo: 0.29,
        texturePath: 'assets/textures/2k_neptune.jpg', // Corrigido
        iconPath: 'assets/icons/neptuno.jpg', // Corrigido
        positionX: 3011,
        // Rotação: 0.671 dias (Média)
        rotationSpeed: 0.00045,
        // Órbita: 164.79 anos
        orbitSpeed: 0.0001,
        info: {
            "Tipo": "Gigante de Gelo",
            "Idade": "4.6 Bilhões de anos",
            "Diâmetro": "49.244 km",
            "Massa": "1.024 × 10²⁶ kg",
            "Temperatura da Superfície": "-201 °C (média)",
            "Composição Principal": "Hidrogênio, Hélio e Metano",
            "Ressonância orbital com Netuno": "N/A",
            "Distância orbital média (UA)": 30.110,
            "Periélio (UA)": 29.810,
            "Afélio (UA)": 30.410,
            "Excentricidade orbital": 0.0113,
            "Inclinação orbital em graus": 1.77,
            "Magnitude absoluta": -6.90
        }
    }
];