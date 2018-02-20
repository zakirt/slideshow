window.slideshow = window.slideshow || {};
window.slideshow.sliderFactory = (() => {
    'use strict';

    const sliderFactory = (() => {
        const sliderComponent = {
            sliderElement: null,
            slides: [],
            activeSlideIndex: 0,
            transitionDuration: '0.5s'
        };

        let slider;
        let slideContainerElement;
        let prevSlideControlElement;
        let nextSlideControlElement;
        let slideContainerWidth = 0;
        let isAnimationInProgress = false;

        return sliderFactory;

        function sliderFactory(options) {
            slider = Object.assign(Object.create(sliderComponent), options);
            initSliderDomElements(slider);
            trySlideIndexOutOfBounds(slider.activeSlideIndex);
            moveLeftByNumberOfSlides(1); // skip clone of the last item       
            return slider;
        }

        function initSliderDomElements(slider) {
            checkSliderElementForErrors(slider);
            slideContainerElement = createSlideContainerElement(slider.sliderElement);
            createSlides();
            setSlideContainerElementWidth(slider.slides);
            bindClickEventToControlElements(slider.sliderElement);
        }

        function createSlides() {
            if (slider.slides.length) {              
                addSlidesToDom();   // must put slides into DOM, else their clientWidth will be 0
                retrieveExistingSlidesFromDom();
            } else {
                createSlidesFromDomElements();
            }       
        }

        function retrieveExistingSlidesFromDom() {
            const slides = [];
            const slideElements = slideContainerElement.querySelectorAll('.slider-slide');
            for (let i = 0, len = slider.slides.length; i < len; ++i) {
                const slide = slider.slides[i];
                slide.element = slideElements[i];
                slides.push(slide);
            }
            checkForMinimumNumberOfSlides(slides);
            cloneFirstAndLastSlidesToContainerElement(slides);
            stretchSlidesFitInsideOuterContainer(slides);
            slider.slides = slides;  
        }

        function addSlidesToDom() {
            const docFragment = document.createDocumentFragment();
            for (let i = 0, len = slider.slides.length; i < len; ++i) {
                // const slideDiv = document.createElement('div');
                // slideDiv.className = 'slider-slide';
                // slideDiv.appendChild(slider.slides[i].element);
                docFragment.appendChild(slider.slides[i].element);
            }
            slideContainerElement.appendChild(docFragment);
        }

        function bindClickEventToControlElements(sliderElement) {
            prevSlideControlElement = sliderElement.querySelector( '.slider-control-prev');
            nextSlideControlElement = sliderElement.querySelector('.slider-control-next');
            checkForMissingControlElements(
                prevSlideControlElement,
                nextSlideControlElement
            );
            prevSlideControlElement.addEventListener('click', onClickPrevControl);
            nextSlideControlElement.addEventListener('click', onClickNextControl);
        }

        function checkForMissingControlElements(prevCtrlElement, nextCtrlElement) {
            if (!prevCtrlElement || !nextCtrlElement) {
                throw new Error(
                    'Slider: failed to retrieve control element(s) from DOM.'
                );
            }
        }

        function checkSliderElementForErrors() {
            if (!(slider.sliderElement instanceof HTMLElement)) {
                throw new TypeError(
                    'Slider: sliderElement must be valid HTML element.'
                );
            }
        }

        function trySlideIndexOutOfBounds(slideIndex) {
            try {
                checkSlideIndexForOutOfBounds(slideIndex);
            } catch (e) {
                slider.activeSlideIndex = 0;
                console.error(e.message);
            }
        }

        function checkSlideIndexForOutOfBounds(slideIndex) {
            if (slideIndexOutOfBounds(slider.activeSlideIndex)) {
                throw new RangeError(
                    'Slider: slide index is out of bounds. Setting to 0.'
                );
            }
        }

        function slideIndexOutOfBounds(slideIndex) {
            return slideIndex < 0 || slideIndex > slider.slides.length - 1;
        }

        function createSlideContainerElement(sliderElement) {
            const containerElement = slider.sliderElement.querySelector(
                '.slider-inner-wrap'
            );
            bindTransitionEndEventToContainerElement(containerElement);
            setTransitionCssForContainerElement(containerElement);
            return containerElement;
        }

        function bindTransitionEndEventToContainerElement(slideContainerElement) {
            slideContainerElement.addEventListener(
                'transitionend',
                onSlideTransitionEnd
            );
        }

        function setTransitionCssForContainerElement(containerElement) {
            containerElement.style.transitionProperty = 'transform';
            containerElement.style.transitionDuration = slider.transitionDuration;
        }

        function createSlidesFromDomElements() {
            const slides = retrieveSlidesFromDom(slider.sliderElement);
            checkForMinimumNumberOfSlides(slides);
            cloneFirstAndLastSlidesToContainerElement(slides);
            stretchSlidesFitInsideOuterContainer(slides);
            slider.slides = slides;            
        }

        function stretchSlidesFitInsideOuterContainer(slides) {
            let len = slides.length;           
            while (len--) {
                slides[len].element.style.width = `${slider.sliderElement.clientWidth}px`;
            }
        }

        function retrieveSlidesFromDom(sliderElement) {
            const slideElements = sliderElement.querySelectorAll('.slider-slide');
            const slides = [];
            for (let i = 0, len = slideElements.length; i < len; ++i) {
                const newSlide = createSlideFromDomElement(slideElements[i]);
                slides.push(newSlide);
            }
            return slides;
        }

        function setSlideContainerElementWidth(slides) {
            slideContainerWidth = slides.reduce(
                (accumulatedWidth, currentSlide, index, slides) => {
                    return accumulatedWidth + currentSlide.width;
                },
                0
            );
            slideContainerElement.style.width = `${slideContainerWidth}px`;
        }

        function checkForMinimumNumberOfSlides(slides) {
            if (slides.length < 2) {
                throw new Error(
                    'Slider: needs at least 2 slides to build a slideshow.'
                );
            }
        }

        function cloneFirstAndLastSlidesToContainerElement(slides) {
            const firstSlideElement = slides[0].element.cloneNode(true);
            const lastSlideIndex = slides.length - 1;
            const lastSlideElement = slides[lastSlideIndex].element.cloneNode(true);
            const firstSlide = createSlideFromDomElement(firstSlideElement);
            const lastSlide = createSlideFromDomElement(lastSlideElement);
            slideContainerElement.insertBefore(lastSlideElement, slides[0].element);
            slideContainerElement.appendChild(firstSlideElement);
            slides.unshift(lastSlide);
            slides.push(firstSlide);
        }

        function createSlideFromDomElement(slideElement) {
            return slideshow.slideFactory({
                element: slideElement
            });
        }

        function onClickNextControl() {
            if (!isAnimationInProgress) {                
                animateAndMoveLeftOneSlide();                
                isAnimationInProgress = true;
            }
        }

        function onClickPrevControl() {
            if (!isAnimationInProgress) {               
                animateAndMoveRightOneSlide();                
                isAnimationInProgress = true;
            }
        }

        function animateAndMoveLeftOneSlide() {
            setCssTransitionDuration(slider.transitionDuration);
            moveLeftByNumberOfSlides(1, onSlideTransitionEnd);
        }

        function animateAndMoveRightOneSlide() {
            setCssTransitionDuration(slider.transitionDuration);
            moveRightByNumberOfSlides(1);
        }

        function onSlideTransitionEnd() {
            setCssTransitionDuration('0s'); // temporarily disable slide animation
            if (leftBoundaryReached()) {
                moveLeftByNumberOfSlides(1);
            } else if (rightBoundaryReached()) {
                moveRightByNumberOfSlides(1);
            }
            isAnimationInProgress = false;
        }       

        function setCssTransitionDuration(duration) {
            slideContainerElement.style.transitionDuration = duration;
        }

        function moveRightByNumberOfSlides(numSlides) {
            resetActiveIndexIfRightBoundaryReached();
            const offset = calculateRightOffset(numSlides);          
            cssTranslate(offset);
            isAnimationInProgress = false;
            slider.activeSlideIndex--;
        }

        function calculateRightOffset(numSlides) {
            const offset =
                (slider.activeSlideIndex - numSlides) * -slider.slides[0].width;
            return offset;
        }

        function moveLeftByNumberOfSlides(numSlides) {
            resetActiveIndexIfLeftBoundaryReached();
            const offset = calculateLeftOffset(numSlides);
            cssTranslate(offset);
            isAnimationInProgress = false;
            slider.activeSlideIndex++;          
        }

        function resetActiveIndexIfLeftBoundaryReached() {
            if (leftBoundaryReached()) {
                slider.activeSlideIndex = 0;
            }
        }

        function leftBoundaryReached() {
            return slider.activeSlideIndex >= slider.slides.length - 1;
        }

        function resetActiveIndexIfRightBoundaryReached() {
            if (rightBoundaryReached()) {
                slider.activeSlideIndex = slider.slides.length - 1;
            }
        }

        function rightBoundaryReached() {
            return slider.activeSlideIndex < 1;
        }

        function calculateLeftOffset(numSlides) {
            const offset =
                (slider.activeSlideIndex + numSlides) * -slider.slides[0].width;
            return offset;
        }

        function cssTranslate(offset) {
            slideContainerElement.style.transform = `translateX(${offset}px)`;
        }
    })();

    return sliderFactory;
})();