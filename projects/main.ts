ChocoCar.Choco_init()
ChocoCar.rainbowlight(5, 5)
basic.forever(() => {
    if (15 < ChocoCar.Ultrasonic()) {
        ChocoCar.CarCtrl(ChocoCar.CarState.Car_Run)
        basic.pause(500)
        ChocoCar.CarCtrl(ChocoCar.CarState.Car_Stop)
    }
})
