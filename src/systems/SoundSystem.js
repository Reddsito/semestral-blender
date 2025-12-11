// ═══════════════════════════════════════════════════════════
// SISTEMA DE SONIDOS - Efectos de audio para el ciclo día/noche
// ═══════════════════════════════════════════════════════════

export class SoundSystem {
	constructor() {
		this.roosterSound = null;
		this.wolfSound = null;
		this.waterSound = null;
		this.initialized = false;
		this.lastDayState = "dawn"; // Empieza en dawn para no sonar al inicio
		this.firstCycle = true;

		// Referencias a los modelos para animarlos
		this.chickenModel = null;
		this.wolfModel = null;

		// Estado de animaciones
		this.chickenAnimation = null;
		this.wolfAnimation = null;

		this.loadSounds();
	}

	/**
	 * Carga los archivos de audio
	 */
	loadSounds() {
		this.roosterSound = new Audio("/rooster.mp3");
		this.wolfSound = new Audio("/wolf.mp3");
		this.waterSound = new Audio("/water-sound.mp3");

		this.roosterSound.volume = 0.6;
		this.wolfSound.volume = 0.6;
		this.waterSound.volume = 0.6;
		this.waterSound.loop = true;

		// Pre-cargar
		this.roosterSound.load();
		this.wolfSound.load();
		this.waterSound.load();

		console.log("🔊 Sonidos cargados");
	}

	/**
	 * Inicializa el sistema (después de interacción del usuario)
	 */
	init() {
		if (this.initialized) return;
		this.initialized = true;

		// Iniciar sonido de agua de fondo
		this.waterSound.play()
			.then(() => console.log("💧 Agua sonando"))
			.catch((e) => console.warn("No se pudo reproducir agua:", e));

		console.log("🔊 Sistema de sonido activado");
	}

	/**
	 * Registra los modelos para animarlos
	 */
	setModels(chicken, wolf) {
		this.chickenModel = chicken;
		this.wolfModel = wolf;
	}

	/**
	 * Reproduce el sonido de la gallina y la anima
	 */
	playRooster() {
		if (!this.initialized || !this.roosterSound) return;

		// Bajar volumen del agua mientras suena
		this.waterSound.volume = 0.05;

		this.roosterSound.currentTime = 0;
		this.roosterSound
			.play()
			.catch((e) => console.warn("No se pudo reproducir rooster:", e));

		// Restaurar volumen del agua después
		setTimeout(() => {
			this.waterSound.volume = 0.6;
			if (this.waterSound.paused) {
				this.waterSound.play().catch(() => {});
			}
		}, 2000);

		// Animar la gallina (saltar y mover cabeza)
		if (this.chickenModel) {
			this.animateChicken();
		}

		console.log("🐔 ¡Cocoroco!");
	}

	/**
	 * Anima la gallina cuando canta
	 */
	animateChicken() {
		const model = this.chickenModel;
		const originalY = model.position.y;
		const originalRotX = model.rotation.x;
		let startTime = performance.now();
		const duration = 1500; // 1.5 segundos

		const animate = () => {
			const elapsed = performance.now() - startTime;
			const progress = elapsed / duration;

			if (progress < 1) {
				// Saltar arriba y abajo
				const jumpHeight = Math.sin(progress * Math.PI * 4) * 0.15;
				model.position.y = originalY + Math.max(0, jumpHeight);

				// Mover cabeza arriba (rotar en X)
				const headTilt = Math.sin(progress * Math.PI * 3) * 0.3;
				model.rotation.x = originalRotX - Math.max(0, headTilt);

				requestAnimationFrame(animate);
			} else {
				// Restaurar posición original
				model.position.y = originalY;
				model.rotation.x = originalRotX;
			}
		};

		animate();
	}

	/**
	 * Reproduce el aullido del lobo y lo anima
	 */
	playWolfHowl() {
		if (!this.initialized || !this.wolfSound) return;

		// Bajar volumen del agua mientras suena
		this.waterSound.volume = 0.05;

		this.wolfSound.currentTime = 0;
		this.wolfSound
			.play()
			.catch((e) => console.warn("No se pudo reproducir wolf:", e));

		// Restaurar volumen del agua después
		setTimeout(() => {
			this.waterSound.volume = 0.6;
			if (this.waterSound.paused) {
				this.waterSound.play().catch(() => {});
			}
		}, 3000);

		// Animar el lobo (levantar cabeza)
		if (this.wolfModel) {
			this.animateWolf();
		}

		console.log("🐺 ¡Auuuuu!");
	}

	/**
	 * Anima el lobo cuando aúlla
	 */
	animateWolf() {
		const model = this.wolfModel;
		const originalRotX = model.rotation.x;
		let startTime = performance.now();
		const duration = 2500; // 2.5 segundos

		const animate = () => {
			const elapsed = performance.now() - startTime;
			const progress = elapsed / duration;

			if (progress < 1) {
				// Levantar la cabeza hacia arriba (como aullando a la luna)
				let headTilt;
				if (progress < 0.2) {
					// Subir cabeza rápido
					headTilt = (progress / 0.2) * 0.4;
				} else if (progress < 0.8) {
					// Mantener arriba con pequeño movimiento
					headTilt = 0.4 + Math.sin((progress - 0.2) * Math.PI * 3) * 0.05;
				} else {
					// Bajar cabeza
					headTilt = 0.4 * (1 - (progress - 0.8) / 0.2);
				}

				model.rotation.x = originalRotX - headTilt;

				requestAnimationFrame(animate);
			} else {
				// Restaurar rotación original
				model.rotation.x = originalRotX;
			}
		};

		animate();
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

		// Gallina: ~8am = ángulo 0.5 (entre amanecer 0 y mediodía π/2)
		const is8am = Math.abs(cycleAngle - 0.5) < tolerance;

		// Lobo: medianoche = ángulo 3π/2 ≈ 4.71
		const isMidnight = Math.abs(cycleAngle - (3 * PI / 2)) < tolerance;

		// Después del primer ciclo, permitir sonidos
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

		// Reset del estado para permitir que suenen en cada ciclo
		if (!is8am && !isMidnight) {
			if (cycleAngle > 0.5 + tolerance && cycleAngle < PI) {
				this.lastDayState = "day";
			} else if (cycleAngle > PI && cycleAngle < (3 * PI / 2) - tolerance) {
				this.lastDayState = "evening";
			} else if (cycleAngle > (3 * PI / 2) + tolerance) {
				this.lastDayState = "night";
			}
		}
	}
}
