// public/showme-test.js
(function() {
  // CRÉATION D'UNE BANNIÈRE DE DEBUG VISUELLE
  const debugBanner = document.createElement('div');
  debugBanner.style.cssText = "position:fixed;top:0;left:0;width:100%;background:red;color:white;z-index:999999;padding:10px;text-align:center;font-weight:bold;font-family:sans-serif;";
  debugBanner.innerText = "[DEBUG] LE SCRIPT SHOWME-TEST EST BIEN CHARGÉ ✅";
  document.body.appendChild(debugBanner);

  const scriptTag = document.querySelector('script[src*="showme-test"]');
  const clientId = scriptTag ? scriptTag.getAttribute('data-client-id') : null;
  const SERVER_URL = "http://localhost:3000"; 

  console.log("%c[ShowMe NUCLEAR] Client ID détecté : " + clientId, "background: black; color: yellow; padding: 10px;");

  let hoverTimer = null;

  // CHARGEMENT
  fetch(`${SERVER_URL}/api/triggers/${clientId}`)
    .then(r => r.json())
    .then(triggers => {
      debugBanner.style.background = "green";
      debugBanner.innerText = `[DEBUG] CONNEXION API OK - ${triggers.length} TRIGGERS TROUVÉS`;
      
      triggers.forEach(t => {
        const elements = document.querySelectorAll(t.selector);
        console.log(`[ShowMe] Recherche de "${t.selector}" -> ${elements.length} trouvé(s)`);

        elements.forEach(el => {
          el.style.outline = "4px dashed green"; // On entoure les boutons pour les voir !

          el.addEventListener('mouseenter', () => {
            console.log("👀 Hover détecté !");
            // Vidéo simplifiée pour le test
            const v = document.createElement('video');
            v.src = t.video_url;
            v.style.cssText = "position:fixed;bottom:20px;right:20px;width:200px;z-index:9999;border:4px solid white;";
            v.id = "temp-video";
            v.autoplay = true;
            document.body.appendChild(v);

            hoverTimer = setTimeout(() => {
              console.log("📡 Envoi tracking...");
              fetch(`${SERVER_URL}/api/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ triggerId: t.id, clientId }),
                mode: 'cors'
              }).then(() => console.log("✅ TRACKÉ !"));
            }, 1000);
          });

          el.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
            const v = document.getElementById('temp-video');
            if(v) v.remove();
          });
        });
      });
    })
    .catch(err => {
      debugBanner.style.background = "black";
      debugBanner.innerText = "[DEBUG] ERREUR API : " + err.message;
    });
})();