# 🐔🐺 Proyecto Animales en Three.js

Proyecto interactivo en Three.js que muestra modelos 3D de animales (gallina y lobo) con controles de cámara y animaciones.

## 🚀 Características

- ✨ Modelos 3D con texturas personalizadas
- 🎮 Controles interactivos de cámara (OrbitControls)
- 💡 Iluminación realista con sombras
- 🎬 Animaciones de rotación
- 📱 Diseño responsive
- 🎨 Interfaz moderna y elegante

## 📦 Instalación

### Requisitos previos
- Node.js (v18 o superior)
- pnpm (si no lo tienes, instálalo con `npm install -g pnpm`)

### Pasos de instalación

1. Navega al directorio del proyecto:
```bash
cd animals-threejs
```

2. Instala las dependencias con pnpm:
```bash
pnpm install
```

3. Copia los archivos de modelos:
   - Coloca `chicken.glb` en la carpeta `public/`
   - Coloca `wolf.glb` en la carpeta `public/`

4. Inicia el servidor de desarrollo:
```bash
pnpm dev
```

5. Abre tu navegador en `http://localhost:5173`

## 🎮 Controles

- **Arrastrar con el ratón**: Rotar la cámara
- **Scroll**: Hacer zoom in/out
- **Click derecho + arrastrar**: Mover (pan) la cámara
- **Botones en pantalla**:
  - 🐔 Mostrar Gallina: Enfoca solo la gallina
  - 🐺 Mostrar Lobo: Enfoca solo el lobo
  - 👥 Mostrar Ambos: Muestra ambos animales
  - 🎬 Animar: Activa/desactiva la rotación automática

## 📁 Estructura del proyecto

```
animals-threejs/
├── public/
│   ├── chicken.glb      # Modelo 3D de la gallina
│   └── wolf.glb         # Modelo 3D del lobo
├── index.html           # HTML principal
├── main.js              # Lógica de Three.js
├── package.json         # Configuración del proyecto
└── README.md           # Este archivo
```

## 🛠️ Scripts disponibles

```bash
pnpm dev      # Inicia servidor de desarrollo
pnpm build    # Construye para producción
pnpm preview  # Preview de la build de producción
```

## 🎨 Personalización

### Cambiar colores del fondo
Edita en `main.js`:
```javascript
scene.background = new THREE.Color(0x87ceeb); // Cambia el color aquí
```

### Ajustar escala de los modelos
Edita en `main.js`:
```javascript
chicken.scale.set(0.5, 0.5, 0.5); // Cambia la escala
wolf.scale.set(0.5, 0.5, 0.5);
```

### Modificar posiciones iniciales
Edita en `main.js`:
```javascript
chicken.position.set(-2, 0, 0); // Posición X, Y, Z
wolf.position.set(2, 0, 0);
```

## 🔧 Tecnologías utilizadas

- **Three.js**: Librería 3D para WebGL
- **Vite**: Build tool y dev server ultra rápido
- **GLTFLoader**: Cargador de modelos GLTF/GLB
- **OrbitControls**: Controles de cámara

## 📝 Notas

- Los modelos GLB ya incluyen las texturas embebidas
- El proyecto está optimizado para desarrollo con Vite
- Las sombras están activadas para mayor realismo

## 🐛 Solución de problemas

### Los modelos no se cargan
- Verifica que los archivos `.glb` estén en la carpeta `public/`
- Revisa la consola del navegador para ver errores
- Asegúrate de que los nombres de archivo coincidan exactamente

### El proyecto no inicia
- Verifica que pnpm esté instalado: `pnpm --version`
- Elimina `node_modules` y vuelve a instalar: `pnpm install`
- Verifica que tengas Node.js v18 o superior

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🎉 ¡Disfruta explorando tus modelos 3D!
