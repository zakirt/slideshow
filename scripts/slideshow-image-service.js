window.slideshow = window.slideshow || {};
window.slideshow.slideshowImageService = (() => {
    'use strict';
    
    const IMAGES__AND_CAPTIONS_URL = 'https://next.json-generator.com/api/json/get/4JMDhRCLN';
    const TITLES_AND_DESCRIPTIONS_URL = 'https://next.json-generator.com/api/json/get/Ek0ZdCCI4';
    let slides = [];
    const slideshowImageService = {
        fetchImages        
    };

    return slideshowImageService;

    async function fetchImages() {
        try {
            const imagesAndCaptions = await fetchImagesAndCaptions();
            const titlesAndDescriptions = await fetchImageTitlesAndDescriptions();
            slides = combineSlideImageData(imagesAndCaptions, titlesAndDescriptions);     
            return slides;      
        } catch(e) {
            console.error(e.message);
        }       
    }

    async function fetchImagesAndCaptions() {
        const result = await fetch(IMAGES__AND_CAPTIONS_URL);
        if (!result.ok) {
            throw new Error('imageService: Failed to retrieve images and captions');
        }
        const imagesData = await result.json();
        return imagesData;
    }

    async function fetchImageTitlesAndDescriptions() {
        const result = await fetch(TITLES_AND_DESCRIPTIONS_URL);
        if (!result.ok) {
            throw new Error('imageService: Failed to retrieve titles and descriptions');
        }
        const imageData = await result.json();
        return imageData;
    }

    function combineSlideImageData(imagesAndCaptions, titlesAndDescriptions) {
        const slides = imagesAndCaptions.map((imageWithCaption, index) => {
            const slide = Object.assign(imageWithCaption, titlesAndDescriptions[index]);
            return slide;
        });
        return slides;
    }
})();