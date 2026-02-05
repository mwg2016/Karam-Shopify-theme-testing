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
    this.threshold = 50;
    
    this.init();
  }

  init() {
    if (window.matchMedia('(min-width: 750px)').matches) {
      return; // Don't init slider on desktop
    }

    this.addEventListeners();
    this.updateSlider();
  }

  addEventListeners() {
    // Touch events
    this.slider.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
    this.slider.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
    this.slider.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);

    // Mouse events (for testing)
    this.slider.addEventListener('mousedown', (e) => this.handleMouseDown(e), false);
    this.slider.addEventListener('mousemove', (e) => this.handleMouseMove(e), false);
    this.slider.addEventListener('mouseup', (e) => this.handleMouseUp(e), false);
    this.slider.addEventListener('mouseleave', (e) => this.handleMouseUp(e), false);

    // Button events
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

    // Indicator events
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });

    // Handle resize
    window.addEventListener('resize', () => this.handleResize());
  }

  handleTouchStart(e) {
    this.isDragging = true;
    this.startX = e.touches[0].clientX;
    this.currentX = this.startX;
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.touches[0].clientX;
  }

  handleTouchEnd(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    
    const diff = this.startX - this.currentX;
    
    if (Math.abs(diff) > this.threshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }

  handleMouseDown(e) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.currentX = this.startX;
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.clientX;
  }

  handleMouseUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    
    const diff = this.startX - this.currentX;
    
    if (Math.abs(diff) > this.threshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.updateSlider();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.updateSlider();
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.updateSlider();
  }

  updateSlider() {
    const offset = -this.currentIndex * 100;
    this.slider.style.transform = `translateX(${offset}%)`;

    // Update indicators
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('is-active', index === this.currentIndex);
    });

    // Update button states
    if (this.prevBtn) {
      this.prevBtn.disabled = false;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = false;
    }
  }

  handleResize() {
    if (window.matchMedia('(min-width: 750px)').matches) {
      // Reset slider on desktop
      this.slider.style.transform = 'translateX(0)';
      this.currentIndex = 0;
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const sliders = document.querySelectorAll('[data-shoppable-video-slider]');
  sliders.forEach(slider => new ShoppableVideoSlider(slider));
});
