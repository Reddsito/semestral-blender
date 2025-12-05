// ═══════════════════════════════════════════════════════════
// SISTEMA DÍA/NOCHE - Ciclo completo 360° con sol, luna y estrellas
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';
import { CONFIG, SKY_TRANSITIONS } from '../utils/constants.js';

export class DayNightCycle {
    constructor(scene, lightingSystem) {
        this.scene = scene;
        this.lightingSystem = lightingSystem;

        this.isAnimating = true; // Inicia automáticamente
        this.cycleAngle = 0; // 0 a 2*PI (360°)

        this.sun = null;
        this.moon = null;
        this.stars = null;
        this.clouds = [];

        this.waterMeshes = [];

        this.init();
    }

    init() {
        this.createSun();
        this.createMoon();
        this.createStars();
        this.createClouds();
    }

    createSun() {
        const { sunSize } = CONFIG.dayNight;
        
        const geometry = new THREE.SphereGeometry(sunSize, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            emissive: 0xffaa00,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 1
        });
        
        this.sun = new THREE.Mesh(geometry, material);
        this.sun.position.set(0, 18, 0); // Empieza arriba (mediodía)
        this.scene.add(this.sun);
    }

    createMoon() {
        const { moonSize, pointLightColor, pointLightIntensity } = CONFIG.dayNight;
        
        const geometry = new THREE.SphereGeometry(moonSize, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xe6e6e6,
            emissive: 0x666688,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0
        });
        
        this.moon = new THREE.Mesh(geometry, material);
        this.moon.position.set(0, -18, 0); // Empieza abajo
        
        // Luz de punto para la luna
        const moonPointLight = new THREE.PointLight(
            CONFIG.lighting.moon.pointLightColor,
            0,
            50
        );
        this.moon.add(moonPointLight);
        this.moon.userData.pointLight = moonPointLight;
        
        this.scene.add(this.moon);
    }

    createStars() {
        const { starCount } = CONFIG.dayNight;

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const sizes = [];

        for (let i = 0; i < starCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 100,
                Math.random() * 25 + 8,
                (Math.random() - 0.5) * 100
            );
            sizes.push(Math.random() * 0.8 + 0.3);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        // Calcular opacidad inicial basada en el cycleAngle inicial (0 = amanecer)
        const sunHeight = CONFIG.dayNight.sunRadius * Math.sin(this.cycleAngle);
        const maxHeight = CONFIG.dayNight.sunRadius;
        const normalizedSunHeight = (sunHeight + maxHeight) / (2 * maxHeight);
        const dayFactor = Math.max(0, Math.min(1, normalizedSunHeight));
        const nightFactor = 1 - dayFactor;
        const initialOpacity = Math.max(0, (nightFactor - 0.5) / 0.5);

        // Crear textura circular para estrellas redondas
        const starTexture = this.createCircleTexture();

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.6,
            transparent: true,
            opacity: initialOpacity,
            sizeAttenuation: true,
            map: starTexture,
            alphaTest: 0.01
        });

        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }

    createCircleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // Dibujar círculo con gradiente para efecto de brillo
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createClouds() {
        const cloudCount = 12;

        for (let i = 0; i < cloudCount; i++) {
            const cloud = this.createSingleCloud();

            // Posicionar en diferentes alturas y lugares (más cerca de la base)
            cloud.position.set(
                (Math.random() - 0.5) * 30,
                6 + Math.random() * 3,
                (Math.random() - 0.5) * 30
            );

            // Rotacion aleatoria
            cloud.rotation.y = Math.random() * Math.PI * 2;

            // Velocidad de movimiento más lento
            cloud.userData.speed = 0.1 + Math.random() * 0.15;
            cloud.userData.direction = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                0,
                (Math.random() - 0.5) * 0.5
            ).normalize();

            this.clouds.push(cloud);
            this.scene.add(cloud);
        }
    }

    createSingleCloud() {
        const cloudGroup = new THREE.Group();

        // Crear varias esferas para formar una nube
        const sphereCount = 5 + Math.floor(Math.random() * 4);
        const cloudMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.85,
            fog: true
        });

        for (let i = 0; i < sphereCount; i++) {
            const radius = 0.8 + Math.random() * 1.2;
            const geometry = new THREE.SphereGeometry(radius, 12, 12);
            const sphere = new THREE.Mesh(geometry, cloudMaterial.clone());

            // Posicionar esferas para formar forma de nube
            sphere.position.set(
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 2
            );

            // Escalar un poco para variar
            const scale = 0.7 + Math.random() * 0.6;
            sphere.scale.set(scale, scale * 0.7, scale);

            cloudGroup.add(sphere);
        }

        // Escala general de la nube (más pequeñas)
        const cloudScale = 0.6 + Math.random() * 0.5;
        cloudGroup.scale.setScalar(cloudScale);

        return cloudGroup;
    }

    /**
     * Registra meshes de agua para actualizar sus colores
     */
    registerWaterMeshes(meshes) {
        this.waterMeshes = meshes;
    }

    /**
     * Alterna la animación del ciclo
     */
    toggle() {
        this.isAnimating = !this.isAnimating;
        console.log(this.isAnimating ? '🎬 Ciclo iniciado' : '⏸️ Ciclo pausado');
        return this.isAnimating;
    }

    /**
     * Actualiza el ciclo día/noche
     */
    update(deltaTime) {
        if (!this.isAnimating) return;

        const { speed, sunRadius, moonRadius, horizonFadeDistance } = CONFIG.dayNight;

        // Avanzar el ciclo
        this.cycleAngle += speed * deltaTime;
        if (this.cycleAngle >= Math.PI * 2) {
            this.cycleAngle -= Math.PI * 2;
        }

        // Actualizar posiciones del sol y luna
        this.updateSunPosition(sunRadius);
        this.updateMoonPosition(moonRadius);

        // Calcular factor día/noche basado en la altura del sol (más intuitivo)
        // Cuando el sol está arriba = día, cuando está abajo = noche
        const sunHeight = this.sun.position.y;
        const maxHeight = sunRadius;

        // dayFactor: 1 cuando sol está en su punto más alto, 0 cuando está abajo
        // Usar la altura normalizada del sol para una transición suave
        const normalizedSunHeight = (sunHeight + maxHeight) / (2 * maxHeight); // 0 a 1
        const dayFactor = Math.max(0, Math.min(1, normalizedSunHeight));
        const nightFactor = 1 - dayFactor;

        // Actualizar visibilidad
        this.updateSunVisibility(horizonFadeDistance);
        this.updateMoonVisibility(horizonFadeDistance, nightFactor);

        // Actualizar iluminación
        this.lightingSystem.updateLighting(dayFactor);
        this.lightingSystem.updateDayLightPosition(this.sun.position);
        this.lightingSystem.updateNightLightPosition(this.moon.position);

        // Actualizar cielo
        this.updateSkyColor(dayFactor);

        // Actualizar estrellas
        this.updateStars(nightFactor);

        // Actualizar agua
        this.updateWaterColors(nightFactor);

        // Actualizar nubes
        this.updateClouds(deltaTime, dayFactor);
    }

    updateSunPosition(radius) {
        this.sun.position.x = radius * Math.cos(this.cycleAngle);
        this.sun.position.y = radius * Math.sin(this.cycleAngle);
        this.sun.position.z = 0;
    }

    updateMoonPosition(radius) {
        const moonAngle = this.cycleAngle + Math.PI;
        this.moon.position.x = radius * Math.cos(moonAngle);
        this.moon.position.y = radius * Math.sin(moonAngle);
        this.moon.position.z = 0;
    }

    updateSunVisibility(fadeDistance) {
        const height = this.sun.position.y;
        if (height > -5) {
            this.sun.material.opacity = Math.max(0, Math.min(1, (height + 5) / fadeDistance));
        } else {
            this.sun.material.opacity = 0;
        }
    }

    updateMoonVisibility(fadeDistance, nightFactor) {
        const height = this.moon.position.y;

        // Opacidad visual de la luna basada en su altura
        let visualOpacity = 0;
        if (height > -5) {
            visualOpacity = Math.max(0, Math.min(1, (height + 5) / fadeDistance));
        }
        this.moon.material.opacity = visualOpacity;

        // La luz de la luna se basa en el nightFactor (no solo en su altura)
        // Así ilumina aunque esté subiendo
        if (this.moon.userData.pointLight) {
            // Intensidad de luz basada en qué tan de noche es
            const lightIntensity = nightFactor * 1.2;
            this.moon.userData.pointLight.intensity = lightIntensity;
        }
    }

    updateSkyColor(dayFactor) {
        const colors = CONFIG.skyColors;
        let skyColor;
        
        if (dayFactor > 0.8) {
            skyColor = new THREE.Color(colors.day);
        } else if (dayFactor > 0.6) {
            const t = (dayFactor - 0.6) / 0.2;
            skyColor = new THREE.Color(colors.day).lerp(new THREE.Color(colors.sunset), 1 - t);
        } else if (dayFactor > 0.3) {
            const t = (dayFactor - 0.3) / 0.3;
            skyColor = new THREE.Color(colors.sunset).lerp(new THREE.Color(colors.twilight), 1 - t);
        } else if (dayFactor > 0.1) {
            const t = (dayFactor - 0.1) / 0.2;
            skyColor = new THREE.Color(colors.twilight).lerp(new THREE.Color(colors.night), 1 - t);
        } else {
            skyColor = new THREE.Color(colors.night);
        }
        
        this.scene.background.copy(skyColor);
        this.scene.fog.color.copy(skyColor);
    }

    updateStars(nightFactor) {
        // Solo aparecen cuando es realmente de noche (nightFactor > 0.5)
        // Así desaparecen completamente durante el día
        const starOpacity = Math.max(0, (nightFactor - 0.5) / 0.5);
        this.stars.material.opacity = starOpacity;
        this.stars.rotation.y += 0.0001; // Rotación lenta
    }

    updateWaterColors(nightFactor) {
        const { day, night } = CONFIG.waterColors;

        this.waterMeshes.forEach(mesh => {
            if (mesh.material.uniforms) {
                mesh.material.uniforms.waterColor.value.lerpColors(
                    new THREE.Color(day.light),
                    new THREE.Color(night.light),
                    nightFactor
                );
                mesh.material.uniforms.deepWaterColor.value.lerpColors(
                    new THREE.Color(day.deep),
                    new THREE.Color(night.deep),
                    nightFactor
                );
                mesh.material.uniforms.dayNightMix.value = nightFactor;
            }
        });
    }

    updateClouds(deltaTime, dayFactor) {
        // Colores de nubes según el momento del día
        const dayColor = new THREE.Color(0xffffff);
        const sunsetColor = new THREE.Color(0xffccaa);
        const nightColor = new THREE.Color(0x667799); // Más claro para que se vean de noche

        let cloudColor;
        let cloudOpacity;

        if (dayFactor > 0.7) {
            // Día
            cloudColor = dayColor;
            cloudOpacity = 0.85;
        } else if (dayFactor > 0.4) {
            // Atardecer
            const t = (dayFactor - 0.4) / 0.3;
            cloudColor = sunsetColor.clone().lerp(dayColor, t);
            cloudOpacity = 0.8;
        } else if (dayFactor > 0.2) {
            // Crepúsculo
            const t = (dayFactor - 0.2) / 0.2;
            cloudColor = nightColor.clone().lerp(sunsetColor, t);
            cloudOpacity = 0.7;
        } else {
            // Noche - mantener visibles
            cloudColor = nightColor;
            cloudOpacity = 0.6;
        }

        this.clouds.forEach(cloud => {
            // Mover nube lentamente
            const speed = cloud.userData.speed * deltaTime;
            const dir = cloud.userData.direction;

            cloud.position.x += dir.x * speed;
            cloud.position.z += dir.z * speed;

            // Si sale del área, reposicionar al otro lado
            const boundary = 18;
            if (cloud.position.x > boundary) cloud.position.x = -boundary;
            if (cloud.position.x < -boundary) cloud.position.x = boundary;
            if (cloud.position.z > boundary) cloud.position.z = -boundary;
            if (cloud.position.z < -boundary) cloud.position.z = boundary;

            // Actualizar color y opacidad de cada esfera en la nube
            cloud.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.color.copy(cloudColor);
                    child.material.opacity = cloudOpacity;
                }
            });
        });
    }
}
