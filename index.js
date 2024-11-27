window.addEventListener(
    'load',
    () => {
        const nextFrameEvent = new CustomEvent('showNextFrame')

        const animationWrapper = document.querySelector('#animation')
        const frames = document.querySelectorAll('.frame')
        const logos = document.querySelectorAll('.logo')
        const ctaButtons = document.querySelectorAll('.cta')

        const frameAnimationDuration = parseFloat(window.getComputedStyle(frames[0]).animationDuration) * 1000
        const loopRotate = true
        const animationDelay = 1500

        let prevFrame = 0
        let currFrame = 0

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

        function showFrame(index) {
            const frame = frames[index]
            const lastChild = Array.from(frame.children).at(-1)

            frame.classList.add('show')
            animationWrapper.classList.add(`active-frame-${index}`)

            lastChild.addEventListener('animationend', nextFrameEventDispatch)
        }

        function hideFrame(currFrame, prevFrame) {
            if (currFrame === prevFrame) return

            frames[prevFrame].classList.add('hide')
            frames[prevFrame].classList.remove('show')
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

            ctaButtons.forEach(ctaBtn => {
                if (ctaBtn.classList.contains('active')) {
                    ctaBtn.classList.add('hide')
                } else {
                    ctaBtn.classList.remove('hide')
                }

                ctaBtn.classList.remove('active')

                if (frames[currFrame].getAttribute('data-cta') === ctaBtn.getAttribute('data-title')) {
                    ctaBtn.classList.add('active')
                    ctaBtn.classList.remove('hide')
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
