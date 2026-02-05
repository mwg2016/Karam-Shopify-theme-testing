class ShoppableVideoSlider {
  constructor(container) {
    this.container = container;
    this.slider = container.querySelector('[data-slider]');
    this.items = this.slider.querySelectorAll('[data-slider-item]');
    this.prevBtn = container.querySelector('[data-slider-prev]');
    this.nextBtn = container.querySelector('[data-slider-next]');
    this.indicators = container.querySelectorAll('[data-slider-indicator]');
    
    this.currentIndex = 0;
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.startTime = 0;
    this.threshold = 50;
    this.velocityThreshold = 0.5;
    this.isAnimating = false;
    this.isMobile = window.matchMedia('(max-width: 749px)').matches;
    
    this.init();
  }

  init() {
    if (!this.isMobile || this.items.length <= 1) {
      return; // Don't init slider on desktop or if only one item
    }

    this.addEventListeners();
    this.updateSlider();
    this.startAutoResize();
  }

  addEventListeners() {
    // Prevent default drag behavior
    this.slider.addEventListener('dragstart', (e) => e.preventDefault());

    // Touch events
    this.slider.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.slider.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
    this.slider.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

    // Mouse events (for testing)
    this.slider.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.slider.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.slider.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.slider.addEventListener('mouseleave', (e) => this.handleMouseUp(e));

    // Button events
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

    // Indicator events
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  startAutoResize() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.handleResize(), 250);
    });
  }

  handleTouchStart(e) {
    this.isDragging = true;
    this.startX = e.touches[0].clientX;
    this.currentX = this.startX;
    this.startTime = Date.now();
    this.removeTransition();
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.touches[0].clientX;
  }

  handleTouchEnd(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    
    const diff = this.startX - this.currentX;
    const timeElapsed = Date.now() - this.startTime;
    const velocity = Math.abs(diff) / timeElapsed;

    this.addTransition();

    if (Math.abs(diff) > this.threshold || velocity > this.velocityThreshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    } else {
      this.updateSlider();
    }
  }

  handleMouseDown(e) {
    if (e.target.closest('button, a, [role="button"]')) return;
    
    this.isDragging = true;
    this.startX = e.clientX;
    this.currentX = this.startX;
    this.startTime = Date.now();
    this.removeTransition();
    this.slider.style.cursor = 'grabbing';
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.clientX;
  }

  handleMouseUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    
    const diff = this.startX - this.currentX;
    const timeElapsed = Date.now() - this.startTime;
    const velocity = Math.abs(diff) / timeElapsed;

    this.slider.style.cursor = 'grab';
    this.addTransition();

    if (Math.abs(diff) > this.threshold || velocity > this.velocityThreshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    } else {
      this.updateSlider();
    }
  }

  handleKeyboard(e) {
    if (!this.container.closest(':visible')) return;
    
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    }
  }

  next() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.updateSlider();
    setTimeout(() => this.isAnimating = false, 300);
  }

  prev() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.updateSlider();
    setTimeout(() => this.isAnimating = false, 300);
  }

  goToSlide(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    this.isAnimating = true;
    this.currentIndex = index;
    this.updateSlider();
    setTimeout(() => this.isAnimating = false, 300);
  }

  updateSlider() {
    const offset = -this.currentIndex * 100;
    this.slider.style.transform = `translateX(${offset}%)`;

    // Update indicators
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('is-active', index === this.currentIndex);
      indicator.setAttribute('aria-label', `Go to slide ${index + 1}${index === this.currentIndex ? ' (current)' : ''}`);
    });

    // Update button states
    if (this.prevBtn) {
      this.prevBtn.setAttribute('aria-label', `Previous video (showing ${this.currentIndex + 1} of ${this.items.length})`);
    }
    if (this.nextBtn) {
      this.nextBtn.setAttribute('aria-label', `Next video (showing ${this.currentIndex + 1} of ${this.items.length})`);
    }
  }

  removeTransition() {
    this.slider.style.transition = 'none';
  }

  addTransition() {
    this.slider.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  }

  handleResize() {
    const isMobileNow = window.matchMedia('(max-width: 749px)').matches;
    
    if (this.isMobile && !isMobileNow) {
      // Switching to desktop
      this.slider.style.transform = 'translateX(0)';
      this.slider.style.transition = 'none';
      this.currentIndex = 0;
      this.isMobile = false;
    } else if (!this.isMobile && isMobileNow) {
      // Switching to mobile
      this.isMobile = true;
      this.addTransition();
      this.updateSlider();
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const sliders = document.querySelectorAll('[data-shoppable-video-slider]');
  sliders.forEach(slider => new ShoppableVideoSlider(slider));
});

// Reinitialize sliders when sections are dynamically loaded
document.addEventListener('shopify:section:load', function(e) {
  const slider = e.detail.target.querySelector('[data-shoppable-video-slider]');
  if (slider) {
    new ShoppableVideoSlider(slider);
  }
});
