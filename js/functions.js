// Modern Functions.js - Responsive and Optimized
class LoveApp {
    constructor() {
        this.gardenCtx = null;
        this.gardenCanvas = null;
        this.garden = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.clientWidth = window.innerWidth;
        this.clientHeight = window.innerHeight;
        this.animationFrame = null;
        this.resizeTimeout = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupGarden());
        } else {
            this.setupGarden();
        }
        
        this.setupEventListeners();
    }
    
    setupGarden() {
        const loveHeart = document.getElementById('loveHeart');
        const garden = document.getElementById('garden');
        const content = document.getElementById('content');
        const code = document.getElementById('code');
        
        if (!loveHeart || !garden) return;
        
        // Calculate responsive dimensions
        const dimensions = this.getResponsiveDimensions();
        
        // Setup canvas
        this.gardenCanvas = garden;
        this.gardenCanvas.width = dimensions.width;
        this.gardenCanvas.height = dimensions.height;
        
        // Setup context
        this.gardenCtx = this.gardenCanvas.getContext('2d');
        this.gardenCtx.globalCompositeOperation = 'lighter';
        
        // Enable high DPI support
        this.setupHighDPI();
        
        // Create garden instance
        this.garden = new Garden(this.gardenCtx, this.gardenCanvas);
        this.garden.addEventListeners();
        
        // Calculate offsets for heart animation
        this.offsetX = dimensions.width / 2;
        this.offsetY = dimensions.height / 2 - (window.innerWidth <= 480 ? 30 : 55);
        
        // Setup layout
        this.setupLayout();
        
        // Start render loop with RAF
        this.startRenderLoop();
    }
    
    getResponsiveDimensions() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        if (screenWidth <= 480) {
            return {
                width: Math.min(screenWidth - 20, 400),
                height: Math.min(screenHeight - 200, 300)
            };
        } else if (screenWidth <= 768) {
            return {
                width: Math.min(screenWidth - 100, 550),
                height: Math.min(screenHeight - 150, 450)
            };
        } else {
            return {
                width: 670,
                height: 625
            };
        }
    }
    
    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.gardenCanvas.getBoundingClientRect();
        
        this.gardenCanvas.width = rect.width * dpr;
        this.gardenCanvas.height = rect.height * dpr;
        this.gardenCanvas.style.width = rect.width + 'px';
        this.gardenCanvas.style.height = rect.height + 'px';
        
        this.gardenCtx.scale(dpr, dpr);
    }
    
    setupLayout() {
        const content = document.getElementById('content');
        const code = document.getElementById('code');
        const loveHeart = document.getElementById('loveHeart');
        
        if (!content || !code || !loveHeart) return;
        
        const screenWidth = window.innerWidth;
        const isMobile = screenWidth <= 768;
        
        if (isMobile) {
            // Mobile layout: stack vertically
            content.style.width = '100%';
            content.style.height = 'auto';
            content.style.marginTop = '10px';
            content.style.marginLeft = '0';
            content.style.padding = '10px';
            content.style.boxSizing = 'border-box';
            content.style.display = 'flex';
            content.style.flexDirection = 'column';
            content.style.alignItems = 'center';
            
            // Adjust code position for mobile
            code.style.marginTop = '20px';
            code.style.width = '100%';
            code.style.maxWidth = '100%';
        } else {
            // Desktop layout
            const contentWidth = this.gardenCanvas.width + code.offsetWidth;
            const contentHeight = Math.max(this.gardenCanvas.height, code.offsetHeight);
            
            content.style.width = contentWidth + 'px';
            content.style.height = contentHeight + 'px';
            content.style.marginTop = Math.max((window.innerHeight - contentHeight) / 2, 10) + 'px';
            content.style.marginLeft = Math.max((window.innerWidth - contentWidth) / 2, 10) + 'px';
            
            // Adjust code position for desktop
            code.style.marginTop = ((this.gardenCanvas.height - code.offsetHeight) / 2) + 'px';
        }
    }
    
    startRenderLoop() {
        const render = () => {
            if (this.garden) {
                this.garden.render();
            }
            this.animationFrame = requestAnimationFrame(render);
        };
        render();
    }
    
    setupEventListeners() {
        // Responsive resize handler
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 150);
        });
        
        // Orientation change handler for mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 500);
        });
        
        // Visibility change handler for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.animationFrame) {
                    cancelAnimationFrame(this.animationFrame);
                }
            } else {
                this.startRenderLoop();
            }
        });
    }
    
    handleResize() {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        
        // Only reload if significant size change
        if (Math.abs(newWidth - this.clientWidth) > 100 || 
            Math.abs(newHeight - this.clientHeight) > 100) {
            
            this.clientWidth = newWidth;
            this.clientHeight = newHeight;
            
            // Recreate garden with new dimensions
            this.setupGarden();
        }
    }
    
    getHeartPoint(angle) {
        const t = angle / Math.PI;
        const scale = window.innerWidth <= 480 ? 0.7 : window.innerWidth <= 768 ? 0.85 : 1;
        const x = 19.5 * scale * (16 * Math.pow(Math.sin(t), 3));
        const y = -20 * scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        return [this.offsetX + x, this.offsetY + y];
    }
    
    startHeartAnimation() {
        const interval = window.innerWidth <= 480 ? 80 : 50; // Slower on mobile
        let angle = 10;
        const heart = [];
        
        const animationTimer = setInterval(() => {
            const bloom = this.getHeartPoint(angle);
            let draw = true;
            
            // Check if bloom is within canvas bounds
            if (bloom[0] < 0 || bloom[0] > this.gardenCanvas.width || 
                bloom[1] < 0 || bloom[1] > this.gardenCanvas.height) {
                draw = false;
            }
            
            // Check distance from existing blooms
            for (let i = 0; i < heart.length; i++) {
                const p = heart[i];
                const distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
                if (distance < Garden.options.bloomRadius.max * 1.3) {
                    draw = false;
                    break;
                }
            }
            
            if (draw && this.garden) {
                heart.push(bloom);
                this.garden.createRandomBloom(bloom[0], bloom[1]);
            }
            
            if (angle >= 30) {
                clearInterval(animationTimer);
                this.showMessages();
            } else {
                angle += 0.2;
            }
        }, interval);
    }
    
    showMessages() {
        this.adjustWordsPosition();
        const messages = document.getElementById('messages');
        if (messages) {
            messages.style.display = 'block';
            messages.style.opacity = '0';
            this.fadeIn(messages, 5000, () => {
                this.showLoveU();
            });
        }
    }
    
    adjustWordsPosition() {
        const words = document.getElementById('words');
        const garden = document.getElementById('garden');
        
        if (!words || !garden) return;
        
        const screenWidth = window.innerWidth;
        
        if (screenWidth <= 768) {
            // Mobile positioning
            words.style.position = 'relative';
            words.style.top = 'auto';
            words.style.left = 'auto';
            words.style.textAlign = 'center';
            words.style.marginTop = '20px';
        } else {
            // Desktop positioning
            const gardenRect = garden.getBoundingClientRect();
            words.style.position = 'absolute';
            words.style.top = (gardenRect.top + 195) + 'px';
            words.style.left = (gardenRect.left + 70) + 'px';
        }
    }
    
    showLoveU() {
        const loveu = document.getElementById('loveu');
        if (loveu) {
            loveu.style.display = 'block';
            loveu.style.opacity = '0';
            this.fadeIn(loveu, 3000);
        }
    }
    
    // Modern fade-in implementation
    fadeIn(element, duration, callback) {
        const start = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };
        requestAnimationFrame(animate);
    }
}

// Modern Typewriter Effect
class TypewriterEffect {
    constructor(element, options = {}) {
        this.element = element;
        this.speed = options.speed || 75;
        this.cursor = options.cursor || '_';
        this.showCursor = options.showCursor !== false;
    }
    
    type() {
        const originalText = this.element.innerHTML;
        this.element.innerHTML = '';
        
        let progress = 0;
        const timer = setInterval(() => {
            let current = originalText.substr(progress, 1);
            
            if (current === '<') {
                progress = originalText.indexOf('>', progress) + 1;
            } else {
                progress++;
            }
            
            const displayText = originalText.substring(0, progress);
            const cursor = this.showCursor && (progress % 2 === 1) ? this.cursor : '';
            
            this.element.innerHTML = displayText + cursor;
            
            if (progress >= originalText.length) {
                clearInterval(timer);
                if (this.showCursor) {
                    this.element.innerHTML = originalText;
                }
            }
        }, this.speed);
    }
}

// Time Elapsed Calculator
class TimeElapsedCalculator {
    constructor(startDate) {
        this.startDate = new Date(startDate);
        this.element = document.getElementById('elapseClock');
        this.updateInterval = null;
    }
    
    start() {
        this.update();
        this.updateInterval = setInterval(() => this.update(), 1000);
    }
    
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
    
    update() {
        if (!this.element) return;
        
        const now = new Date();
        const seconds = Math.floor((now - this.startDate) / 1000);
        
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        const formatTime = (time) => time.toString().padStart(2, '0');
        
        this.element.innerHTML = `
            <span class="digit">${days}</span> days 
            <span class="digit">${formatTime(hours)}</span> hours 
            <span class="digit">${formatTime(minutes)}</span> minutes 
            <span class="digit">${formatTime(remainingSeconds)}</span> seconds
        `;
    }
}

// Initialize everything when DOM is ready
let loveApp;
let timeCalculator;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize main app
    loveApp = new LoveApp();
    
    // Initialize typewriter effect
    const codeElement = document.getElementById('code');
    if (codeElement) {
        const typewriter = new TypewriterEffect(codeElement, {
            speed: 75,
            showCursor: true
        });
        
        // Start typewriter after a delay
        setTimeout(() => {
            typewriter.type();
        }, 1000);
    }
    
    // Initialize time calculator
    const startDate = new Date(2024, 4, 4, 22, 30, 0); // May 4, 2024, 22:30:00
    timeCalculator = new TimeElapsedCalculator(startDate);
    timeCalculator.start();
    
    // Start heart animation after delay
    setTimeout(() => {
        if (loveApp) {
            loveApp.startHeartAnimation();
        }
    }, 5000);
});

// Global functions for backward compatibility
window.startHeartAnimation = () => {
    if (loveApp) {
        loveApp.startHeartAnimation();
    }
};

window.timeElapse = (date) => {
    if (timeCalculator) {
        timeCalculator.startDate = new Date(date);
        timeCalculator.update();
    }
};

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (loveApp && loveApp.animationFrame) {
        cancelAnimationFrame(loveApp.animationFrame);
    }
    if (timeCalculator) {
        timeCalculator.stop();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LoveApp, TypewriterEffect, TimeElapsedCalculator };
}