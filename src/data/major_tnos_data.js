export const majorTNOData = [
    // Planetas-anões e outros TNOs principais
    {
        name: 'Plutão',
        size: 0.5,
        albedo: 0.49,
        texturePath: 'assets/textures/pluto.jpg', // Ok
        iconPath: 'assets/icons/plutao.jpg',
        positionX: 5900,
        // Rotação: 6.387 dias (Lenta) -> 0.000045 ajustado
        rotationSpeed: 0.000045,
        // Órbita: 247.92 anos
        orbitSpeed: 0.000004,
        info: {
            "Tipo": "Planeta-anão",
            "Idade": "4.6 Bilhões de anos",
            "Diâmetro": "2.376,6 km",
            "Massa": "1,309 × 10²² kg",
            "Temperatura da Superfície": "-232 °C (média)",
            "Composição Principal": "Gelo de nitrogênio, metano e monóxido de carbono",
            "Ressonância orbital com Netuno": "3:2",
            "Distância orbital média (UA)": 39.5,
            "Periélio (UA)": 29.658,
            "Afélio (UA)": 49.305,
            "Excentricidade orbital": 0.2488,
            "Inclinação orbital em graus": 17.16,
            "Magnitude absoluta": -1.0
        },
        satellites: [
            {
                name: 'Caronte',
                size: 0.2,
                albedo: 0.36,
                texturePath: 'assets/textures/charon.jpg',  // Ok
                position: 19571,
                // Rotação: 6.387 dias (Síncrona)
                rotationSpeed: 0.000045,
                // Órbita: 6.387 dias
                orbitSpeed: 0.000045,
                info: {
                    "Tipo": "Lua de Plutão",
                    "Diâmetro": "1.212 km",
                    "Massa": "1.586 × 10²¹ kg",
                    "Distância ao planeta": "19.571 km",
                    "Período orbital": "6,387 dias"
                }
            },
            {
                name: 'Nix',
                size: 0.02,
                albedo: 0.5,
                texturePath: 'assets/textures/nix.jpg', // Ok
                position: 48694,
                // Rotação: 1.82 dias (ALTAMENTE CAÓTICA, usando proxy)
                rotationSpeed: 0.00015,
                // Órbita: 24.856 dias
                orbitSpeed: 0.000012,
                info: {
                    "Tipo": "Lua de Plutão",
                    "Diâmetro": "49,8 km",
                    "Massa": "4.5 × 10¹⁶ kg",
                    "Distância ao planeta": "48.694 km",
                    "Período orbital": "24,856 dias"
                }
            },
            {
                name: 'Hidra',
                size: 0.02,
                albedo: 0.5,
                texturePath: 'assets/textures/hydra.jpg', // Ok
                position: 64738,
                // Rotação: 10.33 dias (CAÓTICA, usando proxy)
                rotationSpeed: 0.00003,
                // Órbita: 38.206 dias
                orbitSpeed: 0.000008,
                info: {
                    "Tipo": "Lua de Plutão",
                    "Diâmetro": "50,9 km",
                    "Massa": "4.8 × 10¹⁶ kg",
                    "Distância ao planeta": "64.738 km",
                    "Período orbital": "38,206 dias"
                }
            },
            {
                name: 'Cérbero',
                size: 0.02,
                albedo: 0.5,
                texturePath: 'assets/textures/kerberos.jpg',
                position: 57783,
                // Rotação: 5.31 dias (CAÓTICA, usando proxy)
                rotationSpeed: 0.00006,
                // Órbita: 32.168 dias
                orbitSpeed: 0.000009,
                info: {
                    "Tipo": "Lua de Plutão",
                    "Diâmetro": "19 km",
                    "Massa": "1.65 × 10¹⁶ kg",
                    "Distância ao planeta": "57.783 km",
                    "Período orbital": "32,168 dias"
                }
            },
            {
                name: 'Estige',
                size: 0.02,
                albedo: 0.5,
                texturePath: 'assets/textures/styx.jpg',
                position: 42656,
                // Rotação: 3.24 dias (CAÓTICA, usando proxy)
                rotationSpeed: 0.00009,
                // Órbita: 20.161 dias
                orbitSpeed: 0.000015,
                info: {
                    "Tipo": "Lua de Plutão",
                    "Diâmetro": "16 km",
                    "Massa": "7.5 × 10¹⁵ kg",
                    "Distância ao planeta": "42.656 km",
                    "Período orbital": "20,161 dias"
                }
            }
        ]
    },
    {
        name: 'Éris',
        size: 0.48,
        albedo: 0.96,
        texturePath: 'assets/textures/eris.jpg', // Ok
        iconPath: 'assets/icons/eris.jpg',
        positionX: 6800,
        // Rotação: 11 dias
        rotationSpeed: 0.00002,
        // Órbita: 558 anos
        orbitSpeed: 0.0000003,
        info: {
            "Tipo": "Planeta-anão",
            "Diâmetro": "2.326 ± 12 km",
            "Massa": "1.647 × 10²² kg",
            "Temperatura da Superfície": "-243 °C (média)",
            "Composição Principal": "Gelo de metano, gelo de nitrogênio",
            "Excentricidade orbital": 0.434,
            "Inclinação orbital em graus": 43.9,
            "Distância orbital média (UA)": 68.0,
            "Período orbital (anos)": 558
        },
        satellites: [
            {
                name: 'Disnomia',
                size: 0.1,
                albedo: 0.04,
                texturePath: 'assets/textures/dysnomia.png', // Ok
                position: 37300,
                // Rotação: N/A (Síncrona assumida)
                rotationSpeed: 0.00001,
                // Órbita: 15.78 dias
                orbitSpeed: 0.00001,
                info: {
                    "Tipo": "Lua de Éris",
                    "Diâmetro": "700 ± 115 km",
                    "Massa": "3.5 × 10²⁰ kg",
                    "Distância ao planeta": "37.300 km",
                    "Período orbital": "15,78 dias"
                }
            }
        ]
    },
    {
        name: 'Makemake',
        size: 0.45,
        albedo: 0.81,
        texturePath: 'assets/textures/makemake.jpg', // Ok
        iconPath: 'assets/icons/makemake.jpg',
        positionX: 4500,
        // Rotação: 7.77 horas (MUITO RÁPIDA) -> Aumentado significativamente
        rotationSpeed: 0.0015,
        // Órbita: 309.88 anos
        orbitSpeed: 0.000006,
        info: {
            "Tipo": "Planeta-anão",
            "Diâmetro": "1.430 ± 9 km",
            "Massa": "~3.1 × 10²¹ kg",
            "Temperatura da Superfície": "-243 °C (média)",
            "Composição Principal": "Metano, etano, nitrogênio",
            "Excentricidade orbital": 0.163,
            "Inclinação orbital em graus": 29.0,
            "Distância orbital média (UA)": 45.3,
            "Período orbital (anos)": 305
        },
        satellites: [
            {
                name: 'MK2',
                size: 0.05,
                albedo: 0.04,
                texturePath: 'assets/textures/mk2.png', // Ok
                position: 21000,
                // Rotação: N/A (Síncrona assumida)
                rotationSpeed: 0.00003,
                // Órbita: 12.4 dias
                orbitSpeed: 0.00002,
                info: {
                    "Tipo": "Lua de Makemake",
                    "Diâmetro": "160 km",
                    "Massa": "~1 × 10¹⁶ kg",
                    "Distância ao planeta": "21.000 km",
                    "Período orbital": "12,4 dias"
                }
            }
        ]
    },
    {
        name: 'Haumea',
        size: 0.4,
        albedo: 0.77,
        texturePath: 'assets/textures/haumea.jpg', // Ok
        iconPath: 'assets/icons/haumea.jpg',
        positionX: 4300,
        // Rotação: 3.91 horas (EXTREMAMENTE RÁPIDA) -> Aumentado drasticamente
        rotationSpeed: 0.003,
        // Órbita: 285.3 anos
        orbitSpeed: 0.000006,
        info: {
            "Tipo": "Planeta-anão",
            "Diâmetro": "1.632 × 1.138 × 832 km",
            "Massa": "4.006 ± 0.040 × 10²¹ kg",
            "Composição Principal": "Gelo, rocha",
            "Excentricidade orbital": 0.197,
            "Inclinação orbital em graus": 28.2,
            "Distância orbital média (UA)": 43.0,
            "Período orbital (anos)": 285
        },
        satellites: [
            {
                name: 'Namaka',
                size: 0.05,
                albedo: 0.8,
                texturePath: 'assets/textures/namaka.png', // Ok
                position: 25657,
                // Rotação: N/A (Síncrona assumida)
                rotationSpeed: 0.000025,
                // Órbita: 18.27 dias
                orbitSpeed: 0.00001,
                info: {
                    "Tipo": "Lua de Haumea",
                    "Diâmetro": "170 km",
                    "Massa": "1.79 × 10¹⁸ kg",
                    "Distância ao planeta": "25.657 km",
                    "Período orbital": "18,27 dias"
                }
            },
            {
                name: 'Hiʻiaka',
                size: 0.08,
                albedo: 0.8,
                texturePath: 'assets/textures/hiiakia.png', // Ok
                position: 49880,
                // Rotação: N/A (Síncrona assumida)
                rotationSpeed: 0.00001,
                // Órbita: 49.12 dias
                orbitSpeed: 0.000004,
                info: {
                    "Tipo": "Lua de Haumea",
                    "Diâmetro": "320 km",
                    "Massa": "1.79 × 10¹⁹ kg",
                    "Distância ao planeta": "49.880 km",
                    "Período orbital": "49,12 dias"
                }
            }
        ]
    },
    {
        name: 'Sedna',
        size: 0.35,
        albedo: 0.32,
        texturePath: 'assets/textures/sedna.png', // Ok
        iconPath: 'assets/icons/sedna.jpg',
        positionX: 9600,
        // Rotação: 10 horas (~0.42 dias) -> Aumentado
        rotationSpeed: 0.0007,
        // Órbita: 11408 anos
        orbitSpeed: 0.00000001,
        info: {
            "Tipo": "Planeta-anão Candidato",
            "Diâmetro": "995 ± 80 km",
            "Massa": "~1 × 10²¹ kg",
            "Temperatura da Superfície": "-235 °C (média)",
            "Composição Principal": "Hidrocarbonetos, tolinas",
            "Excentricidade orbital": 0.853,
            "Inclinação orbital em graus": 11.9,
            "Distância orbital média (UA)": 518.57,
            "Período orbital (anos)": 11408
        }
    },
    {
        name: '2002 MS4',
        size: 0.3,
        albedo: 0.14,
        texturePath: 'assets/textures/2002ms4.png', // Ok
        iconPath: 'assets/icons/2002ms4.jpg',
        positionX: 4200,
        // Rotação: ~7.3 dias (estimada)
        rotationSpeed: 0.00003,
        // Órbita: 275 anos
        orbitSpeed: 0.000005,
        info: {
            "Tipo": "Planeta-anão Candidato",
            "Diâmetro": "934 ± 47 km",
            "Massa": "~6.7 × 10²⁰ kg",
            "Excentricidade orbital": 0.141,
            "Inclinação orbital em graus": 19.4,
            "Distância orbital média (UA)": 42.81,
            "Período orbital (anos)": 275
        }
    },
    {
        name: '2007 OR10',
        size: 0.3,
        albedo: 0.12,
        texturePath: 'assets/textures/2007or10.png', // Ok
        iconPath: 'assets/icons/2007or10.jpg',
        positionX: 6700,
        // Rotação: 45 horas (~1.87 dias)
        rotationSpeed: 0.00013,
        // Órbita: 548 anos
        orbitSpeed: 0.000003,
        info: {
            "Tipo": "Planeta-anão Candidato",
            "Diâmetro": "1.230 ± 50 km",
            "Massa": "1.75 × 10²¹ kg",
            "Excentricidade orbital": 0.5,
            "Inclinação orbital em graus": 30.7,
            "Distância orbital média (UA)": 67.34,
            "Período orbital (anos)": 548
        }
    },
    {
        name: 'Quaoar',
        size: 0.3,
        albedo: 0.1,
        texturePath: 'assets/textures/quaoar.png', // Ok
        iconPath: 'assets/icons/quaoar.jpg',
        positionX: 4300,
        // Rotação: 8.9 horas (~0.37 dias) -> Aumentado
        rotationSpeed: 0.0008,
        // Órbita: 286 anos
        orbitSpeed: 0.000005,
        info: {
            "Tipo": "Planeta-anão Candidato",
            "Diâmetro": "1.110 km",
            "Massa": "1.26 × 10²¹ kg",
            "Composição Principal": "Gelo, rocha",
            "Excentricidade orbital": 0.04,
            "Inclinação orbital em graus": 8.0,
            "Distância orbital média (UA)": 43.4,
            "Período orbital (anos)": 286
        },
        satellites: [
            {
                name: 'Weywot',
                size: 0.03,
                albedo: 0.1,
                texturePath: 'assets/textures/weywot.png', // Ok
                position: 14500,
                // Rotação: N/A (Síncrona assumida)
                rotationSpeed: 0.00001,
                // Órbita: N/A (Usando proxy rápido)
                orbitSpeed: 0.000004,
                info: {
                    "Tipo": "Lua de Quaoar",
                    "Diâmetro": "80 km",
                    "Massa": "Não disponível",
                    "Distância ao planeta": "14.500 km",
                    "Período orbital": "Não disponível"
                }
            }
        ]
    },
    {
        name: 'Salácia',
        size: 0.3,
        albedo: 0.1,
        texturePath: 'assets/textures/salacia.png', // Ok
        iconPath: 'assets/icons/salacia.jpg',
        positionX: 4200,
        // Rotação: 6.13 horas (~0.25 dias) -> Aumentado
        rotationSpeed: 0.0011,
        // Órbita: 273 anos
        orbitSpeed: 0.000005,
        info: {
            "Tipo": "Planeta-anão Candidato",
            "Diâmetro": "854 ± 20 km",
            "Massa": "4.1 ± 0.6 × 10²⁰ kg",
            "Excentricidade orbital": 0.103,
            "Inclinação orbital em graus": 23.9,
            "Distância orbital média (UA)": 42.27,
            "Período orbital (anos)": 273
        },
        satellites: [
            {
                name: 'Actaea',
                size: 0.03,
                albedo: 0.03,
                texturePath: 'assets/textures/actaea.png', // Ok
                // POSIÇÃO CORRIGIDA: 5619 km (real) * Fator de escala visual = 56190 (para afastar visualmente)
                position: 5619,
                // Rotação: 5.49 dias (Síncrona)
                rotationSpeed: 0.00006,
                // Órbita: 5.49 dias
                orbitSpeed: 0.00006,
                info: {
                    "Tipo": "Lua de Salácia",
                    "Diâmetro": "290 km",
                    "Massa": "2.8 ± 0.6 × 10¹⁸ kg",
                    "Distância ao planeta": "5.619 km",
                    "Período orbital": "5,4938 dias"
                }
            }
        ]
    },
    {
        name: 'Orco',
        size: 0.3,
        albedo: 0.23,
        texturePath: 'assets/textures/orcus.png', // Ok
        iconPath: 'assets/icons/orcus.jpg',
        positionX: 3900,
        // Rotação: 6.95 dias
        rotationSpeed: 0.00003,
        // Órbita: 247 anos
        orbitSpeed: 0.0000055,
        info: {
            "Tipo": "Planeta-anão Candidato",
            "Diâmetro": "917 ± 20 km",
            "Massa": "6.32 ± 0.05 × 10²⁰ kg",
            "Excentricidade orbital": 0.227,
            "Inclinação orbital em graus": 20.6,
            "Distância orbital média (UA)": 39.16,
            "Período orbital (anos)": 247
        },
        satellites: [
            {
                name: 'Vanth',
                size: 0.03,
                albedo: 0.03,
                texturePath: 'assets/textures/vanth.png', // Ok
                position: 8960,
                // Rotação: 9.54 dias (Síncrona)
                rotationSpeed: 0.00002,
                // Órbita: 9.54 dias
                orbitSpeed: 0.00002,
                info: {
                    "Tipo": "Lua de Orco",
                    "Diâmetro": "475 ± 12 km",
                    "Massa": "2.9 ± 0.6 × 10¹⁹ kg",
                    "Distância ao planeta": "8.960 km",
                    "Período orbital": "9,54 dias"
                }
            }
        ]
    }
];