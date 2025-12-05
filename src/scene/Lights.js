// ═══════════════════════════════════════════════════════════
// SISTEMA DE ILUMINACIÓN - Luces ambientales y direccionales
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';
import { CONFIG } from '../utils/constants.js';

export class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.ambientLight = null;
        this.dayLight = null;
        this.nightLight = null;
        
        this.init();
    }

    init() {
        this.createAmbientLight();
        this.createDayLight();
        this.createNightLight();
    }

    createAmbientLight() {
        const { dayColor, dayIntensity } = CONFIG.lighting.ambient;
        
        this.ambientLight = new THREE.AmbientLight(dayColor, dayIntensity);
        this.scene.add(this.ambientLight);
    }

    createDayLight() {
        const { color, intensity, shadowMapSize } = CONFIG.lighting.sun;
        
        this.dayLight = new THREE.DirectionalLight(color, intensity);
        this.dayLight.position.set(5, 20, 5);
        this.dayLight.castShadow = true;
        
        // Configuración de sombras
        this.dayLight.shadow.mapSize.width = shadowMapSize;
        this.dayLight.shadow.mapSize.height = shadowMapSize;
        this.dayLight.shadow.camera.left = -25;
        this.dayLight.shadow.camera.right = 25;
        this.dayLight.shadow.camera.top = 25;
        this.dayLight.shadow.camera.bottom = -25;
        this.dayLight.shadow.camera.near = 0.5;
        this.dayLight.shadow.camera.far = 100;
        
        this.scene.add(this.dayLight);
    }

    createNightLight() {
        const { color, intensity } = CONFIG.lighting.moon;

        this.nightLight = new THREE.DirectionalLight(color, 0);
        this.nightLight.position.set(-5, 15, -5);
        this.nightLight.castShadow = false; // Luna no proyecta sombras marcadas

        this.scene.add(this.nightLight);
    }

    /**
     * Actualiza la iluminación según el factor día/noche
     * @param {number} dayFactor - 0 (noche) a 1 (día)
     */
    updateLighting(dayFactor) {
        const nightFactor = 1 - dayFactor;
        const { ambient, sun, moon } = CONFIG.lighting;
        
        // Luz ambiental
        this.ambientLight.intensity = 
            ambient.dayIntensity * dayFactor + 
            ambient.nightIntensity * nightFactor;
        
        this.ambientLight.color.lerpColors(
            new THREE.Color(ambient.dayColor),
            new THREE.Color(ambient.nightColor),
            nightFactor
        );
        
        // Luces direccionales
        this.dayLight.intensity = sun.intensity * dayFactor;
        this.nightLight.intensity = moon.intensity * nightFactor;
    }

    /**
     * Actualiza la posición de la luz del día
     */
    updateDayLightPosition(position) {
        this.dayLight.position.x = position.x * 0.2;
        this.dayLight.position.y = Math.max(5, position.y * 0.5);
        this.dayLight.position.z = position.z * 0.2;
    }

    /**
     * Actualiza la posición de la luz de noche
     */
    updateNightLightPosition(position) {
        this.nightLight.position.x = position.x * 0.15;
        this.nightLight.position.y = Math.max(5, position.y * 0.4);
        this.nightLight.position.z = position.z * 0.15;
    }
}
