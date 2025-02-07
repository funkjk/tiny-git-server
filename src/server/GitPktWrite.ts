// https://shafiul.github.io/gitbook/7_the_packfile.html
import zlib from "zlib"
//@ts-ignore
import Hash from 'sha.js/sha1.js'

export type ObjectEntry = { buffer: Buffer, type: number }
export class GitPktWrite {
    static write(objectEntries: ObjectEntry[]) {
        const packed: Buffer[] = []
        const hash = new Hash()
        packed.push(Buffer.from('PACK', 'utf8'))
        // version 2
        packed.push(number2Buffer4Byte(2))
        // entry size
        packed.push(number2Buffer4Byte(objectEntries.length))
        for (let obj of objectEntries) {
            const zippedBuffer = zlib.deflateSync(obj.buffer)
            const objSize = obj.buffer.length
            packed.push(createObjectHeader(obj.type, objSize))
            packed.push(zippedBuffer)
        }
        for (let b of packed) {
            hash.update(b)
        }
        packed.push(hash.digest())
        return Buffer.concat(packed)
    }
}

function number2Buffer4Byte(num: number) {
    return Buffer.from([
        (num >> 24) & 255,
        (num >> 16) & 255,
        (num >> 8) & 255,
        num & 255,
    ]);
}

function createObjectHeader(type: number, size: number) :Buffer{
    let currentSize = size
    const byteArray: number[] = []
    if (currentSize >> 4 >= 1) {
        byteArray.push(currentSize % (1 << 4))
        currentSize = currentSize >> 4
    }
    while (currentSize >> 7 >= 1) {
        byteArray.push(currentSize % (1 << 7))
        currentSize = currentSize >> 7
    }
    byteArray.push(currentSize)
    for (let idx = 0; idx < byteArray.length; idx++) {
        if (idx != byteArray.length - 1) {
            byteArray[idx] = byteArray[idx] | 0b10000000
        }
        if (idx == 0) {
            byteArray[idx] = byteArray[idx] | (type << 4)
        }
    }
    return Buffer.from(byteArray)
}
