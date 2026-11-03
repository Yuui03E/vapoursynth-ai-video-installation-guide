/**
 * Ryoku Anime Side Art System for VapourSynth AI Video Installation Guide
 * Displays aesthetic, safe-for-work (SFW) anime pictures from yande.re on the left and right flanks.
 * Features:
 *  - Fixed side flanks that never obscure main reading content or code.
 *  - Automatic hiding on narrow viewports (< 1380px).
 *  - User toggle: ON / OFF (saved in localStorage).
 *  - Shuffle button to cycle through illustrations.
 *  - Customizer dialog to add/remove your own yande.re URLs and adjust opacity.
 *  - Strict referrerpolicy="no-referrer" to prevent yande.re anti-hotlinking redirects.
 */

(function () {
  'use strict';

  // Default verified SFW, aesthetic landscape & character artworks from yande.re
  const DEFAULT_ART_LIST = [
    {
      id: 315846,
      url: 'https://files.yande.re/sample/7a958b9a1bc766a54811f335be6a5af1/yande.re%20315846%20sample%20kanou_meguri%20landscape%20misaki_kurehito%20saenai_heroine_no_sodatekata%20seifuku.jpg',
      title: 'Saekano Landscape (yande.re #315846)'
    },
    {
      id: 317740,
      url: 'https://files.yande.re/sample/a5fc35b5273b4401c3107a7f01246b60/yande.re%20317740%20sample%205_nenme_no_houkago%20dress%20kantoku%20landscape%20summer_dress.jpg',
      title: 'Summer Landscape (yande.re #317740)'
    },
    {
      id: 391895,
      url: 'https://files.yande.re/sample/ccab7529338bc24cf448db9cccf36e78/yande.re%20391895%20sample%205_nenme_no_houkago%20dress%20kantoku%20kurumi_%28kantoku%29%20landscape%20see_through%20skirt_lift%20summer_dress%20wings.jpg',
      title: 'Kantoku Landscape (yande.re #391895)'
    },
    {
      id: 406553,
      url: 'https://files.yande.re/sample/617230b9451bf96a088e0f27a8c39430/yande.re%20406553%20sample%20landscape%20natsu_%28hottopeppa3390%29%20seifuku%20sweater.jpg',
      title: 'Autumn Twilight (yande.re #406553)'
    },
    {
      id: 305610,
      url: 'https://files.yande.re/sample/3ca497e21c089117ed1e7f47b6b6061a/yande.re%20305610%20sample%20anmi%20dress%20landscape%20megane%20megane_shoujo%20paper_texture%20thighhighs.jpg',
      title: 'Anmi Scenic Art (yande.re #305610)'
    },
    {
      id: 434053,
      url: 'https://files.yande.re/sample/1998232a1fae62184c27b1e75aac6646/yande.re%20434053%20sample%20cura%20disc_cover%20landscape%20seifuku.jpg',
      title: 'Horizon Seifuku (yande.re #434053)'
    },
    {
      id: 290674,
      url: 'https://files.yande.re/sample/a75040e4ec93aeecd233ea9f733fde2e/yande.re%20290674%20sample%20landscape%20lm7%20seifuku%20thighhighs.jpg',
      title: 'LM7 Industrial Landscape (yande.re #290674)'
    },
    {
      id: 321279,
      url: 'https://files.yande.re/sample/564dff1b4ec0a548b8e52ecdd519864c/yande.re%20321279%20sample%20aki_tomoya%20katou_megumi%20landscape%20megane%20misaki_kurehito%20saenai_heroine_no_sodatekata.jpg',
      title: 'Cherry Blossom Slope (yande.re #321279)'
    },
    {
      id: 501760,
      url: 'https://files.yande.re/sample/b3c6558cfdc49446b8e6d6d7f9ff2163/yande.re%20501760%20sample%20chen_bin%20dress%20keisenko%20landscape%20thighhighs.jpg',
      title: 'Moonlit Lake (yande.re #501760)'
    }
  ];

  const STORAGE_KEY_ENABLED = 'ryoku_anime_art_enabled';
  const STORAGE_KEY_OPACITY = 'ryoku_anime_art_opacity';
  const STORAGE_KEY_CUSTOM_LIST = 'ryoku_anime_art_custom_list';

  function getArtList() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_LIST);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read custom art list:', e);
    }
    return [...DEFAULT_ART_LIST];
  }

  function saveArtList(list) {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_LIST, JSON.stringify(list));
    } catch (e) {
      console.error('Could not save art list:', e);
    }
  }

  function isArtEnabled() {
    return localStorage.getItem(STORAGE_KEY_ENABLED) !== 'false';
  }

  function setArtEnabled(val) {
    localStorage.setItem(STORAGE_KEY_ENABLED, val ? 'true' : 'false');
  }

  function getOpacity() {
    const val = localStorage.getItem(STORAGE_KEY_OPACITY);
    return val ? parseFloat(val) : 0.35;
  }

  function setOpacity(val) {
    localStorage.setItem(STORAGE_KEY_OPACITY, val.toString());
  }

  // Initialize DOM on document ready
  function initAnimeArt() {
    if (document.getElementById('ryoku-art-container')) return;

    // 1. Create Side Flanks Container
    const container = document.createElement('div');
    container.id = 'ryoku-art-container';
    container.className = 'ryoku-art-container';
    container.innerHTML = `
      <aside class="ryoku-art-flank ryoku-art-left" aria-hidden="true">
        <img id="ryoku-art-img-left" class="ryoku-art-img" referrerpolicy="no-referrer" alt="" />
        <div class="ryoku-art-fade-left"></div>
      </aside>
      <aside class="ryoku-art-flank ryoku-art-right" aria-hidden="true">
        <img id="ryoku-art-img-right" class="ryoku-art-img" referrerpolicy="no-referrer" alt="" />
        <div class="ryoku-art-fade-right"></div>
      </aside>
    `;
    document.body.prepend(container);

    // 2. Create Floating Toolbar
    const toolbar = document.createElement('div');
    toolbar.id = 'ryoku-art-toolbar';
    toolbar.className = 'ryoku-art-toolbar';
    toolbar.innerHTML = `
      <button id="ryoku-art-toggle-btn" class="ryoku-art-toolbar-btn" type="button" title="Toggle anime side artwork (ON / OFF)">
        <span class="ryoku-art-dot"></span>
        <span id="ryoku-art-toggle-label">ART: ON</span>
      </button>
      <button id="ryoku-art-shuffle-btn" class="ryoku-art-toolbar-btn" type="button" title="Shuffle new pictures">
        <span>🔀 SHUFFLE</span>
      </button>
      <button id="ryoku-art-manage-btn" class="ryoku-art-toolbar-btn" type="button" title="Manage & add yande.re pictures">
        <span>⚙️ ART SETTINGS</span>
      </button>
    `;
    document.body.appendChild(toolbar);

    // 3. Create Settings Modal
    const modal = document.createElement('div');
    modal.id = 'ryoku-art-modal';
    modal.className = 'ryoku-art-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="ryoku-art-modal-backdrop" id="ryoku-art-modal-backdrop"></div>
      <div class="ryoku-art-modal-dialog">
        <div class="ryoku-art-modal-header">
          <span class="ryoku-art-modal-title">ANIME SIDE ART // SETTINGS</span>
          <button id="ryoku-art-modal-close" class="ryoku-art-modal-close" type="button">&times;</button>
        </div>
        <div class="ryoku-art-modal-body">
          <p class="ryoku-art-modal-desc">
            Aesthetic illustrations from <strong>yande.re</strong> flank your display without obscuring the reading column.
          </p>

          <div class="ryoku-art-field">
            <div class="ryoku-art-field-header">
              <label for="ryoku-art-opacity-input">Side Art Opacity</label>
              <span id="ryoku-art-opacity-val" class="ryoku-art-badge">35%</span>
            </div>
            <input type="range" id="ryoku-art-opacity-input" min="5" max="85" value="35" />
          </div>

          <div class="ryoku-art-field">
            <label for="ryoku-art-url-input">Add Image from yande.re (Sample / Image URL):</label>
            <div class="ryoku-art-input-row">
              <input type="text" id="ryoku-art-url-input" placeholder="https://files.yande.re/sample/... or any direct anime picture URL" />
              <button id="ryoku-art-add-btn" class="ryoku-art-action-btn" type="button">+ ADD</button>
            </div>
            <span class="ryoku-art-hint">Tip: On yande.re, right click the picture and choose "Copy image address".</span>
          </div>

          <div class="ryoku-art-field">
            <div class="ryoku-art-field-header">
              <label>Active Pictures in Pool</label>
              <span id="ryoku-art-count-val" class="ryoku-art-badge"></span>
            </div>
            <div id="ryoku-art-list-container" class="ryoku-art-list-container"></div>
          </div>
        </div>
        <div class="ryoku-art-modal-footer">
          <button id="ryoku-art-reset-btn" class="ryoku-art-btn-secondary" type="button">Reset to Default SFW Art</button>
          <button id="ryoku-art-done-btn" class="ryoku-art-btn-primary" type="button">DONE</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Apply initial state
    applyState();
    setupEventListeners();
  }

  let currentLeftIdx = 0;
  let currentRightIdx = 1;

  function pickRandomIndices(total) {
    if (total <= 1) return [0, 0];
    const left = Math.floor(Math.random() * total);
    let right = Math.floor(Math.random() * total);
    while (right === left && total > 1) {
      right = Math.floor(Math.random() * total);
    }
    return [left, right];
  }

  function updateImages(animate = true) {
    const list = getArtList();
    if (list.length === 0) return;

    const imgLeft = document.getElementById('ryoku-art-img-left');
    const imgRight = document.getElementById('ryoku-art-img-right');
    if (!imgLeft || !imgRight) return;

    if (currentLeftIdx >= list.length) currentLeftIdx = 0;
    if (currentRightIdx >= list.length) currentRightIdx = Math.min(1, list.length - 1);

    if (animate) {
      imgLeft.style.opacity = '0';
      imgRight.style.opacity = '0';
      setTimeout(() => {
        imgLeft.src = list[currentLeftIdx].url;
        imgRight.src = list[currentRightIdx].url;
        imgLeft.onload = () => { imgLeft.style.opacity = '1'; };
        imgRight.onload = () => { imgRight.style.opacity = '1'; };
      }, 200);
    } else {
      imgLeft.src = list[currentLeftIdx].url;
      imgRight.src = list[currentRightIdx].url;
      imgLeft.style.opacity = '1';
      imgRight.style.opacity = '1';
    }
  }

  function shuffleImages() {
    const list = getArtList();
    const [l, r] = pickRandomIndices(list.length);
    currentLeftIdx = l;
    currentRightIdx = r;
    updateImages(true);
  }

  function applyState() {
    const enabled = isArtEnabled();
    const opacity = getOpacity();
    const container = document.getElementById('ryoku-art-container');
    const toggleLabel = document.getElementById('ryoku-art-toggle-label');
    const toggleBtn = document.getElementById('ryoku-art-toggle-btn');
    const opacityVal = document.getElementById('ryoku-art-opacity-val');
    const opacityInput = document.getElementById('ryoku-art-opacity-input');

    if (container) {
      container.style.display = enabled ? 'block' : 'none';
      container.style.opacity = enabled ? opacity.toString() : '0';
    }

    if (toggleLabel) {
      toggleLabel.textContent = enabled ? 'ART: ON' : 'ART: OFF';
    }
    if (toggleBtn) {
      if (enabled) {
        toggleBtn.classList.remove('is-off');
      } else {
        toggleBtn.classList.add('is-off');
      }
    }

    if (opacityVal) opacityVal.textContent = Math.round(opacity * 100) + '%';
    if (opacityInput) opacityInput.value = Math.round(opacity * 100).toString();

    const list = getArtList();
    const [l, r] = pickRandomIndices(list.length);
    currentLeftIdx = l;
    currentRightIdx = r;
    updateImages(false);
  }

  function renderModalArtList() {
    const list = getArtList();
    const container = document.getElementById('ryoku-art-list-container');
    const countVal = document.getElementById('ryoku-art-count-val');
    if (!container) return;

    if (countVal) countVal.textContent = list.length + ' images';
    container.innerHTML = '';

    list.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'ryoku-art-list-item';
      row.innerHTML = `
        <div class="ryoku-art-thumb-wrap">
          <img class="ryoku-art-thumb" src="${item.url}" referrerpolicy="no-referrer" alt="" />
        </div>
        <div class="ryoku-art-item-info">
          <span class="ryoku-art-item-title">${item.title || 'Image #' + (index + 1)}</span>
          <span class="ryoku-art-item-url">${item.url}</span>
        </div>
        <button class="ryoku-art-remove-btn" type="button" data-index="${index}" title="Remove this image">&times;</button>
      `;
      container.appendChild(row);
    });

    // Attach delete listeners
    container.querySelectorAll('.ryoku-art-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const current = getArtList();
        if (current.length <= 2) {
          alert('You need at least 2 pictures in the pool so the left and right sides can display artwork.');
          return;
        }
        current.splice(idx, 1);
        saveArtList(current);
        renderModalArtList();
        updateImages(true);
      });
    });
  }

  function setupEventListeners() {
    // 1. Toggle ON / OFF
    const toggleBtn = document.getElementById('ryoku-art-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = isArtEnabled();
        setArtEnabled(!current);
        applyState();
      });
    }

    // 2. Shuffle
    const shuffleBtn = document.getElementById('ryoku-art-shuffle-btn');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        if (!isArtEnabled()) {
          setArtEnabled(true);
          applyState();
        }
        shuffleImages();
      });
    }

    // 3. Modal open / close
    const manageBtn = document.getElementById('ryoku-art-manage-btn');
    const modal = document.getElementById('ryoku-art-modal');
    const modalClose = document.getElementById('ryoku-art-modal-close');
    const modalDone = document.getElementById('ryoku-art-done-btn');
    const modalBackdrop = document.getElementById('ryoku-art-modal-backdrop');

    function openModal() {
      if (modal) {
        renderModalArtList();
        modal.style.display = 'flex';
      }
    }

    function closeModal() {
      if (modal) modal.style.display = 'none';
    }

    if (manageBtn) manageBtn.addEventListener('click', openModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalDone) modalDone.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.style.display !== 'none') {
        closeModal();
      }
    });

    // 4. Opacity Slider
    const opacityInput = document.getElementById('ryoku-art-opacity-input');
    const opacityVal = document.getElementById('ryoku-art-opacity-val');
    if (opacityInput) {
      opacityInput.addEventListener('input', () => {
        const val = parseInt(opacityInput.value, 10) / 100;
        setOpacity(val);
        if (opacityVal) opacityVal.textContent = opacityInput.value + '%';
        const container = document.getElementById('ryoku-art-container');
        if (container && isArtEnabled()) {
          container.style.opacity = val.toString();
        }
      });
    }

    // 5. Add custom URL
    const addBtn = document.getElementById('ryoku-art-add-btn');
    const urlInput = document.getElementById('ryoku-art-url-input');
    if (addBtn && urlInput) {
      addBtn.addEventListener('click', () => {
        let url = urlInput.value.trim();
        if (!url) return;

        // Auto clean yande.re post page to direct sample image if possible
        if (url.includes('yande.re/post/show/')) {
          const match = url.match(/\/show\/(\d+)/);
          const postId = match ? match[1] : '';
          alert(`To add image from yande.re post #${postId}: right click the image on yande.re, select "Copy image address", and paste that direct link here!`);
          return;
        }

        const list = getArtList();
        const newId = Date.now();
        list.unshift({
          id: newId,
          url: url,
          title: 'Custom Art #' + list.length
        });
        saveArtList(list);
        urlInput.value = '';
        renderModalArtList();
        updateImages(true);
      });
    }

    // 6. Reset to default
    const resetBtn = document.getElementById('ryoku-art-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset to the default curated SFW anime artwork list?')) {
          saveArtList([...DEFAULT_ART_LIST]);
          renderModalArtList();
          updateImages(true);
        }
      });
    }
  }

  // Ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimeArt);
  } else {
    initAnimeArt();
  }
})();
