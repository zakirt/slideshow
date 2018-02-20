window.slider = (() => {
    "use strict";
  
    const slideFactory = (() => {
      const slide = {
        isActive: false
      };
  
      function createSlide({ element }) {
        const newSlide = Object.create(slide, {
          element: {
            value: element
          },
          width: {
            get: function() {
              if (!this.element) {
                return 0;
              }
              return this.element.clientWidth;
            }
          }
        });
        return newSlide;
      }
  
      return {
        createSlide
      };
    })();
  
    const slideCollection = {
      slides: []
    };
  
    const sliderFactory = (() => {
      const sliderComponent = {
        sliderElement: null,
        slides: [],
        activeSlideIndex: 0
      };
  
      let slider;
      let slideContainerElement;
      let prevSlideControlElement;
      let nextSlideControlElement;
      let slideContainerWidth = 0;
      let aciveSlideIndex = 0;
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
        slider.slides = createSlidesFromDomElements(slider.sliderElement);
        setSlideContainerElementWidth(slider.slides);
        bindClickEventToControlElements(slider.sliderElement);
      }
  
      function bindClickEventToControlElements(sliderElement) {
        prevSlideControlElement = sliderElement.querySelector(
          ".slider-control-prev"
        );
        nextSlideControlElement = sliderElement.querySelector(
          ".slider-control-next"
        );
        checkForMissingControlElements(
          prevSlideControlElement,
          nextSlideControlElement
        );
        prevSlideControlElement.addEventListener("click", onClickPrevControl);
        nextSlideControlElement.addEventListener("click", onClickNextControl);
      }
  
      function checkForMissingControlElements(prevCtrlElement, nextCtrlElement) {
        if (!prevCtrlElement || !nextCtrlElement) {
          throw new Error(
            "Slider: failed to retrieve control element(s) from DOM."
          );
        }
      }
  
      function checkSliderElementForErrors() {
        if (!(slider.sliderElement instanceof HTMLElement)) {
          throw new TypeError(
            "Slider: sliderElement must be valid HTML element."
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
            "Slider: slide index is out of bounds. Setting to 0."
          );
        }
      }
  
      function slideIndexOutOfBounds(slideIndex) {
        return slideIndex < 0 || slideIndex > slider.slides.length - 1;
      }
  
      function createSlideContainerElement(sliderElement) {
        const containerElement = slider.sliderElement.querySelector(
          ".slider-inner-wrap"
        );
        bindTransitionEndEventToContainerElement(containerElement);
        setTransitionCssForContainerElement(containerElement);
        return containerElement;
      }
  
      function bindTransitionEndEventToContainerElement(slideContainerElement) {
        slideContainerElement.addEventListener(
          "transitionend",
          onSlideTransitionEnd
        );
      }
  
      function setTransitionCssForContainerElement(containerElement) {
        containerElement.style.transitionProperty = "transform";
        containerElement.style.transitionDuration = "0.5s";
      }
  
      function createSlidesFromDomElements(sliderElement) {
        const slides = retrieveSlidesFromDom(sliderElement);
        checkForMinimumNumberOfSlides(slides);
        cloneFirstAndLastSlidesToContainerElement(slides);
        stretchSlidesFitInsideOuterContainer(slides);      
        return slides;
      }
      
      function stretchSlidesFitInsideOuterContainer(slides) {
        let len = slides.length;
        console.log(slides)
        while (len--) {
          slides[len].element.style.width = `${slider.sliderElement.clientWidth}px`;
        }
      }
  
      function retrieveSlidesFromDom(sliderElement) {
        const slideElements = sliderElement.querySelectorAll(".slider-slide");
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
            "Slider: needs at least 2 slides to build a slideshow."
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
        return slideFactory.createSlide({
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
        setCssTransitionDuration("0.5s");
        moveLeftByNumberOfSlides(1);
      }
      
      function animateAndMoveRightOneSlide() {
        setCssTransitionDuration("0.5s");      
        moveRightByNumberOfSlides(1);
      }
  
      function onSlideTransitionEnd() {
        if (leftBoundaryReached()) {
          disableAnimationAndMoveLeftOneSlide();
        } else if (rightBoundaryReached()) {
          disableAnimationAndMoveRightOneSlide();
        }
        isAnimationInProgress = false;
      }
  
      function disableAnimationAndMoveLeftOneSlide() {
        setCssTransitionDuration("0s");
        moveLeftByNumberOfSlides(1);
      }
  
      function disableAnimationAndMoveRightOneSlide() {
        setCssTransitionDuration("0s");
        moveRightByNumberOfSlides(1);
      }
  
      function setCssTransitionDuration(duration) {
        slideContainerElement.style.transitionDuration = duration;
      }
  
      function moveRightByNumberOfSlides(numSlides) {
        resetActiveIndexIfRightBoundaryReached();
        const offset = calculateRightOffset(numSlides);
        console.log('n ', slider.activeSlideIndex);   
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
  
    return {
      sliderFactory
    };
  })();
  // const s2 = slider.sliderFactory({
  //   sliderElement: document.querySelector("#slider1")
  // });
  