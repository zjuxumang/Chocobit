//自定义扩展库模板
//chocobit 2018/7/14

//% color="#f97c04" weight=25 icon="\uf1b2"
namespace Choco{
    
    //% blockId=choco_test block="测试|参数1 %value|参数2 %text"
    export function LED3(value: number, text: string): void {
        serial.writeNumber(value);
        serial.writeLine("");
        serial.writeLine(text);
    }
}
