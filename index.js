// NOTE: add this code to script tag in index.html
window.addEventListener('load', () => {
    // === params === //
    const creepingLineSpeed = 1
    const animationDelay = 1000
    const loopRotate = true
    const showCtaFirst = true
    // === params === //

    const nextFrameEvent = new CustomEvent('showNextFrame')
    const startAnimationEvent = new CustomEvent('startAnimation')

    const animationWrapper = document.querySelector('#animation')
    const frames = document.querySelectorAll('.frame')
    const logoWrapper = document.querySelector('#logos')
    const ctaButtonsWrapper = document.querySelector('#cta-buttons')

    const logos = Array.from(logoWrapper.children)
    const ctaButtons = Array.from(ctaButtonsWrapper.children)

    const creepingLines = document.querySelector('.creeping-lines')
    const creepingAxis = creepingLines && window.getComputedStyle(creepingLines).getPropertyValue('--axis')

    const frameAnimationDuration = parseFloat(window.getComputedStyle(animationWrapper).getPropertyValue('--frame-animation-duration')) * 1000
    const stepsAnimationDelay = parseFloat(window.getComputedStyle(animationWrapper).getPropertyValue('--step-animation-delay')) * 1000

    let creepingLInePosition = 0

    let prevFrame = 0
    let currFrame = 0
    let prevCta = null

    if (!showCtaFirst) ctaButtonsWrapper.style.setProperty('--cta-animation-delay', '0s')

    animationWrapper.addEventListener('showNextFrame', nextFrame)
    animationWrapper.dispatchEvent(nextFrameEvent)

    if (creepingLines) addCreepingLines()

    function nextFrame() {
        if (currFrame >= frames.length) {
            if (!loopRotate) return
            currFrame = 0
        }

        hideFrame(currFrame, prevFrame)
        showFrame(currFrame)

        logosHandler(currFrame)

        if (!showCtaFirst) hideCtaButton(currFrame)
        if (showCtaFirst) ctaButtonsHandler(currFrame)

        prevFrame = currFrame
        currFrame++
    }

    function showFrame(currFrame) {
        const frame = frames[currFrame]
        const lastChild = Array.from(frame.children).at(-1)
        lastChild.currFrame = currFrame

        frame.classList.add('show')

        animationWrapper.classList.add(`active-frame-${currFrame}`)

        animationWrapper.addEventListener('startAnimation', startAnimationHandler)

        if (showCtaFirst) {
            lastChild.addEventListener('animationend', nextFrameEventDispatch)
        } else {
            animationWrapper.dispatchEvent(startAnimationEvent)
            lastChild.addEventListener('animationend', showCtaEventDispatch)
        }
    }

    function hideFrame(currFrame, prevFrame) {
        if (currFrame === prevFrame) return

        frames[prevFrame].classList.add('hide')
        frames[prevFrame].classList.remove('show')
        animationWrapper.classList.remove(`active-frame-${prevFrame}`)

        setTimeout(() => {
            frames[prevFrame].classList.remove('hide')
            frames[prevFrame].classList.remove('start-animation')
        }, frameAnimationDuration)
    }

    function logosHandler(currFrame) {
        logos.forEach(logo => {
            if (logo.classList.contains('active')) {
                logo.classList.add('hide')
            } else {
                logo.classList.remove('hide')
            }

            logo.classList.remove('active')

            if (frames[currFrame].getAttribute('data-logo') === logo.getAttribute('data-title')) {
                logo.classList.add('active')
                logo.classList.remove('hide')
            }
        })
    }

    function ctaButtonsHandler(currFrame) {
        if (ctaButtons.length === 0) {
            setTimeout(() => {
                animationWrapper.dispatchEvent(nextFrameEvent)
            }, animationDelay)

            return
        }

        let triggered = false

        ctaButtons.forEach(ctaBtn => {
            if (ctaBtn.classList.contains('active')) {
                ctaBtn.classList.add('hide')
            } else {
                ctaBtn.classList.remove('hide')
            }

            ctaBtn.classList.remove('active')

            if (!frames[currFrame].getAttribute('data-cta') && !triggered) {
                triggered = true
                prevCta = null

                if (showCtaFirst) animationWrapper.dispatchEvent(startAnimationEvent)

                if (!showCtaFirst) {
                    setTimeout(() => {
                        animationWrapper.dispatchEvent(nextFrameEvent)
                    }, animationDelay)
                }
            }

            if (frames[currFrame].getAttribute('data-cta') === ctaBtn.getAttribute('data-title')) {
                if (ctaBtn.getAttribute('data-title') !== prevCta) {
                    if (showCtaFirst) {
                        setTimeout(() => {
                            animationWrapper.dispatchEvent(startAnimationEvent)
                        }, stepsAnimationDelay)
                    }

                    if (!showCtaFirst) {
                        setTimeout(() => {
                            animationWrapper.dispatchEvent(nextFrameEvent)
                        }, animationDelay + frameAnimationDuration)
                    }
                } else {
                    if (showCtaFirst) animationWrapper.dispatchEvent(startAnimationEvent)

                    if (!showCtaFirst) {
                        setTimeout(() => {
                            animationWrapper.dispatchEvent(nextFrameEvent)
                        }, animationDelay)
                    }
                }

                ctaBtn.classList.add('active')
                ctaBtn.classList.remove('hide')
                prevCta = ctaBtn.getAttribute('data-title')
            }
        })
    }

    function hideCtaButton(currFrame) {
        ctaButtons.forEach(ctaBtn => {
            if (frames[currFrame].getAttribute('data-cta') !== ctaBtn.getAttribute('data-title')) {
                if (ctaBtn.getAttribute('data-title') === prevCta) {
                    ctaBtn.classList.add('hide')
                    ctaBtn.classList.remove('active')

                    setTimeout(() => {
                        ctaBtn.classList.remove('hide')
                    }, frameAnimationDuration)
                }
            }
        })
    }

    function startAnimationHandler() {
        this.addEventListener('startAnimation', startAnimationHandler)

        const frame = this.querySelector('.frame.show')
        frame.classList.add('start-animation')
    }

    function nextFrameEventDispatch() {
        this.removeEventListener('animationend', nextFrameEventDispatch)

        setTimeout(() => {
            animationWrapper.dispatchEvent(nextFrameEvent)
        }, animationDelay)
    }

    function showCtaEventDispatch() {
        this.removeEventListener('animationend', showCtaEventDispatch)

        ctaButtonsHandler(this.currFrame)
    }

    function addCreepingLines() {
        const isHidden = window.getComputedStyle(creepingLines).getPropertyValue('display') === 'none'
        const lineText = creepingLines.getAttribute('data-text')
        if (!lineText || isHidden) return

        creepingLines.classList.add(creepingAxis)

        const creepingLine = document.createElement('div')
        creepingLine.classList.add('creeping-line')

        const creepingLineTop = creepingLine.cloneNode(true)
        creepingLineTop.classList.add('creeping-line-top')

        const creepingLineBottom = creepingLine.cloneNode(true)
        creepingLineBottom.classList.add('creeping-line-bottom')

        creepingLines.appendChild(creepingLineTop)
        creepingLines.appendChild(creepingLineBottom)

        const text = document.createElement('span')
        text.innerHTML = lineText

        let shouldAddText = true

        const size = creepingAxis === 'vertical' ? 'offsetHeight' : 'offsetWidth'

        while (shouldAddText) {
            creepingLineTop.appendChild(text.cloneNode(true))
            creepingLineBottom.appendChild(text.cloneNode(true))

            if (Math.min(creepingLineTop.offsetWidth, creepingLineBottom.offsetWidth) > animationWrapper[size] * 2) {
                shouldAddText = false
                creepingLineTop.appendChild(text.cloneNode(true))
                creepingLineBottom.appendChild(text.cloneNode(true))
            }
        }

        requestAnimationFrame(() => moveLine({ top: creepingLineTop, bottom: creepingLineBottom }))
    }

    function moveLine({ top, bottom }) {
        const textWidth = top.children[0].offsetWidth
        const gap = parseFloat(window.getComputedStyle(top).getPropertyValue('gap'))
        const maxWidth = textWidth + gap
        const rotateValue = creepingAxis === 'vertical' ? '-90deg' : '0'

        if (creepingLInePosition >= maxWidth) {
            creepingLInePosition = 0
        } else {
            creepingLInePosition += 1 * creepingLineSpeed
        }

        top.style.transform = `rotate(${rotateValue}) translateX(${creepingLInePosition * -1}px)`
        bottom.style.transform = `rotate(${rotateValue}) translateX(${creepingLInePosition}px)`

        requestAnimationFrame(() => moveLine({ top, bottom }))
    }
}, false)
