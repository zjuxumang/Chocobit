//自定义扩展库模板
//chocobit 2018/7/14

//% color="#f97c04" weight=25 icon="\uf1b9"
namespace ChocoCar {

    const PCA9685_ADD = 0x41
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04

    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09

    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD

    const PRESCALE = 0xFE

    let initialized = false

    export enum enServo {
        //blockId=servo_s1 block="接口1"
        S1 = 1,
        //blockId=servo_s2 block="接口2"
        S2,
        //blockId=servo_s3 block="接口3"
        S3,
        //blockId=servo_s4 block="接口4"
        S4
    }
    
    export enum CarState {
        //% blockId="Car_Run" block="前进"
        Car_Run = 1,
        //% blockId="Car_Back" block="后退"
        Car_Back = 2,
        //% blockId="Car_Left" block="左转"
        Car_Left = 3,
        //% blockId="Car_Right" block="右转"
        Car_Right = 4,
        //% blockId="Car_Stop" block="停止"
        Car_Stop = 5,
        //% blockId="Car_SpinLeft" block="原地左转"
        Car_SpinLeft = 6,
        //% blockId="Car_SpinRight" block="原地右转"
        Car_SpinRight = 7
    }
    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADD, MODE1, 0x00)
        setFreq(50);
        initialized = true
    }
    
    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADD, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADD, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADD, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADD, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADD, MODE1, oldmode | 0xa1);
    }
    
    function setPwm(channel: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;
        if (!initialized) {
            initPCA9685();
        }
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = 0;
        buf[2] = 0;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADD, buf);
    }

    function RGB_init(): void{
        neopixel.create(5, 12, 0)
    }

    //% blockId=Choco_init block="初始化智能车" color="#d43717"
    //% weight=99
    export function Choco_init() {
        pins.setPull(DigitalPin.P1, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P2, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
        music.playTone(262, music.beat(BeatFraction.Quarter))
        music.playTone(330, music.beat(BeatFraction.Quarter))
        music.playTone(392, music.beat(BeatFraction.Half))
        music.playTone(523, music.beat(BeatFraction.Half))
    }

    //% blockId=Choco_move block="设置电机速度 左轮 %leftspeed |右轮 %rightspeed" weight=90
    //% leftspeed.min=-100 lelftspeed.max=100
    //% rightspeed.min=-100 rightspeed.max=100
    export function move(leftspeed: number, rightspeed: number) {

        leftspeed = pins.map(leftspeed, -100, 100, -4095, 4095)
        rightspeed = pins.map(rightspeed, -100, 100, -4095, 4095)
        if (rightspeed >= 0)
        {
            setPwm(0, rightspeed)
            setPwm(1, 0)    
        }
        else
        {
            setPwm(0, 0)
            setPwm(1, -rightspeed)
        }
        if (leftspeed >= 0)
        {
            setPwm(2, leftspeed)
            setPwm(3, 0)    
        }
        else
        {
            setPwm(2, 0)
            setPwm(3, -leftspeed)
        }

    }
    //% blockId=Choco_CarCtrl block="智能车移动控制|%index"
    //% weight=93
    //% 
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=10
    export function CarCtrl(index: CarState): void {
        switch (index) {
            case CarState.Car_Run: move(100, 100); break;
            case CarState.Car_Back: move(-100, -100); break;
            case CarState.Car_Left: move(0, 100); break;
            case CarState.Car_Right: move(100, 0); break;
            case CarState.Car_Stop: move(0, 0); break;
            case CarState.Car_SpinLeft: move(-100, 100); break;
            case CarState.Car_SpinRight: move(100, -100); break;
        }
    }
    //% blockId=Choco_CarCtrlSpeed block="智能车移动控制|%index|速度 %speed"
    //% weight=92
    //% 
    //% speed.min=0 speed.max=100
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=10
    export function CarCtrlSpeed(index: CarState, speed: number): void {
        switch (index) {
            case CarState.Car_Run: move(speed, speed); break;
            case CarState.Car_Back: move(-speed, -speed); break;
            case CarState.Car_Left: move(speed*3/5, speed); break;
            case CarState.Car_Right: move(speed, speed*3/5); break;
            case CarState.Car_Stop: move(0, 0); break;
            case CarState.Car_SpinLeft: move(-speed, speed); break;
            case CarState.Car_SpinRight: move(speed, -speed); break;
        }
    }

    //% blockId=Choco_Servo block="舵机控制|编号 %num|角度 %value"
    //% weight=80
    //% 
    //% value.min=0 value.max=180
    //% num.fieldEditor="gridpicker" num.fieldOptions.columns=4
    export function Servo(num: enServo, value: number): void {

        // 50hz: 20,000 us
        let us = (value * 1800 / 180 + 600); // 0.6 ~ 2.4
        let pwm = us * 4096 / 20000;
        setPwm(num + 10, pwm);

    }



    export enum IR_sensor{
        //% blockId=IR_Left2 block="左2"
        Left2 = 0,
        //% blockId=IR_Left1 block="左1"
        Left1,
        //% blockId=IR_Right1 block="右1"
        Right1,
        //% blockId=IR_Right2 block="右2"
        Right2

    }
    export enum IR_state{
        //% blockId=IR_black block="黑"
        black = 0,
        //% blockId=IR_white block="白"
        white = 1
    }
    export enum enTouch {
        //% blockId=NoTouch block="未触摸"
        NoTouch = 0,
        //% blockId=Touch block="触摸"
        Touch = 1
    }
    //% blockId=Choco_touch block="检测到触摸输入" weight=15 color="#3d85c6"
    export function read_touch(): boolean{
        if (pins.digitalReadPin(DigitalPin.P15) == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    //% blockId=Choco_IRsensor block="循线传感器 %n |检测到 %state"
    //% n.fieldEditor="gridpicker" n.fieldOptions.columns=4 color="#3d85c6"
    export function read_IRsensor(n: IR_sensor,state:IR_state): boolean{
        let pin = 0;
        switch (n) {
            case IR_sensor.Left1: pin = DigitalPin.P2; break;
            case IR_sensor.Left2: pin = DigitalPin.P12; break;
            case IR_sensor.Right1: pin = DigitalPin.P8; break;
            case IR_sensor.Right2: pin = DigitalPin.P1; break;
        }
        if (pins.digitalReadPin(pin) == state) {
            return true;
        }
        else {
            return false;
        }
    }

    //% blockId=Choco_ultrasonic block="超声波测距值"
    //% color="#3d85c6"
    //% weight=20
    //% 
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Ultrasonic(): number {

        // send pulse
        pins.setPull(DigitalPin.P9, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P9, 0);
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P9, 1);
        control.waitMicros(15);
        pins.digitalWritePin(DigitalPin.P9, 0);

        // read pulse
        let d = pins.pulseIn(DigitalPin.P14, PulseValue.High, 23200);
        return d / 58;
    }
}




//% color="#f23c17" weight=20 icon="\uf085"
namespace MUsensor {
    export enum MODE {
        //% blockId=MU_mode_face block="人脸"
        FACE = 0,
        //% blockId=MU_mode_ball block="球"
        BALL,
        //% blockId=MU_mode_line block="线"
        LINE,
        //% blockId=MU_mode_body block="人体"
        BODY,
        //% blockId=MU_mode_shape block="形状卡片"
        SHAPE,
        //% blockId=MU_mode_signal block="标志卡片"
        SIGNAL,
        //% blockId=MU_mode_moving block="移动物体"
        MOVING,
        //% blockId=MU_mode_moving block="特定人脸"
        FACERCG,
        //% blockId=MU_mode_color block="颜色"
        COLOR

    }
    export enum DIR {
        //%blockId=DIR_X block="X"
        X = 0,
        //%blockId=DIR_Y block="Y"
        Y
    }

    //% blockId=MU_init block="初始化MU传感器"
    //% weight=90
    export function init() {

        serial.writeLine("CMD+SENSOR_SETUP")
        basic.pause(100)
        serial.writeLine("CMD+UART_STATUS=ENABLE")
        basic.pause(100)
        serial.writeLine("CMD+UART_OUTPUT=CALLBACK")
        basic.pause(100)
        serial.writeLine("CMD+SENSOR_SAVE")
        basic.pause(100)
        serial.writeLine("CMD+SENSOR_EXIT")

    }

    //% blockId=MU_face_train block="录入人脸"
    export function facetrain() {
        serial.writeLine("CMD+SENSOR_SETUP")
        basic.pause(100)
        serial.writeLine("CMD+VISION_OPTION=FACETRAIN")
        basic.pause(100)
    }

    //% blockId=MU_set_mode block="设置检测模式为 %mode"
    //% mode.fieldEditor="gridpicker" mode.fieldOptions.columns=3
    //% weight=85
    export function setmode(mode: MODE): void {
        serial.writeLine("CMD+SENSOR_SETUP")
        basic.pause(100);
        switch (mode) {
            case 0: serial.writeLine("CMD+VISION_TYPE=FACE")
            case 1: serial.writeLine("CMD+VISION_TYPE=BALL")
            case 2: serial.writeLine("CMD+VISION_TYPE=LINE")
            case 3: serial.writeLine("CMD+VISION_TYPE=BODY")
            case 4: serial.writeLine("CMD+VISION_TYPE=SHAPE")
            case 5: serial.writeLine("CMD+VISION_TYPE=SIGNAL")
            case 6: serial.writeLine("CMD+VISION_TYPE=MOVING")
            case 7: serial.writeLine("CMD+VISION_TYPE=FACERCG")
            case 8: serial.writeLine("CMD+VISION_TYPE=COLOR")
        }
        basic.pause(100)
        serial.writeLine("CMD+SENSOR_SAVE")
        basic.pause(100)
        serial.writeLine("CMD+SENSOR_EXIT")
    }

    //%blockId=MU_isdetected block="看到目标"
    //%weight=80
    export function isdetected(): boolean {
        serial.writeLine("CMD+VISION_DETECT=RESULT")
        basic.pause(100)
        let result = serial.readUntil(String.fromCharCode(0xed))
        if (result.charCodeAt(2) == 0)
            return false
        else return true
    }

    //%blockId=MU_detect_result block="检测结果 %dir|坐标"
    //%help="如果检测到目标，返回目标物体的X,Y坐标，范围为0~100，否则返回-1"
    //%weight=75
    export function detect_result(dir: DIR): number {
        serial.writeLine("CMD+VISION_DETECT=RESULT")
        basic.pause(100)
        let result = serial.readUntil(String.fromCharCode(0xed))
        if (result.charCodeAt(2) == 0)
            return -1
        else {
            if (dir == 0)
                return result.charCodeAt(3)
            else
                return result.charCodeAt(4)
        }

    }

    


}


