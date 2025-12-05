// ═══════════════════════════════════════════════════════════
// SHADER DEL AGUA - Solo animación de ondas (mantiene textura original)
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';

/**
 * Aplica animación de ondas a un material existente sin cambiar su apariencia
 * @param {THREE.Mesh} mesh - Mesh del agua
 * @returns {object} Objeto con el material modificado y función de update
 */
export function applyWaterAnimation(mesh) {
    const originalMaterial = mesh.material;

    // Clonar el material original para no afectar otros meshes
    const animatedMaterial = originalMaterial.clone();

    // Agregar brillo/reflejo para que se vea desde lejos
    if (animatedMaterial.isMeshStandardMaterial || animatedMaterial.isMeshPhysicalMaterial) {
        animatedMaterial.metalness = 0.1;
        animatedMaterial.roughness = 0.3;
        animatedMaterial.envMapIntensity = 0.5;
    } else if (animatedMaterial.isMeshPhongMaterial) {
        animatedMaterial.shininess = 100;
        animatedMaterial.specular = new THREE.Color(0x444444);
    } else if (animatedMaterial.isMeshBasicMaterial) {
        // Convertir a MeshStandardMaterial para tener brillo
        const color = animatedMaterial.color.clone();
        const map = animatedMaterial.map;
        const newMaterial = new THREE.MeshStandardMaterial({
            color: color,
            map: map,
            metalness: 0.1,
            roughness: 0.3,
            transparent: animatedMaterial.transparent,
            opacity: animatedMaterial.opacity
        });
        mesh.material = newMaterial;
        return applyWaterAnimation(mesh); // Reiniciar con nuevo material
    }

    // Guardar la geometría original
    const geometry = mesh.geometry;

    // Guardar las posiciones originales de los vértices
    const positionAttribute = geometry.getAttribute('position');
    const originalPositions = new Float32Array(positionAttribute.array);

    // Función para actualizar las ondas
    const updateWaves = (time) => {
        const positions = positionAttribute.array;

        for (let i = 0; i < positions.length; i += 3) {
            const x = originalPositions[i];
            const y = originalPositions[i + 1];
            const originalZ = originalPositions[i + 2];

            // Ondas moderadas
            const wave1 = Math.sin(x * 0.8 + time * 0.8) * 0.045;
            const wave2 = Math.sin(y * 0.9 + time * 0.7) * 0.035;
            const wave3 = Math.cos(x * 1.1 - time * 0.6) * 0.03;
            const wave4 = Math.cos(y * 1.2 - time * 0.75) * 0.032;

            // Onda circular desde el centro
            const dist = Math.sqrt(x * x + y * y);
            const circularWave = Math.sin(dist * 1.5 - time * 1.0) * 0.02;

            positions[i + 2] = originalZ + wave1 + wave2 + wave3 + wave4 + circularWave;
        }

        positionAttribute.needsUpdate = true;
        geometry.computeVertexNormals();
    };

    mesh.material = animatedMaterial;

    return {
        material: animatedMaterial,
        update: updateWaves
    };
}

/**
 * Detecta si un mesh es agua basándose en su color o nombre
 * @param {THREE.Mesh} mesh - Mesh a verificar
 * @returns {boolean} True si es agua
 */
export function isWaterMesh(mesh) {
    // Por nombre
    const name = mesh.name.toLowerCase();

    // Lista de nombres que indican agua
    const waterNames = ['water', 'lake', 'lago', 'river', 'agua', 'rio', 'pond', 'ocean', 'mar', 'sea'];
    const hasWaterName = waterNames.some(w => name.includes(w));

    if (hasWaterName) {
        return true;
    }

    // Verificar por color azul si tiene material
    if (mesh.material && mesh.material.color) {
        const c = mesh.material.color;
        // Si es azulado (B > R y B > G y B > 0.5)
        if (c.b > c.r && c.b > c.g && c.b > 0.5) {
            return true;
        }
    }

    return false;
}
