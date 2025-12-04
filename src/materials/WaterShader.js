// ═══════════════════════════════════════════════════════════
// SHADER DEL AGUA - Material animado y realista
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';
import { CONFIG } from '../utils/constants.js';

// Vertex Shader - Geometría de las ondas
export const waterVertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;

    void main() {
        vUv = uv;
        vPosition = position;

        vec3 pos = position;

        // Múltiples ondas suaves y lentas para efecto más calmado
        float wave1 = sin(pos.x * 0.8 + time * 0.15) * 0.025;
        float wave2 = sin(pos.y * 0.9 + time * 0.12) * 0.02;
        float wave3 = cos(pos.x * 1.1 - time * 0.1) * 0.015;
        float wave4 = cos(pos.y * 1.2 - time * 0.13) * 0.018;

        // Ondas circulares suaves desde el centro
        float dist = length(pos.xy);
        float circularWave = sin(dist * 1.5 - time * 0.2) * 0.01;

        pos.z += wave1 + wave2 + wave3 + wave4 + circularWave;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

// Fragment Shader - Apariencia del agua
export const waterFragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;
    uniform vec3 waterColor;
    uniform vec3 deepWaterColor;
    uniform float dayNightMix; // 0 = día, 1 = noche

    void main() {
        // Múltiples capas de ondas suaves y lentas para el color
        float wave1 = sin(vUv.x * 4.0 + time * 0.15) * 0.5 + 0.5;
        float wave2 = sin(vUv.y * 4.0 + time * 0.12) * 0.5 + 0.5;
        float wave3 = sin((vUv.x + vUv.y) * 3.0 - time * 0.1) * 0.5 + 0.5;

        // Mezcla de colores base
        vec3 color = mix(waterColor, deepWaterColor, wave1 * wave2 * 0.3);

        // Destellos suaves y lentos
        float shimmer1 = sin(vUv.x * 12.0 + time * 0.4) * sin(vUv.y * 12.0 + time * 0.35);
        float shimmer2 = sin(vUv.x * 8.0 - time * 0.3) * sin(vUv.y * 8.0 - time * 0.25);
        float shimmer = (shimmer1 + shimmer2) * 0.08;

        // Destellos más fuertes de día, más sutiles de noche
        float shimmerStrength = mix(1.0, 0.3, dayNightMix);
        color += vec3(shimmer * shimmerStrength);

        // Efecto de profundidad sutil
        float depth = wave3 * 0.15;
        color = mix(color, deepWaterColor, depth);

        // Reflexión del cielo (más fuerte de día)
        float skyReflection = mix(0.12, 0.04, dayNightMix);
        color += vec3(skyReflection * (1.0 - wave1 * wave2));

        gl_FragColor = vec4(color, 0.9);
    }
`;

/**
 * Crea un material de agua animado
 * @returns {THREE.ShaderMaterial} Material del agua
 */
export function createWaterMaterial() {
    return new THREE.ShaderMaterial({
        vertexShader: waterVertexShader,
        fragmentShader: waterFragmentShader,
        uniforms: {
            time: { value: 0 },
            waterColor: { value: new THREE.Color(CONFIG.waterColors.day.light) },
            deepWaterColor: { value: new THREE.Color(CONFIG.waterColors.day.deep) },
            dayNightMix: { value: 0 }
        },
        transparent: true,
        side: THREE.DoubleSide
    });
}

/**
 * Detecta si un mesh es agua basándose en su color o nombre
 * @param {THREE.Mesh} mesh - Mesh a verificar
 * @returns {boolean} True si es agua
 */
export function isWaterMesh(mesh) {
    // Por nombre
    const name = mesh.name.toLowerCase();
    if (name.includes('water') || name.includes('lake') || 
        name.includes('river') || name.includes('agua') ||
        name.includes('plane')) {
        
        // Verificar color azul si tiene material
        if (mesh.material && mesh.material.color) {
            const c = mesh.material.color;
            // Si es azulado (B > R y B > G y B > 0.5)
            if (c.b > c.r && c.b > c.g && c.b > 0.5) {
                return true;
            }
        }
        
        // Si no tiene color pero el nombre sugiere agua
        if (name.includes('water') || name.includes('lake') || 
            name.includes('river') || name.includes('agua')) {
            return true;
        }
    }
    
    return false;
}
