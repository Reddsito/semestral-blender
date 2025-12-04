// ═══════════════════════════════════════════════════════════
// CONTROLES UI - Botones e interfaz de usuario
// ═══════════════════════════════════════════════════════════

export class UIControls {
    constructor(dayNightCycle) {
        this.dayNightCycle = dayNightCycle;
        this.cycleButton = null;
        
        this.init();
    }

    init() {
        this.createCycleButton();
    }

    createCycleButton() {
        const controlsDiv = document.getElementById('controls');
        if (!controlsDiv) {
            console.error('Elemento "controls" no encontrado');
            return;
        }
        
        // Limpiar controles existentes
        controlsDiv.innerHTML = '';
        
        // Crear botón
        this.cycleButton = document.createElement('button');
        this.cycleButton.id = 'toggleCycle';
        this.cycleButton.textContent = '▶️ Iniciar Ciclo Día/Noche';
        
        // Estilos
        this.cycleButton.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        `;
        
        // Eventos
        this.cycleButton.addEventListener('mouseenter', () => this.onButtonHover());
        this.cycleButton.addEventListener('mouseleave', () => this.onButtonLeave());
        this.cycleButton.addEventListener('click', () => this.onButtonClick());
        
        controlsDiv.appendChild(this.cycleButton);
    }

    onButtonHover() {
        this.cycleButton.style.transform = 'translateY(-2px) scale(1.05)';
        this.cycleButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    }

    onButtonLeave() {
        this.cycleButton.style.transform = 'translateY(0) scale(1)';
        this.cycleButton.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    }

    onButtonClick() {
        const isAnimating = this.dayNightCycle.toggle();
        
        if (isAnimating) {
            this.cycleButton.textContent = '⏸️ Pausar Ciclo';
            this.cycleButton.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        } else {
            this.cycleButton.textContent = '▶️ Iniciar Ciclo';
            this.cycleButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    }

    /**
     * Muestra/oculta el loading screen
     */
    static hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        const controls = document.getElementById('controls');
        if (controls) {
            controls.style.display = 'flex';
        }
    }
}
