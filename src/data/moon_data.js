// moon_data.js
export const moonData = [
    // Luas da Terra
    {
        name: 'Lua',
        parentPlanet: 'Terra',
        size: 3474, // Diâmetro em km
        albedo: 0.11,
        texturePath: 'assets/textures/2k_moon.jpg', // Ok
        position: 384400, // Distância em km (Semi-eixo maior aproximado, 'a')
        // Rotação: 27.32 dias (Síncrona)
        rotationSpeed: 0.00003,
        // Órbita: 27.32 dias (Fator ajustado para órbita proporcional)
        orbitSpeed: 0.00003,
        inclination: 5.1,
        eccentricity: 0.0549, // Adicionado
        info: {
            "Tipo": "Satélite Natural",
            "Diâmetro": "3.474 km",
            "Massa": "7.342 × 10²² kg",
            "Distância ao planeta": "384.400 km",
            "Período orbital": "27,3 dias",
            "Excentricidade orbital": 0.0549
        }
    },
    // Luas de Marte
    {
        name: 'Fobos',
        parentPlanet: 'Marte',
        size: 22.2,
        albedo: 0.071,
        texturePath: 'assets/textures/phobos_texture.jpg', // Ok
        position: 9377,
        // Rotação: 0.31 dias (Síncrona)
        rotationSpeed: 0.0005,
        // Órbita: 0.31 dias
        orbitSpeed: 0.0005,
        inclination: 1.08,
        eccentricity: 0.0151, // Adicionado
        info: {
            "Tipo": "Satélite Natural",
            "Diâmetro": "22.2 km (média)",
            "Massa": "1.0659 × 10¹⁶ kg",
            "Distância ao planeta": "9.377 km",
            "Período orbital": "0,31 dias",
            "Particularidades": "Irregular, com crateras profundas",
            "Excentricidade orbital": 0.0151
        }
    },
    {
        name: 'Deimos',
        parentPlanet: 'Marte',
        size: 12.4,
        albedo: 0.068,
        texturePath: 'assets/textures/deimos_texture.jpg', // Ok
        position: 23460,
        // Rotação: 1.26 dias (Síncrona)
        rotationSpeed: 0.00013,
        // Órbita: 1.26 dias
        orbitSpeed: 0.00013,
        inclination: 0.93,
        eccentricity: 0.0002, // Adicionado (quase circular)
        info: {
            "Tipo": "Satélite Natural",
            "Diâmetro": "12.4 km (média)",
            "Massa": "1.4762 × 10¹⁵ kg",
            "Distância ao planeta": "23.460 km",
            "Período orbital": "1,26 dias",
            "Particularidades": "Irregular, a menor lua de Marte",
            "Excentricidade orbital": 0.0002
        }
    },
    // Luas de Júpiter
    {
        name: 'Io',
        parentPlanet: 'Júpiter',
        size: 3643,
        albedo: 0.63,
        texturePath: 'assets/textures/2k_io.jpg', // Ok
        position: 421700,
        // Rotação: 1.77 dias (Síncrona)
        rotationSpeed: 0.0001,
        // Órbita: 1.77 dias
        orbitSpeed: 0.0001,
        inclination: 0.04,
        eccentricity: 0.0041, // Adicionado
        info: {
            "Tipo": "Satélite Natural",
            "Diâmetro": "3.643 km",
            "Massa": "8.9319 × 10²² kg",
            "Distância ao planeta": "421.700 km",
            "Período orbital": "1,77 dias",
            "Particularidades": "Mais vulcânica do Sistema Solar",
            "Excentricidade orbital": 0.0041
        }
    },
    {
        name: 'Europa',
        parentPlanet: 'Júpiter',
        size: 3121,
        albedo: 0.67,
        texturePath: 'assets/textures/2k_europa.jpg', // Ok
        position: 671034,
        // Rotação: 3.55 dias (Síncrona)
        rotationSpeed: 0.00005,
        // Órbita: 3.55 dias
        orbitSpeed: 0.00005,
        inclination: 0.47,
        eccentricity: 0.009, // Adicionado
        info: {
            "Tipo": "Satélite Natural",
            "Diâmetro": "3.121 km",
            "Massa": "4.7998 × 10²² kg",
            "Distância ao planeta": "671.034 km",
            "Período orbital": "3,55 dias",
            "Particularidades": "Candidata a ter um oceano subterrâneo",
            "Excentricidade orbital": 0.009
        }
    },
    {
        name: 'Ganimedes',
        parentPlanet: 'Júpiter',
        size: 5268,
        albedo: 0.43,
        texturePath: 'assets/textures/2k_ganymede.jpg', // Ok
        position: 1070400,
        // Rotação: 7.15 dias (Síncrona)
        rotationSpeed: 0.000025,
        // Órbita: 7.15 dias
        orbitSpeed: 0.000025,
        inclination: 0.32,
        eccentricity: 0.0013, // Adicionado
        info: {
            "Tipo": "Satélite Natural",
            "Diâmetro": "5.268 km",
            "Massa": "1.4819 × 10²³ kg",
            "Distância ao planeta": "1.070.400 km",
            "Período orbital": "7,15 dias",
            "Particularidades": "Maior lua do Sistema Solar",
            "Excentricidade orbital": 0.0013
        }
    },
    {
        name: 'Calisto',
        parentPlanet: 'Júpiter',
        size: 4821,
        albedo: 0.17,
        texturePath: 'assets/textures/2k_callisto.jpg', // Ok
        position: 1882700,
        // Rotação: 16.69 dias (Síncrona)
        rotationSpeed: 0.00001,
        // Órbita: 16.69 dias
        orbitSpeed: 0.00001,
        inclination: 0.2,
        eccentricity: 0.0074, // Adicionado
        info: {
            "Tipo": "Satélite Natural",
            "Diâmetro": "4.821 km",
            "Massa": "1.0759 × 10²³ kg",
            "Distância ao planeta": "1.882.700 km",
            "Período orbital": "16,7 dias",
            "Particularidades": "Superfície mais craterada do Sistema Solar",
            "Excentricidade orbital": 0.0074
        }
    },
    // Luas de Saturno (adicionadas)
    {
        name: 'Titã',
        parentPlanet: 'Saturno',
        size: 5150,
        albedo: 0.22,
        texturePath: 'assets/textures/2k_titan.jpg', // Ok
        position: 1221870,
        // Rotação: 15.94 dias (Síncrona)
        rotationSpeed: 0.000011,
        // Órbita: 15.94 dias
        orbitSpeed: 0.000011,
        inclination: 0.33,
        eccentricity: 0.0288, // Adicionado
        info: {
            "Tipo": "Satélite Natural",
            "Diâmetro": "5.150 km",
            "Massa": "1.3452 × 10²³ kg",
            "Distância ao planeta": "1.221.870 km",
            "Período orbital": "15,9 dias",
            "Particularidades": "Única lua com atmosfera densa, rios e lagos de metano",
            "Excentricidade orbital": 0.0288
        }
    },
    {
        name: 'Reia',
        parentPlanet: 'Saturno',
        size: 1528,
        albedo: 0.60,
        texturePath: 'assets/textures/rhea_texture.jpg', // Ok
        position: 527040,
        // Rotação: 4.52 dias (Síncrona)
        rotationSpeed: 0.000038,
        // Órbita: 4.52 dias
        orbitSpeed: 0.000038,
        inclination: 0.345,
        eccentricity: 0.0009, // Adicionado
        info: {
            "Tipo": "Satélite Natural",
            "Diâmetro": "1.528 km",
            "Massa": "2.306518 × 10²¹ kg",
            "Distância ao planeta": "527.040 km",
            "Período orbital": "4,52 dias",
            "Excentricidade orbital": 0.0009
        }
    },
    {
        name: 'Iapeto',
        parentPlanet: 'Saturno',
        size: 1470,
        albedo: 0.16,
        texturePath: 'assets/textures/iapetus_texture.jpg', // Ok
        position: 3561300,
        // Rotação: 79.33 dias (Síncrona)
        rotationSpeed: 0.0000021,
        // Órbita: 79.33 dias
        orbitSpeed: 0.0000021,
        inclination: 14.72,
        eccentricity: 0.0283, // Adicionado (relativamente alto)
        info: {
            "Tipo": "Satélite Natural",
            "Diâmetro": "1.470 km",
            "Massa": "1.805635 × 10²¹ kg",
            "Distância ao planeta": "3.561.300 km",
            "Período orbital": "79,33 dias",
            "Excentricidade orbital": 0.0283
        }
    },
    // Luas de Urano (adicionadas)
    {
        name: 'Titânia',
        parentPlanet: 'Urano',
        size: 1578,
        albedo: 0.27,
        texturePath: 'assets/textures/titania_texture.jpg',  // Ok
        iconPath: 'assets/icons/titania_icon.jpg', // Ok
        position: 436300,
        // Rotação: 8.71 dias (Síncrona)
        rotationSpeed: 0.00002,
        // Órbita: 8.71 dias
        orbitSpeed: 0.00002,
        inclination: 0.08,
        eccentricity: 0.0011, // Adicionado
        info: {
            "Tipo": "Satélite Natural",
            "Diâmetro": "1.578 km",
            "Massa": "3.42 ± 0.35 × 10²¹ kg",
            "Distância ao planeta": "436.300 km",
            "Período orbital": "8,7 dias",
            "Excentricidade orbital": 0.0011
        }
    },
    // Luas de Netuno (adicionadas)
    {
        name: 'Tritão',
        parentPlanet: 'Netuno',
        size: 2707,
        albedo: 0.76,
        texturePath: 'assets/textures/triton_texture.jpg', // Ok
        position: 354800,
        // Rotação: 5.87 dias (Síncrona, mas com órbita retrógrada!)
        rotationSpeed: 0.00003,
        // Órbita: 5.87 dias
        orbitSpeed: 0.00003,
        inclination: 157, // Inclinação retrógrada significativa
        eccentricity: 0.000016, // Adicionado (quase circular)
        info: {
            "Tipo": "Satélite Natural",
            "Diâmetro": "2.707 km",
            "Massa": "2.14 × 10²² kg",
            "Distância ao planeta": "354.800 km",
            "Período orbital": "5,87 dias",
            "Particularidades": "Órbita retrógrada, atmosfera tênue",
            "Excentricidade orbital": 0.000016
        }
    }
];