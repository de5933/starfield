function init() {
	var canvas = document.getElementById('canvas');
	var svg = document.getElementById('svg');
	var ctx = canvas.getContext('2d');
	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;
    var resolution = WIDTH*HEIGHT;
    
    function setCanvas(c) {
        canvas = c;
        ctx = canvas.getContext('2d');
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
    
    function rnd(scale, offset) {
        if (typeof(scale)!='number') scale=1;
        if (typeof(offset)!='number') offset=0;
        return scale*Math.random()+offset;
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
    
	function drawStarCanvas(x, y, scale, color, lum) {
		if (!scale) scale = 1;
        if (!lum) lum = 1;
        if (!color) color = Color.WHITE;
        
		var r = scale / 2;
        color = color.avg(Color.WHITE);
        color.a = 0.5;
        
		ctx.fillStyle = color;
        
        // Halo
        var gradient = ctx.createRadialGradient(x,y, r/2, x,y,5*r*lum);
        gradient.addColorStop(0,color);
        gradient.addColorStop(1,Color.rgba(color.r,color.g,color.b,0));
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.arc(x, y, 5*r*lum, 0, 2*Math.PI);
        ctx.fill();

        // Star
        color.a = 1;
        ctx.fillStyle = Color.WHITE;
		ctx.beginPath();
		ctx.moveTo(x, y - r);
		ctx.lineTo(x - r, y);
		ctx.lineTo(x, y + r);
		ctx.lineTo(x + r, y);
		ctx.fill();
        
        // Center
        r = r / 2;
        ctx.fillStyle = 'white';
        
        ctx.beginPath();
		ctx.moveTo(x, y - r);
		ctx.lineTo(x - r, y);
		ctx.lineTo(x, y + r);
		ctx.lineTo(x + r, y);
		ctx.fill();
	}

    function drawStarSVG(x, y, scale, color, lum) {
		if (!scale) scale = 1;
        if (!lum) lum = 1;
        if (!color) color = Color.WHITE;
        
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
	}
    
	var drawStar = drawStarCanvas;
	
    function addSpot(x, y, size, blur, color) {
        if (x==null) x=Math.random()*WIDTH;
        if (y==null) y=Math.random()*HEIGHT;
        if (size==null) size=30 + 100*Math.random();
        if (blur==null) blur=(100+100*Math.random())+'px';
        if (color==null) color = Color.random();
        color.a = 0.5;

        var spot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        spot.setAttribute('cx', x);
        spot.setAttribute('cy', y);
        spot.setAttribute('r', size);
        spot.setAttribute('style', 'fill:' + color.toString() + '; filter: blur(' + blur + ')');
        svg.appendChild(spot);
    }

    function getPos(scale, t) {
        
        var mode = 1;
       
       // Sorted by color
        if (mode==0) return {
            x:(1-t)*WIDTH+rnd(100),
            y:(1-t)*HEIGHT+rnd(100)
        };
        
        // Random
        if (mode==1) return {
            x:rnd(WIDTH),
            y:rnd(HEIGHT)
        };
    }
    
    function starField(count, newcanvas) {
        
        setCanvas(newcanvas || canvas);
        
        for (var i = 0; i < count; i++) {
            // The distance between the star and the camera
            var scale = 1-Math.pow(rnd(), 1/8);

            // The color and brightness of the star
            var t = 1-Math.pow(rnd(), 1/3);
            var pos = getPos(scale, t);
            
            drawStar(
                pos.x,
                pos.y,
                10*scale,
                thermalColor(t),
                1
            );
        }
    }
    
    for (var i = 0; i < 50; i++) {
        addSpot();
    }
    
     var layers = document.getElementsByTagName('canvas');
    
    for (var i = 0; i < 1; i++) {
        starField(WIDTH*HEIGHT/1000, layers[i]);
    }
    
    //drawStar( rnd(WIDTH), rnd(HEIGHT), 25, thermalColor(0.5), 1);
    //drawStar( rnd(WIDTH), rnd(HEIGHT), 25, thermalColor(0.1), 1);
    //drawStar( rnd(WIDTH), rnd(HEIGHT), 25, thermalColor(1), 1);
    
    // Keep adding stars
    (function callback(){
        starField(1000);
        setTimeout(callback, 10);
    });
    
    //parallaxInit({x0: -WIDTH/2, y0: -HEIGHT/2 });
    
}