/**
 * LÊ THU TRANG — PORTFOLIO INTERACTION ENGINE
 * Features: Fluid Magnetic Cursor, Dynamic Trade Canvas, 3D Tilt,
 * Web Audio Synthesizer, Stat Counters, Filter System, Terminology Explorer,
 * Theme Switcher, Modal Dialogs & Toasts.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. THEME SWITCHER (Dark / Light Mode)
  // ==========================================
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('lettrang_theme') || (prefersDark ? 'dark' : 'light');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lettrang_theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối');
      const icon = themeToggle.querySelector('svg');
      if (icon) {
        if (theme === 'dark') {
          icon.innerHTML = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>`;
        } else {
          icon.innerHTML = `<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>`;
        }
      }
    }
  }

  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      triggerAudio('click');
      showToast(next === 'dark' ? 'Chế độ hiển thị: Obsidian Dark' : 'Chế độ hiển thị: Warm Alabaster');
    });
  }

  // ==========================================
  // 2. WEB AUDIO SYNTHESIZER (Tactile Sound)
  // ==========================================
  let audioCtx = null;
  let soundEnabled = false;
  const soundToggle = document.getElementById('sound-toggle');

  function initAudio() {
    if (!audioCtx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      } catch (e) {
        console.warn('Web Audio not supported');
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function triggerAudio(type = 'click') {
    if (!soundEnabled || !audioCtx) return;

    const now = audioCtx.currentTime;
    if (type === 'click') {
      // Gentle soft chime
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'paper') {
      // Paper rustle sound
      const bufferSize = audioCtx.sampleRate * 0.12;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.06, now);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) initAudio();
      soundToggle.classList.toggle('active', soundEnabled);
      soundToggle.style.color = soundEnabled ? 'var(--terracotta)' : '';
      triggerAudio('click');
      showToast(soundEnabled ? 'Hiệu ứng âm thanh: Bật' : 'Hiệu ứng âm thanh: Tắt');
    });
  }

  // ==========================================
  // 3. FLUID CUSTOM CURSOR
  // ==========================================
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (cursorDot && cursorRing && window.innerWidth > 992) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover elements
    const hoverTargets = document.querySelectorAll('a, button, [data-hover], .card-3d, .cert-card, .term-card, .award-card');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        triggerAudio('paper');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  // ==========================================
  // 4. GLOBAL TRADE ROUTES CANVAS PARTICLES
  // ==========================================
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    const nodes = [];
    const nodeCount = Math.min(Math.floor(width / 35), 45);

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.2,
      });
    }

    let mouseCanvasX = null;
    let mouseCanvasY = null;
    window.addEventListener('mousemove', (e) => {
      mouseCanvasX = e.clientX;
      mouseCanvasY = e.clientY;
    }, { passive: true });

    function drawCanvas() {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const nodeColor = isDark ? 'rgba(227, 100, 68, 0.45)' : 'rgba(186, 78, 48, 0.35)';
      const lineColor = isDark ? 'rgba(215, 170, 100, 0.08)' : 'rgba(182, 138, 72, 0.12)';

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = (1 - dist / 130) * 1.2;
            ctx.stroke();
          }
        }
      }

      // Draw and update nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        // Subtle mouse interaction
        if (mouseCanvasX !== null) {
          const mdx = n.x - mouseCanvasX;
          const mdy = n.y - mouseCanvasY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 90) {
            n.x += mdx * 0.02;
            n.y += mdy * 0.02;
          }
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
      }

      requestAnimationFrame(drawCanvas);
    }
    requestAnimationFrame(drawCanvas);
  }

  // ==========================================
  // 5. SCROLL PROGRESS & REVEAL ANIMATIONS
  // ==========================================
  const scrollProgress = document.getElementById('scroll-progress');
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  const siteHeader = document.querySelector('.site-header');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    if (scrollProgress) scrollProgress.style.width = `${progress}%`;

    // Header shadow on scroll
    if (siteHeader) {
      if (window.scrollY > 40) {
        siteHeader.classList.add('header-scrolled');
      } else {
        siteHeader.classList.remove('header-scrolled');
      }
    }

    // Scroll to top button visibility
    if (scrollToTopBtn) {
      if (window.scrollY > 400) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    }
  }, { passive: true });

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      triggerAudio('click');
    });
  }

  // Intersection Observer for Reveal elements
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-scale').forEach(el => revealObserver.observe(el));

  // Side Index Active Scroll Spy
  const sections = document.querySelectorAll('section[id]');
  const sideLinks = document.querySelectorAll('.side-index a');
  const headerLinks = document.querySelectorAll('.header-nav a');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        sideLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
        headerLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => spyObserver.observe(s));

  // ==========================================
  // 6. TYPEWRITER EFFECT IN HERO
  // ==========================================
  const typewriterEl = document.getElementById('typewriter-text');
  if (typewriterEl) {
    const phrases = [
      "Tiếng Trung Thương Mại · Năng lực HSK 6 (278/300) & HSKK Cao cấp",
      "Quản lý Nguồn cung Sourcing & Đàm phán Giá xuất xưởng (EXW)",
      "Incoterms 2020 & Thanh toán Quốc tế L/C (ICC Academy)",
      "MOS Master Certified · Phân tích Bảng tính Quản trị Chuỗi cung ứng",
      "Cầu nối ngoại thương chuẩn mực Việt Nam — Trung Quốc"
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingDelay = 65;

    function type() {
      const currentPhrase = phrases[phraseIdx];

      if (isDeleting) {
        typewriterEl.textContent = currentPhrase.substring(0, charIdx - 1);
        charIdx--;
        typingDelay = 35;
      } else {
        typewriterEl.textContent = currentPhrase.substring(0, charIdx + 1);
        charIdx++;
        typingDelay = 70;
      }

      if (!isDeleting && charIdx === currentPhrase.length) {
        typingDelay = 2200;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        typingDelay = 400;
      }

      setTimeout(type, typingDelay);
    }
    setTimeout(type, 800);
  }

  // ==========================================
  // 7. STATS NUMBER COUNTERS
  // ==========================================
  let counted = false;
  const statsRow = document.querySelector('.stats-row');

  function animateCounters() {
    if (counted || !statsRow) return;
    const rect = statsRow.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.85) {
      counted = true;
      // Animate GPA
      const gpaEl = document.getElementById('counter-gpa');
      if (gpaEl) {
        let current = 2.0;
        const target = 3.82;
        const interval = setInterval(() => {
          current += 0.05;
          if (current >= target) {
            gpaEl.textContent = target.toFixed(2);
            clearInterval(interval);
          } else {
            gpaEl.textContent = current.toFixed(2);
          }
        }, 30);
      }
      // Animate HSK
      const hskEl = document.getElementById('counter-hsk');
      if (hskEl) {
        let current = 200;
        const target = 278;
        const interval = setInterval(() => {
          current += 2;
          if (current >= target) {
            hskEl.textContent = `${target} / 300`;
            clearInterval(interval);
          } else {
            hskEl.textContent = `${current} / 300`;
          }
        }, 25);
      }
    }
  }

  window.addEventListener('scroll', animateCounters, { passive: true });

  // ==========================================
  // 8. 3D TILT EFFECT ON CARDS
  // ==========================================
  const tiltCards = document.querySelectorAll('[data-card], .cert-card, .project-card, .stat-card, .award-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // ==========================================
  // 9. CERTIFICATE CATEGORY FILTER
  // ==========================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const certCards = document.querySelectorAll('.cert-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      triggerAudio('click');

      const filter = btn.getAttribute('data-filter');
      certCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 40);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // ==========================================
  // 10. INTERACTIVE LOGISTICS TERMINOLOGY WIDGET
  // ==========================================
  const terms = [
    {
      en: "Bill of Lading (B/L)",
      cn: "海运提单",
      pinyin: "Hǎiyùn tídān",
      vi: "Vận đơn đường biển — Chứng từ sở hữu hàng hóa và bằng chứng giao nhận quan trọng nhất.",
      tip: "Thường dùng trong vận tải quốc tế đường biển, căn cứ nhận hàng tại cảng đích."
    },
    {
      en: "Letter of Credit (L/C)",
      cn: "信用证",
      pinyin: "Xìnyòngzhèng",
      vi: "Tín dụng thư — Cam kết thanh toán có điều kiện của ngân hàng người mua.",
      tip: "Tuân thủ nghiêm ngặt theo quy tắc UCP 600 của Phòng Thương mại Quốc tế (ICC)."
    },
    {
      en: "Ex Works (EXW)",
      cn: "工厂交货",
      pinyin: "Gōngchǎng jiāohuò",
      vi: "Giao tại xưởng — Người bán hoàn thành nghĩa vụ khi đặt hàng tại xưởng.",
      tip: "Chiến lược đàm phán giá cốt lõi khi làm việc với các nhà xưởng 1688 tại Quảng Đông & Chiết Giang."
    },
    {
      en: "Cost, Insurance & Freight (CIF)",
      cn: "成本加保险费、运费",
      pinyin: "Chéngběn jiā bǎoxiǎnfèi, yùnfèi",
      vi: "Giá thành, bảo hiểm và cước phí — Giao hàng qua lan can tàu tại cảng bốc.",
      tip: "Người bán chịu chi phí và mua bảo hiểm đến cảng đến quy định."
    },
    {
      en: "Demurrage / Detention",
      cn: "滞港费 / 滞箱费",
      pinyin: "Zhìgǎngfèi / Zhìxiāngfèi",
      vi: "Phí lưu bãi bến cảng / Phí lưu giữ vỏ container quá hạn miễn phí.",
      tip: "Rủi ro phát sinh lớn nếu chậm thông quan điện tử VNACCS/VCIS."
    },
    {
      en: "Customs Clearance",
      cn: "报关 / 结关",
      pinyin: "Bàoguān / Jiéguān",
      vi: "Khai báo & Thông quan hải quan điện tử cho lô hàng xuất nhập khẩu.",
      tip: "Yêu cầu đầy đủ Invoice, Packing List, C/O Form E song ngữ."
    }
  ];

  const termCardsContainer = document.getElementById('terms-container');
  const termDetailBox = document.getElementById('term-active-detail');

  if (termCardsContainer && termDetailBox) {
    terms.forEach((t, i) => {
      const card = document.createElement('div');
      card.className = `term-card ${i === 0 ? 'active' : ''}`;
      card.innerHTML = `
        <div class="term-en">${t.en}</div>
        <div class="term-cn">${t.cn} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">(${t.pinyin})</span></div>
        <div class="term-vi">${t.vi.substring(0, 52)}...</div>
      `;
      card.addEventListener('click', () => {
        document.querySelectorAll('.term-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        triggerAudio('click');
        renderTermDetail(t);
      });
      termCardsContainer.appendChild(card);
    });

    function renderTermDetail(t) {
      termDetailBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <h4 style="font-family:var(--font-serif); font-size:1.4rem; color:var(--terracotta);">${t.en}</h4>
            <div style="font-family:var(--font-chinese); font-size:1.3rem; color:var(--text-main); font-weight:600;">
              ${t.cn} <span style="font-size:0.92rem; font-family:var(--font-sans); color:var(--text-muted); font-weight:normal;">[${t.pinyin}]</span>
            </div>
          </div>
          <button type="button" id="speak-term-btn" class="btn btn-secondary btn-sm" title="Phát âm tiếng Trung" data-hover>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            Phát âm
          </button>
        </div>
        <p style="font-size:0.95rem; color:var(--text-soft); line-height:1.7; margin-bottom:12px;">${t.vi}</p>
        <div style="background:var(--terracotta-light); padding:10px 14px; border-radius:var(--radius-sm); font-size:0.86rem; color:var(--terracotta);">
          <strong>Ứng dụng thực tiễn:</strong> ${t.tip}
        </div>
      `;

      const speakBtn = document.getElementById('speak-term-btn');
      if (speakBtn) {
        speakBtn.addEventListener('click', () => {
          if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance(t.cn);
            utter.lang = 'zh-CN';
            utter.rate = 0.85;
            window.speechSynthesis.speak(utter);
          } else {
            showToast(`Thuật ngữ: ${t.cn} (${t.pinyin})`);
          }
        });
      }
    }

    renderTermDetail(terms[0]);
  }

  // ==========================================
  // 11. CHINESE SEAL STAMP CLICK INTERACTION
  // ==========================================
  const seal = document.querySelector('.avatar-badge-chinese');
  if (seal) {
    seal.addEventListener('click', () => {
      triggerAudio('click');
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance("黎秋妆");
        utter.lang = 'zh-CN';
        utter.rate = 0.8;
        window.speechSynthesis.speak(utter);
      }
      showToast("黎秋妆 (Lí Qiūzhuāng) — Lê Thu Trang");
    });
  }

  // ==========================================
  // 12. INTERACTIVE MODAL (CV & ARTICLE PREVIEW)
  // ==========================================
  const cvModal = document.getElementById('cv-modal');
  const openCvBtn = document.getElementById('open-cv-modal');
  const openCvNav = document.getElementById('open-cv-nav');
  const closeCvBtn = document.getElementById('close-cv-modal');
  const printCvBtn = document.getElementById('print-cv-btn');
  const downloadCvBtn = document.getElementById('download-cv-btn');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    triggerAudio('click');
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (openCvBtn) openCvBtn.addEventListener('click', () => openModal(cvModal));
  if (openCvNav) openCvNav.addEventListener('click', (e) => { e.preventDefault(); openModal(cvModal); });
  if (closeCvBtn) closeCvBtn.addEventListener('click', () => closeModal(cvModal));

  if (cvModal) {
    cvModal.addEventListener('click', (e) => {
      if (e.target === cvModal) closeModal(cvModal);
    });
  }

  if (printCvBtn) {
    printCvBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (downloadCvBtn) {
    downloadCvBtn.addEventListener('click', () => {
      const element = document.getElementById('cv-printable-area');
      const actions = element.querySelector('.modal-actions');
      const closeBtn = element.querySelector('.modal-close');

      const originalBtnText = downloadCvBtn.innerHTML;
      downloadCvBtn.disabled = true;
      downloadCvBtn.innerHTML = `
        <svg style="animation:spin 1s linear infinite; width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:6px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle style="opacity:0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path style="opacity:0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Đang tạo file PDF...
      `;

      if (typeof html2pdf !== 'undefined') {
        const opt = {
          margin:       [10, 14, 10, 14],
          filename:     'CV_Le_Thu_Trang_Tieng_Trung_Thuong_Mai_FTU_K63.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        if (actions) actions.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';

        html2pdf().set(opt).from(element).save().then(() => {
          if (actions) actions.style.display = '';
          if (closeBtn) closeBtn.style.display = '';
          downloadCvBtn.disabled = false;
          downloadCvBtn.innerHTML = originalBtnText;
          showToast('✓ Đã tải file CV PDF thành công!');
        }).catch(err => {
          console.error(err);
          if (actions) actions.style.display = '';
          if (closeBtn) closeBtn.style.display = '';
          downloadCvBtn.disabled = false;
          downloadCvBtn.innerHTML = originalBtnText;
          window.print();
        });
      } else {
        downloadCvBtn.disabled = false;
        downloadCvBtn.innerHTML = originalBtnText;
        window.print();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(cvModal);
      const articleModal = document.getElementById('article-modal');
      if (articleModal) closeModal(articleModal);
      const mobileDrawer = document.getElementById('mobile-drawer');
      if (mobileDrawer) mobileDrawer.classList.remove('active');
    }
  });

  // ==========================================
  // 13. QUICK EMAIL COPY BUTTON
  // ==========================================
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = 'lethutrang2302@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        triggerAudio('click');
        showToast('✓ Đã sao chép email: lethutrang2302@gmail.com');
      }).catch(() => {
        showToast('Email: lethutrang2302@gmail.com');
      });
    });
  }

  // ==========================================
  // 14. CONTACT FORM SUBMISSION HANDLER
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin" style="animation:spin 1s linear infinite; width:18px; height:18px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle style="opacity:0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path style="opacity:0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Đang gửi tin nhắn...
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();
        triggerAudio('click');
        showToast('✓ Cảm ơn bạn! Lê Thu Trang đã nhận được tin nhắn và sẽ phản hồi sớm.');
      }, 1200);
    });
  }

  // ==========================================
  // 15. MOBILE MENU DRAWER
  // ==========================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.add('active');
      triggerAudio('click');
    });
  }

  if (mobileDrawerClose && mobileDrawer) {
    mobileDrawerClose.addEventListener('click', () => {
      mobileDrawer.classList.remove('active');
    });
  }

  document.querySelectorAll('.mobile-drawer nav a').forEach(a => {
    a.addEventListener('click', () => {
      if (mobileDrawer) mobileDrawer.classList.remove('active');
    });
  });

  // ==========================================
  // 16. TOAST NOTIFICATION HELPER
  // ==========================================
  let toastTimeout;
  function showToast(message) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  window.showToast = showToast;
});
