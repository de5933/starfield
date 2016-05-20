function parallaxInit(settings){
    var lst = document.querySelectorAll('[data-parallax]');
    
    var onupdate = settings.onupdate || function(){};
    
    var win = {
        x0: settings.x0||0,
        y0: settings.y0||0
    };
    
    var fx = {
        scale: function(p){ return (5/2+p)*0.3; },
        blur: function(p){ return p*p*5; },
        hue: function(p){ return p*60; }
    };
    
    /* Update on Scroll */
    function update() {
        for (var i = 0; i < lst.length; i++) {
            var element = lst[i];
            var parallax = parseFloat(element.attributes['data-parallax']);
            var dx = (window.scrollX - win.x0) * parallax;
            var dy = (window.scrollY - win.y0) * parallax;
            element.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
            onupdate(element, parallax, i);
        }
    }

    update();

    window.onscroll = update;
};
