ChocoCar.Choco_init()
ChocoCar.rainbowlight(5, 1)
basic.forever(() => {
    if (ChocoCar.read_touch()) {
        basic.showIcon(IconNames.Happy)
        ChocoCar.CarCtrl(ChocoCar.CarState.Car_Run)
        basic.pause(800)
        ChocoCar.CarCtrl(ChocoCar.CarState.Car_SpinLeft)
        basic.pause(300)
        ChocoCar.CarCtrl(ChocoCar.CarState.Car_SpinRight)
        basic.pause(600)
        ChocoCar.CarCtrl(ChocoCar.CarState.Car_Stop)
        music.beginMelody(music.builtInMelody(Melodies.PowerUp), MelodyOptions.Once)
        basic.clearScreen()
    }
})
