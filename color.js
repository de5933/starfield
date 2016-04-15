/**
 * Color object
 * RGB Color with three 8-bit channels
 * Each instance expresses color in three different ways:
 *  - Hexidecimal: A 6-character string
 *  - FlatInteger: A 24-bit integer encoding three bytes
 *  - RGB: r, g, and b are three separate properties, 1 byte each
 *  
 *  valueOf() returns the FlatInteger representation.
 *  toString() returns the hexidecimal representation.
 *  toString('rgb') returns the rgb representation as a string.
 *  
 *  This allows shortcuts like document.body.style.color = new Color('ff7700');
 * 
 * TODO: 
 *  - Add alpha channel
 *  - Integrate HSL and HSV calculations
 *  - Add handy methods like lighter() darker()
 *  - Add a fuzz() function to randomize the color within a range
 */

var Color = (function(){
	var BYTE = 0xff;
	var BYTE3 = 0xffffff;
	
	/*** Constructor ***/
	function Color() {
		// Initialize default values
		this.hex='000000';
		this.int=0;
		this.r=0;
		this.g=0;
		this.b=0;
        this.a=1;
		
        var success = false;
        
		if (arguments.length == 1) {
			var c = arguments[0];
			
			// #hex
			if (vld.hex(c)) {
				// Parse hex
				this.hex = parse.hex(c);
				// Convert to int
				this.int = cnv.hex_int(this.hex);
				// Convert to rgb
				var rgb = cnv.int_rgb(this.int);
				this.r = rgb.r;
				this.g = rgb.g;
				this.b = rgb.b;
                
                success = true;
			}
			
			// Flat integer
			else if (vld.int(c)) {
				// Parse int
				this.int = parse.int(c);
				// Convert to hex
				this.hex = cnv.int_hex(this.int);
				// Convert to rgb
				var rgb = cnv.int_rgb(this.int);
				this.r = rgb.r;
				this.g = rgb.g;
				this.b = rgb.b;
                
                success = true;
			}
			
			else if (typeof(c) == 'object') {
				if ( 
					(vld.byte(c.r)) && 
					(vld.byte(c.g)) && 
					(vld.byte(c.b)) 
					) {
					var r = c.r;
					var g = c.g;
					var b = c.b;
                    
					return Color.call(this, r,g,b);
				}
			}
            
            
		}
		else if (arguments.length == 3 || arguments.length == 4) {
			var r = arguments[0];
			var g = arguments[1];
			var b = arguments[2];
			var a = arguments[3];
            
			// RGB
			if (vld.rgb(r,g,b)) {
				// Parse rgb
				var rgba = parse.rgba(r,g,b,a);
				this.r = rgba.r;
				this.g = rgba.g;
				this.b = rgba.b;
                this.a = rgba.a;
				// Convert to int
				this.int = cnv.rgb_int(r,g,b);
				// Convert to hex
				this.hex = cnv.int_hex(this.int);
                
                success = true;
			}
			
		}
        
        if (!success) 
            err('Constructor arguments not recognized: ' + JSON.stringify(arguments));
		
		// Attach member functions
		this.toString = function() 	{return util.tostr(this);}
		this.valueOf = function() 	{return util.val(this);}
        this.inv = function(c)      {return util.not(this);}
		this.add = function(c) 		{return util.add(this, c);}
		this.avg = function(c) 		{return util.avg(this, c);}
		this.sub = function(c) 		{return util.sub(this, c);}
		this.not = function() 		{return util.not(this);}
		this.and = function(c) 		{return util.and(this, c);}
		this.or = function(c) 		{return util.or(this, c);}
		this.xor = function(c) 		{return util.xor(this, c);}
        this.rgb = function()       {return [this.r, this.g, this.b];}
        this.rgba = function()       {return [this.r, this.g, this.b, this.r];}
	}
	
	/*** Utilities ***/
	var util = {
		tostr: function toString(c, fmt) {
			if ( c.a<1 || (fmt && fmt == 'rgba') ) {
				return 'rgba('+c.r+','+c.g+','+c.b+','+c.a+')';
			}
			else {
				return '#' + c.hex;
			}
		},
		
		val: function valueOf(c) {
			return c.int;
		},
        
		add: function add(x,y) {
			return new Color(x.int + y.int);
		},
		
		avg: function average(x,y) {
			var rgb = parse.rgb(
				(x.r + y.r)/2,
				(x.g + y.g)/2,
				(x.b + y.b)/2
			);
			return new Color(rgb);
		},
		
		sub: function subtract(x,y) {
			return new Color(x.int - y.int);
		},
		
		not: function bitnot(x){
			return new Color((BYTE3-x.int));
		},
		
		and: function bitand(x,y){
			return new Color(x.int & y.int);
		},
		
		or: function bitor(x,y){
			return new Color(x.int | y.int);
		},
		
		xor: function bitxor(x,y){
			return new Color(x.int ^ y.int);
		},
        
		random: function random() {
			return new Color(Math.floor(Math.random()*BYTE3));
		}
	};
		
	/*** Validation ***/
	var vld = {
			
		hex: function isvalidHex(str) {
			return (typeof(str)=='string') && /^\s*#?[a-fA-F0-9]{1,6}\s*;?$/.test(str);
		},
		
		int: function isvalidFlatInt(n) {
			return (typeof(n)=='number') && (0<=n) && (n<=BYTE3);
		},
		
		rgb: function isvalidRGB() {
			var retval = true;
			for (var i in arguments) {
				retval &= vld.byte(arguments[i]);
			}
			return retval;
		},
		
		byte: function isvalidByte(n) {
			return (typeof(n)=='number') && (0<=n) && (n<=BYTE);
		},
		
		color: function isvalidColor(c) {
			return (
				vld.hex(c.hex) &&
				vld.int(c.int) &&
				vld.byte(c.r) &&
				vld.byte(c.g) &&
				vld.byte(c.b)
			);
		}
	};
	
	/*** Parsing ***/
	var parse = {
		hex: function parseHex(x) {
            // Remove whitspace and hash sign
            x = x.replace(/[\s#;]*/g,'');
            // Handle 3-digit shorthand
            if (x.length==3) {
                var r = x.charAt(0);
                var g = x.charAt(1);
                var b = x.charAt(2);
                x = r+r + g+g + b+b;
            }
            // Left pad with zeros
            while (x.length < 6) {
                x = '0'+x;
            }
            return x;
		},
		
		int: function parseFlatInt(n) {
            var i = parseInt(n);
            if (isNull(i)) return 0;
            return clamp(n, 0, BYTE3);
		},
		
		rgb: function parseRGB(r,g,b) {
			return { 
                r: parse.byte(r), 
                g: parse.byte(g), 
                b: parse.byte(b)
			};
		},
        
        rgba: function parseRGBA(r, g, b, a) {
            return { 
                r: parse.byte(r), 
                g: parse.byte(g), 
                b: parse.byte(b),
                a: parse.unit(a)
			};
        },
        
        unit: function parseUnit(n) {
            var i = parseFloat(n);
            if (isNull(i)) return 1;
            return clamp(i, 0, 1);
        },
		
		byte: function parseByte(n) {
			var i = parseInt(n);
			if (isNull(i)) return 0;
			return clamp(i, 0, BYTE);
		}
	}
	
	/*** Conversion ***/
	var cnv = {
		hex_int: function hexToInt(x){
			var hex = parse.hex(x);
			return parseInt(hex, 16);
		},
		
		hex_rgb: function hexToRgb(x){
			var int = cnv.hex_int(x);
			return cnv.int_rgb(int);
		},
		
		int_hex: function intToHex(n){
			var int = parse.int(n);
			return parse.hex(int.toString(16));
		},
		
		int_rgb: function intToRgb(n){
			var int = parse.int(n);
			return {
				r: (int & 0xff0000) >> 16,
				g: (int & 0x00ff00) >> 8,
				b:  int & 0x0000ff
			}
		},
		
		rgb_hex: function rgbToHex(r,g,b){
			var int = cnv.rgb_int(r,g,b);
			return cnv.int_hex(int);
		},
		
		rgb_int: function rgbToInt(r,g,b){
			return (parse.byte(r) << 16) + 
					(parse.byte(g) << 8) + 
					parse.byte(b);
		}
	};

    function clamp(val, min, max) {
        if (val > max) val = max;
        if (val < min) val = min;
        return val;
    }
    
    function isNull(v) {
        return (v==undefined) || isNaN(v) || !isFinite(v);
    }
    
    /*** Error Handling ***/
    function err(message) {
        console.error(message);
    }
    
	/*** Static Properties ***/
	Color.util = util;
	
    Color.inv = util.not;
	Color.add = util.add;
	Color.avg = util.avg;
	Color.sub = util.sub;
	Color.and = util.and;
	Color.or = util.or;
	Color.xor = util.xor;
	Color.random = util.random;
    
    Color.rgb = function(r,g,b) {
        return new Color(
            parse.byte(r),
            parse.byte(g),
            parse.byte(b)
        );
    };
    Color.rgba = function(r,g,b,a) {
        return new Color(
            parse.byte(r),
            parse.byte(g),
            parse.byte(b),
            parse.byte(a)
        );
    };
	
	Color.WHITE = 	new Color(0xffffff);
	Color.RED = 	new Color(0xff0000);
	Color.GREEN = 	new Color(0x00ff00);
	Color.BLUE = 	new Color(0x0000ff);
	Color.YELLOW = 	new Color(0xffff00);
	Color.CYAN = 	new Color(0x00ffff);
	Color.MAGENTA = new Color(0xff00ff);
	Color.BLACK = 	new Color(0x0);
    Color.TRANSPARENT = new Color(0,0,0,0);
	
	/** Return constructor **/
	return Color;
})();

// #19CB97
// 162.4, 0.779, 0.447
// 162.4 198.645, 113.985
function getHSL(color) {
    var H = 0;
    var S = 0;
    var L = 0;
    
    var r = color.r;
    var g = color.g;
    var b = color.b;
    
    var min = 255;
    var max = 0;
    var arr = [r,g,b];
    
    for (var i in arr) {
        if (arr[i] > max) max = arr[i];
        if (arr[i] < min) min = arr[i];
    }
    
    var chroma = parseFloat(max-min);
    
    var H = 0;
    
    if ( r>g && r>b ) {
        H = ((g-b)/chroma) % 6;
    }
    else if (g>r && g>b) {
        H = ((b-r)/chroma) + 2;
    }
    else if (b>r && b>g) {
        H = ((r-g)/chroma) + 4;
    }
    
    H = 60*H;
    L = (max + min) / 2;
    
    if (L <= 127.5) {
        S = 255*chroma/(2*L);
    }
    else {
        S = 255*chroma/(2 - 2*L);
    }
    
    return {
        h: H,
        s: S,
        l: L
    };
}


