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
    const earthView = document.querySelector('[data-earth-view]');
    const earthCanvas = document.querySelector('[data-earth-canvas]');
    const earthAzimuth = document.querySelector('[data-earth-azimuth]');
    const earthAltitude = document.querySelector('[data-earth-altitude]');
    let observerLocation = null;
    let lastEphemeris = null;
    let earthFromOpportunity = null;
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
    const compassPointEnglish = azimuth => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(azimuth / 45) % 8];

    const rotateAxis3 = (vector, degrees) => {
      const angle = degrees * Math.PI / 180;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      return [cosine * vector[0] + sine * vector[1], -sine * vector[0] + cosine * vector[1], vector[2]];
    };
    const rotateAxis1 = (vector, degrees) => {
      const angle = degrees * Math.PI / 180;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      return [vector[0], cosine * vector[1] + sine * vector[2], -sine * vector[1] + cosine * vector[2]];
    };
    const marsBodyFixed = (vector, date) => {
      const days = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
      const centuries = days / 36525;
      const poleRa = 317.68143 - .1061 * centuries;
      const poleDec = 52.88650 - .0609 * centuries;
      const primeMeridian = 176.630 + 350.89198226 * days;
      return rotateAxis3(rotateAxis1(rotateAxis3(vector, 90 + poleRa), 90 - poleDec), primeMeridian);
    };
    const calculateEarthFromOpportunity = date => {
      const A = window.Astronomy;
      const mars = A.HelioVector(A.Body.Mars, date);
      let earth = A.HelioVector(A.Body.Earth, date);
      let distanceAu = Math.hypot(earth.x - mars.x, earth.y - mars.y, earth.z - mars.z);
      const emissionDate = new Date(date.getTime() - distanceAu * 499.0047838 * 1000);
      earth = A.HelioVector(A.Body.Earth, emissionDate);
      const inertial = [earth.x - mars.x, earth.y - mars.y, earth.z - mars.z];
      distanceAu = Math.hypot(...inertial);
      const fixed = marsBodyFixed(inertial, date);
      const latitude = -1.948282 * Math.PI / 180;
      const longitude = 354.47417 * Math.PI / 180;
      const east = [-Math.sin(longitude), Math.cos(longitude), 0];
      const north = [-Math.sin(latitude) * Math.cos(longitude), -Math.sin(latitude) * Math.sin(longitude), Math.cos(latitude)];
      const up = [Math.cos(latitude) * Math.cos(longitude), Math.cos(latitude) * Math.sin(longitude), Math.sin(latitude)];
      const dot = (left, right) => left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
      const eastward = dot(fixed, east);
      const northward = dot(fixed, north);
      const upward = dot(fixed, up);
      const azimuth = (Math.atan2(eastward, northward) * 180 / Math.PI + 360) % 360;
      const altitude = Math.asin(upward / distanceAu) * 180 / Math.PI;
      const earthToSun = [-earth.x, -earth.y, -earth.z];
      const earthToMars = [mars.x - earth.x, mars.y - earth.y, mars.z - earth.z];
      const phaseCosine = dot(earthToSun, earthToMars) / (Math.hypot(...earthToSun) * Math.hypot(...earthToMars));
      return {
        azimuth,
        altitude,
        distanceAu,
        phaseFraction: (1 + Math.max(-1, Math.min(1, phaseCosine))) / 2,
        angularDiameter: 2 * Math.atan(6378.137 / (distanceAu * AU_KM)) * 180 / Math.PI * 3600
      };
    };

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
      earthFromOpportunity = calculateEarthFromOpportunity(now);
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
      if (earthAzimuth) earthAzimuth.textContent = `${earthFromOpportunity.azimuth.toFixed(2)}° / ${compassPointEnglish(earthFromOpportunity.azimuth)}`;
      if (earthAltitude) earthAltitude.textContent = `${earthFromOpportunity.altitude >= 0 ? '+' : '−'}${Math.abs(earthFromOpportunity.altitude).toFixed(2)}° / ${earthFromOpportunity.altitude >= 0 ? 'VISIBLE' : 'BELOW HORIZON'}`;
      if (earthView) {
        const visible = earthFromOpportunity.altitude > 0;
        earthView.hidden = !visible;
        earthView.setAttribute('aria-hidden', String(!visible));
        if (visible) earthView.style.top = `${Math.max(10, Math.min(43, 42 - earthFromOpportunity.altitude * .35))}%`;
      }

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

    const drawEarthFromMars = timestamp => {
      if (!earthCanvas || !earthFromOpportunity || earthFromOpportunity.altitude <= 0) return;
      const context = earthCanvas.getContext('2d');
      const size = earthCanvas.width;
      const center = size / 2;
      const radius = size * .25;
      const phaseAngle = Math.acos(Math.max(-1, Math.min(1, earthFromOpportunity.phaseFraction * 2 - 1)));
      const rotation = (Date.now() / 86164090.5 * Math.PI * 2) % (Math.PI * 2);
      context.clearRect(0, 0, size, size);
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
          const landSignal = Math.sin(longitude * 2.2 + Math.sin(latitude * 3.7)) + .55 * Math.sin(longitude * 5.4 - latitude * 4.1);
          const cloudSignal = Math.sin(longitude * 8.1 + latitude * 13.7 + timestamp / 18000);
          const light = Math.max(0, nx * Math.sin(phaseAngle) + nz * Math.cos(phaseAngle));
          const limb = Math.pow(nz, .28);
          const shade = (.035 + .965 * light) * (.6 + .4 * limb);
          const land = landSignal > .62;
          const cloud = cloudSignal > .78 && light > .05;
          const color = cloud ? [214, 237, 244] : land ? [76, 137, 88] : [38, 113, 176];
          const index = (y * size + x) * 4;
          image.data[index] = color[0] * shade;
          image.data[index + 1] = color[1] * shade;
          image.data[index + 2] = color[2] * shade;
          image.data[index + 3] = 255;
        }
      }
      context.putImageData(image, 0, 0);
    };

    const drawSolarSystem = timestamp => {
      if (timestamp - lastDraw > 65) {
        lastDraw = timestamp;
        drawEarthFromMars(timestamp);
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
            const markerX = earth.x + vector.x / length * 9.5;
            const markerY = earth.y - vector.y / length * 9.5;
            const visibleSide = vector.z >= 0;
            const pulse = 2.4 + .75 * (Math.sin(timestamp / 360) * .5 + .5);
            const blink = .5 + .5 * (Math.sin(timestamp / 280) * .5 + .5);
            context.strokeStyle = visibleSide ? `rgba(255,67,67,${blink})` : `rgba(255,67,67,${blink * .55})`;
            context.lineWidth = 1.2;
            context.beginPath();
            context.arc(markerX, markerY, pulse, 0, Math.PI * 2);
            context.stroke();
            context.fillStyle = visibleSide ? `rgba(255,92,92,${blink})` : `rgba(255,92,92,${blink * .65})`;
            context.beginPath();
            context.arc(markerX, markerY, 1.1, 0, Math.PI * 2);
            context.fill();
            context.fillStyle = visibleSide ? '#ff7777' : 'rgba(255,119,119,.65)';
            context.font = '700 11px SFMono-Regular, Consolas, monospace';
            context.fillText('YOU', markerX + 5, markerY - 5);
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

