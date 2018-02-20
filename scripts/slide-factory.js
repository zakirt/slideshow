window.slideshow = window.slideshow || {};
window.slideshow.slideFactory = (() => {
    const slide = {
        isActive: false,
        title: '',
        description: ''
    };

    return slideFactory;

    function slideFactory(options) {
        let newSlide = Object.create(slide, {       
            width: {
                get: function () {
                    if (!this.element) {
                        return 0;
                    }
                    return this.element.clientWidth;
                }
            }
        });
        Object.assign(newSlide, options);
        return newSlide;
    }    
})();