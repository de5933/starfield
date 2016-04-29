var Starfield = (function(){

    function Starfield(target, width, height) {
        this.target = target;

        var nodeName = target.nodeName.toUpperCase();
            
        if (nodeName == 'CANVAS') mode = TARGET_CANVAS;
        else if (nodeName == 'SVG') mode = TARGET_SVG;
        else mode = TARGET_CANVAS;
        
        if (mode==TARGET_CANVAS) {
            this.drawStar = drawStarCanvas;
            this.drawSpot = function(){};
            this.context = target.getContext('2d');
            this.width = width || target.width;
            this.height = height || target.height;
        }
        else if (mode == TARGET_SVG) {
            this.drawStar = drawStarSVG;
            this.drawSpot = drawSpot;
            this.width = width || target.width.baseVal.value;
            this.height = height || target.height.baseVal.value;
        }
        
        this.drawmode = DRAW_DISK;
        this.generate = generate;
    }
    
    function getGaussian(a, b, c) {
        a = typeof(a)=='number'? a : 1;
        b = typeof(b)=='number'? b : 1;
        c = typeof(c)=='number'? c : 1;
        
        return function gauss(x) {
            return a*Math.exp(
                -Math.pow(x-b,2) / (2*c*c)
            );
        };
    
    }
    
    function thermalColor(x) {
        // 0.0 = f00
        // 0.25 = f70
        // 0.5 = ff0
        // 0.75 = fff
        // 1.0 = 0ff
        var max = 255;
        var r = 0;
        var g = 0;
        var b = 0;
        
        if (x<0.75) r = max;
        else  r = max-max*(x-0.75)/0.25;
        
        if (x < 0.75) g=x*max/0.75;
        else g=max;
        
        if (x < 0.75) b=(x-0.5)*max/0.25;
        else b=max;
        
        return Color.rgb(r, g, b);
    }
    
    function rnd(scale, offset) {
        if (typeof(scale)!='number') scale=1;
        if (typeof(offset)!='number') offset=0;
        return scale*Math.random()+offset;
    }
    
    function drawStarCanvas (x, y, scale, color, lum) {
        if (!scale) scale = 1;
        if (!lum) lum = 1;
        if (!color) color = Color.WHITE;
        
        var ctx = this.context;
        
		var r = scale / 2;
        color = color.avg(Color.WHITE);

        // Halo
        if (this.drawmode == DRAW_GRADIENT) {
            color.a = 0.5;
            ctx.fillStyle = color;
            
            var gradient = ctx.createRadialGradient(x,y, r/2, x,y,5*r*lum);
            gradient.addColorStop(0,color);
            gradient.addColorStop(1,Color.rgba(color.r,color.g,color.b,0));
            ctx.fillStyle = gradient;
            
            color = Color.WHITE;
        }
        else {
            color.a = 0.1;
            ctx.fillStyle = color;
        }
        
        ctx.beginPath();
        ctx.arc(x, y, 5*r*lum, 0, 2*Math.PI);
        ctx.fill();

        // Star
        color.a = 1;
        ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(x, y - r);
		ctx.lineTo(x - r, y);
		ctx.lineTo(x, y + r);
		ctx.lineTo(x + r, y);
		ctx.fill();
        
        // Center
        if (this.drawmode != DRAW_GRADIENT) {
            r = r / 2;
            ctx.fillStyle = Color.WHITE;
            
            ctx.beginPath();
            ctx.moveTo(x, y - r);
            ctx.lineTo(x - r, y);
            ctx.lineTo(x, y + r);
            ctx.lineTo(x + r, y);
            ctx.fill();
        }
    };
    
    function drawStarSVG(x, y, scale, color, lum) {
		if (!scale) scale = 1;
        if (!lum) lum = 1;
        if (!color) color = Color.WHITE;
        
        var svg = this.target;
        
		var r = scale / 2;
        color = color.avg(Color.WHITE);
		
		// Halo
		
		color.a = 0.1;
		var haloRadius = 5*r*lum;
		
		if (haloRadius > 2 && haloRadius > r) {
			var halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			halo.setAttribute('class', 'halo');
			halo.setAttribute('cx', x);
			halo.setAttribute('cy', y);
			halo.setAttribute('r', haloRadius);
			halo.setAttribute('fill', color);
			svg.appendChild(halo);
		}
		
		// Star
		
		color.a = 1;
		
		var star = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		star.setAttribute('class', 'star');
		star.setAttribute('d', [
			'M', x, y,
			'h', -r,
			'l', r, r,
			'l', r, -r,
			'l', -r, -r,
			'l', -r, r,
			'z'
		].join(' '));
		star.setAttribute('fill', color);
		svg.appendChild(star);
		
		
		// Core
		r = r/2;
		
		if (r >= 1) {
			var core = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			core.setAttribute('d', [
				'M', x, y,
				'h', -r,
				'l', r, r,
				'l', r, -r,
				'l', -r, -r,
				'l', -r, r,
				'z'
			].join(' '));
			core.setAttribute('fill', Color.WHITE);
			svg.appendChild(core);
		}
	};
    
    function drawSpot(x, y, size, blur) {
        if (x==null) x=rnd(this.width);
        if (y==null) y=rnd(this.height);
        if (size==null) size=30 + 100*rnd();
        if (blur==null) blur=(100+100*rnd())+'px';

        var spot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        spot.setAttribute('cx', x);
        spot.setAttribute('cy', y);
        spot.setAttribute('r', size);
        spot.setAttribute('style', 'fill: rgba(255,119,0,0.5); filter: blur(' + blur + ') hue-rotate(' + (360+180*rnd(1,-0.5)) + 'deg)');
        svg.appendChild(spot);
    }
    
    function generate(starcount) {
        
        for (var i = 0; i < starcount; i++) {
            // The distance between the star and the camera
            var scale = 1-Math.pow(rnd(), 1/8);

            // The color and brightness of the star
            var t = 1-Math.pow(rnd(), 1/3);
            
            this.drawStar(
                rnd(this.width),
                rnd(this.height),
                10*scale,
                thermalColor(t),
                1
            );
        }
        
        var spotcount = (this.width * this.height) / 50000;
        
        for (var i = 0; i < spotcount; i++) {
            this.drawSpot();
        }
    }

    var TARGET_CANVAS = Starfield.TARGET_CANVAS = 'canvas';
    var TARGET_SVG = Starfield.TARGET_SVG = 'svg';
    
    var DRAW_DISK = Starfield.DRAW_DISK = 'disk';
    var DRAW_GRADIENT = Starfield.DRAW_GRADIENT = 'gradient';
    
    return Starfield;
})();

function init() {
    var cField = new Starfield(document.getElementById('canvas'));
    var sField = new Starfield(document.getElementById('svg'));
    
    sField.generate(0);
    cField.generate();
}
