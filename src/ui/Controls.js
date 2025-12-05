// ═══════════════════════════════════════════════════════════
// CONTROLES UI - Funciones de interfaz de usuario
// ═══════════════════════════════════════════════════════════

export class UIControls {
    constructor(dayNightCycle) {
        this.dayNightCycle = dayNightCycle;
    }

    /**
     * Oculta el loading screen
     */
    static hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
}
