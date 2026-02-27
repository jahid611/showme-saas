// packages/widget/src/main.ts

interface Trigger {
  selector: string;
  video_url: string;
}

class ShowMeWidget {
  private clientId: string;
  private isInitialized: boolean = false;
  private apiBaseUrl: string = 'http://localhost:3000'; 
  
  private shadowRoot: ShadowRoot | null = null;
  private playerWrapper: HTMLDivElement | null = null;
  private videoElement: HTMLVideoElement | null = null;

  constructor() {
    this.clientId = this.extractClientId();
    
    if (!this.clientId) {
      console.error("[ShowMe] Erreur : Attribut 'data-client-id' manquant sur la balise script.");
      return;
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  private extractClientId(): string {
    const scriptTag = document.currentScript as HTMLScriptElement;
    if (scriptTag && scriptTag.dataset.clientId) {
      return scriptTag.dataset.clientId;
    }
    return "";
  }

  private async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      const triggers = await this.fetchTriggers();
      
      if (triggers && triggers.length > 0) {
        this.injectShadowDOM();
        this.attachEventListeners(triggers);
        console.log("[ShowMe] Moteur d'injection activé avec succès.");
      }
    } catch (error) {
      console.error("[ShowMe] Échec de l'initialisation :", error);
    }
  }

  private async fetchTriggers(): Promise<Trigger[]> {
    const response = await fetch(`${this.apiBaseUrl}/api/triggers/${this.clientId}`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    return await response.json();
  }

  private injectShadowDOM() {
    const host = document.createElement('div');
    host.id = 'showme-widget-host';
    host.style.position = 'absolute';
    host.style.top = '0';
    host.style.left = '0';
    host.style.zIndex = '2147483647';
    host.style.pointerEvents = 'none';
    document.body.appendChild(host);

    this.shadowRoot = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      .showme-player-wrapper {
        position: fixed;
        opacity: 0;
        transform: scale(0.95) translateY(10px);
        transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3);
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: #000;
        z-index: 2147483647;
      }
      .showme-player-wrapper.show {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      .showme-video {
        display: block;
        width: 250px;
        height: auto;
        aspect-ratio: 9/16;
        object-fit: cover;
      }
    `;
    
    this.playerWrapper = document.createElement('div');
    this.playerWrapper.className = 'showme-player-wrapper';
    
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
        element.addEventListener('mouseenter', (e) => this.showVideo(e as MouseEvent, trigger.video_url));
        element.addEventListener('mouseleave', () => this.hideVideo());
      });
    });
  }

  private showVideo(event: MouseEvent, videoUrl: string) {
    if (!this.playerWrapper || !this.videoElement) return;

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const videoWidth = 250;
    const videoHeight = (videoWidth * 16) / 9;
    const gap = 20;

    // --- CALCUL AXE X (Horizontal) ---
    let left = rect.right + gap; 
    const canFitRight = (rect.right + gap + videoWidth) <= window.innerWidth;
    const canFitLeft = (rect.left - gap - videoWidth) >= 0;

    if (!canFitRight) {
      if (canFitLeft) {
        left = rect.left - gap - videoWidth;
      } else {
        // Mode panique : on centre sur l'écran si ça ne tient nulle part
        left = Math.max(gap, (window.innerWidth - videoWidth) / 2);
      }
    }

    // --- CALCUL AXE Y (Vertical) ---
    let top = rect.top + (rect.height / 2) - (videoHeight / 2);
    const minTop = gap;
    const maxTop = window.innerHeight - videoHeight - gap;
    top = Math.max(minTop, Math.min(top, maxTop));

    // --- APPLICATION ---
    this.playerWrapper.style.top = `${top}px`;
    this.playerWrapper.style.left = `${left}px`;

    if (this.videoElement.src !== videoUrl) {
      this.videoElement.src = videoUrl;
    }
    
    this.playerWrapper.classList.add('show');
    this.videoElement.play().catch(e => console.error("[ShowMe] Erreur de lecture vidéo:", e));
  }

  private hideVideo() {
    if (!this.playerWrapper || !this.videoElement) return;
    this.playerWrapper.classList.remove('show');
    this.videoElement.pause();
  }
}

// L'instanciation est bien à l'extérieur de la classe
new ShowMeWidget();