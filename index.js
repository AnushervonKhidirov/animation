window.addEventListener(
    'load',
    () => {
        const nextFrameEvent = new CustomEvent('showNextFrame')
        const startAnimation = new CustomEvent('startAnimation')

        const animationWrapper = document.querySelector('#animation')
        const step = document.querySelectorAll('.step-0')
        const frames = document.querySelectorAll('.frame')
        const logos = document.querySelectorAll('.logo')
        const ctaButtons = document.querySelectorAll('.cta')

        const frameAnimationDuration = parseFloat(window.getComputedStyle(frames[0]).animationDuration) * 1000
        const stepsAnimationDelay = parseFloat(window.getComputedStyle(step[0]).animationDelay) * 1000
        const loopRotate = true
        const animationDelay = 1500

        let prevFrame = 0
        let currFrame = 0
        let prevCta = null

        animationWrapper.addEventListener('showNextFrame', nextFrame)
        animationWrapper.dispatchEvent(nextFrameEvent)

        function nextFrame() {
            if (currFrame >= frames.length) {
                if (!loopRotate) return
                currFrame = 0
            }

            hideFrame(currFrame, prevFrame)
            showFrame(currFrame)

            logosHandler(currFrame)
            ctaButtonsHandler(currFrame)

            prevFrame = currFrame
            currFrame++
        }

        function showFrame(currFrame) {
            const frame = frames[currFrame]
            const lastChild = Array.from(frame.children).at(-1)

            frame.classList.add('show')

            animationWrapper.classList.add(`active-frame-${currFrame}`)

            lastChild.addEventListener('animationend', nextFrameEventDispatch)

            animationWrapper.addEventListener('startAnimation', () => {
                frame.classList.add('start-animation')
            })
        }

        function hideFrame(currFrame, prevFrame) {
            if (currFrame === prevFrame) return

            frames[prevFrame].classList.add('hide')
            frames[prevFrame].classList.remove('show')
            frames[prevFrame].classList.remove('start-animation')
            animationWrapper.classList.remove(`active-frame-${prevFrame}`)

            setTimeout(() => {
                frames[prevFrame].classList.remove('hide')
            }, frameAnimationDuration)
        }

        function logosHandler(currFrame) {
            if (logos.length === 0) return
            if (logos.length === 1) return logos[0].classList.add('active')

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
            if (ctaButtons.length === 0) return
            if (ctaButtons.length === 1) return ctaButtons[0].classList.add('active')

            ctaButtons.forEach((ctaBtn, index) => {
                if (ctaBtn.classList.contains('active')) {
                    ctaBtn.classList.add('hide')
                } else {
                    ctaBtn.classList.remove('hide')
                }

                ctaBtn.classList.remove('active')

                if (frames[currFrame].getAttribute('data-cta') === ctaBtn.getAttribute('data-title')) {
                    if (ctaBtn.getAttribute('data-title') !== prevCta) {
                        setTimeout(() => {
                            animationWrapper.dispatchEvent(startAnimation)
                        }, stepsAnimationDelay)
                    } else {
                        animationWrapper.dispatchEvent(startAnimation)
                    }

                    ctaBtn.classList.add('active')
                    ctaBtn.classList.remove('hide')
                    prevCta = ctaBtn.getAttribute('data-title')
                }
            })
        }

        function nextFrameEventDispatch() {
            this.removeEventListener('animationend', nextFrameEventDispatch)

            setTimeout(() => {
                animationWrapper.dispatchEvent(nextFrameEvent)
            }, animationDelay)
        }
    },
    false,
)
