// Application Logic & State

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  loadProducts();
  initScrollAnimations();
  initCounters();
  initGallery();
  initTestimonials();
  initContactForm();
  initScrollSpy();
  initBackToTop();
});

// --- Toast Notifier ---
function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 4000);
}

// --- Mobile Navigation Menu ---
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isActive = navMenu.classList.contains('active');
      toggleBtn.innerHTML = isActive ? '✕' : '☰';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        toggleBtn.innerHTML = '☰';
      });
    });
  }
}

// --- Dynamic Products Loader ---
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  try {
    const response = await fetch('./products.json');
    if (!response.ok) throw new Error('Failed to fetch products.json');
    const products = await response.json();

    grid.innerHTML = '';
    products.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'product-card fade-in';
      card.innerHTML = `
        <div class="product-img-container">
          <img class="product-img" src="${prod.img}" alt="${prod.name}" loading="lazy" onerror="this.src='${prod.fallbackImg}'">
          ${prod.badge ? `<span class="product-badge">${prod.badge}</span>` : ''}
        </div>
        <div class="product-body">
          <h3 class="product-name">${prod.name}</h3>
          <p class="product-desc">${prod.desc}</p>
          <div class="product-footer">
            <div>
              <span class="product-price">₹${prod.price}</span>
              <span class="product-unit">/ ${prod.unit}</span>
            </div>
            <button class="btn btn-primary" style="padding: 0.5rem 1.25rem; font-size: 0.85rem;" onclick="orderProduct('${prod.name}')">
              Order Now
            </button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Re-trigger scroll animations for newly added elements
    triggerNewAnimations();

  } catch (error) {
    console.error('Error loading products:', error);
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Error loading fresh products. Please refresh page.</p>`;
  }
}

window.orderProduct = (name) => {
  showToast(`Initiating order request for ${name}! Please fill out the contact form below.`);
  const contactSec = document.getElementById('contact');
  if (contactSec) {
    contactSec.scrollIntoView({ behavior: 'smooth' });
    // Pre-fill message field
    const msgInput = document.getElementById('contactMessage');
    if (msgInput) {
      msgInput.value = `Hello! I would like to place an order for: ${name}. Please contact me.`;
    }
  }
};

// --- Scroll-Triggered Fade-In Animations ---
function initScrollAnimations() {
  triggerNewAnimations();
}

function triggerNewAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target); // Stop observing once animated
      }
    });
  }, observerOptions);

  elements.forEach(el => observer.observe(el));
}

// --- Scroll-Triggered Count-Up Counters ---
function initCounters() {
  const counterSection = document.querySelector('.counters-section');
  if (!counterSection) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats();
        obs.unobserve(counterSection); // Run only once
      }
    });
  }, { threshold: 0.2 });

  observer.observe(counterSection);
}

function animateStats() {
  const counters = document.querySelectorAll('.counter-val');
  const duration = 2000; // ms

  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const start = 0;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(progress * (target - start) + start);
      
      // format for display (e.g. 5000+ or 12000+)
      if (target >= 1000) {
        counter.textContent = current.toLocaleString('en-IN');
      } else {
        counter.textContent = current;
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        counter.textContent = target >= 1000 ? target.toLocaleString('en-IN') + '+' : target + '+';
      }
    }

    window.requestAnimationFrame(step);
  });
}

// --- Farm Gallery Filter & Lightbox ---
function initGallery() {
  const filters = document.querySelectorAll('.gallery-filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (!filters || !items) return;

  // 1. Filtering Logic
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.classList.remove('hidden');
          setTimeout(() => item.style.opacity = '1', 50);
        } else {
          item.style.opacity = '0';
          item.classList.add('hidden');
        }
      });
    });
  });

  // 2. Lightbox Open
  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
      }
    });
  });

  // 3. Lightbox Close
  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.classList.remove('active');
    });
    // Escape key closes lightbox
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') lightbox.classList.remove('active');
    });
  }
}

// --- Testimonial Auto-Sliding Carousel ---
function initTestimonials() {
  const track = document.getElementById('testimonialTrack');
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsContainer = document.getElementById('testimonialDots');
  if (!track || slides.length === 0) return;

  let currentSlide = 0;
  const slideCount = slides.length;
  let autoplayInterval;

  // 1. Generate Dot indicators
  dotsContainer.innerHTML = '';
  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.className = `testimonial-dot ${idx === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Go to testimonial slide ${idx + 1}`);
    dot.addEventListener('click', () => {
      goToSlide(idx);
      resetAutoplay();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.testimonial-dot');

  // 2. Slide function
  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update active dot
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  }

  // 3. Autoplay Loop
  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      let nextSlide = (currentSlide + 1) % slideCount;
      goToSlide(nextSlide);
    }, 4500); // slide every 4.5 seconds
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  startAutoplay();

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
  track.addEventListener('mouseleave', startAutoplay);
}

// --- Contact Form Submission ---
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !phone || !email || !message) return;

    // Simulate backend payload
    console.log('--- MEADOWBROOK CONTACT PAYLOAD ---');
    console.log(`Name: ${name}`);
    console.log(`Phone: ${phone}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    console.log('------------------------------------');

    showToast(`Thank you, ${name}! We have received your query.`);
    form.reset();
  });
}

// --- Navigation ScrollSpy (Active highlights) ---
function initScrollSpy() {
  const header = document.querySelector('header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // 1. Header scroll shadow toggle
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // 2. ScrollSpy logic
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 120; // offset for sticky nav

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-tab') === currentSectionId);
      });
    }
  });
}

// --- Floating Back-To-Top Button ---
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
