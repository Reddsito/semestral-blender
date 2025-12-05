// ═══════════════════════════════════════════════════════════
// CONSTANTES Y CONFIGURACIÓN GLOBAL
// ═══════════════════════════════════════════════════════════

export const CONFIG = {
    // Cámara
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        initialPosition: { x: 10, y: 8, z: 10 }
    },

    // Controles de cámara
    controls: {
        enableDamping: true,
        dampingFactor: 0.05,
        minDistance: 5,
        maxDistance: 30
    },

    // Ciclo día/noche
    dayNight: {
        speed: 0.35,              // Velocidad del ciclo (más rápido)
        sunRadius: 18,            // Radio de órbita del sol (más cerca)
        moonRadius: 18,           // Radio de órbita de la luna (más cerca)
        sunSize: 3.0,             // Tamaño del sol (más grande)
        moonSize: 2.2,            // Tamaño de la luna (más grande)
        starCount: 400,           // Número de estrellas (menos)
        horizonFadeDistance: 5    // Distancia de fade en horizonte
    },

    // Colores del cielo
    skyColors: {
        day: 0x87ceeb,           // Azul cielo
        sunset: 0xffa07a,        // Naranja/Rosa
        twilight: 0x4a5c8a,      // Crepúsculo
        night: 0x0a1a2a          // Noche (azul oscuro pero no negro)
    },

    // Colores del agua
    waterColors: {
        day: {
            light: 0x5ab3ff,     // Azul claro
            deep: 0x1a7acc       // Azul medio
        },
        night: {
            light: 0x1a3a52,     // Azul oscuro
            deep: 0x0a1a2a       // Casi negro
        }
    },

    // Iluminación
    lighting: {
        ambient: {
            dayColor: 0xffffff,
            nightColor: 0x7788cc,
            dayIntensity: 0.55,
            nightIntensity: 0.45
        },
        sun: {
            color: 0xffffdd,
            intensity: 1.0,
            shadowMapSize: 2048
        },
        moon: {
            color: 0xaabbff,
            intensity: 0.8,
            pointLightColor: 0x99aaff,
            pointLightIntensity: 0.6
        }
    },

    // Modelos
    models: {
        chicken: {
            path: '/chicken.glb',
            position: { x: 2, y: 0, z: -1 },
            scale: 0.3,
            rotation: Math.PI / 4
        },
        wolf: {
            path: '/wolf.glb',
            position: { x: -3, y: 0, z: 1 },
            scale: 0.4,
            rotation: -Math.PI / 6
        },
        base: {
            path: '/base.glb',
            position: { x: 0, y: 0, z: 0 },
            scale: 1
        }
    },

    // Agua
    water: {
        opacity: 0.88,
        waveAmplitudes: [0.08, 0.06, 0.04, 0.05, 0.03],
        waveFrequencies: [1.5, 1.8, 2.2, 2.5, 3.0],
        waveSpeeds: [1.2, 0.9, 0.8, 1.0, 2.0],
        shimmerIntensity: 0.15
    }
};

// Transiciones del cielo según el dayFactor
export const SKY_TRANSITIONS = {
    full_day: { threshold: 0.8, color: 'day' },
    early_sunset: { threshold: 0.6, color: 'sunset' },
    sunset: { threshold: 0.3, color: 'twilight' },
    twilight: { threshold: 0.1, color: 'night' },
    night: { threshold: 0, color: 'night' }
};
