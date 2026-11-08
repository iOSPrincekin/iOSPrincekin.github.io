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
    let orbitPaths = null;

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
      const eclipticRotation = A.Rotation_EQJ_ECL();
      const earthHelio = A.RotateVector(eclipticRotation, A.HelioVector(A.Body.Earth, now));
      const marsHelio = A.RotateVector(eclipticRotation, A.HelioVector(A.Body.Mars, now));
      const distanceKm = illumination.geo_dist * AU_KM;
      const angularDiameter = 2 * Math.atan(MARS_RADIUS_KM / distanceKm) * 180 / Math.PI * 3600;
      let equatorial;
      let horizontal = null;
      let observerEcliptic = null;

      if (observerLocation) {
        const earthObserver = new A.Observer(observerLocation.latitude, observerLocation.longitude, observerLocation.height);
        equatorial = A.Equator(A.Body.Mars, now, earthObserver, true, true);
        horizontal = A.Horizon(now, earthObserver, equatorial.ra, equatorial.dec, 'normal');
        observerEcliptic = A.RotateVector(eclipticRotation, A.ObserverVector(now, earthObserver, false));
      } else {
        equatorial = A.EquatorFromVector(geoVector);
      }

      lastEphemeris = { illumination, horizontal, angularDiameter, earthHelio, marsHelio, observerEcliptic };
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

    const buildOrbit = (body, periodDays, date) => {
      const A = window.Astronomy;
      const rotation = A.Rotation_EQJ_ECL();
      const start = date.getTime() - periodDays * 86400000 / 2;
      return Array.from({ length: 241 }, (_, index) => {
        const sampleDate = new Date(start + periodDays * 86400000 * index / 240);
        return A.RotateVector(rotation, A.HelioVector(body, sampleDate));
      });
    };

    const drawOrbitPath = (context, path, centerX, centerY, scale, color) => {
      context.beginPath();
      path.forEach((point, index) => {
        const x = centerX + point.x * scale;
        const y = centerY - point.y * scale;
        if (index) context.lineTo(x, y); else context.moveTo(x, y);
      });
      context.closePath();
      context.strokeStyle = color;
      context.lineWidth = 1.2;
      context.stroke();
    };

    const drawPlanet = (context, x, y, radius, colors, label) => {
      const glow = context.createRadialGradient(x, y, radius * .5, x, y, radius * 2.4);
      glow.addColorStop(0, colors.glow);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(x, y, radius * 2.4, 0, Math.PI * 2);
      context.fill();
      const sphere = context.createRadialGradient(x - radius * .35, y - radius * .4, radius * .1, x, y, radius);
      sphere.addColorStop(0, colors.light);
      sphere.addColorStop(.58, colors.base);
      sphere.addColorStop(1, colors.dark);
      context.fillStyle = sphere;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = colors.text;
      context.font = '600 15px SFMono-Regular, Consolas, monospace';
      context.fillText(label, x + radius + 8, y - radius - 5);
    };

    const drawSolarSystem = timestamp => {
      if (timestamp - lastDraw > 65) {
        lastDraw = timestamp;
        const context = marsCanvas.getContext('2d');
        const width = marsCanvas.width;
        const height = marsCanvas.height;
        const centerX = width / 2;
        const centerY = height / 2 - 8;
        const scale = Math.min(width, height) * .25;
        context.clearRect(0, 0, width, height);

        for (let index = 0; index < 70; index++) {
          const x = (Math.sin(index * 91.73) * .5 + .5) * width;
          const y = (Math.sin(index * 47.19 + 2.4) * .5 + .5) * height;
          const twinkle = .18 + .22 * (Math.sin(timestamp / 900 + index) * .5 + .5);
          context.fillStyle = `rgba(190,215,235,${twinkle})`;
          context.fillRect(x, y, index % 9 === 0 ? 2 : 1, index % 9 === 0 ? 2 : 1);
        }

        if (!orbitPaths) {
          const date = new Date();
          orbitPaths = {
            earth: buildOrbit(window.Astronomy.Body.Earth, 365.256, date),
            mars: buildOrbit(window.Astronomy.Body.Mars, 686.98, date)
          };
        }
        drawOrbitPath(context, orbitPaths.mars, centerX, centerY, scale, 'rgba(210,91,52,.28)');
        drawOrbitPath(context, orbitPaths.earth, centerX, centerY, scale, 'rgba(115,212,221,.28)');

        const sunGlow = context.createRadialGradient(centerX, centerY, 3, centerX, centerY, 42);
        sunGlow.addColorStop(0, 'rgba(255,248,190,1)');
        sunGlow.addColorStop(.18, 'rgba(255,182,70,.9)');
        sunGlow.addColorStop(1, 'rgba(255,126,32,0)');
        context.fillStyle = sunGlow;
        context.beginPath();
        context.arc(centerX, centerY, 42, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#fff2bd';
        context.beginPath();
        context.arc(centerX, centerY, 10, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = 'rgba(255,199,97,.8)';
        context.font = '600 14px SFMono-Regular, Consolas, monospace';
        context.fillText('SUN', centerX + 17, centerY + 5);

        if (lastEphemeris?.earthHelio && lastEphemeris?.marsHelio) {
          const earth = { x: centerX + lastEphemeris.earthHelio.x * scale, y: centerY - lastEphemeris.earthHelio.y * scale };
          const mars = { x: centerX + lastEphemeris.marsHelio.x * scale, y: centerY - lastEphemeris.marsHelio.y * scale };
          context.setLineDash([5, 7]);
          context.strokeStyle = 'rgba(210,224,235,.18)';
          context.beginPath();
          context.moveTo(earth.x, earth.y);
          context.lineTo(mars.x, mars.y);
          context.stroke();
          context.setLineDash([]);

          drawPlanet(context, mars.x, mars.y, 11, { light: '#ff9460', base: '#c34e2e', dark: '#4b1b18', glow: 'rgba(210,91,52,.42)', text: '#f19770' }, 'MARS');
          drawPlanet(context, earth.x, earth.y, 13, { light: '#b7f0ff', base: '#277ca6', dark: '#0a284b', glow: 'rgba(82,188,230,.38)', text: '#8bd5eb' }, 'EARTH');

          if (lastEphemeris.observerEcliptic) {
            const vector = lastEphemeris.observerEcliptic;
            const length = Math.hypot(vector.x, vector.y, vector.z) || 1;
            const markerX = earth.x + vector.x / length * 10;
            const markerY = earth.y - vector.y / length * 10;
            const visibleSide = vector.z >= 0;
            const pulse = 4.5 + 1.8 * (Math.sin(timestamp / 420) * .5 + .5);
            context.strokeStyle = visibleSide ? '#9af7ff' : 'rgba(154,247,255,.45)';
            context.lineWidth = 2;
            context.beginPath();
            context.arc(markerX, markerY, pulse, 0, Math.PI * 2);
            context.stroke();
            context.fillStyle = '#efffff';
            context.beginPath();
            context.arc(markerX, markerY, 2.4, 0, Math.PI * 2);
            context.fill();
            context.fillStyle = '#9af7ff';
            context.font = '700 13px SFMono-Regular, Consolas, monospace';
            context.fillText(visibleSide ? 'YOU' : 'YOU · FAR SIDE', earth.x + 18, earth.y + 25);
          }
        }

        context.fillStyle = 'rgba(145,158,175,.65)';
        context.font = '12px SFMono-Regular, Consolas, monospace';
        context.fillText('HELIOCENTRIC ECLIPTIC VIEW · LIVE 1:1', 20, 25);
        context.fillText('ORBITS TO SCALE · PLANETS ENLARGED', 20, 43);
      }
      animationFrame = requestAnimationFrame(drawSolarSystem);
    };

    marsTrigger.addEventListener('click', () => setPanelOpen(!marsPanel.classList.contains('open')));
    document.querySelectorAll('[data-mars-close]').forEach(button => button.addEventListener('click', () => setPanelOpen(false)));
    document.querySelector('[data-location-request]')?.addEventListener('click', requestLocation);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && marsPanel.classList.contains('open')) setPanelOpen(false); });
    updateMarsData();
    setInterval(updateMarsData, 10000);
    animationFrame = requestAnimationFrame(drawSolarSystem);
    window.addEventListener('pagehide', () => cancelAnimationFrame(animationFrame), { once: true });
  }
})();

