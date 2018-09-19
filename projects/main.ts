ChocoCar.Choco_init()
ChocoCar.rainbowlight(5, 1)
basic.forever(() => {
    ChocoCar.CarCtrl(ChocoCar.CarState.Car_Run)
    basic.pause(1000)
    ChocoCar.CarCtrl(ChocoCar.CarState.Car_Back)
    basic.pause(1000)
})
