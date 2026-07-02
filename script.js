/**
 * script.js
 * Adidas-inspired Shoes Landing Page Interactive Features
 * Original implementation by Antigravity
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Preloader Fade Out
     ========================================================================== */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('fade-out');
    }, 600); // Small delay to appreciate the custom loader animation
  });

  /* ==========================================================================
     2. Sticky Navbar & Scroll Progress
     ========================================================================== */
  const header = document.getElementById('header');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Sticky navbar toggle
    if (scrollTop > 50) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }

    // Scroll progress indicator
    if (docHeight > 0) {
      const scrolled = (scrollTop / docHeight) * 100;
      scrollProgress.style.width = `${scrolled}%`;
    }

    // Back to top button visibility
    if (scrollTop > 400) {
      backToTopBtn.classList.add('active');
    } else {
      backToTopBtn.classList.remove('active');
    }
  });

  // Smooth scroll to top on back to top button click
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  /* ==========================================================================
     3. Mobile Menu Toggle
     ========================================================================== */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when clicking menu links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Close mobile menu when clicking outside of it
  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });

  /* ==========================================================================
     4. Dark / Light Mode Toggle
     ========================================================================== */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const body = document.body;

  // Retrieve saved theme preference
  const savedTheme = localStorage.getItem('adidas-theme') || 'dark-theme';
  body.className = savedTheme;

  themeToggleBtn.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
      body.classList.replace('dark-theme', 'light-theme');
      localStorage.setItem('adidas-theme', 'light-theme');
      showToast('System Setting Updated', 'Light mode theme applied successfully.');
    } else {
      body.classList.replace('light-theme', 'dark-theme');
      localStorage.setItem('adidas-theme', 'dark-theme');
      showToast('System Setting Updated', 'Dark mode theme applied successfully.');
    }
  });

  /* ==========================================================================
     5. Active Navigation Link Highlighting on Scroll
     ========================================================================== */
  const sections = document.querySelectorAll('section, header');
  const navObserverOptions = {
    root: null,
    threshold: 0.25, // Active when at least 25% is visible
    rootMargin: "-80px 0px 0px 0px" // Account for sticky navbar height
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (id) {
          // Remove active class from all links
          navLinks.forEach(link => link.classList.remove('active'));
          // Add active class to corresponding link
          const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      }
    });
  }, navObserverOptions);

  sections.forEach(section => {
    if (section.getAttribute('id')) {
      navObserver.observe(section);
    }
  });

  /* ==========================================================================
     6. Search Box Activation
     ========================================================================== */
  const searchBtn = document.getElementById('searchBtn');
  const searchBox = document.querySelector('.search-box');
  const searchInput = document.getElementById('searchInput');

  searchBtn.addEventListener('click', (e) => {
    // If not active, prevent immediate form action and open input
    if (!searchBox.classList.contains('active')) {
      e.preventDefault();
      searchBox.classList.add('active');
      searchInput.focus();
    } else {
      // If empty, close it, else trigger dummy search
      if (searchInput.value.trim() === '') {
        e.preventDefault();
        searchBox.classList.remove('active');
      } else {
        showToast('Search Query Submitted', `Searching for: "${searchInput.value}"`);
        searchInput.value = '';
        searchBox.classList.remove('active');
      }
    }
  });

  // Close search input on blur/outside click
  document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target) && searchBox.classList.contains('active')) {
      searchBox.classList.remove('active');
    }
  });

  /* ==========================================================================
     7. Hero Image Parallax (3D Floating Effect)
     ========================================================================== */
  const heroImageWrapper = document.getElementById('heroImageWrapper');
  const heroShoe = document.getElementById('heroShoe');
  
  if (heroImageWrapper && heroShoe) {
    heroImageWrapper.addEventListener('mousemove', (e) => {
      const rect = heroImageWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2); // Center is 0
      const y = e.clientY - rect.top - (rect.height / 2);

      // Degrees of rotation: max 15deg
      const rotateX = -(y / rect.height) * 20;
      const rotateY = (x / rect.width) * 20;

      // Translate offsets: max 25px
      const translateX = (x / rect.width) * 25;
      const translateY = (y / rect.height) * 25;

      heroShoe.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });

    heroImageWrapper.addEventListener('mouseleave', () => {
      // Restore floating default animation smoothly
      heroShoe.style.transform = `translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)`;
    });
  }

  /* ==========================================================================
     8. New Arrivals Carousel Implementation
     ========================================================================== */
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  
  let slides = Array.from(track.children);
  let currentIndex = 0;
  let autoSlideInterval;
  
  // Calculate items per view dynamically
  function getItemsPerView() {
    const width = window.innerWidth;
    if (width > 1200) return 4;
    if (width > 768) return 2;
    return 1;
  }

  // Setup navigation dots
  function setupDots() {
    dotsContainer.innerHTML = '';
    const itemsPerView = getItemsPerView();
    const dotsCount = Math.max(1, slides.length - itemsPerView + 1);
    
    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        moveToSlide(i);
        resetAutoSlide();
      });
      dotsContainer.appendChild(dot);
    }
  }

  // Slide move operation
  function moveToSlide(index) {
    const itemsPerView = getItemsPerView();
    const maxIndex = slides.length - itemsPerView;
    
    // Boundary check
    if (index < 0) index = 0;
    if (index > maxIndex) index = maxIndex;
    
    currentIndex = index;
    
    // Slide translation logic
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = 24; // Matches gap in style.css
    const offset = currentIndex * (slideWidth + gap);
    
    track.style.transform = `translateX(-${offset}px)`;
    
    // Update dots indicator
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      if (i === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Toggle button disabled state
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;
  }

  // Autoplay functionality
  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      const itemsPerView = getItemsPerView();
      const maxIndex = slides.length - itemsPerView;
      
      let nextIndex = currentIndex + 1;
      if (nextIndex > maxIndex) {
        nextIndex = 0;
      }
      moveToSlide(nextIndex);
    }, 4000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  // Button actions
  prevBtn.addEventListener('click', () => {
    moveToSlide(currentIndex - 1);
    resetAutoSlide();
  });

  nextBtn.addEventListener('click', () => {
    moveToSlide(currentIndex + 1);
    resetAutoSlide();
  });

  // Track viewport resize
  window.addEventListener('resize', () => {
    setupDots();
    moveToSlide(currentIndex);
  });

  // Swipe/Drag gestures implementation
  let startX = 0;
  let isDragging = false;
  let currentTranslate = 0;
  let prevTranslate = 0;

  track.addEventListener('mousedown', dragStart);
  track.addEventListener('mousemove', drag);
  track.addEventListener('mouseup', dragEnd);
  track.addEventListener('mouseleave', dragEnd);
  
  track.addEventListener('touchstart', dragStart, { passive: true });
  track.addEventListener('touchmove', drag, { passive: true });
  track.addEventListener('touchend', dragEnd);

  function dragStart(e) {
    startX = getPositionX(e);
    isDragging = true;
    clearInterval(autoSlideInterval);
    track.style.transition = 'none'; // Temporarily disable transition during dragging
  }

  function drag(e) {
    if (!isDragging) return;
    const currentX = getPositionX(e);
    const diff = currentX - startX;
    
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = 24;
    const baseTranslate = -currentIndex * (slideWidth + gap);
    
    // Add translation offset
    track.style.transform = `translateX(${baseTranslate + diff}px)`;
  }

  function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    
    const endX = getPositionX(e);
    const diff = endX - startX;
    const threshold = 80; // Minimum pixel drag to shift slide
    
    if (diff < -threshold) {
      moveToSlide(currentIndex + 1);
    } else if (diff > threshold) {
      moveToSlide(currentIndex - 1);
    } else {
      moveToSlide(currentIndex); // Bounce back
    }
    
    startAutoSlide();
  }

  function getPositionX(e) {
    return e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  }

  // Initial setup of carousel
  setupDots();
  moveToSlide(0);
  startAutoSlide();

  /* ==========================================================================
     9. Featured Shoes Filtering Logic
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const categoryLinks = document.querySelectorAll('.category-link');
  const productCards = document.querySelectorAll('.product-card');

  // Sync category section link filter clicks with featured product grid
  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const filter = link.getAttribute('data-filter');
      // Highlight matching filter button
      filterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
          btn.click();
        }
      });
    });
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle button highlight
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        // Fade transition during filtering
        card.style.transform = 'scale(0.95)';
        card.style.opacity = '0';
        
        setTimeout(() => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.classList.remove('hidden');
            setTimeout(() => {
              card.style.transform = 'scale(1)';
              card.style.opacity = '1';
            }, 50);
          } else {
            card.classList.add('hidden');
          }
        }, 300);
      });
    });
  });

  /* ==========================================================================
     10. Product Interaction (Color Swatches, Add to Cart, Wishlist)
     ========================================================================== */
  const wishlistBadge = document.getElementById('wishlistCount');
  const cartBadge = document.getElementById('cartCount');
  const toastContainer = document.getElementById('toastContainer');
  
  let wishlistItems = new Set();
  let cartItems = [];

  // Color Swatch Selection Handler
  const swatches = document.querySelectorAll('.swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const parentCard = swatch.closest('.product-card');
      const siblings = parentCard.querySelectorAll('.swatch');
      
      siblings.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      
      // Visual feedback: brief scale on active product image
      const img = parentCard.querySelector('.product-img');
      img.style.transform = 'scale(0.95) rotate(-2deg)';
      setTimeout(() => {
        img.style.transform = '';
      }, 300);

      const colorSelected = swatch.getAttribute('data-color');
      showToast('Color Selected', `Selected color variant: ${colorSelected}`);
    });
  });

  // Add To Cart logic
  const cartButtons = document.querySelectorAll('.add-to-cart-btn, .quick-add-btn');
  cartButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');
      const img = btn.getAttribute('data-img');

      // Visual state toggle on active button
      const isQuickAdd = btn.classList.contains('quick-add-btn');
      
      if (!isQuickAdd) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        btn.style.pointerEvents = 'none';
        
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-check"></i> Added';
          btn.style.backgroundColor = 'var(--accent-color)';
          btn.style.color = '#000';
          
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = '';
            btn.style.color = '';
            btn.style.pointerEvents = 'auto';
          }, 1500);
        }, 800);
      }

      // Add item and increment badge
      cartItems.push({ id, name, price });
      cartBadge.textContent = cartItems.length;
      cartBadge.style.transform = 'scale(1.3)';
      setTimeout(() => {
        cartBadge.style.transform = 'scale(1)';
      }, 300);

      // Toast alert
      setTimeout(() => {
        showToast('Added to Cart', `${name} ($${price}) has been added to your shopping bag.`, img);
      }, isQuickAdd ? 0 : 800);
    });
  });

  // Wishlist Action Handler
  const wishlistButtons = document.querySelectorAll('.wishlist-btn');
  wishlistButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const card = btn.closest('.product-card');
      const name = card.querySelector('.product-name').textContent;
      const img = card.querySelector('.product-img').src;
      
      const heartIcon = btn.querySelector('i');

      if (wishlistItems.has(id)) {
        // Remove from wishlist
        wishlistItems.delete(id);
        btn.classList.remove('active');
        heartIcon.classList.replace('fas', 'far');
        
        showToast('Removed from Wishlist', `${name} has been removed from your saved collection.`);
      } else {
        // Add to wishlist
        wishlistItems.add(id);
        btn.classList.add('active');
        heartIcon.classList.replace('far', 'fas');
        
        // Bounce animation
        btn.style.transform = 'scale(1.4)';
        setTimeout(() => btn.style.transform = 'scale(1)', 300);

        showToast('Added to Wishlist', `${name} has been added to your saved collection.`, img);
      }

      wishlistBadge.textContent = wishlistItems.size;
      wishlistBadge.style.transform = 'scale(1.3)';
      setTimeout(() => {
        wishlistBadge.style.transform = 'scale(1)';
      }, 300);
    });
  });

  // Common Toast Generator function
  function showToast(title, message, imgUrl = null) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    
    let imgHtml = '';
    if (imgUrl) {
      imgHtml = `<img src="${imgUrl}" alt="${title}" style="width: 45px; height: 45px; object-fit: contain; border-radius: 4px; background: rgba(255,255,255,0.05); padding: 2px;">`;
    }

    toast.innerHTML = `
      ${imgHtml}
      <div class="toast-content">
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
    `;

    toastContainer.appendChild(toast);

    // Fade out and remove toast after 3.5s
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3500);
  }

  /* ==========================================================================
     11. Statistics Counter Animations
     ========================================================================== */
  const statsSection = document.getElementById('stats');
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        animateCounters();
      }
    });
  }, { threshold: 0.35 });

  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  function animateCounters() {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      const duration = 2000; // 2 seconds animation time
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Easing function (easeOutQuad)
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(easeProgress * target);
        
        // Format counters: e.g. 5,000,000 to "5" with M+ suffix
        if (target >= 1000000) {
          stat.textContent = (currentValue / 1000000).toFixed(0);
        } else if (target >= 1000) {
          stat.textContent = (currentValue / 1000).toFixed(0) + 'K';
          // Hide redundant suffix text since it's built into output
          const card = stat.closest('.stat-card');
          const suffix = card.querySelector('.stat-suffix');
          if (suffix) suffix.style.display = 'none';
        } else {
          stat.textContent = currentValue;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          // Confirm final exact value format
          if (target >= 1000000) {
            stat.textContent = (target / 1000000).toString();
          } else if (target >= 1000) {
            stat.textContent = (target / 1000).toString();
            const card = stat.closest('.stat-card');
            const suffix = card.querySelector('.stat-suffix');
            if (suffix) {
              suffix.style.display = 'inline';
              suffix.textContent = 'K+';
            }
          } else {
            stat.textContent = target;
          }
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  /* ==========================================================================
     12. Scroll Reveal Animations (Fade & Translate)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserverOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target); // Animate once only
      }
    });
  }, revealObserverOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // Fallback reveal activation for hero elements
  setTimeout(() => {
    const heroElements = document.querySelectorAll('#home .reveal');
    heroElements.forEach(el => el.classList.add('active'));
  }, 100);

  /* ==========================================================================
     13. Button Ripple Effect (Micro-interactions)
     ========================================================================== */
  const rippleButtons = document.querySelectorAll('.ripple');
  
  rippleButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  /* ==========================================================================
     14. Newsletter Form Action
     ========================================================================== */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;
      showToast('Subscription Active', `Thank you for subscribing with: ${email}`);
      newsletterForm.reset();
    });
  }
});
