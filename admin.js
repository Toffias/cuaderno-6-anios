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

    const dataRes = await fetch('/api/album', { cache: 'no-store' });
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

  function buildChapterSidebar() {
    chapterTabsNav.innerHTML = album.chapters.map((ch, idx) => `
      <button class="side-tab" data-section="ch-${idx}">
        🎁 ${esc(ch.tabLabel)} · ${esc(ch.shortTitle)}
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
    `;

    bindInput('[data-key]', (el) => {
      album.meta[el.dataset.key] = el.value;
    });

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

    editorMain.innerHTML = `
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

    bindInput('[data-ch]', (el) => {
      ch[el.dataset.ch] = el.value;
      if (el.dataset.ch === 'tabLabel' || el.dataset.ch === 'shortTitle') {
        const navBtn = chapterTabsNav.querySelector(`[data-section="ch-${idx}"]`);
        if (navBtn) navBtn.textContent = `🎁 ${ch.tabLabel} · ${ch.shortTitle}`;
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
