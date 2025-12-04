// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN DE ESCENA - Scene, Camera, Renderer, Controls
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CONFIG } from '../utils/constants.js';

export class SceneSetup {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.setupEventListeners();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.skyColors.day);
        this.scene.fog = new THREE.Fog(CONFIG.skyColors.day, 30, 100);
    }

    createCamera() {
        const { fov, near, far, initialPosition } = CONFIG.camera;
        
        this.camera = new THREE.PerspectiveCamera(
            fov,
            window.innerWidth / window.innerHeight,
            near,
            far
        );
        
        this.camera.position.set(
            initialPosition.x,
            initialPosition.y,
            initialPosition.z
        );
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true 
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Agregar al DOM
        const container = document.getElementById('canvas-container');
        if (container) {
            container.appendChild(this.renderer.domElement);
        } else {
            console.error('Container "canvas-container" no encontrado');
        }
    }

    createControls() {
        const { enableDamping, dampingFactor, minDistance, maxDistance } = CONFIG.controls;
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = enableDamping;
        this.controls.dampingFactor = dampingFactor;
        this.controls.minDistance = minDistance;
        this.controls.maxDistance = maxDistance;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        // Actualizar cámara
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // Actualizar renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Actualiza los controles (llamar en loop de animación)
     */
    update() {
        if (this.controls) {
            this.controls.update();
        }
    }

    /**
     * Renderiza la escena
     */
    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Cambia el color de fondo de la escena
     */
    setBackgroundColor(color) {
        this.scene.background.copy(color);
        this.scene.fog.color.copy(color);
    }
}
