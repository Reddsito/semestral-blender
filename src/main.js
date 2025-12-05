// ═══════════════════════════════════════════════════════════
// MAIN - Punto de entrada de la aplicación
// ═══════════════════════════════════════════════════════════

import { SceneSetup } from './scene/SceneSetup.js';
import { LightingSystem } from './scene/Lights.js';
import { DayNightCycle } from './systems/DayNightCycle.js';
import { ModelLoader } from './models/ModelLoader.js';
import { UIControls } from './ui/Controls.js';
import { SoundSystem } from './systems/SoundSystem.js';

class Application {
    constructor() {
        // Componentes principales
        this.sceneSetup = null;
        this.lightingSystem = null;
        this.dayNightCycle = null;
        this.modelLoader = null;
        this.uiControls = null;
        this.soundSystem = null;
        
        // Variables de tiempo
        this.lastTime = 0;
        
        this.init();
    }

    init() {
        console.log('🎬 Iniciando aplicación...');
        
        // 1. Configurar escena, cámara y renderer
        this.sceneSetup = new SceneSetup();
        
        // 2. Crear sistema de iluminación
        this.lightingSystem = new LightingSystem(this.sceneSetup.scene);
        
        // 3. Crear sistema día/noche
        this.dayNightCycle = new DayNightCycle(
            this.sceneSetup.scene,
            this.lightingSystem
        );

        // 4. Crear sistema de sonido
        this.soundSystem = new SoundSystem();
        
        // 5. Cargar modelos 3D
        this.modelLoader = new ModelLoader(this.sceneSetup.scene);
        this.modelLoader.loadAll((waterMeshes) => {
            // Cuando todos los modelos estén cargados
            this.onModelsLoaded(waterMeshes);
        });
        
        // 6. Iniciar loop de animación
        this.animate();

        // 7. Inicializar sonido con primer click del usuario
        document.addEventListener('click', () => {
            this.soundSystem.init();
        }, { once: true });
    }

    onModelsLoaded(waterMeshes) {
        console.log('✅ Aplicación lista!');

        // Registrar meshes de agua en el ciclo día/noche
        this.dayNightCycle.registerWaterMeshes(waterMeshes);

        // Pasar los modelos al sistema de sonido para animarlos
        this.soundSystem.setModels(
            this.modelLoader.getModel('chicken'),
            this.modelLoader.getModel('wolf')
        );

        // Crear controles UI
        this.uiControls = new UIControls(this.dayNightCycle);

        // Ocultar pantalla de carga
        UIControls.hideLoading();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Calcular delta time
        const currentTime = performance.now() * 0.001;
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Actualizar componentes
        this.sceneSetup.update();
        this.dayNightCycle.update(deltaTime);
        this.modelLoader.updateWater(currentTime);
        this.soundSystem.update(this.dayNightCycle.cycleAngle);
        
        // Renderizar
        this.sceneSetup.render();
    }
}

// Iniciar aplicación cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
    new Application();
});
