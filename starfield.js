function init() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;
    var resolution = WIDTH*HEIGHT;
    
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
    
	function drawStar(x, y, scale, color, lum) {
		if (!scale) scale = 1;
        if (!lum) lum = 1;
        if (!color) color = Color.WHITE;
        
		var r = scale / 2;
        color = color.avg(Color.WHITE);
        color.a = 0.1;
        
		ctx.fillStyle = color;
        
        // Halo
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
        r = r / 2;
        ctx.fillStyle = 'white';
        
        ctx.beginPath();
		ctx.moveTo(x, y - r);
		ctx.lineTo(x - r, y);
		ctx.lineTo(x, y + r);
		ctx.lineTo(x + r, y);
		ctx.fill();
	}

    
    
    function starField(count) {
        
        for (var i = 0; i < count; i++) {
            // The distance between the star and the camera
            var scale = 1-Math.pow(rnd(), 1/8);

            // The color and brightness of the star
            var t = Math.pow(rnd(), 2);
            
            drawStar(
                rnd(WIDTH),
                rnd(HEIGHT),
                10*scale,
                thermalColor(t),
                t
            );
        }
    }
    
    starField(WIDTH*HEIGHT/100);
    
    drawStar(
    rnd(WIDTH), rnd(HEIGHT),
    25, thermalColor(0.5), 1);
    
    drawStar(
    rnd(WIDTH), rnd(HEIGHT),
    25, thermalColor(0.1), 1);
    
    drawStar(
    rnd(WIDTH), rnd(HEIGHT),
    25, thermalColor(1), 1);
}