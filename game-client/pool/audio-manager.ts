/**
 * Web Audio API-based audio manager for pool game
 * Supports multiple simultaneous sound playback with proper synchronization
 */

export class AudioManager {
    private context: AudioContext | null = null;
    private audioBuffers: Map<string, AudioBuffer> = new Map();
    private masterGain: GainNode | null = null;
    private pendingSounds: Array<{ path: string; basePath: string }> = [];

    /**
     * Initialize Web Audio context (must be called after user interaction)
     */
    public initContext(): void {
        if (this.context) return;
        
        try {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            this.context = new AudioContextClass();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = 1.0;
            
            // Load any pending sounds that were deferred
            if (this.pendingSounds.length > 0) {
                const pending = [...this.pendingSounds];
                this.pendingSounds = [];
                pending.forEach(({ path, basePath }) => {
                    this.loadSound(path, basePath).catch(err => {
                        console.error(`[AudioManager] Failed to load deferred sound "${path}":`, err);
                    });
                });
            }
        } catch (err) {
            console.warn('[AudioManager] Web Audio API not supported:', err);
        }
    }

    /**
     * Check if audio context is initialized
     */
    public isInitialized(): boolean {
        return this.context !== null && this.context.state !== 'closed';
    }

    /**
     * Ensure audio context is active (resume if suspended)
     */
    private ensureContextResumed(): void {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume().catch(err => {
                console.warn('[AudioManager] Failed to resume audio context:', err);
            });
        }
    }

    /**
     * Load a sound file and cache it as an AudioBuffer
     */
    public async loadSound(path: string, basePath: string = ''): Promise<void> {
        if (!this.context) {
            // Defer loading until audio context is initialized
            if (!this.pendingSounds.some(s => s.path === path && s.basePath === basePath)) {
                this.pendingSounds.push({ path, basePath });
            }
            return;
        }

        try {
            const fullPath = basePath + path;
            const response = await fetch(fullPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            this.audioBuffers.set(path, audioBuffer);
        } catch (err) {
            console.error(`[AudioManager] Failed to load sound "${path}":`, err);
        }
    }

    /**
     * Play a sound with specified volume
     * Supports multiple simultaneous playback
     */
    public playSound(key: string, volume: number = 1.0): void {
        if (!this.isInitialized()) {
            // Only warn if sound isn't queued for loading
            const isPending = this.pendingSounds.some(s => s.path === key);
            if (!isPending) {
                console.warn('[AudioManager] Audio context not initialized and sound not queued:', key);
            }
            return;
        }

        this.ensureContextResumed();

        const audioBuffer = this.audioBuffers.get(key);
        if (!audioBuffer) {
            // Only warn if sound isn't queued for loading
            const isPending = this.pendingSounds.some(s => s.path === key);
            if (!isPending) {
                console.warn(`[AudioManager] Sound not found and not queued: ${key}`);
            }
            return;
        }

        try {
            // Create new source for each playback (enables simultaneous playback)
            const source = this.context!.createBufferSource();
            const gainNode = this.context!.createGain();

            source.buffer = audioBuffer;
            gainNode.gain.value = Math.max(0, Math.min(1, volume)); // Clamp volume to [0, 1]

            source.connect(gainNode);
            gainNode.connect(this.masterGain!);

            // Play immediately with precise timing
            source.start(0);
        } catch (err) {
            console.error(`[AudioManager] Error playing sound "${key}":`, err);
        }
    }

    /**
     * Stop all sounds
     */
    public stopAll(): void {
        // Note: Individual sources cannot be stopped directly in Web Audio API
        // To properly stop sounds, we would need to track source nodes
        // For now, this is a placeholder
    }

    /**
     * Set master volume (0.0 to 1.0)
     */
    public setMasterVolume(volume: number): void {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Get master volume
     */
    public getMasterVolume(): number {
        return this.masterGain?.gain.value ?? 1.0;
    }

    /**
     * Get number of loaded sounds
     */
    public getLoadedSoundCount(): number {
        return this.audioBuffers.size;
    }

    /**
     * Clear all cached audio buffers
     */
    public clear(): void {
        this.audioBuffers.clear();
    }
}

export const audioManager = new AudioManager();
