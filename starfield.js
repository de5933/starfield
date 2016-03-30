function init() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var WIDTH = canvas.width;
	var HEIGHT = canvas.height;
    
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
		if (!scale)
			scale = 1;
		var r = scale / 2;
        var c = color || Color.WHITE;
        c = c.avg(Color.WHITE);
        c.a = 0.1;
        
		ctx.fillStyle = c;
        
        // Halo
        ctx.beginPath();
        ctx.arc(x, y, 5*r, 0, 2*Math.PI);
        ctx.fill();

        // Star
        c.a = 1;
        ctx.fillStyle = c;
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

    var COUNT = (WIDTH*HEIGHT) / 100;
    
    var area = [rnd(WIDTH), rnd(HEIGHT)]
    for (var i = 0; i < 0; i++) {
        drawStar(
            area[0]+200*getGaussian()(rnd()),
            area[1]+200*getGaussian()(rnd()),
            rnd(10),
            Color.GREEN
        );
    }
    
	for (var i = 0; i < COUNT; i++) {
        // The distance between the star and the camera
		var scale = 1-Math.pow(rnd(), 1/8);

		// The color and brightness of the star
		var t = Math.pow(rnd(), 2);
        
        var seed = rnd();
        var w = rnd(WIDTH);
        
		drawStar(
			w,
			(0.5+Math.tan(w)/2)*HEIGHT,
			10*scale,
			thermalColor(t),
            t
        );
	}

}