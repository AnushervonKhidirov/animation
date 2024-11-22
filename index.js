const nextFrameEvent = new CustomEvent('showNextFrame')

const animationWrapper = document.querySelector('#animation')
const frames = document.querySelectorAll('.frame')
const logos = document.querySelectorAll('.logo')
const ctaButtons = document.querySelectorAll('.cta')

const frameAnimationDuration = parseFloat(window.getComputedStyle(frames[0]).animationDuration) * 1000
const loopRotate = true
const animationDelay = 1500
const showLogosOnFrame = [[1, 3, 4], [2]]
const showCtaButtonsOnFrame = [[1, 2, 4], [3]]

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

    lastChild.addEventListener('animationend', nextFrameEventDispatch)
}

function hideFrame(currFrame, prevFrame) {
    if (currFrame === prevFrame) return

    frames[prevFrame].classList.add('hide')
    frames[prevFrame].classList.remove('show')

    setTimeout(() => {
        frames[prevFrame].classList.remove('hide')
    }, frameAnimationDuration)
}

function logosHandler(currFrame) {
    if (logos.length === 0) return
    if (logos.length === 1) return logos[0].classList.add('active')

    logos.forEach((logo, index) => {
        logo.classList.remove('active')

        if (showLogosOnFrame[index].includes(currFrame + 1)) {
            logo.classList.add('active')
        }
    })
}

function ctaButtonsHandler(currFrame) {
    if (ctaButtons.length === 0) return
    if (ctaButtons.length === 1) return ctaButtons[0].classList.add('active')

    ctaButtons.forEach((ctaBtn, index) => {
        ctaBtn.classList.remove('active')

        if (showCtaButtonsOnFrame[index].includes(currFrame + 1)) {
            ctaBtn.classList.add('active')
        }
    })
}

function nextFrameEventDispatch() {
    this.removeEventListener('animationend', nextFrameEventDispatch)

    setTimeout(() => {
        animationWrapper.dispatchEvent(nextFrameEvent)
    }, animationDelay)
}
