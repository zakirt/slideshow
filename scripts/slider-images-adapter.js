window.slideshow = window.slideshow || {};
window.slideshow.sliderImagesAdapter = ((slideshow) => {
    'use strict';

    const sliderImagesAdapter = {
        sliderFactory
    };

    return sliderImagesAdapter;

    function sliderFactory(sliderOptions) {
        const slides = convertSlidesToAcceptedFormat(sliderOptions.slides);
        sliderOptions.slides = slides;
        return slideshow.sliderFactory(sliderOptions);
    }

    function convertSlidesToAcceptedFormat(slides) {
        const convertedSlides = [];    
        for (let i = 0,  numFetchedSlides = slides.length; i < numFetchedSlides; ++i) {                        
            for (let j = 0, numSlideProperties = slides[i].captions.length; j < numSlideProperties; ++j) {
                let slide = {};
                const temp = slides[i]; 
                slide.title = temp.title;
                slide.caption =  temp.captions[j];
                slide.description = temp.descriptions[j];
                const div = document.createElement('div');
                div.className = 'slider-slide';
                const slideImage = new Image();
                slideImage.src = temp.pictures[j];
                div.appendChild(slideImage);
                slide.element = div;
                convertedSlides.push(slideshow.slideFactory(slide));
            }            
        }
        return convertedSlides;
    }
})(window.slideshow);