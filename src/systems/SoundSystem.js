// ═══════════════════════════════════════════════════════════
// SISTEMA DE SONIDOS - Efectos de audio para el ciclo día/noche
// ═══════════════════════════════════════════════════════════

export class SoundSystem {
    constructor() {
        this.roosterSound = null;
        this.wolfSound = null;
        this.initialized = false;
        this.lastDayState = 'dawn'; // Empieza en dawn para no sonar al inicio
        this.firstCycle = true;

        this.loadSounds();
    }

    /**
     * Carga los archivos de audio
     */
    loadSounds() {
        this.roosterSound = new Audio('/rooster.mp3');
        this.wolfSound = new Audio('/wolf.mp3');

        this.roosterSound.volume = 0.6;
        this.wolfSound.volume = 0.6;

        // Pre-cargar
        this.roosterSound.load();
        this.wolfSound.load();

        console.log('🔊 Sonidos cargados');
    }

    /**
     * Inicializa el sistema (después de interacción del usuario)
     */
    init() {
        if (this.initialized) return;
        this.initialized = true;

        // Reproducir un sonido silencioso para desbloquear el audio
        this.roosterSound.volume = 0;
        this.roosterSound.play().then(() => {
            this.roosterSound.pause();
            this.roosterSound.currentTime = 0;
            this.roosterSound.volume = 0.6;
        }).catch(() => {});

        console.log('🔊 Sistema de sonido activado');
    }

    /**
     * Reproduce el sonido de la gallina
     */
    playRooster() {
        if (!this.initialized || !this.roosterSound) return;

        this.roosterSound.currentTime = 0;
        this.roosterSound.play().catch(e => console.warn('No se pudo reproducir rooster:', e));
        console.log('🐔 ¡Cocoroco!');
    }

    /**
     * Reproduce el aullido del lobo
     */
    playWolfHowl() {
        if (!this.initialized || !this.wolfSound) return;

        this.wolfSound.currentTime = 0;
        this.wolfSound.play().catch(e => console.warn('No se pudo reproducir wolf:', e));
        console.log('🐺 ¡Auuuuu!');
    }

    /**
     * Verifica el estado del ciclo y reproduce sonidos en los momentos correctos
     * @param {number} cycleAngle - Ángulo actual del ciclo (0 a 2*PI)
     */
    update(cycleAngle) {
        if (!this.initialized) return;

        // cycleAngle = 0 es cuando el sol está en el horizonte saliendo
        // cycleAngle = PI/2 es mediodía
        // cycleAngle = PI es atardecer
        // cycleAngle = 3*PI/2 es medianoche

        const PI = Math.PI;
        const tolerance = 0.08;

        // Detectar amanecer (cycleAngle cerca de 0 o 2*PI)
        const isDawn = cycleAngle < tolerance || cycleAngle > (2 * PI - tolerance);

        // Detectar medianoche (cycleAngle cerca de 3*PI/2)
        const isMidnight = Math.abs(cycleAngle - (3 * PI / 2)) < tolerance;

        // Después del primer ciclo, permitir sonidos
        if (this.firstCycle && cycleAngle > PI / 2) {
            this.firstCycle = false;
        }

        if (!this.firstCycle) {
            if (isDawn && this.lastDayState !== 'dawn') {
                this.playRooster();
                this.lastDayState = 'dawn';
            } else if (isMidnight && this.lastDayState !== 'midnight') {
                this.playWolfHowl();
                this.lastDayState = 'midnight';
            }
        }

        // Reset del estado
        if (!isDawn && !isMidnight) {
            if (cycleAngle > tolerance && cycleAngle < PI) {
                this.lastDayState = 'day';
            } else if (cycleAngle > PI && Math.abs(cycleAngle - (3 * PI / 2)) > tolerance) {
                this.lastDayState = 'night';
            }
        }
    }
}
