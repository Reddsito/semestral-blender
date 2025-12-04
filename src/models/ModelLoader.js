// ═══════════════════════════════════════════════════════════
// CARGADOR DE MODELOS 3D - GLB loader con configuración
// ═══════════════════════════════════════════════════════════

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CONFIG } from '../utils/constants.js';
import { createWaterMaterial, isWaterMesh } from '../materials/WaterShader.js';

export class ModelLoader {
    constructor(scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.loadedCount = 0;
        this.totalModels = 3;
        
        this.models = {
            chicken: null,
            wolf: null,
            base: null
        };
        
        this.waterMeshes = [];
    }

    /**
     * Carga todos los modelos
     * @param {Function} onComplete - Callback cuando todos los modelos estén cargados
     */
    loadAll(onComplete) {
        this.loadBase(() => this.checkComplete(onComplete));
        this.loadChicken(() => this.checkComplete(onComplete));
        this.loadWolf(() => this.checkComplete(onComplete));
    }

    loadBase(onLoad) {
        const config = CONFIG.models.base;
        
        this.loader.load(config.path, (gltf) => {
            this.models.base = gltf.scene;
            
            // Procesar meshes
            this.models.base.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Detectar y aplicar shader de agua
                    if (isWaterMesh(child)) {
                        const waterMaterial = createWaterMaterial();
                        child.material = waterMaterial;
                        this.waterMeshes.push(child);
                        console.log('💧 Agua detectada:', child.name);
                    }
                }
            });
            
            this.scene.add(this.models.base);
            console.log('🏝️ Base cargada!');
            onLoad();
        });
    }

    loadChicken(onLoad) {
        const config = CONFIG.models.chicken;
        
        this.loader.load(config.path, (gltf) => {
            this.models.chicken = gltf.scene;
            
            // Configurar posición y escala
            this.models.chicken.position.set(
                config.position.x,
                config.position.y,
                config.position.z
            );
            this.models.chicken.scale.setScalar(config.scale);
            this.models.chicken.rotation.y = config.rotation;
            
            // Habilitar sombras
            this.models.chicken.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });
            
            this.scene.add(this.models.chicken);
            console.log('🐔 Gallina cargada!');
            onLoad();
        });
    }

    loadWolf(onLoad) {
        const config = CONFIG.models.wolf;
        
        this.loader.load(config.path, (gltf) => {
            this.models.wolf = gltf.scene;
            
            // Configurar posición y escala
            this.models.wolf.position.set(
                config.position.x,
                config.position.y,
                config.position.z
            );
            this.models.wolf.scale.setScalar(config.scale);
            this.models.wolf.rotation.y = config.rotation;
            
            // Habilitar sombras
            this.models.wolf.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });
            
            this.scene.add(this.models.wolf);
            console.log('🐺 Lobo cargado!');
            onLoad();
        });
    }

    checkComplete(onComplete) {
        this.loadedCount++;
        if (this.loadedCount >= this.totalModels) {
            console.log('✅ Todos los modelos cargados!');
            onComplete(this.waterMeshes);
        }
    }

    /**
     * Actualiza animaciones de agua
     */
    updateWater(time) {
        this.waterMeshes.forEach(mesh => {
            if (mesh.material.uniforms) {
                mesh.material.uniforms.time.value = time;
            }
        });
    }

    /**
     * Obtiene un modelo específico
     */
    getModel(name) {
        return this.models[name];
    }

    /**
     * Obtiene todos los meshes de agua
     */
    getWaterMeshes() {
        return this.waterMeshes;
    }
}
