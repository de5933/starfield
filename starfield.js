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
            this.drawGradientCanvas = drawGradientCanvas;
            
            this.context = target.getContext('2d');
            this.context.globalCompositeOperation = 'screen';
            this.width = width || target.width;
            this.height = height || target.height;
            
            target.width = this.width;
            target.height = this.height;
        }
        else if (mode == TARGET_SVG) {
            this.drawStar = drawStarSVG;
            this.drawSpot = drawSpot;
            
            this.width = width || target.width.baseVal.value;
            this.height = height || target.height.baseVal.value;
            target.width.baseVal.valueAsString = this.width+'px';
            target.height.baseVal.valueAsString = this.height+'px';
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
    
    function isNum(n) {
        return typeof(n)=='number';
    }
    
    function rnd(scale, offset) {
        if (typeof(scale)!='number') scale=1;
        if (typeof(offset)!='number') offset=0;
        return scale*Math.random()+offset;
    }
    
    function rndSign(scale) {
        scale = scale || 1;
        return Math.pow(-1, Math.ceil(rnd(2)))*scale;
    }
    
    function drawStarCanvas (x, y, scale, color, lum) {
        if (this.drawmode == DRAW_CLOUDS) return;
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
        
        if (this.drawmode == DRAW_GRADIENT || this.drawmode == DRAW_DISK) {
            ctx.beginPath();
            ctx.arc(x, y, 5*r*lum, 0, 2*Math.PI);
            ctx.fill();
        }

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
        if (this.drawmode == DRAW_CLOUDS) return;
		if (!scale) scale = 1;
        if (!lum) lum = 1;
        if (!color) color = Color.WHITE;
        
        var svg = this.target;
        
		var r = scale / 2;
        color = color.avg(Color.WHITE);
		
		// Halo
		if (this.drawmode == DRAW_GRADIENT || this.drawmode == DRAW_DISK) {
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
        star.setAttribute('data-parallax', rnd(2));
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
        //spot.setAttribute('style', 'fill: rgba(255,119,0,0.5); filter: blur(' + blur + ') hue-rotate(' + (360+180*rnd(1,-0.5)) + 'deg)');
        var c = Color.random(); c.a = 0.5; spot.setAttribute('style', 'fill: ' + c.toString() + '; filter: blur(' + blur + ')');
        this.target.appendChild(spot);
    }
    
    function drawGradientCanvas(x, y, r, color) {
        if (!isNum(x)) x = rnd(this.width);
        if (!isNum(y)) y = rnd(this.height);
        if (!isNum(r)) r = rnd( (this.width+this.height) );
        if (!color) color = Color.random();
        
        color = color.avg(Color.BLACK);
        color.a = 0.5;
        
        var ctx = this.context;
        var gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,this.width,this.height);
    }
    
    var position = {
        random: function () {
            return {
                x: rnd(this.width),
                y: rnd(this.height)
            };
        },
        milkyway: function() {
            return {
                x: this.width*rnd(),
                y: this.height*Math.pow(rnd(),2)/2*rndSign() + 0.5
            };
        },
        graph: function(xaxis, yaxis, jitter) {
            if (!isNum(jitter)) jitter = 0;
            return {
                x: this.height*(xaxis + rnd(jitter)),
                y: this.width*(yaxis + rnd(jitter))
            };
        }
    };
    
    function generate(starcount) {
        if (this.drawmode == DRAW_CLOUDS) {
            var spotcount = isNum(starcount) ? starcount : (this.width * this.height) / 50000;
            
            for (var i = 0; i < spotcount; i++) {
                this.drawSpot();
            }
        }
        else {
            var starcount = isNum(starcount) ? starcount : ((this.width * this.height) / 100);
            
            for (var i = 0; i < starcount; i++) {
                // The distance between the star and the camera
                var scale = 10*(1-Math.pow(rnd(), 1/8));

                // The color and brightness of the star
                var t = 1-Math.pow(rnd(), 1/3);
                
                var color = thermalColor(t);
                //var color = Color.random();
                var hsl = getHSL(color);
                
                var pos = position.random.call(this);
                //var pos = position.graph.call(this, hsl.h/360, hsl.l/255, 0);
                
                this.drawStar(
                    pos.x,
                    pos.y,
                    scale,
                    color,
                    1
                );
            }
        }
    }

    var TARGET_CANVAS = Starfield.TARGET_CANVAS = 'canvas';
    var TARGET_SVG = Starfield.TARGET_SVG = 'svg';
    
    var DRAW_DISK = Starfield.DRAW_DISK = 'disk';
    var DRAW_GRADIENT = Starfield.DRAW_GRADIENT = 'gradient';
    var DRAW_DIAMOND = Starfield.DRAW_DIAMOND = 'diamond';
    var DRAW_CLOUDS = Starfield.DRAW_CLOUDS = 'clouds';
    
    return Starfield;
})();

function init(width, height) {
    width = width||innerWidth;
    height = height||innerHeight;
    var cField = new Starfield(document.getElementById('canvas1'), width, height);
    var sField = new Starfield(document.getElementById('svg1'), width, height);
    var nebula = new Starfield(document.getElementById('svg2'), width, height);
    var cNebula = new Starfield(document.getElementById('canvas2'), width, height);
    
    //cField.drawmode = Starfield.DRAW_GRADIENT;
    sField.drawmode = Starfield.DRAW_DIAMOND;
    nebula.drawmode = Starfield.DRAW_CLOUDS;
    
    for (var i = 0; i < 3; i++) cNebula.drawGradientCanvas();
    
    //sField.generate(1000);
    cField.generate();
    //nebula.generate();
    //parallaxInit();
    
}
