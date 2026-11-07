(() => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const searchPanel = document.querySelector('[data-search-panel]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');
  let searchData = null;

  const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);

  window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

  navToggle?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => document.body.classList.remove('nav-open')));

  const openSearch = async () => {
    searchPanel?.classList.add('open');
    searchPanel?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => searchInput?.focus(), 80);
    if (!searchData) {
      try {
        const response = await fetch(`${window.ARES_ROOT || '/'}search.json`);
        searchData = await response.json();
      } catch (_) {
        searchResults.innerHTML = '<p class="search-hint">搜索索引暂时无法建立。</p>';
      }
    }
  };
  const closeSearch = () => {
    searchPanel?.classList.remove('open');
    searchPanel?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };
  document.querySelectorAll('[data-search-open]').forEach(button => button.addEventListener('click', openSearch));
  document.querySelectorAll('[data-search-close]').forEach(button => button.addEventListener('click', closeSearch));
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
    if (event.key === 'Escape') closeSearch();
  });
  searchInput?.addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    if (!query) { searchResults.innerHTML = '<p class="search-hint">输入关键词，检索全部探索日志。</p>'; return; }
    const matches = (searchData || []).filter(post => [post.title, post.text, ...post.categories, ...post.tags].join(' ').toLowerCase().includes(query)).slice(0, 8);
    searchResults.innerHTML = matches.length ? matches.map(post => `
      <a class="search-result" href="${escapeHtml(post.url)}">
        <span>${escapeHtml(post.date)} · ${escapeHtml(post.categories.join(' / ') || '探索日志')}</span>
        <strong>${escapeHtml(post.title)}</strong>
        <p>${escapeHtml(post.text.slice(0, 110))}…</p>
      </a>`).join('') : '<p class="search-hint">没有找到相关日志，换一个关键词试试。</p>';
  });

  const toc = document.querySelector('[data-toc-list]');
  if (toc) {
    const headings = [...document.querySelectorAll('.article-content h2, .article-content h3')];
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      if (heading.tagName === 'H3') link.className = 'sub';
      toc.appendChild(link);
    });
    if (!headings.length) document.querySelector('[data-toc]')?.remove();
  }

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

  const marsPanel = document.querySelector('[data-mars-panel]');
  const marsTrigger = document.querySelector('[data-mars-open]');
  const marsCanvas = document.querySelector('[data-mars-canvas]');
  if (marsPanel && marsTrigger && marsCanvas && window.Astronomy) {
    const AU_KM = 149597870.7;
    const LIGHT_KM_S = 299792.458;
    const MARS_RADIUS_KM = 3396.2;
    const fields = Object.fromEntries([
      'az', 'alt', 'ra', 'dec', 'ecliptic', 'distance', 'light', 'lighting', 'visibility', 'time',
      'observer-location', 'mars-trigger-status', 'mars-bearing'
    ].map(name => [name, document.querySelector(`[data-${name.startsWith('mars-') || name.startsWith('observer-') ? name : `mars-${name}`}]`)]));
    let observerLocation = null;
    let lastEphemeris = null;
    let locationRequested = false;
    let animationFrame = 0;
    let lastDraw = 0;

    const setPanelOpen = open => {
      marsPanel.classList.toggle('open', open);
      document.body.classList.toggle('mars-panel-open', open);
      marsPanel.setAttribute('aria-hidden', String(!open));
      marsTrigger.setAttribute('aria-expanded', String(open));
      if (open && !locationRequested) requestLocation();
    };

    const requestLocation = () => {
      locationRequested = true;
      if (!navigator.geolocation) {
        fields['observer-location'].textContent = '浏览器不支持定位';
        return;
      }
      fields['observer-location'].textContent = '正在请求位置…';
      navigator.geolocation.getCurrentPosition(position => {
        observerLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          height: position.coords.altitude || 0,
          accuracy: position.coords.accuracy
        };
        fields['observer-location'].textContent = `${formatDegree(observerLocation.latitude, 'N', 'S')}  ${formatDegree(observerLocation.longitude, 'E', 'W')}`;
        updateMarsData();
      }, error => {
        fields['observer-location'].textContent = error.code === 1 ? '定位未授权 · 仅显示地心坐标' : '暂时无法定位 · 请重试';
        locationRequested = false;
        updateMarsData();
      }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    };

    const formatDegree = (value, positive, negative) => `${Math.abs(value).toFixed(4)}°${value >= 0 ? positive : negative}`;
    const formatSignedDegree = value => `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(2)}°`;
    const formatRa = hours => {
      const h = Math.floor(hours);
      const minutes = (hours - h) * 60;
      return `${String(h).padStart(2, '0')}h ${String(Math.floor(minutes)).padStart(2, '0')}m`;
    };
    const compassPoint = azimuth => ['北', '东北', '东', '东南', '南', '西南', '西', '西北'][Math.round(azimuth / 45) % 8];

    const updateMarsData = () => {
      const now = new Date();
      const A = window.Astronomy;
      const geoVector = A.GeoVector(A.Body.Mars, now, true);
      const ecliptic = A.Ecliptic(geoVector);
      const illumination = A.Illumination(A.Body.Mars, now);
      const distanceKm = illumination.geo_dist * AU_KM;
      const angularDiameter = 2 * Math.atan(MARS_RADIUS_KM / distanceKm) * 180 / Math.PI * 3600;
      let equatorial;
      let horizontal = null;

      if (observerLocation) {
        const earthObserver = new A.Observer(observerLocation.latitude, observerLocation.longitude, observerLocation.height);
        equatorial = A.Equator(A.Body.Mars, now, earthObserver, true, true);
        horizontal = A.Horizon(now, earthObserver, equatorial.ra, equatorial.dec, 'normal');
      } else {
        equatorial = A.EquatorFromVector(geoVector);
      }

      lastEphemeris = { illumination, horizontal, angularDiameter };
      fields.ra.textContent = formatRa(equatorial.ra);
      fields.dec.textContent = formatSignedDegree(equatorial.dec);
      fields.ecliptic.textContent = `${ecliptic.elon.toFixed(2)}° / ${formatSignedDegree(ecliptic.elat)}`;
      fields.distance.textContent = `${(distanceKm / 1000000).toFixed(2)} 百万 km`;
      fields.light.textContent = `${(distanceKm / LIGHT_KM_S / 60).toFixed(1)} 分钟`;
      fields.lighting.textContent = `${illumination.mag.toFixed(2)} mag / ${(illumination.phase_fraction * 100).toFixed(1)}%`;
      fields.time.textContent = `UTC ${now.toISOString().replace('T', ' ').slice(0, 19)}`;

      if (horizontal) {
        fields.az.textContent = `${horizontal.azimuth.toFixed(2)}° ${compassPoint(horizontal.azimuth)}`;
        fields.alt.textContent = formatSignedDegree(horizontal.altitude);
        fields.visibility.textContent = horizontal.altitude >= 0
          ? `火星位于${compassPoint(horizontal.azimuth)}方地平线上 ${horizontal.altitude.toFixed(1)}°`
          : `火星当前在${compassPoint(horizontal.azimuth)}方地平线下 ${Math.abs(horizontal.altitude).toFixed(1)}°`;
        fields['mars-bearing'].style.transform = `rotate(${horizontal.azimuth}deg)`;
        fields['mars-trigger-status'].textContent = `${horizontal.altitude >= 0 ? '可见' : '地平线下'} ${formatSignedDegree(horizontal.altitude)}`;
      } else {
        fields.az.textContent = '需要定位';
        fields.alt.textContent = '需要定位';
        fields.visibility.textContent = `地心视图 · 视直径 ${angularDiameter.toFixed(1)}″`;
        fields['mars-trigger-status'].textContent = '启用定位';
      }
    };

    const drawMars = timestamp => {
      if (timestamp - lastDraw > 65) {
        lastDraw = timestamp;
        const context = marsCanvas.getContext('2d');
        const size = marsCanvas.width;
        const center = size / 2;
        const radius = size * .34;
        context.clearRect(0, 0, size, size);

        const halo = context.createRadialGradient(center, center, radius * .7, center, center, radius * 1.45);
        halo.addColorStop(0, 'rgba(210,91,52,.18)');
        halo.addColorStop(1, 'rgba(210,91,52,0)');
        context.fillStyle = halo;
        context.fillRect(0, 0, size, size);

        const phaseAngle = (lastEphemeris?.illumination.phase_angle || 0) * Math.PI / 180;
        const rotation = (Date.now() / 88775244 * Math.PI * 2) % (Math.PI * 2);
        const image = context.createImageData(size, size);
        for (let y = Math.floor(center - radius); y <= Math.ceil(center + radius); y++) {
          for (let x = Math.floor(center - radius); x <= Math.ceil(center + radius); x++) {
            const nx = (x - center) / radius;
            const ny = (center - y) / radius;
            const rr = nx * nx + ny * ny;
            if (rr > 1) continue;
            const nz = Math.sqrt(1 - rr);
            const longitude = Math.atan2(nx, nz) + rotation;
            const latitude = Math.asin(ny);
            const terrain = Math.sin(longitude * 3.1 + Math.sin(latitude * 4.4)) * .5
              + Math.sin(longitude * 8.7 - latitude * 5.3) * .24
              + Math.sin(longitude * 17.3 + latitude * 11.1) * .11;
            const light = Math.max(0, nx * Math.sin(phaseAngle) + nz * Math.cos(phaseAngle));
            const limb = Math.pow(nz, .35);
            const shade = (.055 + .945 * light) * (.55 + .45 * limb);
            const polar = Math.max(0, (Math.abs(latitude) - 1.25) * 4.2);
            const base = terrain > .28 ? [103, 43, 31] : terrain < -.36 ? [77, 31, 25] : [192, 75, 42];
            const index = (y * size + x) * 4;
            image.data[index] = Math.min(255, base[0] * shade + polar * 95);
            image.data[index + 1] = Math.min(255, base[1] * shade + polar * 95);
            image.data[index + 2] = Math.min(255, base[2] * shade + polar * 100);
            image.data[index + 3] = 255;
          }
        }
        context.putImageData(image, 0, 0);
        context.strokeStyle = 'rgba(255,146,94,.35)';
        context.lineWidth = 1;
        context.beginPath();
        context.arc(center, center, radius, 0, Math.PI * 2);
        context.stroke();
      }
      animationFrame = requestAnimationFrame(drawMars);
    };

    marsTrigger.addEventListener('click', () => setPanelOpen(!marsPanel.classList.contains('open')));
    document.querySelectorAll('[data-mars-close]').forEach(button => button.addEventListener('click', () => setPanelOpen(false)));
    document.querySelector('[data-location-request]')?.addEventListener('click', requestLocation);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && marsPanel.classList.contains('open')) setPanelOpen(false); });
    updateMarsData();
    setInterval(updateMarsData, 10000);
    animationFrame = requestAnimationFrame(drawMars);
    window.addEventListener('pagehide', () => cancelAnimationFrame(animationFrame), { once: true });
  }
})();

