// public/showme.js
(function() {
  const scriptTag = document.querySelector('script[data-client-id]');
  if (!scriptTag) return;

  const clientId = scriptTag.getAttribute('data-client-id');
  const isSandbox = scriptTag.getAttribute('data-is-sandbox') === "true";
  const SERVER_URL = "http://localhost:3000"; 

  if (!document.getElementById('showme-core-style')) {
    const style = document.createElement('style');
    style.id = 'showme-core-style';
    style.innerHTML = `
      .showme-wrapper {
        position: fixed; z-index: 9999999; pointer-events: none; opacity: 0;
        transform: scale(0.9) translateX(20px); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        width: 270px; aspect-ratio: 9/19.5; background: #000; border-radius: 45px;
        box-shadow: 0 40px 80px rgba(0,0,0,0.8); overflow: hidden;
        border-style: solid; /* On prépare le contour */
      }
      .showme-wrapper.active { opacity: 1; transform: scale(1) translateX(0); }
      .showme-video { width: 100%; height: 100%; object-fit: cover; }
    `;
    document.head.appendChild(style);
  }

  let wrapper = document.querySelector('.showme-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'showme-wrapper';
    wrapper.innerHTML = `<video class="showme-video" muted playsinline loop></video>`;
    document.body.appendChild(wrapper);
  }
  const video = wrapper.querySelector('video');
  let hoverTimer = null;
  const STORAGE_KEY = `showme_viewed_${clientId}`;

  async function trackView(triggerId) {
    const viewed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (!isSandbox && viewed[triggerId] && (Date.now() - viewed[triggerId]) < 86400000) return;

    try {
      const res = await fetch(`${SERVER_URL}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerId, clientId, isSandbox }),
        mode: 'cors'
      });
      if (res.ok && !isSandbox) {
        viewed[triggerId] = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(viewed));
      }
    } catch (e) { console.error(e); }
  }

  window.ShowMeScan = function() {
    fetch(`${SERVER_URL}/api/triggers/${clientId}`)
      .then(r => r.json())
      .then(triggers => {
        triggers.forEach(t => {
          const targets = document.querySelectorAll(t.selector);
          targets.forEach(el => {
            el.onmouseenter = () => {
              video.src = t.video_url;
              video.play();
              
              // --- APPLICATION DU CONTOUR DYNAMIQUE ---
              const borderColor = t.device_color || "#1a1a1a"; 
              wrapper.style.border = `5px solid ${borderColor}`;
              
              const rect = el.getBoundingClientRect();
              let leftPos = rect.right + 30;
              if (leftPos + 270 > window.innerWidth) leftPos = rect.left - 270 - 30;

              wrapper.style.top = `${rect.top + (rect.height / 2) - 260}px`;
              wrapper.style.left = `${leftPos}px`;
              wrapper.classList.add('active');
              
              hoverTimer = setTimeout(() => trackView(t.id), isSandbox ? 100 : 1000);
            };

            el.onmouseleave = () => {
              wrapper.classList.remove('active');
              clearTimeout(hoverTimer);
              setTimeout(() => { if(!wrapper.classList.contains('active')) video.pause(); }, 400);
            };
          });
        });
      });
  };

  window.ShowMeScan();
})();