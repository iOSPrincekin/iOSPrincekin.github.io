(() => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const searchPanel = document.querySelector('[data-search-panel]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');
  let searchData = null;

  const translations = new Map([
    ['Home', '首页'], ['Logs', '探索日志'], ['Domains', '技术领域'], ['Projects', '项目档案'], ['About', '关于'],
    ['THE MISSION', '任务目标'], ['LATEST TRANSMISSIONS', '最新传输'], ['EXPLORATION DOMAINS', '探索领域'],
    ['FIELD NOTE / 001', '现场记录 / 001'], ['KEEP BUILDING', '持续构建'], ['KEEP EXPLORING', '持续探索'],
    ['MISSION SYSTEMS NOMINAL', '任务系统运行正常'], ['The frontier is not a place. It is a decision to keep going.', '边疆不是一个地点，而是继续前进的决定。'],
    ['TRANSMISSION ARCHIVE', '传输档案'], ['MISSION DOCUMENT', '任务文档'], ['ON THIS MISSION', '本次任务'],
    ['PREVIOUS LOG', '上一篇日志'], ['NEXT LOG', '下一篇日志'],
    ['SEARCH', '搜索'], ['LIVE POSITION', '实时位置'], ['LIVE MARS OBSERVATORY', '火星实时观测台'],
    ['CALCULATING EPHEMERIS…', '正在建立星历…'], ['REAL TIME 1:1 · PLANETS VISUALLY ENLARGED', '真实时间 1:1 · 行星视觉放大'],
    ['OBSERVER', '观察点'], ['LOCATION NOT AVAILABLE', '尚未获取位置'], ['ENABLE LOCATION', '启用定位'],
    ['AZIMUTH AZ', '方位角 AZ'], ['ALTITUDE ALT', '高度角 ALT'], ['RIGHT ASCENSION RA', '赤经 RA'],
    ['DECLINATION DEC', '赤纬 DEC'], ['ECLIPTIC LON / LAT', '黄经 / 黄纬'], ['EARTH–MARS DISTANCE', '地火距离'],
    ['LIGHT TIME', '光行时间'], ['MAGNITUDE / ILLUMINATION', '视星等 / 照明'],
    ['Your location is used only for calculations in this browser. It is never uploaded or stored.', '定位仅在你的浏览器内参与计算，不会上传或保存。'],
    ['Enter a keyword to search every exploration log.', '输入关键词，检索全部探索日志。'],
    ['CODE THE UNKNOWN', '向未知编程'],
    ['Software is our starship. Curiosity is our fuel. Every engineering expedition carries humanity one step closer to Mars.', '以软件为飞船，以好奇心为燃料。记录每一次技术探索，也记录人类走向火星的勇气。'],
    ['READ THE LOGS', '阅读探索日志'], ['VIEW PROJECTS', '查看项目档案'],
    ['CODE IS OUR MOST RELIABLE', '代码是抵达未知世界'], ['VEHICLE INTO THE UNKNOWN', '最可靠的航行工具'],
    ['Exploring the space between code, systems, and products—turning complex problems into reliable, clear, and reusable engineering practice.', '在代码、系统与产品之间持续探索，把复杂问题转化为可靠、清晰、可复用的工程实践。'],
    ['This site records real software problems, design decisions, and implementation details. Every article is a mission review: from discovering an anomaly, to building a model, to making the system run reliably.', '这里收录软件开发中的真实问题、设计判断与实现细节。每一篇文章都是一次任务复盘：从发现异常，到建立模型，再到让系统稳定运行。'],
    ['LEARN ABOUT THE LONG MISSION', '了解这次长期任务'], ['STAY CURIOUS', '保持好奇'], ['SEEK CLARITY', '追求清晰'],
    ['TEST WITH COURAGE', '勇于验证'], ['LATEST EXPLORATION LOGS', '最新探索日志'], ['VIEW ALL LOGS', '查看全部日志'],
    ['FIELDS OF CONTINUOUS EXPLORATION', '持续深入的技术领域'], ['MOBILE DEVELOPMENT', '移动开发'], ['SYSTEM DESIGN', '系统设计'],
    ['ENGINEERING TOOLS', '工程效率'], ['INTELLIGENT SYSTEMS', '智能探索'],
    ['Swift · iOS · Interaction · Performance', 'Swift · iOS · 交互与性能'], ['Architecture · Concurrency · Reliability', '架构 · 并发 · 可靠性'],
    ['Automation · Toolchains · Developer Experience', '自动化 · 工具链 · 开发体验'], ['AI · Data · Emerging Interfaces', 'AI · 数据 · 新型交互'],
    ['“Exploration is not the certainty of safety ahead,', '“真正的探索，不是确信前方安全，'], ['but the decision to move forward through the unknown.”', '而是在未知中仍然选择向前。”'],
    ['Exploration Logs', '探索日志'], ['Every technical transmission, ordered by arrival time.', '所有技术记录，按抵达时间排序。'],
    ['Exploration Domains', '技术领域'], ['An engineering map organized by problem space.', '按问题空间整理的工程探索地图。'],
    ['New technical domains are being surveyed.', '新的技术领域正在勘测中。'], ['← BACK TO EXPLORATION LOGS', '← 返回探索日志'],
    ['About This Long Mission', '关于这次长期任务'], ['Why Mars?', '为什么是火星'],
    ['Mars represents a simple engineering spirit: acknowledge the unknown, respect the constraints, and turn the impossible into testable problems one step at a time.', '火星代表一种很朴素的工程精神：承认未知，尊重约束，然后一步一步把不可能变成可以验证的问题。'],
    ['This site documents my software development expeditions. It focuses on real engineering problems: mobile development, system design, toolchains, performance, reliability, and the details that reshape how I think about building software well.', '这个网站用于记录我的软件开发探索。内容关注真实的工程问题，包括移动开发、系统设计、工具链、性能、可靠性，以及那些让我重新理解“如何把软件做好”的细节。'],
    ['Writing Principles', '写作原则'], ['Start with the problem, its constraints, and the reasoning behind each decision.', '从问题出发，交代限制条件与判断过程。'],
    ['Provide reproducible code, data, or verification methods.', '给出可以复现的代码、数据或验证方法。'], ['Document failed paths; they are often more valuable than the final answer.', '记录失败路径，因为它们往往比最终答案更有价值。'],
    ["Respect the reader's time and keep complex ideas clear.", '尊重读者的时间，让复杂概念保持清晰。'], ['Stay in Contact', '保持联络'],
    ['Respect the reader’s time and keep complex ideas clear.', '尊重读者的时间，让复杂概念保持清晰。'],
    ['Every article is a mission log transmitted from the field. If you are facing the same problem, I hope these notes become a useful map.', '每一篇文章都是一份从现场发回的任务日志。如果其中某个问题也在困扰你，希望这里的记录能成为一张有用的地图。'],
    ['Project Archive', '项目档案'], ['Software Projects Are Executable Thought', '软件项目是可运行的思考'],
    ['This archive collects representative development projects, architecture experiments, and open-source practice. Each record explains its goals, constraints, technical choices, implementation, and lessons learned.', '这里将收录具有代表性的开发项目、架构实验和开源实践。每份档案会说明项目目标、关键约束、技术选择、实现过程与最终复盘。'],
    ['An iOS candlestick chart component covering data visualization, interaction, and real-time updates. Related engineering notes are available in the exploration logs.', '面向 iOS 的 K 线图组件实践，涵盖数据展示、交互和实时更新。相关技术记录可在探索日志中查看。'],
    ['Next Mission', '下一项任务'], ['New project records are being prepared. Complete case studies in mobile engineering, developer tools, and intelligent systems will follow.', '新的项目档案正在整理。后续会逐步加入移动端工程、开发工具与智能系统方向的完整案例。'],
    ['Build Your Own macOS Kernel — Results', '编译自己的 macOS 内核——成果篇'], ['Background', '背景'], ['Results', '成果展示'],
    ['Project Status', '项目完成情况'], ['Status', '状态'], ['Item', '事项'], ['Notes', '说明'],
    ['macOS is an excellent operating system, yet many iOS and macOS developers only encounter operating-system internals in documentation. Working directly with the macOS kernel source is difficult and demanding. After a long investigation, I completed that journey and built a macOS system with my own startup program and kernel.', 'macOS 是一款优秀的操作系统，很多 iOS/macOS 开发者对操作系统的了解仅限于资料。直接与 macOS 内核源代码交互困难且充满挑战。经过长期探索，我完成了这项工作，构建出使用自定义启动程序和内核的 macOS 系统。'],
    ['The screenshot shows macOS running with my compiled versions of', '从图中可以看到，macOS 正在使用我自行编译的'], ['two protected components that cannot normally be replaced in a standard system.', '这两个受保护的系统组件在标准系统中通常无法被替换。'],
    ["The table below separates completed results from the work that remains. To avoid ambiguity, installing Apple's original macOS on real hardware is listed separately from running the custom kernel on real hardware.", '下面分别列出已经完成的成果和仍需推进的工作。为避免误解，Apple 原版 macOS 的真机安装与自定义内核的真机运行分别说明。'],
    ['The table below separates completed results from the work that remains. To avoid ambiguity, installing Apple’s original macOS on real hardware is listed separately from running the custom kernel on real hardware.', '下面分别列出已经完成的成果和仍需推进的工作。为避免误解，Apple 原版 macOS 的真机安装与自定义内核的真机运行分别说明。'],
    ['Compile a custom', '编译自定义'], ['for macOS 11.4', '用于 macOS 11.4'], ['Compile a custom XNU kernel for macOS 11.4', '编译 macOS 11.4 的自定义 XNU 内核'],
    ['Generate a custom kernel cache', '生成自定义内核缓存'], ['Fix custom-kernel boot failures', '修复自定义内核的启动问题'],
    ['Build and configure the OpenCore environment', '构建并配置 OpenCore 启动环境'], ['Boot macOS 11.4 with the custom startup program and kernel', '使用自定义启动程序和内核启动 macOS 11.4'],
    ['Create a macOS 11.4 installer containing the custom kernel', '制作包含自定义内核的 macOS 11.4 安装镜像'], ['Complete installation from the custom image', '使用自定义安装镜像完成系统安装'],
    ['Complete first-boot setup and enter the desktop', '完成首次开机设置并进入桌面'], ['Verify the installed custom system files', '验证安装后的自定义系统文件'],
    ['Enter the macOS recovery environment', '进入 macOS 恢复环境'], ["Install Apple's original macOS 11.4 on a physical Mac", '将 Apple 原版 macOS 11.4 安装到 Mac 真机'],
    ['Install Apple’s original macOS 11.4 on a physical Mac', '将 Apple 原版 macOS 11.4 安装到 Mac 真机'],
    ['Install and run the custom kernel on a physical Mac laptop', '在 Mac 笔记本真机上安装并运行自定义内核'], ['Install and run the custom macOS system on a Windows PC', '在 Windows PC 真机上安装并运行自定义 macOS'],
    ['Complete physical-hardware driver support', '完成自定义系统的真机硬件驱动适配'], ['Complete compatibility testing across multiple computers', '完成不同型号电脑的兼容性测试'],
    ['The system startup program has been compiled, modified, and debugged.', '已完成系统启动程序的编译、修改与调试。'], ['The kernel has been built and debugged from the XNU source corresponding to macOS 11.4.', '已基于 macOS 11.4 对应的 XNU 源代码完成编译与调试。'],
    ['The custom XNU kernel and related system components have been packaged into the cache required to boot macOS.', '已将自定义 XNU 内核及相关系统组件打包为 macOS 启动所需的内核缓存。'], ['Several low-level compatibility and data-validation issues that stopped the system from booting have been resolved.', '已解决多个导致系统无法继续启动的底层兼容性和数据校验问题。'],
    ['The boot environment can load the custom startup program and kernel in a virtual machine.', '已完成引导配置，使虚拟机能够加载自定义启动程序和内核。'], ['The system successfully reaches the macOS desktop in a virtual machine.', '已在虚拟机中成功启动系统并进入 macOS 桌面。'],
    ['The custom startup program, kernel, and kernel cache have been integrated into an installation image.', '已将自定义启动程序、内核和内核缓存集成到安装镜像中。'], ['The complete path from booting the installer and installing to disk through first-boot setup has succeeded.', '已完成从安装镜像启动、磁盘安装到首次开机设置的完整流程。'],
    ['A user account was created successfully, and system applications including Finder and Safari run normally.', '已成功创建用户，并正常打开 Finder、Safari 等系统应用。'], ['The startup program and kernel cache used by the installed system match the custom build outputs.', '已确认系统实际使用的启动程序和内核缓存与自定义编译结果一致。'],
    ['The macOS recovery environment boots successfully in a virtual machine.', '已在虚拟机中成功启动 macOS 恢复环境。'], ['The original system was installed on a Late 2013 13-inch MacBook Pro and reached the desktop. This does not mean the custom kernel has run on real hardware.', '已在一台 2013 年末的 13 英寸 MacBook Pro 上完成原版系统安装并进入桌面；这不代表自定义内核已经在真机上运行。'],
    ['The custom startup program and kernel have only been verified in a virtual machine; physical-Mac installation and boot remain unverified.', '目前自定义启动程序和内核只在虚拟机中完成验证，尚未在 Mac 真机上完成安装和启动。'], ['Adaptation and installation for PC processors, graphics, motherboards, storage, and other hardware have not yet been completed.', '尚未针对 PC 的处理器、显卡、主板、存储等硬件完成适配和安装验证。'],
    ['Graphics, audio, networking, USB, power management, sleep, and wake must still be verified on target hardware.', '显卡、声音、网络、USB、电源管理及睡眠唤醒等功能仍需在目标硬件上逐项验证。'], ['Full installation and stability testing has not yet been performed across multiple Mac and Windows PC models.', '尚未在多款 Mac 和 Windows PC 上进行完整的安装与稳定性测试。'],
    ['The central result is complete: the custom startup program, XNU kernel, and kernel cache have passed the full compile, install, boot, and desktop workflow in a virtual machine. The next milestone is adapting and validating the system on physical hardware.', '当前已经完成的核心成果是：自定义启动程序、自定义 XNU 内核和内核缓存已在虚拟机中完成编译、安装、启动并进入 macOS 桌面的完整流程。下一步将重点进行真机适配和验证。']
  ]);
  let currentLanguage = localStorage.getItem('ares-language') === 'zh' ? 'zh' : 'en';
  const originalText = new WeakMap();
  const isChinese = () => currentLanguage === 'zh';
  const localize = (english, chinese) => isChinese() ? chinese : english;

  const translatePage = language => {
    currentLanguage = language === 'zh' ? 'zh' : 'en';
    localStorage.setItem('ares-language', currentLanguage);
    document.documentElement.lang = isChinese() ? 'zh-CN' : 'en';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement?.closest('script, style, pre, code, textarea') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    let node;
    while ((node = walker.nextNode())) {
      if (!originalText.has(node)) originalText.set(node, node.nodeValue);
      const englishValue = originalText.get(node);
      const englishText = englishValue.trim();
      const translated = translations.get(englishText);
      if (isChinese() && translated) node.nodeValue = englishValue.replace(englishText, translated);
      else node.nodeValue = englishValue;
    }
    const languageToggle = document.querySelector('[data-language-toggle]');
    const languageLabel = document.querySelector('[data-language-label]');
    if (languageLabel) languageLabel.textContent = isChinese() ? 'EN' : '中文';
    if (languageToggle) {
      languageToggle.setAttribute('aria-label', isChinese() ? 'Switch to English' : '切换为中文');
      languageToggle.title = isChinese() ? 'Switch to English' : '切换为中文';
    }
    const brandLocale = document.querySelector('.brand-copy small');
    if (brandLocale) brandLocale.textContent = `MARS DEV LOG / ${isChinese() ? 'CN' : 'EN'}`;
    if (searchInput) searchInput.placeholder = isChinese() ? '搜索技术、项目或关键词…' : 'Search technologies, projects, or keywords…';
    const titleSource = document.querySelector('.article-heading h1, .inner-hero h1');
    if (titleSource) document.title = `${titleSource.textContent.trim()} · MARS / DEV LOG`;
    window.dispatchEvent(new CustomEvent('ares:languagechange', { detail: { language: currentLanguage } }));
  };

  document.querySelector('[data-language-toggle]')?.addEventListener('click', () => translatePage(isChinese() ? 'en' : 'zh'));

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
        searchResults.innerHTML = `<p class="search-hint">${isChinese() ? '搜索索引暂时无法建立。' : 'The search index is temporarily unavailable.'}</p>`;
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
    if (!query) { searchResults.innerHTML = `<p class="search-hint">${isChinese() ? '输入关键词，检索全部探索日志。' : 'Enter a keyword to search every exploration log.'}</p>`; return; }
    const matches = (searchData || []).filter(post => [post.title, post.text, ...post.categories, ...post.tags].join(' ').toLowerCase().includes(query)).slice(0, 8);
    searchResults.innerHTML = matches.length ? matches.map(post => `
      <a class="search-result" href="${escapeHtml(post.url)}">
        <span>${escapeHtml(post.date)} · ${escapeHtml(post.categories.join(' / ') || (isChinese() ? '探索日志' : 'Exploration Log'))}</span>
        <strong>${escapeHtml(isChinese() ? (post.title_zh || post.title) : post.title)}</strong>
        <p>${escapeHtml(post.text.slice(0, 110))}…</p>
      </a>`).join('') : `<p class="search-hint">${isChinese() ? '没有找到相关日志，换一个关键词试试。' : 'No matching logs found. Try another keyword.'}</p>`;
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

  const articleContent = document.querySelector('.article-content');
  if (articleContent) {
    const burstIcons = [
      { theme: 'rover', svg: `<svg viewBox="0 0 96 96" aria-hidden="true"><g class="rover-icon"><g class="rover-wheels"><circle cx="18" cy="72" r="9"/><circle cx="48" cy="76" r="9"/><circle cx="78" cy="72" r="9"/><circle cx="18" cy="72" r="4"/><circle cx="48" cy="76" r="4"/><circle cx="78" cy="72" r="4"/></g><g class="rover-suspension"><path d="M17 62 32 52l16 16 16-16 15 10M32 52h32"/></g><path class="rover-deck" d="M22 43h49l7 13-60 2Z"/><path class="rover-panel" d="m25 39 8-17h33l7 17Z"/><path class="rover-panel-lines" d="M35 22v17m10-17v17m10-17v17m10-13H31m-3 7h42"/><path class="rover-mast" d="M50 23V10m-8 0h21v9H42Z"/><circle class="rover-lens" cx="58" cy="14.5" r="3"/><path class="rover-antenna" d="m38 42-9-12m-3-3 6 6"/></g></svg>` },
      { theme: 'starship', svg: `<svg viewBox="0 0 96 96" aria-hidden="true"><g class="starship-icon"><path class="starship-body" d="M48 5c-9 11-13 25-12 44l2 25h20l2-25C61 30 57 16 48 5Z"/><path class="starship-shade" d="M48 5c8 13 10 29 8 67h-8Z"/><path class="starship-seam" d="M38 39h20M38 49h20M39 59h18"/><path class="starship-flap" d="m38 52-14 25 15-7Zm20 0 14 25-15-7Z"/><path class="starship-aft" d="M40 73h16l-2 8H42Z"/><circle class="starship-window" cx="48" cy="28" r="4"/><path class="starship-flame" d="M43 81c1 7 3 10 5 13 2-3 4-6 5-13Z"/></g></svg>` },
      { theme: 'apple', svg: `<svg viewBox="0 0 384 512" aria-hidden="true"><path class="apple-icon" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5 4 299.7 8.8 326.8 18.4 355c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.9-17.9 31.9 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.8-90-61.8-92.2ZM260.7 104.5C286.5 73.9 284.1 46 283.3 36c-22.7 1.3-49 15.5-64 32.9-16.5 18.7-26.2 41.8-24.2 69.9 24.6 1.9 47-10.8 65.6-34.3Z"/></svg>` },
      { theme: 'mars', svg: `<svg viewBox="0 0 96 96" aria-hidden="true"><g class="mars-icon"><circle class="mars-disc" cx="48" cy="48" r="37"/><path class="mars-shadow" d="M48 11a37 37 0 0 1 0 74c15-17 15-57 0-74Z"/><path class="mars-terrain" d="M19 35c9-8 17 2 24-4 8-7 13-11 25-6M15 53c13-5 17 9 29 3 10-5 17-11 34-4M27 73c8-13 17-5 25-12 8-6 16-4 22 1M35 14c1 9 10 10 15 16"/><ellipse class="mars-cap" cx="50" cy="15" rx="10" ry="3"/></g></svg>` },
      { theme: 'astronaut', svg: `<svg viewBox="0 0 96 96" aria-hidden="true"><g class="astronaut-icon"><path class="astronaut-pack" d="M25 42h8v31h-8Z"/><path class="astronaut-suit" d="M27 79c2-18 8-27 21-27s19 9 21 27Z"/><circle class="astronaut-helmet" cx="48" cy="35" r="25"/><path class="astronaut-visor" d="M29 36c1-13 8-20 19-20s18 7 19 20c-6 8-12 11-19 11s-13-3-19-11Z"/><path class="astronaut-glint" d="M37 23c5-4 11-4 17-1M34 29h4"/><path class="astronaut-panel" d="M40 62h16v12H40Z"/><circle class="astronaut-signal" cx="60" cy="67" r="2"/><path class="astronaut-antenna" d="M68 21 76 9m-3 0h6"/></g></svg>` },
      { theme: 'satellite', svg: `<svg viewBox="0 0 96 96" aria-hidden="true"><g class="satellite-icon"><path class="satellite-panel" d="M5 31h28v34H5Zm58 0h28v34H63Z"/><path class="satellite-grid" d="M14 31v34m10-34v34M5 42h28M5 54h28m39-23v34m10-34v34M63 42h28M63 54h28"/><path class="satellite-body" d="M34 29h28v38H34Z"/><circle class="satellite-core" cx="48" cy="48" r="8"/><path class="satellite-dish" d="M40 28C27 18 28 7 30 5c10 2 19 8 21 23Z"/><path class="satellite-signal" d="M54 20c8-6 15-7 23-4M58 27c8-3 13-3 19 0"/></g></svg>` },
      { theme: 'saturn', svg: `<svg viewBox="0 0 96 96" aria-hidden="true"><g class="saturn-icon"><circle class="saturn-disc" cx="48" cy="48" r="25"/><path class="saturn-band" d="M25 40c14 8 31 10 47 5M25 50c13 7 28 9 44 6"/><ellipse class="saturn-ring-back" cx="48" cy="48" rx="44" ry="15"/><path class="saturn-ring-front" d="M8 45c6 13 30 22 55 20 15-1 24-6 27-12"/></g></svg>` },
      { theme: 'constellation', svg: `<svg viewBox="0 0 96 96" aria-hidden="true"><g class="constellation-icon"><path class="constellation-lines" d="m17 70 17-42 20 18 24-30M34 28l8 48 12-30 24 20"/><g class="constellation-stars"><circle cx="17" cy="70" r="4"/><circle cx="34" cy="28" r="5"/><circle cx="42" cy="76" r="3"/><circle cx="54" cy="46" r="4"/><circle cx="78" cy="16" r="4"/><circle cx="78" cy="66" r="5"/></g><path class="constellation-flare" d="M54 35v22M43 46h22"/></g></svg>` },
      { theme: 'quantum', svg: `<svg viewBox="0 0 96 96" aria-hidden="true"><g class="quantum-icon"><rect class="quantum-chip" x="22" y="22" width="52" height="52" rx="8"/><path class="quantum-pins" d="M32 12v10m16-10v10m16-10v10M32 74v10m16-10v10m16-10v10M12 32h10M12 48h10M12 64h10m52-32h10M74 48h10M74 64h10"/><circle class="quantum-core" cx="48" cy="48" r="7"/><ellipse class="quantum-orbit" cx="48" cy="48" rx="20" ry="8"/><ellipse class="quantum-orbit quantum-orbit-tilt" cx="48" cy="48" rx="8" ry="20"/></g></svg>` },
      { theme: 'courage', svg: `<svg viewBox="0 0 96 96" aria-hidden="true"><g class="courage-icon"><path class="courage-shield" d="M48 7 79 19v24c0 20-11 35-31 46-20-11-31-26-31-46V19Z"/><path class="courage-chevron" d="m30 61 18-32 18 32-18-9Z"/><path class="courage-star" d="m48 19 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/></g></svg>` }
    ];
    let lastBurst = 0;
    articleContent.addEventListener('click', event => {
      if (event.target.closest('a, button, input, textarea, select, pre, code')) return;
      if (window.getSelection()?.toString()) return;
      const now = performance.now();
      if (now - lastBurst < 110) return;
      lastBurst = now;
      const burst = document.createElement('span');
      const selectedIcon = burstIcons[Math.floor(Math.random() * burstIcons.length)];
      burst.className = `article-click-burst burst-${selectedIcon.theme}`;
      burst.setAttribute('aria-hidden', 'true');
      burst.style.left = `${event.clientX}px`;
      burst.style.top = `${event.clientY}px`;
      burst.innerHTML = `<span class="article-click-icon">${selectedIcon.svg}</span><b></b>${Array.from({ length: 7 }, (_, index) => `<i style="--spark-angle:${index * (360 / 7) + Math.random() * 14}deg;--spark-distance:${18 + Math.random() * 14}px;--spark-delay:${Math.random() * 90}ms"></i>`).join('')}`;
      document.body.appendChild(burst);
      burst.addEventListener('animationend', () => burst.remove(), { once: true });
      setTimeout(() => burst.remove(), 1400);
    });
  }

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

  const brandMars = document.querySelector('[data-brand-mars]');
  if (brandMars) {
    const context = brandMars.getContext('2d');
    const size = brandMars.width;
    const center = size / 2;
    const radius = 18;
    let lastBrandDraw = 0;
    let brandAnimationFrame = 0;
    const drawBrandMars = timestamp => {
      if (timestamp - lastBrandDraw >= 90) {
        lastBrandDraw = timestamp;
        const daysSinceJ2000 = (Date.now() - Date.UTC(2000, 0, 1, 12)) / 86400000;
        const centralMeridian = (176.630 + 350.89198226 * daysSinceJ2000) * Math.PI / 180;
        const image = context.createImageData(size, size);
        for (let y = Math.floor(center - radius); y <= Math.ceil(center + radius); y++) {
          for (let x = Math.floor(center - radius); x <= Math.ceil(center + radius); x++) {
            const nx = (x - center) / radius;
            const ny = (center - y) / radius;
            const rr = nx * nx + ny * ny;
            if (rr > 1) continue;
            const nz = Math.sqrt(1 - rr);
            const longitude = Math.atan2(nx, nz) + centralMeridian;
            const latitude = Math.asin(ny);
            const terrain = Math.sin(longitude * 2.7 + Math.sin(latitude * 4.2)) * .5
              + Math.sin(longitude * 7.3 - latitude * 5.1) * .25
              + Math.sin(longitude * 14.9 + latitude * 9.7) * .12;
            const sunlight = Math.max(0, nx * -.42 + ny * .32 + nz * .85);
            const limb = Math.pow(nz, .32);
            const shade = (.1 + .9 * sunlight) * (.56 + .44 * limb);
            const polarCap = Math.max(0, (Math.abs(latitude) - 1.28) * 6);
            const color = terrain > .28 ? [116, 39, 27] : terrain < -.34 ? [92, 31, 24] : [211, 78, 42];
            const index = (y * size + x) * 4;
            image.data[index] = Math.min(255, color[0] * shade + polarCap * 80);
            image.data[index + 1] = Math.min(255, color[1] * shade + polarCap * 72);
            image.data[index + 2] = Math.min(255, color[2] * shade + polarCap * 68);
            image.data[index + 3] = 255;
          }
        }
        context.clearRect(0, 0, size, size);
        context.putImageData(image, 0, 0);
      }
      brandAnimationFrame = requestAnimationFrame(drawBrandMars);
    };
    brandAnimationFrame = requestAnimationFrame(drawBrandMars);
    window.addEventListener('pagehide', () => cancelAnimationFrame(brandAnimationFrame), { once: true });
  }

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
        fields['observer-location'].textContent = localize('LOCATION IS NOT SUPPORTED', '浏览器不支持定位');
        return;
      }
      fields['observer-location'].textContent = localize('REQUESTING LOCATION…', '正在请求位置…');
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
        fields['observer-location'].textContent = error.code === 1
          ? localize('LOCATION DENIED · GEOCENTRIC VIEW', '定位未授权 · 仅显示地心坐标')
          : localize('LOCATION UNAVAILABLE · TRY AGAIN', '暂时无法定位 · 请重试');
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
    const opportunitySurfaceEcliptic = date => {
      const days = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
      const centuries = days / 36525;
      const poleRa = 317.68143 - .1061 * centuries;
      const poleDec = 52.88650 - .0609 * centuries;
      const primeMeridian = 176.630 + 350.89198226 * days;
      const latitude = -1.948282 * Math.PI / 180;
      const longitude = 354.47417 * Math.PI / 180;
      let vector = [Math.cos(latitude) * Math.cos(longitude), Math.cos(latitude) * Math.sin(longitude), Math.sin(latitude)];
      vector = rotateAxis3(vector, -primeMeridian);
      vector = rotateAxis1(vector, -(90 - poleDec));
      vector = rotateAxis3(vector, -(90 + poleRa));
      const obliquity = 23.43928 * Math.PI / 180;
      return {
        x: vector[0],
        y: Math.cos(obliquity) * vector[1] + Math.sin(obliquity) * vector[2],
        z: -Math.sin(obliquity) * vector[1] + Math.cos(obliquity) * vector[2]
      };
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

      lastEphemeris = { illumination, horizontal, angularDiameter, earthHelio, marsHelio, observerEcliptic, opportunitySurface: opportunitySurfaceEcliptic(now) };
      fields.ra.textContent = formatRa(equatorial.ra);
      fields.dec.textContent = formatSignedDegree(equatorial.dec);
      fields.ecliptic.textContent = `${ecliptic.elon.toFixed(2)}° / ${formatSignedDegree(ecliptic.elat)}`;
      fields.distance.textContent = `${(distanceKm / 1000000).toFixed(2)} ${localize('million km', '百万 km')}`;
      fields.light.textContent = `${(distanceKm / LIGHT_KM_S / 60).toFixed(1)} ${localize('minutes', '分钟')}`;
      fields.lighting.textContent = `${illumination.mag.toFixed(2)} mag / ${(illumination.phase_fraction * 100).toFixed(1)}%`;
      fields.time.textContent = `UTC ${now.toISOString().replace('T', ' ').slice(0, 19)}`;
      if (earthAzimuth) earthAzimuth.textContent = `${earthFromOpportunity.azimuth.toFixed(2)}° / ${compassPointEnglish(earthFromOpportunity.azimuth)}`;
      if (earthAltitude) earthAltitude.textContent = `${earthFromOpportunity.altitude >= 0 ? '+' : '−'}${Math.abs(earthFromOpportunity.altitude).toFixed(2)}° / ${earthFromOpportunity.altitude >= 0 ? 'VISIBLE' : 'BELOW HORIZON'}`;
      if (earthView) {
        const visible = earthFromOpportunity.altitude > 0;
        earthView.hidden = !visible;
        earthView.setAttribute('aria-hidden', String(!visible));
        if (visible) {
          const azimuthRadians = earthFromOpportunity.azimuth * Math.PI / 180;
          earthView.style.left = `${50 + Math.sin(azimuthRadians) * 38}%`;
          earthView.style.top = `${Math.max(10, Math.min(48, 50 - earthFromOpportunity.altitude * .45))}%`;
        }
      }

      if (horizontal) {
        fields.az.textContent = `${horizontal.azimuth.toFixed(2)}° ${isChinese() ? compassPoint(horizontal.azimuth) : compassPointEnglish(horizontal.azimuth)}`;
        fields.alt.textContent = formatSignedDegree(horizontal.altitude);
        fields.visibility.textContent = horizontal.altitude >= 0
          ? localize(`MARS IS ${horizontal.altitude.toFixed(1)}° ABOVE THE ${compassPointEnglish(horizontal.azimuth)} HORIZON`, `火星位于${compassPoint(horizontal.azimuth)}方地平线上 ${horizontal.altitude.toFixed(1)}°`)
          : localize(`MARS IS ${Math.abs(horizontal.altitude).toFixed(1)}° BELOW THE ${compassPointEnglish(horizontal.azimuth)} HORIZON`, `火星当前在${compassPoint(horizontal.azimuth)}方地平线下 ${Math.abs(horizontal.altitude).toFixed(1)}°`);
        fields['mars-bearing'].style.transform = `rotate(${horizontal.azimuth}deg)`;
        fields['mars-trigger-status'].textContent = `${horizontal.altitude >= 0 ? localize('VISIBLE', '可见') : localize('BELOW HORIZON', '地平线下')} ${formatSignedDegree(horizontal.altitude)}`;
      } else {
        fields.az.textContent = localize('LOCATION REQUIRED', '需要定位');
        fields.alt.textContent = localize('LOCATION REQUIRED', '需要定位');
        fields.visibility.textContent = localize(`GEOCENTRIC VIEW · ${angularDiameter.toFixed(1)}″ APPARENT DIAMETER`, `地心视图 · 视直径 ${angularDiameter.toFixed(1)}″`);
        fields['mars-trigger-status'].textContent = localize('ENABLE LOCATION', '启用定位');
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
          const light = Math.max(0, nx * Math.sin(phaseAngle) + nz * Math.cos(phaseAngle));
          const limb = Math.pow(nz, .28);
          const shade = (.035 + .965 * light) * (.6 + .4 * limb);
          const land = landSignal > .62;
          const color = land ? [76, 137, 88] : [38, 113, 176];
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

          if (lastEphemeris.opportunitySurface) {
            const vector = lastEphemeris.opportunitySurface;
            const markerX = mars.x + vector.x * 8;
            const markerY = mars.y - vector.y * 8;
            const visibleSide = vector.z >= 0;
            const pulse = 2.1 + .6 * (Math.sin(timestamp / 340) * .5 + .5);
            const blink = .45 + .55 * (Math.sin(timestamp / 290) * .5 + .5);
            context.strokeStyle = visibleSide ? `rgba(92,255,116,${blink})` : `rgba(92,255,116,${blink * .4})`;
            context.lineWidth = 1;
            context.beginPath();
            context.arc(markerX, markerY, pulse, 0, Math.PI * 2);
            context.stroke();
            context.fillStyle = visibleSide ? `rgba(122,255,139,${blink})` : `rgba(122,255,139,${blink * .5})`;
            context.beginPath();
            context.arc(markerX, markerY, .9, 0, Math.PI * 2);
            context.fill();
          }

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
            const labelOnRight = markerX >= earth.x;
            context.fillStyle = visibleSide ? '#ff7777' : 'rgba(255,119,119,.65)';
            context.font = '700 11px SFMono-Regular, Consolas, monospace';
            context.textAlign = labelOnRight ? 'left' : 'right';
            context.fillText('YOU', earth.x + (labelOnRight ? 24 : -24), earth.y - 20);
            context.textAlign = 'left';
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
    setInterval(updateMarsData, 1000);
    animationFrame = requestAnimationFrame(drawSolarSystem);
    window.addEventListener('pagehide', () => cancelAnimationFrame(animationFrame), { once: true });
  }
  translatePage(currentLanguage);
})();

