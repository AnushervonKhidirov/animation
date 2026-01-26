class BannerAnimation {
  constructor(parentElem, options) {
    // options
    this.nextFrameDelay = options.nextFrameDelay;
    this.showCtaFirst = options.showCtaFirst;
    this.loopRotate = options.loopRotate;
    this.developerMode = options.developerMode;

    this.ableToSwitchInDevMode = false;

    // params from css
    this.animationDuration = 0;
    this.animationDelay = 0;

    // properties
    this.currFrameIndex = 0;
    this.prevFrameIndex = 0;

    this.prevLogoTitle = '';
    this.currLogoTitle = '';

    this.prevCtaTitle = '';
    this.currCtaTitle = '';

    // elements
    this.parentElem = parentElem;

    this.framesWrapper = null;
    this.frames = null;

    this.logoWrapper = null;
    this.logos = null;

    this.ctaButtonsWrapper = null;
    this.ctaButtons = null;

    // events name
    this.initEventName = 'init';
    this.frameSwitchingEventName = 'frameSwitching';
    this.frameSwitchedEventName = 'frameSwitched';
    this.frameInnerAnimEndEventName = 'frameInnerAnimEnd';
    this.stepAnimEndEventName = 'stepAnimEnd';
    this.ctaAnimEndEventName = 'ctaAnimEnd';

    // events
    this.initEvent = new CustomEvent(this.initEventName);
    this.frameSwitchingEvent = new CustomEvent(this.frameSwitchingEventName);
    this.frameSwitchedEvent = new CustomEvent(this.frameSwitchedEventName);
    this.frameInnerAnimEndEvent = new CustomEvent(this.frameInnerAnimEndEventName);
    this.stepEndEvent = new CustomEvent(this.stepAnimEndEventName);
    this.ctaAnimEndEvent = new CustomEvent(this.ctaAnimEndEventName);

    // data attributes
    this.dataFrameIndex = 'data-frame-index';
    this.dataStep = 'data-step';
    this.dataLogo = 'data-logo';
    this.dataCta = 'data-cta';
    this.dataTitle = 'data-title';

    // css classes
    this.startStepAnimationClassName = 'start-step-animation';
    this.showClassName = 'show';
    this.hideClassName = 'hide';

    // css variables
    this.animationDurationCssVariable = '--animation-duration';
    this.animationDelayCssVariable = '--animation-delay';
  }

  // common methods
  init() {
    this.getNodeElements();
    this.getCssVariables();
    this.eventsHandler();

    this.parentElem.dispatchEvent(this.initEvent);

    this.showFrame(this.currFrameIndex);

    if (this.developerMode && this.frames.length > 1) this.addDeveloperMode();
  }

  getNodeElements() {
    this.getFrames();
    this.getLogos();
    this.getCtaButtons();
  }

  getCssVariables() {
    const animationDuration = getCssProperty(this.parentElem, this.animationDurationCssVariable);
    const animationDelay = getCssProperty(this.parentElem, this.animationDelayCssVariable);

    this.animationDuration = Number.parseFloat(animationDuration) * 1000;
    this.animationDelay = Number.parseFloat(animationDelay) * 1000;
  }

  eventsHandler() {
    this.parentElem.addEventListener(this.initEventName, () => {
      if (this.developerMode) {
        console.log(`Animation banner initialized | event name: ${this.initEventName}`);
      }

      this.ableToSwitchInDevMode = false;
      this.logoHandler(this.currFrameIndex);
      this.ctaHandler(this.currFrameIndex);

      const shouldUpdateLogo = this.shouldUpdateLogo();

      if (shouldUpdateLogo) {
        this.hideLogo(this.prevLogoTitle);
        this.showLogo(this.currLogoTitle);
      }
    });

    this.parentElem.addEventListener(this.frameSwitchingEventName, () => {
      if (this.developerMode) {
        console.log(`Start frame switching (from ${this.prevFrameIndex} to ${this.currFrameIndex}) | event name: ${this.frameSwitchingEventName}`);
      }

      this.ableToSwitchInDevMode = false;
      this.logoHandler(this.currFrameIndex);
      this.ctaHandler(this.currFrameIndex);

      const shouldUpdateLogo = this.shouldUpdateLogo();
      const shouldUpdateCta = this.shouldUpdateCta();

      if (shouldUpdateLogo) {
        this.hideLogo(this.prevLogoTitle);
        this.showLogo(this.currLogoTitle);
      }

      if (shouldUpdateCta) this.hideCta(this.prevCtaTitle);
    });

    this.parentElem.addEventListener(this.frameSwitchedEventName, () => {
      if (this.developerMode) {
        console.log(`Frame switched (from ${this.prevFrameIndex} to ${this.currFrameIndex}) | event name: ${this.frameSwitchedEventName}`);
      }

      const shouldUpdateCta = this.shouldUpdateCta();

      this.resetStepClassnames(this.prevFrameIndex);

      if (this.showCtaFirst && shouldUpdateCta) {
        this.showCta(this.currCtaTitle, true);
      } else {
        this.startStepAnimation(this.currFrameIndex, true);
      }
    });

    this.parentElem.addEventListener(this.frameInnerAnimEndEventName, () => {
      if (this.developerMode) {
        console.log(`All inner elements animation ended (steps & cta) | event name: ${this.frameInnerAnimEndEventName}`);
      }

      this.ableToSwitchInDevMode = true;
      const shouldSwitchFrame = this.shouldSwitchFrame();

      if (shouldSwitchFrame) {
        setTimeout(this.nextFrame.bind(this), this.nextFrameDelay);
      }
    });

    this.parentElem.addEventListener(this.stepAnimEndEventName, () => {
      if (this.developerMode) {
        console.log(`All steps animation ended | event name: ${this.stepAnimEndEventName}`);
      }

      const shouldUpdateCta = this.shouldUpdateCta();

      if (this.showCtaFirst || !shouldUpdateCta) {
        this.parentElem.dispatchEvent(this.frameInnerAnimEndEvent);
      } else {
        this.showCta(this.currCtaTitle, true);
      }
    });

    this.parentElem.addEventListener(this.ctaAnimEndEventName, () => {
      if (this.developerMode) {
        console.log(`CTA animation ended | event name: ${this.ctaAnimEndEventName}`);
      }

      if (this.showCtaFirst) {
        this.startStepAnimation(this.currFrameIndex, true);
      } else {
        this.parentElem.dispatchEvent(this.frameInnerAnimEndEvent);
      }
    });
  }

  // frame methods
  getFrames() {
    this.framesWrapper = this.parentElem.querySelector('#frames');
    this.frames = this.framesWrapper.querySelectorAll('.frame');

    this.frames.forEach((frame, index) => {
      frame.setAttribute(this.dataFrameIndex, index);
    });
  }

  nextFrame() {
    const currFrameIndex = this.getFrameIndex(this.currFrameIndex + 1);
    this.frameIndexesHandler(currFrameIndex);
    this.switchFrame();
  }

  prevFrame() {
    const currFrameIndex = this.getFrameIndex(this.currFrameIndex - 1);
    this.frameIndexesHandler(currFrameIndex);
    this.switchFrame();
  }

  switchFrame() {
    this.parentElem.dispatchEvent(this.frameSwitchingEvent);

    this.showFrame(this.currFrameIndex);
    this.hideFrame(this.prevFrameIndex);
  }

  showFrame(index) {
    const controller = new AbortController();
    const signal = controller.signal;

    const frame = this.frames[index];
    const { ctaTitle, logoTitle } = this.getFrameData(frame);

    this.parentElem.setAttribute(this.dataFrameIndex, index);
    this.parentElem.setAttribute(this.dataLogo, logoTitle);
    this.parentElem.setAttribute(this.dataCta, ctaTitle);

    frame.classList.add(this.showClassName);

    frame.addEventListener(
      'animationend',
      () => {
        this.parentElem.dispatchEvent(this.frameSwitchedEvent);
        controller.abort();
      },
      { signal },
    );
  }

  hideFrame(index) {
    const controller = new AbortController();
    const signal = controller.signal;

    const frame = this.frames[index];
    frame.classList.add(this.hideClassName);

    frame.addEventListener(
      'animationend',
      () => {
        frame.classList.remove(this.showClassName, this.hideClassName);
        controller.abort();
      },
      { signal },
    );
  }

  shouldSwitchFrame() {
    if (this.frames.length === 1) return false;
    const isLastFrame = this.currFrameIndex >= this.frames.length - 1;
    return !(this.developerMode || (isLastFrame && !this.loopRotate));
  }

  frameIndexesHandler(currIndex) {
    this.prevFrameIndex = this.currFrameIndex;
    this.currFrameIndex = currIndex;
  }

  getFrameIndex(index) {
    const lastFrameIndex = this.frames.length - 1;

    if (index > lastFrameIndex) return 0;
    if (index < 0) return lastFrameIndex;
    return index;
  }

  getFrameData(frame) {
    const logoTitle = frame.getAttribute(this.dataLogo);
    const ctaTitle = frame.getAttribute(this.dataCta);

    return {
      logoTitle: logoTitle,
      ctaTitle: ctaTitle,
    };
  }

  // steps methods
  startStepAnimation(frameIndex, startWithDelay = false) {
    const controller = new AbortController();
    const signal = controller.signal;
    const delay = startWithDelay ? this.animationDelay : 0;

    const frame = this.frames[frameIndex];
    const stepElements = frame.querySelectorAll(`[${this.dataStep}]:not([${[this.dataStep]}="0"])`);

    if (stepElements.length === 0) return this.finishStepAnimation();

    const stepNumbersArray = this.getStepNumbers(stepElements);

    setTimeout(nextStep.bind(this), delay);

    function nextStep(stepIndex = 0) {
      const isLastStep = stepIndex >= stepNumbersArray.length - 1;
      const stepNum = stepNumbersArray[stepIndex];

      const stepElements = frame.querySelectorAll(`[${this.dataStep}="${stepNum}"]`);

      stepElements.forEach(stepElem => {
        stepElem.classList.add(this.showClassName);

        stepElem.addEventListener(
          'animationend',
          () => {
            if (isLastStep) return this.finishStepAnimation(controller);
            setTimeout(nextStep.bind(this, stepIndex + 1), this.animationDelay);
          },
          { signal },
        );
      });
    }
  }

  getStepNumbers(stepElements) {
    const stepNumbers = [];

    stepElements.forEach(stepElem => {
      const stepNum = stepElem.getAttribute(this.dataStep);
      if (stepNum > 0) stepNumbers[stepNum - 1] = Number.parseInt(stepNum);
    });

    return stepNumbers.filter(stepNum => typeof stepNum === 'number');
  }

  finishStepAnimation(controller) {
    this.parentElem.dispatchEvent(this.stepEndEvent);
    if (controller) controller.abort();
  }

  resetStepClassnames(frameIndex) {
    const frame = this.frames[frameIndex];
    const stepElements = frame.querySelectorAll(`[${this.dataStep}]`);

    stepElements.forEach(step => {
      step.classList.remove(this.showClassName);
    });
  }

  // logo methods
  getLogos() {
    this.logoWrapper = this.parentElem.querySelector('#logos');
    this.logos = this.logoWrapper.querySelectorAll('.logo');
  }

  logoHandler(frameIndex) {
    const frame = this.frames[frameIndex];
    const { logoTitle } = this.getFrameData(frame);

    this.prevLogoTitle = this.currLogoTitle;
    this.currLogoTitle = logoTitle;
  }

  shouldUpdateLogo() {
    return this.currLogoTitle !== this.prevLogoTitle;
  }

  showLogo(logoTitle) {
    if (!logoTitle) return;

    const logo = document.querySelector(`.logo[${this.dataTitle}="${logoTitle}"]`);
    logo.classList.add(this.showClassName);
  }

  hideLogo(logoTitle) {
    if (!logoTitle) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const logo = document.querySelector(`.logo[${this.dataTitle}="${logoTitle}"]`);
    logo.classList.add(this.hideClassName);

    logo.addEventListener(
      'animationend',
      () => {
        logo.classList.remove(this.hideClassName, this.showClassName);
        controller.abort();
      },
      { signal },
    );
  }

  // cta methods
  getCtaButtons() {
    this.ctaButtonsWrapper = this.parentElem.querySelector('#cta-buttons');
    this.ctaButtons = this.ctaButtonsWrapper.querySelectorAll('.cta');
  }

  ctaHandler(frameIndex) {
    const frame = this.frames[frameIndex];
    const { ctaTitle } = this.getFrameData(frame);

    this.prevCtaTitle = this.currCtaTitle;
    this.currCtaTitle = ctaTitle;
  }

  shouldUpdateCta() {
    return this.currCtaTitle !== this.prevCtaTitle;
  }

  showCta(ctaTitle, startWithDelay = false) {
    if (!ctaTitle) return this.parentElem.dispatchEvent(this.ctaAnimEndEvent);

    const controller = new AbortController();
    const signal = controller.signal;

    const cta = document.querySelector(`.cta[${this.dataTitle}="${ctaTitle}"]`);
    const delay = startWithDelay ? this.animationDelay : 0;

    setTimeout(() => {
      cta.classList.add(this.showClassName);
    }, delay);

    cta.addEventListener(
      'animationend',
      () => {
        this.parentElem.dispatchEvent(this.ctaAnimEndEvent);
        controller.abort();
      },
      { signal },
    );
  }

  hideCta(ctaTitle) {
    if (!ctaTitle) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const cta = document.querySelector(`.cta[${this.dataTitle}="${ctaTitle}"]`);

    cta.classList.add(this.hideClassName);

    cta.addEventListener(
      'animationend',
      () => {
        cta.classList.remove(this.hideClassName, this.showClassName);
        controller.abort();
      },
      { signal },
    );
  }

  // developer mode methods
  addDeveloperMode() {
    this.createNavigation();
  }

  createNavigation() {
    const navBar = document.createElement('div');
    const prevFrameBtn = document.createElement('div');
    const nextFrameBtn = document.createElement('div');
    const currFrameIndexElem = document.createElement('div');

    navBar.classList.add('frame-navigation');

    prevFrameBtn.classList.add('nav-btn', 'prev-btn');
    prevFrameBtn.innerHTML = '&#8592;';

    nextFrameBtn.classList.add('nav-btn', 'next-btn');
    nextFrameBtn.innerHTML = '&#8594;';

    currFrameIndexElem.classList.add('frame-index');
    currFrameIndexElem.innerHTML = this.currFrameIndex + 1;

    navBar.appendChild(prevFrameBtn);
    navBar.appendChild(currFrameIndexElem);
    navBar.appendChild(nextFrameBtn);

    prevFrameBtn.addEventListener('click', () => {
      if (this.ableToSwitchInDevMode) {
        this.prevFrame();
        currFrameIndexElem.innerHTML = this.currFrameIndex + 1;
      }
    });

    nextFrameBtn.addEventListener('click', () => {
      if (this.ableToSwitchInDevMode) {
        this.nextFrame();
        currFrameIndexElem.innerHTML = this.currFrameIndex + 1;
      }
    });

    this.parentElem.appendChild(navBar);
  }
}

class CreepingLine {
  constructor(parentElem, options) {
    // options
    this.parentElem = parentElem;
    this.text = options.text;
    this.speed = options.speed;

    // elements
    this.wrapper = null;
    this.topLine = null;
    this.bottomLine = null;

    // properties
    this.axis = null;
    this.position = 0;
  }

  init() {
    this.addCreepingLine();
    this.startAnimation();
  }

  addCreepingLine() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('creeping-line-wrapper');

    this.parentElem.appendChild(this.wrapper);

    this.axis = getCssProperty(this.wrapper, '--axis');

    this.wrapper.classList.add(this.axis);

    const creepingLine = document.createElement('div');
    creepingLine.classList.add('creeping-line');

    this.topLine = creepingLine.cloneNode(true);
    this.topLine.classList.add('creeping-line-top');

    this.bottomLine = creepingLine.cloneNode(true);
    this.bottomLine.classList.add('creeping-line-bottom');

    const text = document.createElement('span');
    text.innerHTML = this.text;

    this.wrapper.appendChild(this.topLine);
    this.wrapper.appendChild(this.bottomLine);

    const size = this.axis === 'vertical' ? 'offsetHeight' : 'offsetWidth';

    let shouldAddText = true;

    while (shouldAddText) {
      this.topLine.appendChild(text.cloneNode(true));
      this.bottomLine.appendChild(text.cloneNode(true));

      if (Math.min(this.topLine.offsetWidth, this.bottomLine.offsetWidth) > this.parentElem[size] * 2) {
        shouldAddText = false;
        this.topLine.appendChild(text.cloneNode(true));
        this.bottomLine.appendChild(text.cloneNode(true));
      }
    }
  }

  startAnimation() {
    requestAnimationFrame(moveLine.bind(this, { topLine: this.topLine, bottomLine: this.bottomLine, axis: this.axis }));

    function moveLine({ topLine, bottomLine, axis }) {
      const textWidth = topLine.children[0].offsetWidth;
      const gap = Number.parseFloat(getCssProperty(topLine, 'gap'));
      const maxWidth = textWidth + gap;
      const rotateValue = axis === 'vertical' ? '-90deg' : '0';

      if (this.position >= maxWidth) {
        this.position = 0;
      } else {
        this.position += 1 * this.speed;
      }

      topLine.style.transform = `rotate(${rotateValue}) translateX(${this.position * -1}px)`;
      bottomLine.style.transform = `rotate(${rotateValue}) translateX(${this.position}px)`;

      requestAnimationFrame(moveLine.bind(this, { topLine, bottomLine, axis }));
    }
  }
}

const animationOptions = {
  nextFrameDelay: 2000,
  showCtaFirst: false,
  loopRotate: true,
  developerMode: true,
};

const creepingLineOptions = {
  text: 'Hello World!',
  speed: 1,
};

const animationElem = document.querySelector('#animation');

if (animationElem) {
  const bannerAnimation = new BannerAnimation(animationElem, animationOptions);
  const creepingLine = new CreepingLine(animationElem, creepingLineOptions);

  bannerAnimation.init();
  creepingLine.init();
}

function getCssProperty(elem, property) {
  const elemStyles = getComputedStyle(elem);
  return elemStyles.getPropertyValue(property);
}
