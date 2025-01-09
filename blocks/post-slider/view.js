import BlazeSlider from 'blaze-slider'

window.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.blaze-slider')

    new BlazeSlider(slider, {
        all: {
            slidesToShow: 2,
        },
    })
})
