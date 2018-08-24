ChocoCar.Choco_init()
ChocoCar.rainbowlight(5, 1)
basic.forever(() => {
    if (ChocoCar.read_touch()) {
        ChocoCar.CarCtrl(ChocoCar.CarState.Car_Run)
        basic.pause(500)
        ChocoCar.CarCtrl(ChocoCar.CarState.Car_SpinRight)
        basic.pause(500)
        ChocoCar.CarCtrl(ChocoCar.CarState.Car_Stop)
    }
})
