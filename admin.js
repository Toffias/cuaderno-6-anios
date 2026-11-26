(function () {
  const pinScreen = document.getElementById('pinScreen');
  const pinForm = document.getElementById('pinForm');
  const pinInput = document.getElementById('pinInput');
  const pinError = document.getElementById('pinError');
  const adminApp = document.getElementById('adminApp');
  const chapterTabsNav = document.getElementById('chapterTabsNav');
  const editorMain = document.getElementById('editorMain');
  const saveBtn = document.getElementById('saveBtn');
  const saveStatus = document.getElementById('saveStatus');
  const downloadBackupBtn = document.getElementById('downloadBackupBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const toastEl = document.getElementById('toast');

  const CHAPTER_THEMES = [
    { id: 'vintage-warm',   icon: '☕', name: 'Clásico Cálido',      desc: 'Madera, papel crema y terracota', bg: 'linear-gradient(135deg,#2a1c19,#57342c)', paper: '#faf4e8', accent: '#c46455' },
    { id: 'coastal-sunset', icon: '🌅', name: 'Atardecer en el Mar', desc: 'Océano nocturno y coral cálido',  bg: 'linear-gradient(135deg,#13232e,#594a4e)', paper: '#fbf5eb', accent: '#d97254' },
    { id: 'starry-night',   icon: '🌌', name: 'Noche Estrellada',    desc: 'Índigo profundo y estrellitas',   bg: 'linear-gradient(135deg,#0f152a,#2d3a6b)', paper: '#f2f4fb', accent: '#5564a8' },
    { id: 'botanical-sage', icon: '🌿', name: 'Jardín Botánico',     desc: 'Verde bosque y hojitas',          bg: 'linear-gradient(135deg,#16231a,#36523c)', paper: '#f5f7f0', accent: '#547d5a' },
    { id: 'cozy-lavender',  icon: '🔮', name: 'Hogar & Lavanda',     desc: 'Ciruela suave y destellos',       bg: 'linear-gradient(135deg,#20172b,#513763)', paper: '#f9f3fb', accent: '#8e5c94' },
    { id: 'rose-champagne', icon: '🥂', name: 'Gala Rosa & Oro',     desc: 'Bordeaux romántico y burbujas',   bg: 'linear-gradient(135deg,#2b131b,#6b2c40)', paper: '#fdf4f6', accent: '#c4546d' },
    { id: 'autumn-cinema',  icon: '🍂', name: 'Otoño Nostálgico',    desc: 'Ámbar cálido y hojas de otoño',   bg: 'linear-gradient(135deg,#291710,#6e3b20)', paper: '#f9efe0', accent: '#c4602e' },
    { id: 'sakura-blush',   icon: '🌸', name: 'Primavera Sakura',    desc: 'Rosa pétalo y brisa floral',      bg: 'linear-gradient(135deg,#2d1922,#6e3b50)', paper: '#fef6f8', accent: '#d46c88' }
  ];

  let activePin = sessionStorage.getItem('album_admin_pin') || '';
  let album = null;
  let activeSection = 'meta';
  let isDirty = false;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove('show'), 2800);
  }

  function markDirty(dirty = true) {
    isDirty = dirty;
    saveStatus.textContent = dirty ? '● Cambios sin guardar' : '✓ Todo guardado en data/album.json';
    saveStatus.classList.toggle('dirty', dirty);
  }

  function esc(val) {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function verifyAndLoad(pin) {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    if (!res.ok) return false;

    const dataRes = await fetch('/api/admin/album', {
      cache: 'no-store',
      headers: { 'X-Admin-Pin': pin }
    });
    if (!dataRes.ok) throw new Error('No se pudo leer data/album.json');
    album = await dataRes.json();

    activePin = pin;
    sessionStorage.setItem('album_admin_pin', pin);
    pinScreen.classList.add('hidden');
    adminApp.classList.remove('hidden');
    buildChapterSidebar();
    renderSection();
    markDirty(false);
    return true;
  }

  pinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    pinError.textContent = '';
    const candidate = pinInput.value.trim();
    if (!candidate) return;
    try {
      const ok = await verifyAndLoad(candidate);
      if (!ok) {
        pinError.textContent = 'PIN incorrecto. Probá de nuevo.';
        pinInput.select();
      }
    } catch {
      pinError.textContent = 'Error de conexión con el servidor.';
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('album_admin_pin');
    activePin = '';
    pinInput.value = '';
    adminApp.classList.add('hidden');
    pinScreen.classList.remove('hidden');
    pinInput.focus();
  });

  // Auto-login if PIN already verified in this tab
  if (activePin) {
    verifyAndLoad(activePin).catch(() => {
      sessionStorage.removeItem('album_admin_pin');
      activePin = '';
    });
  } else {
    pinInput.focus();
  }

  // Convert stored ISO string (with tz offset) -> local YYYY-MM-DDTHH:mm for <input type="datetime-local">
  function isoToLocalInputValue(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Convert <input type="datetime-local"> value -> ISO string preserving user's local timezone offset (e.g. -03:00)
  function localInputToIsoWithOffset(localVal) {
    if (!localVal) return '';
    const d = new Date(localVal);
    if (Number.isNaN(d.getTime())) return '';
    const offsetMin = -d.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const absMin = Math.abs(offsetMin);
    const pad = (n) => String(n).padStart(2, '0');
    const hh = pad(Math.floor(absMin / 60));
    const mm = pad(absMin % 60);
    return `${localVal}:00${sign}${hh}:${mm}`;
  }

  function isFutureUnlock(iso) {
    if (!iso) return false;
    const ts = Date.parse(iso);
    return !Number.isNaN(ts) && ts > Date.now();
  }

  function formatPrettyDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function clearLocalUnlockedGift(envId) {
    try {
      const v2 = JSON.parse(localStorage.getItem('album_unlocked_envs_v2') || '{}');
      if (envId) delete v2[envId];
      else Object.keys(v2).forEach(k => delete v2[k]);
      localStorage.setItem('album_unlocked_envs_v2', JSON.stringify(v2));

      const v1 = JSON.parse(localStorage.getItem('album_unlocked_envs') || '[]');
      if (Array.isArray(v1)) {
        const nextV1 = envId ? v1.filter(id => id !== envId) : [];
        localStorage.setItem('album_unlocked_envs', JSON.stringify(nextV1));
      }
    } catch {}
  }

  function buildChapterSidebar() {
    chapterTabsNav.innerHTML = album.chapters.map((ch, idx) => `
      <button class="side-tab ${activeSection === 'ch-' + idx ? 'active' : ''}" data-section="ch-${idx}">
        ${isFutureUnlock(ch.unlockAt) ? '⏳' : '🎁'} ${esc(ch.tabLabel)} · ${esc(ch.shortTitle)}
      </button>
    `).join('');

    document.querySelectorAll('.side-tab').forEach(btn => {
      btn.onclick = () => {
        activeSection = btn.dataset.section;
        document.querySelectorAll('.side-tab').forEach(b => b.classList.toggle('active', b === btn));
        renderSection();
      };
    });
  }

  function bindInput(selector, onChange) {
    editorMain.querySelectorAll(selector).forEach(el => {
      el.addEventListener('input', () => {
        onChange(el);
        markDirty(true);
      });
    });
  }

  // ================= RENDER SECTIONS =================
  function renderSection() {
    if (activeSection === 'meta') renderMeta();
    else if (activeSection === 'dedication') renderDedication();
    else if (activeSection === 'security') renderSecurity();
    else if (activeSection.startsWith('ch-')) {
      renderChapter(Number(activeSection.replace('ch-', '')));
    }
  }

  function uploadMediaFile(file, folder, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');
      xhr.setRequestHeader('X-Admin-Pin', activePin);
      xhr.setRequestHeader('X-Upload-Folder', folder);
      xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && typeof onProgress === 'function') {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300 && json.ok) {
            resolve(json);
          } else {
            reject(new Error(json.error || 'Error al subir el archivo'));
          }
        } catch {
          reject(new Error('Respuesta inválida del servidor'));
        }
      };
      xhr.onerror = () => reject(new Error('Error de red al subir'));
      xhr.send(file);
    });
  }

  async function saveAlbumToDisk(silentToast) {
    const res = await fetch('/api/album', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Pin': activePin
      },
      body: JSON.stringify(album)
    });
    const json = await res.json();
    if (res.ok && json.ok) {
      markDirty(false);
      if (silentToast) showToast(silentToast);
      return true;
    }
    throw new Error(json.error || 'No se pudo guardar');
  }

  function renderMeta() {
    const m = album.meta;
    editorMain.innerHTML = `
      <section class="card">
        <div class="card-head">
          <h2>📖 Portada y Datos Generales</h2>
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Título de portada</label>
            <input data-key="coverTitle" value="${esc(m.coverTitle)}" />
          </div>
          <div class="field">
            <label>Número grande de portada</label>
            <input data-key="anniversaryNumber" value="${esc(m.anniversaryNumber)}" />
          </div>
        </div>
        <div class="field">
          <label>Subtítulo de portada</label>
          <input data-key="coverSubtitle" value="${esc(m.coverSubtitle)}" />
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Etiqueta de fechas (ej: 2020 — 2026)</label>
            <input data-key="datesLabel" value="${esc(m.datesLabel)}" />
          </div>
          <div class="field">
            <label>Fecha exacta de inicio (para contador de días)</label>
            <input data-key="startDate" value="${esc(m.startDate)}" placeholder="2020-11-25T00:00:00" />
          </div>
        </div>
        <div class="field">
          <label>Música de fondo (MP3 / OGG / M4A)</label>
          <div class="music-row">
            <input data-key="musicSrc" id="musicSrcInput" value="${esc(m.musicSrc)}" placeholder="Vacío = melodía suave integrada" />
            <label class="btn primary sm" style="cursor:pointer;">
              🎵 Subir canción
              <input type="file" id="musicUploadInput" accept=".mp3,.ogg,.m4a,audio/*" hidden />
            </label>
          </div>
          <small>Podés subir un MP3 directo desde tu compu y se guarda en <code>media/musica/</code>.</small>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <h2>📕 Contratapa (Cierre del Cuaderno)</h2>
        </div>
        <div class="field">
          <label>Título de contratapa</label>
          <input data-key="backTitle" value="${esc(m.backTitle)}" />
        </div>
        <div class="field">
          <label>Subtítulo de contratapa</label>
          <input data-key="backSubtitle" value="${esc(m.backSubtitle)}" />
        </div>
      </section>

      <section class="card highlight-gift">
        <div class="card-head">
          <h2>🎁 Estado de los 6 Regalos</h2>
          <button class="btn danger sm" id="resetAllGiftsBtn" type="button">🔄 Resetear los 6 regalos (volver a 0/6)</button>
        </div>
        <p style="font-size:0.86rem; color:var(--muted); line-height:1.55;">
          Si abriste sobres para probar las contraseñas, usá este botón para <b>volver a cerrar todos los regalos</b> (se reinician en tu navegador y en cualquier celular/navegador donde los hayas probado). También podés resetear un solo regalo desde su capítulo.
        </p>
      </section>
    `;

    bindInput('[data-key]', (el) => {
      album.meta[el.dataset.key] = el.value;
    });

    document.getElementById('resetAllGiftsBtn').onclick = async () => {
      album.chapters.forEach(ch => {
        (ch.envelopes || []).forEach(env => {
          env.resetVersion = Number(env.resetVersion || 0) + 1;
        });
      });
      clearLocalUnlockedGift(null);
      try {
        await saveAlbumToDisk('🔒 ¡Los 6 regalos volvieron a quedar cerrados (0/6)!');
      } catch (err) {
        showToast('❌ ' + err.message);
      }
    };

    document.getElementById('musicUploadInput').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      showToast('Subiendo canción...');
      try {
        const up = await uploadMediaFile(file, 'musica');
        album.meta.musicSrc = up.path;
        document.getElementById('musicSrcInput').value = up.path;
        await saveAlbumToDisk('✅ Canción subida y guardada');
      } catch (err) {
        showToast('❌ ' + err.message);
      }
    });
  }

  function renderDedication() {
    const d = album.dedication;
    editorMain.innerHTML = `
      <section class="card">
        <div class="card-head">
          <h2>💌 Dedicatoria Inicial (p. 01)</h2>
          <button class="btn sm" id="addParaBtn" type="button">+ Agregar párrafo</button>
        </div>
        <div class="field">
          <label>Título de la dedicatoria</label>
          <input id="dedTitle" value="${esc(d.title)}" />
        </div>
        ${d.paragraphs.map((p, i) => `
          <div class="sub-item">
            <div class="sub-item-head">
              <span>Párrafo ${i + 1}</span>
              ${d.paragraphs.length > 1 ? `<button class="btn danger sm" data-del-para="${i}" type="button">Quitar</button>` : ''}
            </div>
            <div class="field">
              <textarea data-para="${i}">${esc(p)}</textarea>
            </div>
          </div>
        `).join('')}
        <div class="field" style="margin-top:14px;">
          <label>Firma</label>
          <input id="dedSign" value="${esc(d.signature)}" />
        </div>
      </section>
    `;

    document.getElementById('dedTitle').addEventListener('input', (e) => { d.title = e.target.value; markDirty(true); });
    document.getElementById('dedSign').addEventListener('input', (e) => { d.signature = e.target.value; markDirty(true); });
    bindInput('[data-para]', (el) => { d.paragraphs[Number(el.dataset.para)] = el.value; });

    document.getElementById('addParaBtn').onclick = () => {
      d.paragraphs.push('');
      markDirty(true);
      renderDedication();
    };
    editorMain.querySelectorAll('[data-del-para]').forEach(btn => {
      btn.onclick = () => {
        d.paragraphs.splice(Number(btn.dataset.delPara), 1);
        markDirty(true);
        renderDedication();
      };
    });
  }

  function renderChapter(idx) {
    const ch = album.chapters[idx];
    if (!ch.envelopes) ch.envelopes = [];
    if (!ch.leftPage.hiddenNotes) ch.leftPage.hiddenNotes = [];
    if (!ch.rightPage.hiddenNotes) ch.rightPage.hiddenNotes = [];

    const renderHiddenEditor = (side, notes) => `
      <div style="margin-top:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <label style="font-size:0.78rem; font-weight:700; color:var(--muted);">🤫 Mensajes ocultos debajo de fotos (${side === 'left' ? 'Pág. izquierda' : 'Pág. derecha'})</label>
          <button class="btn sm" data-add-hidden="${side}" type="button">+ Agregar nota oculta</button>
        </div>
        ${notes.map((n, ni) => `
          <div class="sub-item">
            <div class="sub-item-head">
              <span>Nota oculta #${ni + 1}</span>
              <button class="btn danger sm" data-del-hidden="${side}:${ni}" type="button">Quitar</button>
            </div>
            <div class="field"><label>Etiqueta</label><input data-hn="${side}:${ni}:tag" value="${esc(n.tag)}" /></div>
            <div class="grid-2">
              <div class="field"><label>Posición X (ej: 18%)</label><input data-hn="${side}:${ni}:left" value="${esc(n.left)}" /></div>
              <div class="field"><label>Posición Y (ej: 48%)</label><input data-hn="${side}:${ni}:top" value="${esc(n.top)}" /></div>
            </div>
            <div class="field"><label>Texto escondido</label><textarea data-hn="${side}:${ni}:text">${esc(n.text)}</textarea></div>
          </div>
        `).join('')}
      </div>
    `;

    const lockedNow = isFutureUnlock(ch.unlockAt);
    const currentTheme = ch.theme || 'vintage-warm';
    editorMain.innerHTML = `
      <section class="card">
        <div class="card-head">
          <h2>⏳ Fecha y hora de habilitación (${esc(ch.tabLabel)})</h2>
          <span class="schedule-pill ${lockedNow ? 'locked' : 'open'}" id="chScheduleBadge">
            ${lockedNow ? '⏳ Sellado hasta el ' + formatPrettyDate(ch.unlockAt) : '🔓 Habilitado ahora'}
          </span>
        </div>
        <div class="field">
          <label>¿Cuándo querés que se habilite este capítulo? (dejalo vacío para que esté abierto ya)</label>
          <div class="schedule-row">
            <input type="datetime-local" id="chUnlockInput" value="${esc(isoToLocalInputValue(ch.unlockAt))}" />
            <button class="btn sm" id="clearUnlockBtn" type="button">🔓 Liberar ahora</button>
          </div>
          <small>Mientras falte para esa fecha y hora, el cuaderno muestra una cuenta regresiva en vivo y oculta las fotos, el tema y la pista del regalo.</small>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <h2>🎵 Canción / Tema musical de ${esc(ch.tabLabel)}</h2>
          ${ch.musicSrc ? `<button class="btn danger sm" id="clearChMusicBtn" type="button">✕ Quitar canción</button>` : ''}
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Nombre del tema (se muestra en el botón de música)</label>
            <input data-ch="musicTitle" value="${esc(ch.musicTitle || '')}" placeholder="Ej: Nuestra canción del ${esc(ch.tabLabel)}" />
          </div>
          <div class="field">
            <label>Archivo de audio (MP3 / OGG / M4A)</label>
            <div class="music-row">
              <input data-ch="musicSrc" id="chMusicSrcInput" value="${esc(ch.musicSrc || '')}" placeholder="Vacío = usa la canción general" />
              <label class="btn primary sm" style="cursor:pointer; white-space:nowrap;">
                🎵 Subir tema
                <input type="file" id="chMusicUploadInput" accept=".mp3,.ogg,.m4a,audio/*" hidden />
              </label>
            </div>
          </div>
        </div>
        ${ch.musicSrc ? `<audio controls src="/${esc(ch.musicSrc)}" style="width:100%; height:36px; margin-top:8px;"></audio>` : `<small style="color:var(--muted);">Si dejás esto vacío, en este capítulo suena la canción general configurada en Portada y General.</small>`}
      </section>

      <section class="card">
        <div class="card-head">
          <h2>🎨 Tema visual de ${esc(ch.tabLabel)}</h2>
        </div>
        <div class="theme-picker-grid" id="themePickerGrid">
          ${CHAPTER_THEMES.map(t => `
            <button type="button" class="theme-card ${currentTheme === t.id ? 'active' : ''}" data-theme-id="${t.id}">
              <div class="theme-swatch" style="background:${t.bg};">
                <span style="font-size:1.1rem;">${t.icon}</span>
                <span class="theme-swatch-paper" style="background:${t.paper};">
                  <span class="theme-swatch-dot" style="background:${t.accent};"></span>
                </span>
              </div>
              <span class="theme-name">${t.name}</span>
              <span class="theme-desc">${t.desc}</span>
            </button>
          `).join('')}
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <h2>📅 ${esc(ch.tabLabel)} · Encabezado y Textos de Hoja</h2>
        </div>
        <div class="grid-3">
          <div class="field"><label>Pestaña lateral</label><input data-ch="tabLabel" value="${esc(ch.tabLabel)}" /></div>
          <div class="field"><label>Título corto (Índice)</label><input data-ch="shortTitle" value="${esc(ch.shortTitle)}" /></div>
          <div class="field"><label>Etiqueta superior del año</label><input data-ch="yearLabel" value="${esc(ch.yearLabel)}" /></div>
        </div>

        <div class="grid-2" style="margin-top:12px;">
          <div class="sub-item">
            <div class="sub-item-head"><span>Página Izquierda</span></div>
            <div class="field"><label>Título</label><input data-page="leftPage:title" value="${esc(ch.leftPage.title)}" /></div>
            <div class="field"><label>Texto principal</label><textarea data-page="leftPage:story">${esc(ch.leftPage.story)}</textarea></div>
            ${renderHiddenEditor('left', ch.leftPage.hiddenNotes)}
          </div>
          <div class="sub-item">
            <div class="sub-item-head"><span>Página Derecha</span></div>
            <div class="field"><label>Título</label><input data-page="rightPage:title" value="${esc(ch.rightPage.title)}" /></div>
            <div class="field"><label>Texto principal</label><textarea data-page="rightPage:story">${esc(ch.rightPage.story)}</textarea></div>
            ${renderHiddenEditor('right', ch.rightPage.hiddenNotes)}
          </div>
        </div>
      </section>

      <section class="card highlight-gift">
        <div class="card-head">
          <h2>🎁 Sobre Secreto y Pista del Regalo (${esc(ch.tabLabel)})</h2>
          ${ch.envelopes.length ? `<button class="btn danger sm" id="resetChapterGiftBtn" type="button">🔄 Volver a cerrar este regalo</button>` : ''}
        </div>
        ${ch.envelopes.map((env, ei) => `
          <div class="sub-item" style="background:#fffdf9;">
            <div class="grid-2">
              <div class="field"><label>Título visible en el sobre</label><input data-env="${ei}:title" value="${esc(env.title)}" /></div>
              <div class="field"><label>🔑 Contraseña del sobre</label><input data-env="${ei}:code" value="${esc(env.code)}" /></div>
            </div>
            <div class="field"><label>Pista para adivinar la contraseña</label><input data-env="${ei}:hint" value="${esc(env.hint)}" /></div>
            <div class="field"><label>Título al abrir el sobre</label><input data-env="${ei}:secretTitle" value="${esc(env.secretTitle)}" /></div>
            <div class="field"><label>Mensaje romántico dentro del sobre</label><textarea data-env="${ei}:secretMessage">${esc(env.secretMessage)}</textarea></div>
            <div class="field">
              <label>📍 Pista de dónde está escondido el regalo</label>
              <textarea data-env="${ei}:giftClue">${esc(env.giftClue || '')}</textarea>
            </div>
          </div>
        `).join('')}
      </section>

      <section class="card">
        <div class="card-head">
          <h2>📸 Fotos y Videos de ${esc(ch.tabLabel)} (${ch.polaroids.length})</h2>
          <div class="upload-actions">
            <label class="btn primary sm" style="cursor:pointer;">
              📷 + Subir Foto
              <input type="file" id="uploadPhotoInput" accept="image/*" multiple hidden />
            </label>
            <label class="btn sm" style="cursor:pointer; border-color:var(--accent); color:var(--accent-dark);">
              🎬 + Subir Video
              <input type="file" id="uploadVideoInput" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" hidden />
            </label>
          </div>
        </div>

        <div class="upload-bar" id="chapterUploadBar">
          <span id="chapterUploadLabel">Subiendo archivo...</span>
          <div class="upload-track"><div class="upload-fill" id="chapterUploadFill"></div></div>
          <span id="chapterUploadPct">0%</span>
        </div>

        ${ch.polaroids.length === 0 ? `
          <div class="empty-media">
            <div style="font-size:2rem;">🖼️</div>
            <strong>Todavía no cargaste fotos ni videos en ${esc(ch.tabLabel)}</strong>
            <p>Usá los botones <b>📷 + Subir Foto</b> o <b>🎬 + Subir Video</b> de arriba. Se suben al servidor y aparecen directo como Polaroids en esta hoja.</p>
          </div>
        ` : ch.polaroids.map((p, pi) => {
          const previewHTML = p.type === 'video'
            ? (p.videoSrc ? `<video src="/${esc(p.videoSrc)}#t=0.1" muted playsinline preload="metadata"></video>` : '<span>Sin video</span>')
            : (p.imageSrc ? `<img src="/${esc(p.imageSrc)}" alt="${esc(p.caption)}" />` : '<span>Sin foto</span>');
          const sideVal = (p.x || 0) >= 50 ? 'right' : 'left';
          return `
          <div class="sub-item">
            <div class="sub-item-head">
              <span>${p.type === 'video' ? '🎬 Video Polaroid' : '📷 Foto Polaroid'} #${pi + 1}</span>
              <button class="btn danger sm" data-del-pol="${pi}" type="button">Quitar</button>
            </div>
            <div class="pol-admin-grid">
              <div class="pol-thumb-box">
                <div class="pol-thumb-media">${previewHTML}</div>
                <div class="pol-thumb-actions">
                  <label class="btn sm" style="cursor:pointer; width:100%;">
                    🔄 Cambiar ${p.type === 'video' ? 'video' : 'foto'}
                    <input type="file" data-replace-pol="${pi}" accept="${p.type === 'video' ? 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov' : 'image/*'}" hidden />
                  </label>
                </div>
              </div>
              <div>
                <div class="grid-3">
                  <div class="field"><label>Título en Polaroid</label><input data-pol="${pi}:caption" value="${esc(p.caption)}" /></div>
                  <div class="field"><label>Fecha (reverso)</label><input data-pol="${pi}:date" value="${esc(p.date)}" /></div>
                  <div class="field">
                    <label>Cinta washi</label>
                    <select data-pol="${pi}:tape">
                      <option value="default" ${(p.tape || 'default') === 'default' ? 'selected' : ''}>Terracota</option>
                      <option value="sage" ${p.tape === 'sage' ? 'selected' : ''}>Verde salvia</option>
                      <option value="gold" ${p.tape === 'gold' ? 'selected' : ''}>Dorado</option>
                      <option value="rose" ${p.tape === 'rose' ? 'selected' : ''}>Rosa</option>
                    </select>
                  </div>
                </div>
                <div class="field"><label>Mensaje secreto en el reverso</label><textarea data-pol="${pi}:backNote">${esc(p.backNote)}</textarea></div>
                <div class="grid-3">
                  <div class="field">
                    <label>Página inicial</label>
                    <select data-pol-side="${pi}">
                      <option value="left" ${sideVal === 'left' ? 'selected' : ''}>Izquierda</option>
                      <option value="right" ${sideVal === 'right' ? 'selected' : ''}>Derecha</option>
                    </select>
                  </div>
                  <div class="field"><label>Posición X (%)</label><input type="number" min="2" max="82" data-pol-num="${pi}:x" value="${esc(p.x ?? 10)}" /></div>
                  <div class="field"><label>Posición Y (%)</label><input type="number" min="8" max="70" data-pol-num="${pi}:y" value="${esc(p.y ?? 40)}" /></div>
                </div>
                <div class="field" style="margin-top:8px;">
                  <label>${p.type === 'video' ? 'Descripción en pantalla grande' : 'Pista "Moveme" (opcional, si tapa una nota oculta)'}</label>
                  <input data-pol="${pi}:${p.type === 'video' ? 'videoDesc' : 'moveHint'}" value="${esc(p.type === 'video' ? p.videoDesc : p.moveHint)}" placeholder="${p.type === 'video' ? 'Contá qué pasó en este video...' : 'Ej: ✋ Moveme para ver qué hay abajo'}" />
                </div>
              </div>
            </div>
          </div>
        `;
        }).join('')}
      </section>
    `;

    const unlockInput = document.getElementById('chUnlockInput');
    const scheduleBadge = document.getElementById('chScheduleBadge');
    function refreshScheduleBadge() {
      const isFut = isFutureUnlock(ch.unlockAt);
      scheduleBadge.className = 'schedule-pill ' + (isFut ? 'locked' : 'open');
      scheduleBadge.textContent = isFut ? ('⏳ Sellado hasta el ' + formatPrettyDate(ch.unlockAt)) : '🔓 Habilitado ahora';
      const navBtn = chapterTabsNav.querySelector(`[data-section="ch-${idx}"]`);
      if (navBtn) navBtn.textContent = `${isFut ? '⏳' : '🎁'} ${ch.tabLabel} · ${ch.shortTitle}`;
    }
    unlockInput.addEventListener('change', () => {
      ch.unlockAt = localInputToIsoWithOffset(unlockInput.value);
      markDirty(true);
      refreshScheduleBadge();
    });
    document.getElementById('clearUnlockBtn').onclick = () => {
      ch.unlockAt = '';
      unlockInput.value = '';
      markDirty(true);
      refreshScheduleBadge();
    };

    const chMusicUploadInput = document.getElementById('chMusicUploadInput');
    if (chMusicUploadInput) {
      chMusicUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        showToast(`Subiendo ${file.name}...`);
        try {
          const up = await uploadMediaFile(file, 'musica');
          ch.musicSrc = up.path;
          if (!ch.musicTitle) {
            ch.musicTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 34);
          }
          await saveAlbumToDisk(`🎵 Canción de ${ch.tabLabel} subida y guardada`);
          renderChapter(idx);
        } catch (err) {
          showToast('❌ ' + err.message);
        }
      });
    }

    const clearChMusicBtn = document.getElementById('clearChMusicBtn');
    if (clearChMusicBtn) {
      clearChMusicBtn.onclick = async () => {
        ch.musicSrc = '';
        ch.musicTitle = '';
        try {
          await saveAlbumToDisk(`Canción propia de ${ch.tabLabel} quitada`);
          renderChapter(idx);
        } catch (err) {
          showToast('❌ ' + err.message);
        }
      };
    }

    editorMain.querySelectorAll('[data-theme-id]').forEach(btn => {
      btn.onclick = () => {
        ch.theme = btn.dataset.themeId;
        editorMain.querySelectorAll('[data-theme-id]').forEach(b => b.classList.toggle('active', b === btn));
        markDirty(true);
      };
    });

    const resetChapterGiftBtn = document.getElementById('resetChapterGiftBtn');
    if (resetChapterGiftBtn) {
      resetChapterGiftBtn.onclick = async () => {
        ch.envelopes.forEach(env => {
          env.resetVersion = Number(env.resetVersion || 0) + 1;
          clearLocalUnlockedGift(env.id);
        });
        try {
          await saveAlbumToDisk(`🔒 Regalo de ${ch.tabLabel} vuelto a cerrar`);
        } catch (err) {
          showToast('❌ ' + err.message);
        }
      };
    }

    bindInput('[data-ch]', (el) => {
      ch[el.dataset.ch] = el.value;
      if (el.dataset.ch === 'tabLabel' || el.dataset.ch === 'shortTitle') {
        refreshScheduleBadge();
      }
    });

    bindInput('[data-page]', (el) => {
      const [pageKey, field] = el.dataset.page.split(':');
      ch[pageKey][field] = el.value;
    });

    bindInput('[data-hn]', (el) => {
      const [side, ni, field] = el.dataset.hn.split(':');
      const target = side === 'left' ? ch.leftPage.hiddenNotes : ch.rightPage.hiddenNotes;
      target[Number(ni)][field] = el.value;
    });

    editorMain.querySelectorAll('[data-add-hidden]').forEach(btn => {
      btn.onclick = () => {
        const target = btn.dataset.addHidden === 'left' ? ch.leftPage.hiddenNotes : ch.rightPage.hiddenNotes;
        target.push({ left: '18%', top: '48%', tag: '🤫 Nota oculta', text: 'Escribí tu mensaje secreto acá...' });
        markDirty(true);
        renderChapter(idx);
      };
    });

    editorMain.querySelectorAll('[data-del-hidden]').forEach(btn => {
      btn.onclick = () => {
        const [side, ni] = btn.dataset.delHidden.split(':');
        const target = side === 'left' ? ch.leftPage.hiddenNotes : ch.rightPage.hiddenNotes;
        target.splice(Number(ni), 1);
        markDirty(true);
        renderChapter(idx);
      };
    });

    bindInput('[data-env]', (el) => {
      const [ei, field] = el.dataset.env.split(':');
      ch.envelopes[Number(ei)][field] = el.value;
    });

    bindInput('[data-pol]', (el) => {
      const [pi, field] = el.dataset.pol.split(':');
      ch.polaroids[Number(pi)][field] = el.value;
    });

    editorMain.querySelectorAll('[data-pol-num]').forEach(el => {
      el.addEventListener('input', () => {
        const [pi, field] = el.dataset.polNum.split(':');
        ch.polaroids[Number(pi)][field] = Number(el.value) || 0;
        markDirty(true);
      });
    });

    editorMain.querySelectorAll('[data-pol-side]').forEach(sel => {
      sel.addEventListener('change', () => {
        const pi = Number(sel.dataset.polSide);
        ch.polaroids[pi].x = sel.value === 'right' ? 54 : 10;
        markDirty(true);
        renderChapter(idx);
      });
    });

    const uploadBar = document.getElementById('chapterUploadBar');
    const uploadLabel = document.getElementById('chapterUploadLabel');
    const uploadFill = document.getElementById('chapterUploadFill');
    const uploadPct = document.getElementById('chapterUploadPct');

    function setUploadProgress(active, label, pct) {
      uploadBar.classList.toggle('active', active);
      if (label) uploadLabel.textContent = label;
      uploadFill.style.width = (pct || 0) + '%';
      uploadPct.textContent = (pct || 0) + '%';
    }

    async function handleAddMediaFiles(files, mediaType) {
      const list = Array.from(files || []);
      if (!list.length) return;
      const tapes = ['default', 'sage', 'gold', 'rose'];

      try {
        for (let i = 0; i < list.length; i++) {
          const file = list[i];
          setUploadProgress(true, `Subiendo ${file.name} (${i + 1}/${list.length})...`, 5);
          const up = await uploadMediaFile(file, ch.id, (pct) => {
            setUploadProgress(true, `Subiendo ${file.name}...`, pct);
          });

          const count = ch.polaroids.length;
          const onRight = count % 2 === 1;
          const cleanCaption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 28) || 'Nuestro recuerdo ♥';

          ch.polaroids.push({
            id: `p-${idx + 1}-${Date.now()}-${i}`,
            type: mediaType,
            imageSrc: mediaType === 'photo' ? up.path : '',
            videoSrc: mediaType === 'video' ? up.path : '',
            posterSrc: '',
            duration: '',
            caption: cleanCaption,
            date: ch.tabLabel,
            backNote: 'Escribí acá tu mensaje secreto para el reverso ♥',
            videoDesc: mediaType === 'video' ? 'Un momento inolvidable juntos.' : '',
            tape: tapes[count % tapes.length],
            x: onRight ? 54 + (count % 3) * 4 : 8 + (count % 3) * 4,
            y: 36 + (count % 3) * 7,
            rot: (count % 2 === 0 ? -3 : 3)
          });
        }
        setUploadProgress(false, '', 0);
        await saveAlbumToDisk(mediaType === 'video' ? '✅ Video subido y guardado en el cuaderno' : '✅ Foto subida y guardada en el cuaderno');
        renderChapter(idx);
      } catch (err) {
        setUploadProgress(false, '', 0);
        showToast('❌ ' + err.message);
      }
    }

    document.getElementById('uploadPhotoInput').addEventListener('change', (e) => {
      handleAddMediaFiles(e.target.files, 'photo');
    });
    document.getElementById('uploadVideoInput').addEventListener('change', (e) => {
      handleAddMediaFiles(e.target.files, 'video');
    });

    editorMain.querySelectorAll('[data-replace-pol]').forEach(input => {
      input.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const pi = Number(input.dataset.replacePol);
        const targetPol = ch.polaroids[pi];
        try {
          setUploadProgress(true, `Reemplazando ${file.name}...`, 10);
          const up = await uploadMediaFile(file, ch.id, (pct) => setUploadProgress(true, `Subiendo ${file.name}...`, pct));
          if (targetPol.type === 'video') targetPol.videoSrc = up.path;
          else targetPol.imageSrc = up.path;
          setUploadProgress(false, '', 0);
          await saveAlbumToDisk('✅ Archivo actualizado y guardado');
          renderChapter(idx);
        } catch (err) {
          setUploadProgress(false, '', 0);
          showToast('❌ ' + err.message);
        }
      });
    });

    editorMain.querySelectorAll('[data-del-pol]').forEach(btn => {
      btn.onclick = () => {
        ch.polaroids.splice(Number(btn.dataset.delPol), 1);
        markDirty(true);
        renderChapter(idx);
      };
    });
  }

  function renderSecurity() {
    editorMain.innerHTML = `
      <section class="card">
        <div class="card-head">
          <h2>🔐 Cambiar PIN de /admin</h2>
        </div>
        <p style="font-size:0.9rem; color:var(--muted); margin-bottom:16px;">
          El PIN se guarda en el archivo físico <code>data/admin-config.json</code> (nunca visible para los visitantes del cuaderno).
        </p>
        <form id="changePinForm" style="max-width:360px;">
          <div class="field">
            <label>Nuevo PIN (4 a 20 caracteres)</label>
            <input type="password" id="newPinInput" minlength="4" maxlength="20" required />
          </div>
          <button type="submit" class="btn primary">Actualizar PIN</button>
        </form>
      </section>
    `;

    document.getElementById('changePinForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPin = document.getElementById('newPinInput').value.trim();
      const res = await fetch('/api/admin/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Pin': activePin },
        body: JSON.stringify({ newPin })
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        activePin = newPin;
        sessionStorage.setItem('album_admin_pin', newPin);
        document.getElementById('newPinInput').value = '';
        showToast('✅ PIN actualizado correctamente');
      } else {
        showToast('❌ ' + (json.error || 'No se pudo cambiar el PIN'));
      }
    });
  }

  // ================= SAVE & BACKUP =================
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando...';
    try {
      await saveAlbumToDisk('✅ Guardado en data/album.json');
    } catch (err) {
      showToast('❌ ' + (err.message || 'Error al guardar'));
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Guardar cambios';
    }
  });

  downloadBackupBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(album, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'album-respaldo.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  window.addEventListener('beforeunload', (e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
})();
