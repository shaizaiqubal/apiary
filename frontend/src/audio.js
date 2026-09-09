export const clickAudio = new Audio('/audio/click.wav')

export const playClickSound = () => {
    clickAudio.currentTime = 0
    clickAudio.play().catch(() => {})
}
