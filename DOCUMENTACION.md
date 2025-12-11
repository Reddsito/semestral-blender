# Documentacion Completa del Proyecto Three.js - Semestral Sistemas Graficos

## Indice

1. [Introduccion - Que es este proyecto?](#1-introduccion---que-es-este-proyecto)
2. [Requisitos y como correr el proyecto](#2-requisitos-y-como-correr-el-proyecto)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Flujo de ejecucion - Como arranca todo](#4-flujo-de-ejecucion---como-arranca-todo)
5. [La escena 3D - SceneSetup](#5-la-escena-3d---scenesetup)
6. [Sistema de iluminacion - Lights](#6-sistema-de-iluminacion---lights)
7. [Cargando modelos 3D - ModelLoader](#7-cargando-modelos-3d---modelloader)
8. [Ciclo dia/noche - DayNightCycle](#8-ciclo-dianoche---daynightcycle)
9. [Sistema de sonidos - SoundSystem](#9-sistema-de-sonidos---soundsystem)
10. [Animacion del agua - WaterShader](#10-animacion-del-agua---watershader)
11. [Configuracion centralizada - constants.js](#11-configuracion-centralizada---constantsjs)
12. [Como agregar un nuevo modelo](#12-como-agregar-un-nuevo-modelo)
13. [Como agregar un nuevo sonido](#13-como-agregar-un-nuevo-sonido)
14. [Diagrama de arquitectura](#14-diagrama-de-arquitectura)

---

## 1. Introduccion - Que es este proyecto?

Este es un proyecto de **visualizacion 3D interactiva** creado con **Three.js**. Muestra una escena con:

- Una base/escenario (exportado desde Blender como `.glb`)
- Agua animada con ondas
- Una gallina y un lobo
- Ciclo completo de dia/noche (sol, luna, estrellas, nubes)
- Sonidos ambientales (agua, gallo cantando, lobo aullando)
- Controles de camara para explorar la escena

### Tecnologias usadas

| Tecnologia | Version | Para que sirve |
|------------|---------|----------------|
| Three.js | 0.160.0 | Motor de graficos 3D |
| Vite | 5.0.0 | Servidor de desarrollo y bundler |
| JavaScript ES6 | - | Lenguaje de programacion |
| GLTF/GLB | - | Formato de modelos 3D |

---

## 2. Requisitos y como correr el proyecto

### Requisitos previos
- Node.js 18 o superior
- npm o pnpm

### Instalacion

```bash
# Clonar o descargar el proyecto
cd semestral-blender

# Instalar dependencias
npm install
# o si usas pnpm:
pnpm install
```

### Ejecutar en modo desarrollo

```bash
npm run dev
```

Esto abre automaticamente `http://localhost:5173` en tu navegador.

### Crear version de produccion

```bash
npm run build
```

Los archivos se generan en la carpeta `dist/`.

---

## 3. Estructura del proyecto

```
semestral-blender/
│
├── index.html              # Pagina HTML principal
├── package.json            # Dependencias del proyecto
├── vite.config.js          # Configuracion de Vite
│
├── public/                 # Assets estaticos (modelos, sonidos)
│   ├── base.glb           # Escenario principal (1.0 MB)
│   ├── chicken.glb        # Modelo de la gallina (160 KB)
│   ├── chicken_texture.png # Textura de la gallina
│   ├── wolf.glb           # Modelo del lobo (84 KB)
│   ├── rooster.mp3        # Sonido del gallo (64 KB)
│   ├── wolf.mp3           # Sonido del lobo (132 KB)
│   └── water-sound.mp3    # Sonido de agua ambiente (1.3 MB)
│
└── src/                    # Codigo fuente
    ├── main.js            # PUNTO DE ENTRADA - Clase Application
    │
    ├── scene/             # Configuracion de escena
    │   ├── SceneSetup.js  # Escena, camara, renderer, controles
    │   └── Lights.js      # Sistema de iluminacion
    │
    ├── models/            # Carga de modelos
    │   └── ModelLoader.js # Cargador de archivos GLB
    │
    ├── materials/         # Materiales y shaders
    │   └── WaterShader.js # Animacion de ondas del agua
    │
    ├── systems/           # Sistemas del juego
    │   ├── DayNightCycle.js # Ciclo dia/noche completo
    │   └── SoundSystem.js   # Audio y animaciones
    │
    ├── ui/                # Interfaz de usuario
    │   └── Controls.js    # Botones y controles UI
    │
    └── utils/             # Utilidades
        └── constants.js   # CONFIGURACION GLOBAL
```

---

## 4. Flujo de ejecucion - Como arranca todo

El proyecto sigue este flujo cuando abres la pagina:

```
┌─────────────────────────────────────────────────────────────┐
│                     index.html                               │
│  1. Carga el HTML con el contenedor #canvas-container        │
│  2. Importa src/main.js como modulo ES6                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      main.js                                 │
│  Evento: DOMContentLoaded                                    │
│  Accion: new Application()                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Application.init()                              │
│                                                              │
│  1. SceneSetup()      → Crea escena, camara, renderer        │
│  2. LightingSystem()  → Crea luces (sol, luna, ambiente)     │
│  3. DayNightCycle()   → Sol, luna, estrellas, nubes          │
│  4. SoundSystem()     → Pre-carga archivos de audio          │
│  5. ModelLoader()     → Carga modelos GLB en paralelo        │
│  6. animate()         → Inicia el loop de renderizado        │
│  7. Event listeners   → Espera click para activar sonido     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            onModelsLoaded() - Cuando todo cargo              │
│                                                              │
│  1. Registra meshes de agua en DayNightCycle                 │
│  2. Pasa modelos al SoundSystem (para animaciones)           │
│  3. Crea controles UI                                        │
│  4. Oculta pantalla de carga                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              animate() - Loop infinito (60 FPS)              │
│                                                              │
│  Cada frame:                                                 │
│  1. sceneSetup.update()      → Actualiza controles camara    │
│  2. dayNightCycle.update()   → Mueve sol/luna/estrellas      │
│  3. modelLoader.updateWater()→ Anima ondas del agua          │
│  4. soundSystem.update()     → Verifica si tocar sonido      │
│  5. renderer.render()        → Dibuja todo en pantalla       │
└─────────────────────────────────────────────────────────────┘
```

### Codigo en main.js

```javascript
// Cuando el DOM esta listo, crear la aplicacion
window.addEventListener('DOMContentLoaded', () => {
    new Application();
});

class Application {
    constructor() {
        // Guardar referencias a los componentes
        this.sceneSetup = null;
        this.lightingSystem = null;
        this.dayNightCycle = null;
        this.modelLoader = null;
        this.soundSystem = null;

        this.lastTime = 0;  // Para calcular deltaTime

        this.init();  // Iniciar todo
    }

    init() {
        // 1. Crear escena
        this.sceneSetup = new SceneSetup();

        // 2. Crear luces
        this.lightingSystem = new LightingSystem(this.sceneSetup.scene);

        // 3. Crear ciclo dia/noche
        this.dayNightCycle = new DayNightCycle(
            this.sceneSetup.scene,
            this.lightingSystem
        );

        // 4. Crear sistema de sonido
        this.soundSystem = new SoundSystem();

        // 5. Cargar modelos
        this.modelLoader = new ModelLoader(this.sceneSetup.scene);
        this.modelLoader.loadAll((waterMeshes) => {
            this.onModelsLoaded(waterMeshes);
        });

        // 6. Iniciar animacion
        this.animate();

        // 7. Activar sonido con interaccion del usuario
        // (Los navegadores requieren interaccion para reproducir audio)
        const initSound = () => {
            this.soundSystem.init();
            // Remover listeners despues de activar
            ['click', 'touchstart', 'keydown'].forEach(event => {
                document.removeEventListener(event, initSound);
            });
        };
        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, initSound, { once: true });
        });
    }
}
```

---

## 5. La escena 3D - SceneSetup

El archivo `src/scene/SceneSetup.js` es responsable de crear los 4 elementos fundamentales de cualquier aplicacion Three.js:

### Los 4 elementos fundamentales

```
┌────────────────────────────────────────────────────────────┐
│                        SCENE                                │
│   El "mundo" 3D donde viven todos los objetos              │
│   - Contiene todos los meshes, luces, camaras              │
│   - Tiene un color de fondo                                │
│   - Puede tener niebla (fog)                               │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                       CAMERA                                │
│   El "ojo" que mira la escena                              │
│   - PerspectiveCamera: simula vision humana                │
│   - FOV (Field of View): 75 grados                         │
│   - Near/Far: que tan cerca/lejos puede ver                │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                      RENDERER                               │
│   El "dibujante" que pinta en pantalla                     │
│   - WebGLRenderer: usa la GPU para dibujar                 │
│   - Antialiasing: suaviza bordes                           │
│   - Sombras habilitadas                                    │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                      CONTROLS                               │
│   Permiten mover la camara con mouse/touch                 │
│   - OrbitControls: rota alrededor de un punto              │
│   - Damping: movimiento suave (inercia)                    │
│   - Zoom limitado (5 a 30 unidades)                        │
└────────────────────────────────────────────────────────────┘
```

### Codigo explicado

```javascript
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
        // Crear el mundo 3D
        this.scene = new THREE.Scene();

        // Color de fondo (azul cielo)
        this.scene.background = new THREE.Color(CONFIG.skyColors.day);

        // Niebla para dar profundidad
        // Fog(color, distanciaInicio, distanciaFin)
        this.scene.fog = new THREE.Fog(CONFIG.skyColors.day, 30, 100);
    }

    createCamera() {
        const { fov, near, far, initialPosition } = CONFIG.camera;

        // Camara con perspectiva (como ojo humano)
        // PerspectiveCamera(FOV, aspectRatio, near, far)
        this.camera = new THREE.PerspectiveCamera(
            fov,                                    // 75 grados
            window.innerWidth / window.innerHeight, // Relacion de aspecto
            near,                                   // 0.1 (no ve mas cerca)
            far                                     // 1000 (no ve mas lejos)
        );

        // Posicionar la camara
        this.camera.position.set(
            initialPosition.x,  // 10
            initialPosition.y,  // 8
            initialPosition.z   // 10
        );
    }

    createRenderer() {
        // Crear el renderizador WebGL
        this.renderer = new THREE.WebGLRenderer({
            antialias: true  // Bordes suaves
        });

        // Tamano del canvas = tamano de la ventana
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Habilitar sombras
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Agregar el canvas al HTML
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);
    }

    createControls() {
        // Controles orbitales (girar con mouse)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // Movimiento suave
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Limites de zoom
        this.controls.minDistance = 5;   // No mas cerca
        this.controls.maxDistance = 30;  // No mas lejos
    }

    // Manejar cambio de tamano de ventana
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Llamar cada frame para actualizar controles
    update() {
        this.controls.update();
    }

    // Dibujar la escena
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
```

### Controles de usuario

| Accion | Mouse | Touch |
|--------|-------|-------|
| Rotar camara | Click izquierdo + arrastrar | Un dedo + arrastrar |
| Zoom | Rueda del mouse | Dos dedos (pinch) |
| Mover (pan) | Click derecho + arrastrar | Tres dedos |

---

## 6. Sistema de iluminacion - Lights

El archivo `src/scene/Lights.js` maneja todas las luces de la escena.

### Tipos de luces usadas

```
┌────────────────────────────────────────────────────────────┐
│                   AmbientLight                              │
│   Luz que ilumina TODO por igual                           │
│   - No tiene direccion                                     │
│   - No proyecta sombras                                    │
│   - Evita que las zonas sin luz directa sean negras        │
│   - Intensidad: 0.55 (dia) / 0.45 (noche)                  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                  DirectionalLight (Sol)                     │
│   Luz que viene de una direccion (como el sol real)        │
│   - Rayos paralelos                                        │
│   - Proyecta sombras                                       │
│   - Posicion sigue al sol en el cielo                      │
│   - Intensidad: 1.0 * dayFactor                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                  DirectionalLight (Luna)                    │
│   Igual que el sol pero para la noche                      │
│   - Color azulado (#AABBFF)                                │
│   - Intensidad: 0.8 * nightFactor                          │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                     PointLight                              │
│   Luz puntual dentro de la luna                            │
│   - Ilumina en todas direcciones                           │
│   - Da brillo extra a la luna                              │
│   - Intensidad: 1.2 * nightFactor                          │
└────────────────────────────────────────────────────────────┘
```

### Codigo explicado

```javascript
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
        // Luz ambiente - ilumina todo por igual
        this.ambientLight = new THREE.AmbientLight(
            0xFFFFFF,  // Color blanco
            0.55       // Intensidad
        );
        this.scene.add(this.ambientLight);
    }

    createDayLight() {
        // Luz direccional del sol
        this.dayLight = new THREE.DirectionalLight(
            0xFFFFDD,  // Amarillo suave
            1.0        // Intensidad maxima
        );

        this.dayLight.position.set(5, 20, 5);

        // Habilitar sombras
        this.dayLight.castShadow = true;

        // Configurar mapa de sombras (calidad)
        this.dayLight.shadow.mapSize.width = 2048;
        this.dayLight.shadow.mapSize.height = 2048;

        // Area que cubre las sombras
        this.dayLight.shadow.camera.left = -25;
        this.dayLight.shadow.camera.right = 25;
        this.dayLight.shadow.camera.top = 25;
        this.dayLight.shadow.camera.bottom = -25;

        this.scene.add(this.dayLight);
    }

    // Actualizar luces segun la hora del dia
    updateLighting(dayFactor) {
        // dayFactor: 0 = noche, 1 = dia
        const nightFactor = 1 - dayFactor;

        // Interpolar intensidad de luz ambiente
        this.ambientLight.intensity =
            0.55 * dayFactor +   // Intensidad de dia
            0.45 * nightFactor;  // Intensidad de noche

        // Interpolar color de luz ambiente
        // Blanco de dia, azulado de noche
        this.ambientLight.color.lerpColors(
            new THREE.Color(0xFFFFFF),  // Dia: blanco
            new THREE.Color(0x7788CC),  // Noche: azul
            nightFactor
        );

        // Intensidad del sol y luna
        this.dayLight.intensity = 1.0 * dayFactor;
        this.nightLight.intensity = 0.8 * nightFactor;
    }
}
```

### Como funcionan las sombras

```javascript
// Para que un objeto PROYECTE sombras:
objeto.castShadow = true;

// Para que un objeto RECIBA sombras:
objeto.receiveShadow = true;

// La luz debe tener sombras habilitadas:
luz.castShadow = true;

// El renderer debe tener sombras habilitadas:
renderer.shadowMap.enabled = true;
```

---

## 7. Cargando modelos 3D - ModelLoader

El archivo `src/models/ModelLoader.js` se encarga de cargar los archivos `.glb` (modelos 3D).

### Que es un archivo GLB?

- **GLB** = GLTF Binary (formato binario de GLTF)
- **GLTF** = GL Transmission Format
- Es el "JPEG de los modelos 3D"
- Contiene: geometria, materiales, texturas, animaciones
- Se exporta desde Blender con: `File > Export > glTF 2.0 (.glb/.gltf)`

### Proceso de carga

```
┌─────────────────────────────────────────────────────────────┐
│                    ModelLoader                               │
│                                                              │
│  loadAll(callback)                                           │
│       │                                                      │
│       ├──► loadBase()     ──► Carga base.glb                 │
│       │         │                                            │
│       │         └──► Detecta agua ──► Aplica animacion       │
│       │                                                      │
│       ├──► loadChicken() ──► Carga chicken.glb               │
│       │         │                                            │
│       │         └──► Posiciona, escala, rota                 │
│       │                                                      │
│       └──► loadWolf()    ──► Carga wolf.glb                  │
│                 │                                            │
│                 └──► Posiciona, escala, rota                 │
│                                                              │
│  Cuando todos cargan ──► callback(waterMeshes)               │
└─────────────────────────────────────────────────────────────┘
```

### Codigo explicado

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CONFIG } from '../utils/constants.js';
import { applyWaterAnimation, isWaterMesh } from '../materials/WaterShader.js';

export class ModelLoader {
    constructor(scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();  // Cargador de Three.js
        this.loadedCount = 0;
        this.totalModels = 3;

        // Guardar referencias a los modelos
        this.models = {
            chicken: null,
            wolf: null,
            base: null
        };

        this.waterMeshes = [];       // Meshes de agua encontrados
        this.waterAnimations = [];   // Funciones para animar el agua
    }

    // Cargar todos los modelos
    loadAll(onComplete) {
        // Los 3 se cargan en paralelo (asincrono)
        this.loadBase(() => this.checkComplete(onComplete));
        this.loadChicken(() => this.checkComplete(onComplete));
        this.loadWolf(() => this.checkComplete(onComplete));
    }

    loadBase(onLoad) {
        const config = CONFIG.models.base;

        // GLTFLoader.load(ruta, onExito, onProgreso, onError)
        this.loader.load(config.path, (gltf) => {
            // gltf.scene contiene el modelo 3D
            this.models.base = gltf.scene;

            // Recorrer todos los hijos del modelo
            this.models.base.traverse((child) => {
                if (child.isMesh) {
                    // Habilitar sombras
                    child.castShadow = true;
                    child.receiveShadow = true;

                    // Detectar si es agua
                    if (isWaterMesh(child)) {
                        // Aplicar animacion de ondas
                        const waterAnim = applyWaterAnimation(child);
                        this.waterMeshes.push(child);
                        this.waterAnimations.push(waterAnim.update);
                        console.log('Agua detectada:', child.name);
                    }
                }
            });

            // Agregar a la escena
            this.scene.add(this.models.base);
            onLoad();
        });
    }

    loadChicken(onLoad) {
        const config = CONFIG.models.chicken;

        this.loader.load(config.path, (gltf) => {
            this.models.chicken = gltf.scene;

            // Posicionar el modelo
            this.models.chicken.position.set(
                config.position.x,   // 3
                config.position.y,   // -0.05
                config.position.z    // -2
            );

            // Escalar (hacerlo mas pequeño)
            this.models.chicken.scale.setScalar(config.scale);  // 0.3

            // Rotar
            this.models.chicken.rotation.y = config.rotation;  // 45 grados

            // Habilitar sombras
            this.models.chicken.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });

            this.scene.add(this.models.chicken);
            onLoad();
        });
    }

    // Actualizar animacion del agua cada frame
    updateWater(time) {
        this.waterAnimations.forEach(update => {
            update(time);
        });
    }

    // Obtener un modelo por nombre
    getModel(name) {
        return this.models[name];
    }
}
```

### Propiedades importantes de posicion/escala/rotacion

```javascript
// POSICION - Donde esta el objeto en el espacio 3D
modelo.position.set(x, y, z);
modelo.position.x = 5;
modelo.position.y = 0;
modelo.position.z = -2;

// ESCALA - Tamano del objeto (1 = tamano original)
modelo.scale.setScalar(0.5);     // 50% del tamano
modelo.scale.set(2, 1, 2);       // Doble ancho, normal alto, doble profundo

// ROTACION - En radianes (PI = 180 grados)
modelo.rotation.y = Math.PI / 4; // 45 grados en eje Y
modelo.rotation.x = Math.PI;     // 180 grados en eje X
```

---

## 8. Ciclo dia/noche - DayNightCycle

El archivo `src/systems/DayNightCycle.js` crea el ciclo completo de dia y noche.

### Componentes del ciclo

```
┌─────────────────────────────────────────────────────────────┐
│                      SOL                                     │
│   - Esfera amarilla brillante                               │
│   - Orbita circular (radio: 18 unidades)                    │
│   - Posicion: x = radio * cos(angulo)                       │
│               y = radio * sin(angulo)                       │
│   - Fade out cuando baja del horizonte                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      LUNA                                    │
│   - Esfera gris/blanca                                      │
│   - Opuesta al sol (angulo + PI)                            │
│   - Tiene PointLight interno para brillo                    │
│   - Aparece cuando el sol se oculta                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ESTRELLAS                                 │
│   - 400 puntos blancos                                      │
│   - Distribuidas aleatoriamente en el cielo                 │
│   - Solo visibles de noche (nightFactor > 0.5)              │
│   - Rotan lentamente                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      NUBES                                   │
│   - 12 grupos de esferas blancas                            │
│   - Se mueven lentamente                                    │
│   - Cambian de color segun la hora                          │
│   - Se reciclan al salir del area                           │
└─────────────────────────────────────────────────────────────┘
```

### El angulo del ciclo

```
              cycleAngle = PI/2
                 (Mediodia)
                    │
                    │ SOL arriba
                    ▼
    ┌───────────────────────────────────┐
    │               ☀                   │
    │                                   │
0 ──┤         ESCENA 3D                 ├── PI
(Amanecer)                          (Atardecer)
    │                                   │
    │               ☾                   │
    └───────────────────────────────────┘
                    ▲
                    │ LUNA arriba
                    │
              cycleAngle = 3*PI/2
                (Medianoche)
```

### Codigo explicado

```javascript
import * as THREE from "three";
import { CONFIG } from "../utils/constants.js";

export class DayNightCycle {
    constructor(scene, lightingSystem) {
        this.scene = scene;
        this.lightingSystem = lightingSystem;

        this.isAnimating = true;
        this.cycleAngle = 0;  // Empieza en amanecer

        this.sun = null;
        this.moon = null;
        this.stars = null;
        this.clouds = [];

        this.init();
    }

    init() {
        this.createSun();
        this.createMoon();
        this.createStars();
        this.createClouds();
    }

    createSun() {
        const { sunSize } = CONFIG.dayNight;  // 3.0

        // Geometria: esfera
        const geometry = new THREE.SphereGeometry(sunSize, 32, 32);

        // Material: amarillo brillante
        const material = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            emissive: 0xFFAA00,      // Brillo propio
            emissiveIntensity: 1,
            transparent: true,
            opacity: 1,
        });

        this.sun = new THREE.Mesh(geometry, material);
        this.sun.position.set(0, 18, 0);  // Empieza arriba
        this.scene.add(this.sun);
    }

    createStars() {
        const { starCount } = CONFIG.dayNight;  // 400

        // Crear geometria con puntos aleatorios
        const geometry = new THREE.BufferGeometry();
        const positions = [];

        for (let i = 0; i < starCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 100,  // X: -50 a 50
                Math.random() * 25 + 8,       // Y: 8 a 33 (arriba)
                (Math.random() - 0.5) * 100   // Z: -50 a 50
            );
        }

        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        );

        // Material: puntos blancos
        const material = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.6,
            transparent: true,
            opacity: 0,  // Empiezan invisibles
        });

        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }

    // Actualizar cada frame
    update(deltaTime) {
        if (!this.isAnimating) return;

        const { speed, sunRadius, moonRadius } = CONFIG.dayNight;

        // Avanzar el ciclo
        // speed = 0.35 rad/s → ciclo completo en ~18 segundos
        this.cycleAngle += speed * deltaTime;

        // Reiniciar cuando completa una vuelta
        if (this.cycleAngle >= Math.PI * 2) {
            this.cycleAngle -= Math.PI * 2;
        }

        // Mover sol y luna
        this.updateSunPosition(sunRadius);
        this.updateMoonPosition(moonRadius);

        // Calcular que tan de dia/noche es
        const sunHeight = this.sun.position.y;
        const maxHeight = sunRadius;
        const normalizedSunHeight = (sunHeight + maxHeight) / (2 * maxHeight);
        const dayFactor = Math.max(0, Math.min(1, normalizedSunHeight));
        const nightFactor = 1 - dayFactor;

        // Actualizar todo segun la hora
        this.lightingSystem.updateLighting(dayFactor);
        this.updateSkyColor(dayFactor);
        this.updateStars(nightFactor);
        this.updateWaterColors(nightFactor);
        this.updateClouds(deltaTime, dayFactor);
    }

    updateSunPosition(radius) {
        // Movimiento circular
        // cos(0) = 1, sin(0) = 0 → sol a la derecha (amanecer)
        // cos(PI/2) = 0, sin(PI/2) = 1 → sol arriba (mediodia)
        this.sun.position.x = radius * Math.cos(this.cycleAngle);
        this.sun.position.y = radius * Math.sin(this.cycleAngle);
        this.sun.position.z = 0;
    }

    updateMoonPosition(radius) {
        // Luna opuesta al sol (+PI radianes = 180 grados)
        const moonAngle = this.cycleAngle + Math.PI;
        this.moon.position.x = radius * Math.cos(moonAngle);
        this.moon.position.y = radius * Math.sin(moonAngle);
        this.moon.position.z = 0;
    }

    updateSkyColor(dayFactor) {
        const colors = CONFIG.skyColors;
        let skyColor;

        // Interpolar colores segun la hora
        if (dayFactor > 0.8) {
            // Dia completo: azul cielo
            skyColor = new THREE.Color(colors.day);
        } else if (dayFactor > 0.6) {
            // Atardecer: azul → naranja
            const t = (dayFactor - 0.6) / 0.2;
            skyColor = new THREE.Color(colors.day).lerp(
                new THREE.Color(colors.sunset),
                1 - t
            );
        } else if (dayFactor > 0.3) {
            // Crepusculo: naranja → morado
            const t = (dayFactor - 0.3) / 0.3;
            skyColor = new THREE.Color(colors.sunset).lerp(
                new THREE.Color(colors.twilight),
                1 - t
            );
        } else {
            // Noche: azul oscuro
            skyColor = new THREE.Color(colors.night);
        }

        // Aplicar al fondo y niebla
        this.scene.background.copy(skyColor);
        this.scene.fog.color.copy(skyColor);
    }

    updateStars(nightFactor) {
        // Solo aparecen cuando nightFactor > 0.5
        const starOpacity = Math.max(0, (nightFactor - 0.5) / 0.5);
        this.stars.material.opacity = starOpacity;

        // Rotacion lenta
        this.stars.rotation.y += 0.0001;
    }
}
```

### Colores del cielo

| dayFactor | Momento | Color |
|-----------|---------|-------|
| > 0.8 | Dia completo | #87CEEB (azul cielo) |
| 0.6 - 0.8 | Atardecer temprano | Transicion a #FFA07A |
| 0.3 - 0.6 | Atardecer | Transicion a #4A5C8A |
| 0.1 - 0.3 | Crepusculo | Transicion a #0A1A2A |
| < 0.1 | Noche | #0A1A2A (azul muy oscuro) |

---

## 9. Sistema de sonidos - SoundSystem

El archivo `src/systems/SoundSystem.js` maneja todos los sonidos y sus animaciones asociadas.

### Sonidos disponibles

| Archivo | Duracion | Loop | Cuando suena |
|---------|----------|------|--------------|
| water-sound.mp3 | Continuo | Si | Siempre (fondo) |
| rooster.mp3 | ~2 seg | No | ~8 AM (cycleAngle ≈ 0.5) |
| wolf.mp3 | ~3 seg | No | Medianoche (cycleAngle ≈ 4.71) |

### Por que se necesita interaccion del usuario?

Los navegadores modernos **bloquean** la reproduccion automatica de audio. Esto es para evitar que las paginas web reproduzcan anuncios o sonidos molestos sin permiso.

Por eso, el codigo espera a que el usuario haga **click, toque la pantalla, o presione una tecla** antes de activar el audio.

### Codigo explicado

```javascript
export class SoundSystem {
    constructor() {
        this.roosterSound = null;
        this.wolfSound = null;
        this.waterSound = null;
        this.initialized = false;
        this.lastDayState = "dawn";
        this.firstCycle = true;

        // Referencias a los modelos para animarlos
        this.chickenModel = null;
        this.wolfModel = null;

        this.loadSounds();
    }

    loadSounds() {
        // Crear elementos de audio HTML5
        this.roosterSound = new Audio("/rooster.mp3");
        this.wolfSound = new Audio("/wolf.mp3");
        this.waterSound = new Audio("/water-sound.mp3");

        // Configurar volumen (0.0 a 1.0)
        this.roosterSound.volume = 0.6;
        this.wolfSound.volume = 0.6;
        this.waterSound.volume = 0.6;

        // El agua se repite infinitamente
        this.waterSound.loop = true;

        // Pre-cargar los archivos
        this.roosterSound.load();
        this.wolfSound.load();
        this.waterSound.load();
    }

    // Se llama cuando el usuario interactua
    init() {
        if (this.initialized) return;
        this.initialized = true;

        // Iniciar sonido de agua de fondo
        this.waterSound.play()
            .then(() => console.log("Agua sonando"))
            .catch((e) => console.warn("No se pudo reproducir agua:", e));
    }

    // Registrar modelos para poder animarlos
    setModels(chicken, wolf) {
        this.chickenModel = chicken;
        this.wolfModel = wolf;
    }

    // Reproducir gallo
    playRooster() {
        if (!this.initialized) return;

        // Bajar volumen del agua para escuchar mejor
        this.waterSound.volume = 0.05;

        // Reiniciar y reproducir
        this.roosterSound.currentTime = 0;
        this.roosterSound.play();

        // Restaurar volumen del agua despues de 2 segundos
        setTimeout(() => {
            this.waterSound.volume = 0.6;
        }, 2000);

        // Animar la gallina
        if (this.chickenModel) {
            this.animateChicken();
        }
    }

    // Animacion de la gallina (saltar y mover cabeza)
    animateChicken() {
        const model = this.chickenModel;
        const originalY = model.position.y;
        const originalRotX = model.rotation.x;
        let startTime = performance.now();
        const duration = 1500; // 1.5 segundos

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;  // 0 a 1

            if (progress < 1) {
                // Saltar arriba y abajo (4 saltos)
                const jumpHeight = Math.sin(progress * Math.PI * 4) * 0.15;
                model.position.y = originalY + Math.max(0, jumpHeight);

                // Mover cabeza arriba (3 veces)
                const headTilt = Math.sin(progress * Math.PI * 3) * 0.3;
                model.rotation.x = originalRotX - Math.max(0, headTilt);

                requestAnimationFrame(animate);
            } else {
                // Restaurar posicion original
                model.position.y = originalY;
                model.rotation.x = originalRotX;
            }
        };

        animate();
    }

    // Se llama cada frame para verificar si toca sonar algo
    update(cycleAngle) {
        if (!this.initialized) return;

        // cycleAngle va de 0 a 2*PI
        // 0 = amanecer
        // PI/2 = mediodia
        // PI = atardecer
        // 3*PI/2 = medianoche

        const PI = Math.PI;
        const tolerance = 0.08;

        // Gallina: ~8am = angulo 0.5
        const is8am = Math.abs(cycleAngle - 0.5) < tolerance;

        // Lobo: medianoche = angulo 3*PI/2 ≈ 4.71
        const isMidnight = Math.abs(cycleAngle - (3 * PI / 2)) < tolerance;

        // Esperar al primer ciclo para evitar sonar al inicio
        if (this.firstCycle && cycleAngle > PI / 2) {
            this.firstCycle = false;
        }

        if (!this.firstCycle) {
            if (is8am && this.lastDayState !== "morning") {
                this.playRooster();
                this.lastDayState = "morning";
            } else if (isMidnight && this.lastDayState !== "midnight") {
                this.playWolfHowl();
                this.lastDayState = "midnight";
            }
        }

        // Reset del estado para el siguiente ciclo
        if (!is8am && !isMidnight) {
            if (cycleAngle > 0.5 + tolerance && cycleAngle < PI) {
                this.lastDayState = "day";
            } else if (cycleAngle > PI && cycleAngle < (3 * PI / 2) - tolerance) {
                this.lastDayState = "evening";
            }
        }
    }
}
```

### Animacion del lobo

```javascript
animateWolf() {
    const model = this.wolfModel;
    const originalRotX = model.rotation.x;
    let startTime = performance.now();
    const duration = 2500; // 2.5 segundos

    const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            let headTilt;

            if (progress < 0.2) {
                // Fase 1: Subir cabeza rapido (0% - 20%)
                headTilt = (progress / 0.2) * 0.4;
            } else if (progress < 0.8) {
                // Fase 2: Mantener arriba con oscilacion (20% - 80%)
                headTilt = 0.4 + Math.sin((progress - 0.2) * Math.PI * 3) * 0.05;
            } else {
                // Fase 3: Bajar cabeza (80% - 100%)
                headTilt = 0.4 * (1 - (progress - 0.8) / 0.2);
            }

            model.rotation.x = originalRotX - headTilt;
            requestAnimationFrame(animate);
        } else {
            model.rotation.x = originalRotX;
        }
    };

    animate();
}
```

---

## 10. Animacion del agua - WaterShader

El archivo `src/materials/WaterShader.js` hace que el agua tenga ondas animadas.

### Como funcionan las ondas

En lugar de usar shaders GLSL complejos, este proyecto anima los **vertices** de la geometria directamente con JavaScript.

```
Vista de arriba del agua:
┌─────────────────────────────────────┐
│ · · · · · · · · · · · · · · · · · │  ← Cada punto es un vertice
│ · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · · · · · · · · │
│ · · · · · · · · · · · · · · · · · │
└─────────────────────────────────────┘

Vista lateral con ondas:
       ∧   ∧   ∧   ∧
──────/─\─/─\─/─\─/─\──────
     ∨   ∨   ∨   ∨

La posicion Z de cada vertice cambia segun:
Z = originalZ + wave1 + wave2 + wave3 + wave4 + circularWave
```

### Codigo explicado

```javascript
import * as THREE from 'three';

// Aplicar animacion de ondas a un mesh de agua
export function applyWaterAnimation(mesh) {
    const originalMaterial = mesh.material;

    // Clonar el material para no afectar otros objetos
    const animatedMaterial = originalMaterial.clone();

    // Agregar brillo/reflejo
    if (animatedMaterial.isMeshStandardMaterial) {
        animatedMaterial.metalness = 0.1;   // Poco metalico
        animatedMaterial.roughness = 0.3;   // Algo brillante
    }

    // Obtener geometria y posiciones de vertices
    const geometry = mesh.geometry;
    const positionAttribute = geometry.getAttribute('position');

    // Guardar posiciones originales (para poder calcular la onda)
    const originalPositions = new Float32Array(positionAttribute.array);

    // Funcion que se llama cada frame
    const updateWaves = (time) => {
        const positions = positionAttribute.array;

        // Recorrer cada vertice (cada 3 valores = x, y, z)
        for (let i = 0; i < positions.length; i += 3) {
            const x = originalPositions[i];
            const y = originalPositions[i + 1];
            const originalZ = originalPositions[i + 2];

            // Sumar varias ondas sinusoidales
            const wave1 = Math.sin(x * 0.8 + time * 0.8) * 0.045;
            const wave2 = Math.sin(y * 0.9 + time * 0.7) * 0.035;
            const wave3 = Math.cos(x * 1.1 - time * 0.6) * 0.03;
            const wave4 = Math.cos(y * 1.2 - time * 0.75) * 0.032;

            // Onda circular desde el centro
            const dist = Math.sqrt(x * x + y * y);
            const circularWave = Math.sin(dist * 1.5 - time * 1.0) * 0.02;

            // Nueva posicion Z = original + todas las ondas
            positions[i + 2] = originalZ + wave1 + wave2 + wave3 + wave4 + circularWave;
        }

        // Indicar a Three.js que actualice la geometria
        positionAttribute.needsUpdate = true;

        // Recalcular normales para iluminacion correcta
        geometry.computeVertexNormals();
    };

    mesh.material = animatedMaterial;

    return {
        material: animatedMaterial,
        update: updateWaves
    };
}

// Detectar si un mesh es agua
export function isWaterMesh(mesh) {
    const name = mesh.name.toLowerCase();

    // Lista de nombres que indican agua
    const waterNames = ['water', 'lake', 'lago', 'river', 'agua', 'rio', 'pond'];

    // Verificar por nombre
    if (waterNames.some(w => name.includes(w))) {
        return true;
    }

    // Verificar por color azul
    if (mesh.material && mesh.material.color) {
        const c = mesh.material.color;
        // Si es azulado (azul > rojo Y azul > verde Y azul > 0.5)
        if (c.b > c.r && c.b > c.g && c.b > 0.5) {
            return true;
        }
    }

    return false;
}
```

### Parametros de las ondas

Puedes ajustar estos valores en `constants.js`:

```javascript
water: {
    waveAmplitudes: [0.08, 0.06, 0.04, 0.05, 0.03],  // Altura de cada onda
    waveFrequencies: [1.5, 1.8, 2.2, 2.5, 3.0],      // Frecuencia espacial
    waveSpeeds: [1.2, 0.9, 0.8, 1.0, 2.0],           // Velocidad temporal
}
```

---

## 11. Configuracion centralizada - constants.js

El archivo `src/utils/constants.js` contiene **TODA** la configuracion del proyecto en un solo lugar.

### Por que es util?

1. **Facil de modificar**: Cambias un valor y afecta todo el proyecto
2. **Documentado**: Ves todos los parametros en un lugar
3. **Evita "numeros magicos"**: En vez de `0.35` usas `CONFIG.dayNight.speed`

### Estructura completa

```javascript
export const CONFIG = {
    // === CAMARA ===
    camera: {
        fov: 75,                              // Campo de vision (grados)
        near: 0.1,                            // Distancia minima de render
        far: 1000,                            // Distancia maxima de render
        initialPosition: { x: 10, y: 8, z: 10 },  // Donde empieza
    },

    // === CONTROLES DE CAMARA ===
    controls: {
        enableDamping: true,     // Movimiento suave
        dampingFactor: 0.05,     // Que tan suave (0-1)
        minDistance: 5,          // Zoom maximo (cerca)
        maxDistance: 30,         // Zoom minimo (lejos)
    },

    // === CICLO DIA/NOCHE ===
    dayNight: {
        speed: 0.35,             // Radianes por segundo (~18s por ciclo)
        sunRadius: 18,           // Radio de orbita del sol
        moonRadius: 18,          // Radio de orbita de la luna
        sunSize: 3.0,            // Tamano del sol
        moonSize: 2.2,           // Tamano de la luna
        starCount: 400,          // Numero de estrellas
        horizonFadeDistance: 5,  // Distancia de fade en horizonte
    },

    // === COLORES DEL CIELO ===
    skyColors: {
        day: 0x87CEEB,           // Azul cielo
        sunset: 0xFFA07A,        // Naranja/Rosa
        twilight: 0x4A5C8A,      // Crepusculo (morado)
        night: 0x0A1A2A,         // Noche (azul oscuro)
    },

    // === COLORES DEL AGUA ===
    waterColors: {
        day: {
            light: 0x5AB3FF,     // Azul claro
            deep: 0x1A7ACC,      // Azul medio
        },
        night: {
            light: 0x1A3A52,     // Azul oscuro
            deep: 0x0A1A2A,      // Casi negro
        },
    },

    // === ILUMINACION ===
    lighting: {
        ambient: {
            dayColor: 0xFFFFFF,       // Blanco de dia
            nightColor: 0x7788CC,     // Azul de noche
            dayIntensity: 0.55,
            nightIntensity: 0.45,
        },
        sun: {
            color: 0xFFFFDD,          // Amarillo suave
            intensity: 1.0,
            shadowMapSize: 2048,      // Resolucion de sombras
        },
        moon: {
            color: 0xAABBFF,          // Azul claro
            intensity: 0.8,
        },
    },

    // === MODELOS 3D ===
    models: {
        chicken: {
            path: "/chicken.glb",
            position: { x: 3, y: -0.05, z: -2 },
            scale: 0.3,
            rotation: Math.PI / 4,    // 45 grados
        },
        wolf: {
            path: "/wolf.glb",
            position: { x: -3, y: 0, z: 1 },
            scale: 0.4,
            rotation: -Math.PI / 6,   // -30 grados
        },
        base: {
            path: "/base.glb",
            position: { x: 0, y: 0, z: 0 },
            scale: 1,
        },
    },

    // === AGUA ===
    water: {
        opacity: 0.88,
        waveAmplitudes: [0.08, 0.06, 0.04, 0.05, 0.03],
        waveFrequencies: [1.5, 1.8, 2.2, 2.5, 3.0],
        waveSpeeds: [1.2, 0.9, 0.8, 1.0, 2.0],
    },
};
```

---

## 12. Como agregar un nuevo modelo

Sigue estos pasos para agregar un nuevo animal u objeto:

### Paso 1: Preparar el modelo

1. Crea o descarga un modelo 3D
2. Abrelo en Blender
3. Exporta como GLB: `File > Export > glTF 2.0 (.glb)`
   - Marca "Include > Selected Objects" si solo quieres exportar algunos
   - En "Geometry", asegurate de incluir las normales

### Paso 2: Agregar el archivo

Copia el archivo `.glb` a la carpeta `public/`:

```
public/
├── base.glb
├── chicken.glb
├── wolf.glb
└── nuevo_modelo.glb    ← Tu nuevo modelo
```

### Paso 3: Configurar en constants.js

Abre `src/utils/constants.js` y agrega la configuracion:

```javascript
models: {
    chicken: { ... },
    wolf: { ... },
    base: { ... },

    // NUEVO MODELO
    nuevoModelo: {
        path: "/nuevo_modelo.glb",
        position: { x: 0, y: 0, z: 5 },   // Donde aparece
        scale: 0.5,                        // Tamano
        rotation: 0,                       // Rotacion en Y (radianes)
    },
},
```

### Paso 4: Crear el metodo de carga en ModelLoader.js

Abre `src/models/ModelLoader.js` y agrega:

```javascript
// En el constructor, agregar al objeto models:
this.models = {
    chicken: null,
    wolf: null,
    base: null,
    nuevoModelo: null,    // ← Agregar aqui
};

// Incrementar el contador de modelos
this.totalModels = 4;     // Era 3, ahora es 4

// En loadAll(), agregar la llamada:
loadAll(onComplete) {
    this.loadBase(() => this.checkComplete(onComplete));
    this.loadChicken(() => this.checkComplete(onComplete));
    this.loadWolf(() => this.checkComplete(onComplete));
    this.loadNuevoModelo(() => this.checkComplete(onComplete));  // ← Agregar
}

// Crear el nuevo metodo:
loadNuevoModelo(onLoad) {
    const config = CONFIG.models.nuevoModelo;

    this.loader.load(config.path, (gltf) => {
        this.models.nuevoModelo = gltf.scene;

        // Posicionar
        this.models.nuevoModelo.position.set(
            config.position.x,
            config.position.y,
            config.position.z
        );

        // Escalar
        this.models.nuevoModelo.scale.setScalar(config.scale);

        // Rotar
        this.models.nuevoModelo.rotation.y = config.rotation;

        // Habilitar sombras
        this.models.nuevoModelo.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.scene.add(this.models.nuevoModelo);
        console.log('Nuevo modelo cargado!');
        onLoad();
    });
}
```

### Paso 5: Probar

```bash
npm run dev
```

El nuevo modelo deberia aparecer en la escena.

---

## 13. Como agregar un nuevo sonido

### Paso 1: Preparar el archivo de audio

- Formato recomendado: **MP3** (compatible con todos los navegadores)
- Duracion: lo que necesites
- Tamano: intenta mantenerlo pequeno (< 500KB para efectos)

### Paso 2: Agregar el archivo

Copia el archivo a `public/`:

```
public/
├── rooster.mp3
├── wolf.mp3
├── water-sound.mp3
└── nuevo_sonido.mp3    ← Tu nuevo sonido
```

### Paso 3: Cargar en SoundSystem.js

Abre `src/systems/SoundSystem.js` y agrega:

```javascript
constructor() {
    this.roosterSound = null;
    this.wolfSound = null;
    this.waterSound = null;
    this.nuevoSound = null;    // ← Agregar aqui
    // ...
}

loadSounds() {
    this.roosterSound = new Audio("/rooster.mp3");
    this.wolfSound = new Audio("/wolf.mp3");
    this.waterSound = new Audio("/water-sound.mp3");
    this.nuevoSound = new Audio("/nuevo_sonido.mp3");  // ← Agregar aqui

    // Configurar volumen
    this.nuevoSound.volume = 0.6;

    // Si quieres que se repita:
    // this.nuevoSound.loop = true;

    // Pre-cargar
    this.nuevoSound.load();
}
```

### Paso 4: Crear metodo para reproducir

```javascript
playNuevoSonido() {
    if (!this.initialized || !this.nuevoSound) return;

    // Opcional: bajar volumen del agua
    this.waterSound.volume = 0.1;

    // Reiniciar y reproducir
    this.nuevoSound.currentTime = 0;
    this.nuevoSound.play()
        .catch((e) => console.warn("Error:", e));

    // Opcional: restaurar volumen del agua
    setTimeout(() => {
        this.waterSound.volume = 0.6;
    }, 2000);

    console.log("Nuevo sonido!");
}
```

### Paso 5: Decidir cuando reproducir

Puedes llamar a `playNuevoSonido()` de varias formas:

**Opcion A: En un momento especifico del ciclo**

```javascript
update(cycleAngle) {
    // ...codigo existente...

    // Por ejemplo, al atardecer (PI = 3.14...)
    const isSunset = Math.abs(cycleAngle - Math.PI) < 0.08;

    if (isSunset && this.lastDayState !== "sunset") {
        this.playNuevoSonido();
        this.lastDayState = "sunset";
    }
}
```

**Opcion B: Con un boton**

En `index.html`:
```html
<button id="btn-sonido">Reproducir Sonido</button>
```

En `main.js`:
```javascript
document.getElementById('btn-sonido').addEventListener('click', () => {
    this.soundSystem.playNuevoSonido();
});
```

**Opcion C: Como sonido de fondo (loop)**

```javascript
init() {
    // ...codigo existente...

    // Iniciar sonido de fondo
    this.nuevoSound.play();
}
```

---

## 14. Diagrama de arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              index.html                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      #canvas-container                           │   │
│  │                     (WebGL Canvas)                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              main.js                                     │
│                          class Application                               │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │ │
│  │   │ SceneSetup  │  │   Lights    │  │    DayNightCycle        │  │ │
│  │   │             │  │             │  │                         │  │ │
│  │   │ • Scene     │◄─┤ • Ambient   │◄─┤ • Sol                   │  │ │
│  │   │ • Camera    │  │ • Sun Light │  │ • Luna                  │  │ │
│  │   │ • Renderer  │  │ • Moon Light│  │ • Estrellas             │  │ │
│  │   │ • Controls  │  │             │  │ • Nubes                 │  │ │
│  │   └─────────────┘  └─────────────┘  │ • Colores cielo/agua    │  │ │
│  │         ▲                           └─────────────────────────┘  │ │
│  │         │                                      ▲                  │ │
│  │         │                                      │                  │ │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │ │
│  │   │ ModelLoader │  │ WaterShader │  │     SoundSystem         │  │ │
│  │   │             │  │             │  │                         │  │ │
│  │   │ • base.glb  │──┤ • Ondas     │  │ • water-sound.mp3       │  │ │
│  │   │ • chicken   │  │ • Animacion │  │ • rooster.mp3           │  │ │
│  │   │ • wolf      │  │   vertices  │  │ • wolf.mp3              │  │ │
│  │   │             │  │             │  │ • Animaciones modelos   │  │ │
│  │   └─────────────┘  └─────────────┘  └─────────────────────────┘  │ │
│  │                                                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                         animate()                                  │ │
│  │                                                                    │ │
│  │   1. sceneSetup.update()         → Actualiza OrbitControls        │ │
│  │   2. dayNightCycle.update()      → Mueve sol/luna/estrellas       │ │
│  │   3. modelLoader.updateWater()   → Anima ondas                    │ │
│  │   4. soundSystem.update()        → Reproduce sonidos si toca      │ │
│  │   5. renderer.render()           → Dibuja frame                   │ │
│  │                                                                    │ │
│  │   requestAnimationFrame(animate) → Repite ~60 veces por segundo   │ │
│  │                                                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            constants.js                                  │
│                         Configuracion global                             │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │ CONFIG = {                                                          ││
│  │   camera: { fov, near, far, position },                            ││
│  │   controls: { damping, minDistance, maxDistance },                 ││
│  │   dayNight: { speed, sunRadius, moonRadius, starCount },           ││
│  │   skyColors: { day, sunset, twilight, night },                     ││
│  │   waterColors: { day, night },                                     ││
│  │   lighting: { ambient, sun, moon },                                ││
│  │   models: { chicken, wolf, base },                                 ││
│  │   water: { waveAmplitudes, waveFrequencies, waveSpeeds }          ││
│  │ }                                                                   ││
│  └────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Resumen final

Este proyecto demuestra los conceptos fundamentales de graficos 3D con Three.js:

| Concepto | Implementacion |
|----------|----------------|
| **Escena 3D** | Scene + Camera + Renderer |
| **Modelos** | GLTFLoader para archivos .glb |
| **Iluminacion** | Ambient + Directional + Point lights |
| **Animacion** | requestAnimationFrame loop |
| **Interaccion** | OrbitControls |
| **Audio** | HTML5 Audio API |
| **Efectos** | Animacion de vertices (agua) |
| **Tiempo** | Ciclo dia/noche basado en angulos |

Para entender mejor Three.js, te recomiendo:

1. [Documentacion oficial de Three.js](https://threejs.org/docs/)
2. [Three.js Fundamentals](https://threejs.org/manual/#en/fundamentals)
3. [Discover Three.js](https://discoverthreejs.com/)

---

*Documentacion generada para el proyecto Semestral de Sistemas Graficos*
