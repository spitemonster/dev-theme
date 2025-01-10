import BlazeSlider from 'blaze-slider'

window.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.blaze-slider')

    if (slider) {
        const { postsVisible, postsToSlide, autoplay, loop } = slider.dataset

        const config = {
            slidesToScroll: Number(postsToSlide),
            enableAutoplay: Boolean(autoplay),
            loop: Boolean(loop),
            slidesToShow: Number(postsVisible),
        }

        console.log(config)

        new BlazeSlider(slider, {
            all: config,
        })
    }
})
