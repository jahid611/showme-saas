interface Trigger {
  id: string; // Ajouté pour le tracking
  selector: string;
  video_url: string;
}

class ShowMeWidget {
  private clientId: string;
  private isInitialized: boolean = false;
  private apiBaseUrl: string;
  
  private shadowRoot: ShadowRoot | null = null;
  private playerWrapper: HTMLDivElement | null = null;
  private videoElement: HTMLVideoElement | null = null;

  private playPromise: Promise<void> | null = null;
  
  // Chrono pour le tracking de 1 seconde
  private trackTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.clientId = this.extractClientId();
    this.apiBaseUrl = this.getApiBaseUrl();
    
    if (!this.clientId) {
      console.error("[ShowMe] Erreur : data-client-id introuvable.");
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  private getApiBaseUrl(): string {
    // Si on est en dev, on force localhost, sinon on essaie de deviner
    const scriptTag = document.querySelector('script[data-client-id]') as HTMLScriptElement;
    if (scriptTag && scriptTag.src.includes('vercel.app')) {
      return new URL(scriptTag.src).origin;
    }
    return 'http://localhost:3000';
  }

  private extractClientId(): string {
    // Plus robuste que currentScript pour les modules
    const scriptTag = document.querySelector('script[data-client-id]') as HTMLScriptElement;
    return scriptTag?.dataset.clientId || "";
  }

  private async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      const triggers = await this.fetchTriggers();
      
      if (triggers && triggers.length > 0) {
        this.injectShadowDOM();
        this.attachEventListeners(triggers);
        console.log(`%c[ShowMe] Moteur activé (${triggers.length} triggers)`, "color: #800020; font-weight: bold;");
      }
    } catch (error) {
      console.error("[ShowMe] Échec initialisation :", error);
    }
  }

  private async fetchTriggers(): Promise<Trigger[]> {
    const response = await fetch(`${this.apiBaseUrl}/api/triggers/${this.clientId}`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    return await response.json();
  }

  private async trackView(triggerId: string) {
    try {
      console.log("[ShowMe] 📡 Tracking : Vue de 1s détectée...");
      await fetch(`${this.apiBaseUrl}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerId, clientId: this.clientId }),
        mode: 'cors'
      });
    } catch (e) {
      console.error("[ShowMe] Erreur tracking :", e);
    }
  }

  private injectShadowDOM() {
    const host = document.createElement('div');
    host.id = 'showme-widget-host';
    host.style.cssText = 'position:absolute;top:0;left:0;z-index:2147483647;pointer-events:none;';
    document.body.appendChild(host);

    this.shadowRoot = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      .showme-player-wrapper {
        position: fixed;
        opacity: 0;
        transform: scale(0.95) translateY(10px);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
        box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        border-radius: 40px;
        overflow: hidden;
        border: 4px solid #1a1a1a;
        background: #000;
        z-index: 2147483647;
        width: 280px;
        aspect-ratio: 9/19.5;
      }
      .showme-player-wrapper.show {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      .showme-video {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .dynamic-island {
        position: absolute;
        top: 15px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 12px;
        background: #000;
        border-radius: 10px;
        z-index: 10;
      }
    `;
    
    this.playerWrapper = document.createElement('div');
    this.playerWrapper.className = 'showme-player-wrapper';
    this.playerWrapper.innerHTML = `<div class="dynamic-island"></div>`;
    
    this.videoElement = document.createElement('video');
    this.videoElement.className = 'showme-video';
    this.videoElement.muted = true;
    this.videoElement.loop = true;
    this.videoElement.playsInline = true;

    this.playerWrapper.appendChild(this.videoElement);
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.playerWrapper);
  }

  private attachEventListeners(triggers: Trigger[]) {
    triggers.forEach(trigger => {
      const elements = document.querySelectorAll(trigger.selector);
      elements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
          this.showVideo(e as MouseEvent, trigger.video_url);
          // Lancement du chrono de 1 seconde pour le tracking
          this.trackTimeout = setTimeout(() => this.trackView(trigger.id), 1000);
        });

        element.addEventListener('mouseleave', () => {
          this.hideVideo();
          // Annulation du chrono si on part avant 1s
          if (this.trackTimeout) {
            clearTimeout(this.trackTimeout);
            this.trackTimeout = null;
          }
        });
      });
    });
  }

  private async showVideo(event: MouseEvent, videoUrl: string) {
    if (!this.playerWrapper || !this.videoElement) return;

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const videoWidth = 280;
    const videoHeight = (videoWidth * 19.5) / 9;
    const gap = 20;

    let left = rect.right + gap; 
    if ((rect.right + gap + videoWidth) > window.innerWidth) {
      left = rect.left - gap - videoWidth;
    }

    let top = rect.top + (rect.height / 2) - (videoHeight / 2);
    top = Math.max(gap, Math.min(top, window.innerHeight - videoHeight - gap));

    this.playerWrapper.style.top = `${top}px`;
    this.playerWrapper.style.left = `${left}px`;

    if (this.videoElement.src !== videoUrl) {
      this.videoElement.src = videoUrl;
    }
    
    this.playerWrapper.classList.add('show');
    this.playPromise = this.videoElement.play();
  }

  private async hideVideo() {
    if (!this.playerWrapper || !this.videoElement) return;
    this.playerWrapper.classList.remove('show');

    if (this.playPromise !== null) {
      try {
        await this.playPromise;
        this.videoElement.pause();
      } catch (e) {
      } finally {
        this.playPromise = null;
      }
    } else {
      this.videoElement.pause();
    }
  }
}

new ShowMeWidget();