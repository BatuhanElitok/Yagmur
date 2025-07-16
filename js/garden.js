// Modern Garden.js - Responsive and Optimized
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    rotate(theta) {
        const x = this.x;
        const y = this.y;
        this.x = Math.cos(theta) * x - Math.sin(theta) * y;
        this.y = Math.sin(theta) * x + Math.cos(theta) * y;
        return this;
    }
    
    mult(f) {
        this.x *= f;
        this.y *= f;
        return this;
    }
    
    clone() {
        return new Vector(this.x, this.y);
    }
    
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
}

class Petal {
    constructor(stretchA, stretchB, startAngle, angle, growFactor, bloom) {
        this.stretchA = stretchA;
        this.stretchB = stretchB;
        this.startAngle = startAngle;
        this.angle = angle;
        this.bloom = bloom;
        this.growFactor = growFactor;
        this.r = 1;
        this.isfinished = false;
        this.opacity = 0;
        this.maxOpacity = Garden.options.color.opacity;
    }
    
    draw() {
        const ctx = this.bloom.garden.ctx;
        const v1 = new Vector(0, this.r).rotate(Garden.degrad(this.startAngle));
        const v2 = v1.clone().rotate(Garden.degrad(this.angle));
        const v3 = v1.clone().mult(this.stretchA);
        const v4 = v2.clone().mult(this.stretchB);
        
        // Smooth opacity transition
        if (this.opacity < this.maxOpacity) {
            this.opacity += this.maxOpacity / 20;
        }
        
        // Create gradient for more beautiful petals
        const gradient = ctx.createRadialGradient(
            v1.x, v1.y, 0,
            v2.x, v2.y, this.r
        );
        gradient.addColorStop(0, this.bloom.c);
        gradient.addColorStop(1, this.bloom.c.replace(/[\d\.]+\)$/g, '0)'));
        
        ctx.save();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = Garden.getResponsiveValue(1, 2, 3);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Add shadow for depth
        ctx.shadowColor = this.bloom.c;
        ctx.shadowBlur = Garden.getResponsiveValue(2, 4, 6);
        
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.bezierCurveTo(v3.x, v3.y, v4.x, v4.y, v2.x, v2.y);
        ctx.stroke();
        ctx.restore();
    }
    
    render() {
        if (this.r <= this.bloom.r) {
            this.r += this.growFactor;
            this.draw();
        } else {
            this.isfinished = true;
        }
    }
}

class Bloom {
    constructor(p, r, c, pc, garden) {
        this.p = p;
        this.r = r;
        this.c = c;
        this.pc = pc;
        this.petals = [];
        this.garden = garden;
        this.scale = 1;
        this.maxScale = Garden.getResponsiveScale();
        this.init();
        this.garden.addBloom(this);
    }
    
    draw() {
        let isfinished = true;
        this.garden.ctx.save();
        this.garden.ctx.translate(this.p.x, this.p.y);
        
        // Responsive scaling
        if (this.scale < this.maxScale) {
            this.scale += 0.02;
        }
        this.garden.ctx.scale(this.scale, this.scale);
        
        for (let i = 0; i < this.petals.length; i++) {
            const p = this.petals[i];
            p.render();
            isfinished = isfinished && p.isfinished;
        }
        
        this.garden.ctx.restore();
        
        if (isfinished) {
            this.garden.removeBloom(this);
        }
    }
    
    init() {
        const angle = 360 / this.pc;
        const startAngle = Garden.randomInt(0, 90);
        
        for (let i = 0; i < this.pc; i++) {
            this.petals.push(new Petal(
                Garden.random(Garden.options.petalStretch.min, Garden.options.petalStretch.max),
                Garden.random(Garden.options.petalStretch.min, Garden.options.petalStretch.max),
                startAngle + i * angle,
                angle,
                Garden.random(Garden.options.growFactor.min, Garden.options.growFactor.max),
                this
            ));
        }
    }
}

class Garden {
    constructor(ctx, element) {
        this.blooms = [];
        this.element = element;
        this.ctx = ctx;
        this.lastTime = 0;
        this.frameRate = 60;
        this.frameInterval = 1000 / this.frameRate;
        this.setupResponsive();
    }
    
    setupResponsive() {
        // Responsive adjustments based on screen size
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        if (screenWidth <= 480) {
            Garden.options.density = 5;
            Garden.options.bloomRadius.min = 4;
            Garden.options.bloomRadius.max = 6;
            Garden.options.petalCount.min = 6;
            Garden.options.petalCount.max = 10;
        } else if (screenWidth <= 768) {
            Garden.options.density = 7;
            Garden.options.bloomRadius.min = 6;
            Garden.options.bloomRadius.max = 8;
            Garden.options.petalCount.min = 7;
            Garden.options.petalCount.max = 12;
        } else {
            Garden.options.density = 10;
            Garden.options.bloomRadius.min = 8;
            Garden.options.bloomRadius.max = 10;
            Garden.options.petalCount.min = 8;
            Garden.options.petalCount.max = 15;
        }
        
        // Adjust colors for better visibility on different devices
        Garden.options.color.opacity = screenWidth <= 480 ? 0.15 : 0.1;
    }
    
    render(currentTime = 0) {
        if (currentTime - this.lastTime >= this.frameInterval) {
            this.ctx.clearRect(0, 0, this.element.width, this.element.height);
            
            for (let i = 0; i < this.blooms.length; i++) {
                this.blooms[i].draw();
            }
            
            this.lastTime = currentTime;
        }
    }
    
    addBloom(b) {
        this.blooms.push(b);
    }
    
    removeBloom(b) {
        const index = this.blooms.indexOf(b);
        if (index > -1) {
            this.blooms.splice(index, 1);
        }
    }
    
    createRandomBloom(x, y) {
        // Ensure coordinates are within canvas bounds
        x = Math.max(0, Math.min(x, this.element.width));
        y = Math.max(0, Math.min(y, this.element.height));
        
        this.createBloom(
            x, y,
            Garden.randomInt(Garden.options.bloomRadius.min, Garden.options.bloomRadius.max),
            Garden.randomrgba(
                Garden.options.color.rmin, Garden.options.color.rmax,
                Garden.options.color.gmin, Garden.options.color.gmax,
                Garden.options.color.bmin, Garden.options.color.bmax,
                Garden.options.color.opacity
            ),
            Garden.randomInt(Garden.options.petalCount.min, Garden.options.petalCount.max)
        );
    }
    
    createBloom(x, y, r, c, pc) {
        new Bloom(new Vector(x, y), r, c, pc, this);
    }
    
    clear() {
        this.blooms = [];
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    }
    
    // Responsive canvas resize
    resize() {
        const rect = this.element.getBoundingClientRect();
        this.element.width = rect.width;
        this.element.height = rect.height;
        this.setupResponsive();
    }
}

// Static properties and methods
Garden.options = {
    petalCount: {
        min: 8,
        max: 15
    },
    petalStretch: {
        min: 0.1,
        max: 3
    },
    growFactor: {
        min: 0.1,
        max: 1
    },
    bloomRadius: {
        min: 8,
        max: 10
    },
    density: 10,
    growSpeed: 1000 / 60,
    color: {
        rmin: 128,
        rmax: 255,
        gmin: 0,
        gmax: 128,
        bmin: 0,
        bmax: 128,
        opacity: 0.1
    },
    tanAngle: 60
};

Garden.random = function(min, max) {
    return Math.random() * (max - min) + min;
};

Garden.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Garden.circle = 2 * Math.PI;

Garden.degrad = function(angle) {
    return Garden.circle / 360 * angle;
};

Garden.raddeg = function(angle) {
    return angle / Garden.circle * 360;
};

Garden.rgba = function(r, g, b, a) {
    return `rgba(${r},${g},${b},${a})`;
};

Garden.randomrgba = function(rmin, rmax, gmin, gmax, bmin, bmax, a) {
    const r = Math.round(Garden.random(rmin, rmax));
    const g = Math.round(Garden.random(gmin, gmax));
    const b = Math.round(Garden.random(bmin, bmax));
    const limit = 5;
    
    if (Math.abs(r - g) <= limit && Math.abs(g - b) <= limit && Math.abs(b - r) <= limit) {
        return Garden.randomrgba(rmin, rmax, gmin, gmax, bmin, bmax, a);
    } else {
        return Garden.rgba(r, g, b, a);
    }
};

// Responsive helper functions
Garden.getResponsiveValue = function(mobile, tablet, desktop) {
    const width = window.innerWidth;
    if (width <= 480) return mobile;
    if (width <= 768) return tablet;
    return desktop;
};

Garden.getResponsiveScale = function() {
    const width = window.innerWidth;
    if (width <= 480) return 0.7;
    if (width <= 768) return 0.85;
    return 1.0;
};

// Performance optimization with RequestAnimationFrame
Garden.prototype.startAnimation = function() {
    const animate = (currentTime) => {
        this.render(currentTime);
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
};

// Touch and mouse event handlers for mobile
Garden.prototype.addEventListeners = function() {
    const handleInteraction = (e) => {
        e.preventDefault();
        const rect = this.element.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        this.createRandomBloom(x, y);
    };
    
    this.element.addEventListener('click', handleInteraction);
    this.element.addEventListener('touchstart', handleInteraction);
    this.element.addEventListener('mousemove', (e) => {
        if (e.buttons === 1) { // Left mouse button pressed
            handleInteraction(e);
        }
    });
};

// Window resize handler
window.addEventListener('resize', () => {
    // Debounce resize events
    clearTimeout(Garden.resizeTimeout);
    Garden.resizeTimeout = setTimeout(() => {
        if (window.garden) {
            window.garden.resize();
        }
    }, 150);
});

// Export for both module and global usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Garden, Vector, Petal, Bloom };
} else {
    window.Garden = Garden;
    window.Vector = Vector;
    window.Petal = Petal;
    window.Bloom = Bloom;
}