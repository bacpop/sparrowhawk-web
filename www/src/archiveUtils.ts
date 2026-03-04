import { zipSync, gzipSync, strToU8 } from 'fflate';

export function buildZipBinary(files: Record<string, Uint8Array>): Uint8Array {
    return zipSync(files);
}

export function buildTarGzBinary(files: Record<string, Uint8Array>): Uint8Array {
    const blocks: Uint8Array[] = [];
    for (const [name, data] of Object.entries(files)) {
        const nameBytes = strToU8(name);
        const header = new Uint8Array(512);
        header.set(nameBytes.slice(0, 100), 0);
        header.set(strToU8('0000644\0'), 100);
        header.set(strToU8('0000000\0'), 108);
        header.set(strToU8('0000000\0'), 116);
        const sizeOctal = data.length.toString(8).padStart(11, '0') + '\0';
        header.set(strToU8(sizeOctal), 124);
        header.set(strToU8('00000000000\0'), 136);
        header.fill(0x20, 148, 156);
        header[156] = 0x30;
        header.set(strToU8('ustar\0'), 257);
        header.set(strToU8('00'), 263);
        let checksum = 0;
        for (let i = 0; i < 512; i++) checksum += header[i];
        header.set(strToU8(checksum.toString(8).padStart(6, '0') + '\0 '), 148);
        blocks.push(header);
        const paddedSize = Math.ceil(data.length / 512) * 512;
        const dataBlock = new Uint8Array(paddedSize);
        dataBlock.set(data);
        blocks.push(dataBlock);
    }
    blocks.push(new Uint8Array(1024));
    const totalSize = blocks.reduce((sum, b) => sum + b.length, 0);
    const tar = new Uint8Array(totalSize);
    let offset = 0;
    for (const block of blocks) { tar.set(block, offset); offset += block.length; }
    return gzipSync(tar);
}

export function buildZip(files: Record<string, string>): Uint8Array {
    const zipInput: Record<string, Uint8Array> = {};
    for (const [name, content] of Object.entries(files)) {
        zipInput[name] = strToU8(content);
    }
    return zipSync(zipInput);
}

export function buildTarGz(files: Record<string, string>): Uint8Array {
    const blocks: Uint8Array[] = [];

    for (const [name, content] of Object.entries(files)) {
        const data = strToU8(content);
        const nameBytes = strToU8(name);

        // POSIX ustar 512-byte header
        const header = new Uint8Array(512);

        // name (100 bytes at offset 0)
        header.set(nameBytes.slice(0, 100), 0);

        // mode (8 bytes at offset 100): 0000644\0
        header.set(strToU8('0000644\0'), 100);

        // uid (8 bytes at offset 108)
        header.set(strToU8('0000000\0'), 108);

        // gid (8 bytes at offset 116)
        header.set(strToU8('0000000\0'), 116);

        // size (12 bytes at offset 124): octal, null-terminated
        const sizeOctal = data.length.toString(8).padStart(11, '0') + '\0';
        header.set(strToU8(sizeOctal), 124);

        // mtime (12 bytes at offset 136): 0
        header.set(strToU8('00000000000\0'), 136);

        // checksum placeholder (8 bytes at offset 148): spaces
        header.fill(0x20, 148, 156);

        // typeflag (1 byte at offset 156): '0' = regular file
        header[156] = 0x30;

        // ustar magic (6 bytes at offset 257)
        header.set(strToU8('ustar\0'), 257);

        // ustar version (2 bytes at offset 263)
        header.set(strToU8('00'), 263);

        // Compute checksum over header with spaces in checksum field
        let checksum = 0;
        for (let i = 0; i < 512; i++) checksum += header[i];
        const checksumOctal = checksum.toString(8).padStart(6, '0') + '\0 ';
        header.set(strToU8(checksumOctal), 148);

        blocks.push(header);

        // Data blocks (padded to 512-byte boundary)
        const paddedSize = Math.ceil(data.length / 512) * 512;
        const dataBlock = new Uint8Array(paddedSize);
        dataBlock.set(data);
        blocks.push(dataBlock);
    }

    // Two 512-byte null blocks to end the archive
    blocks.push(new Uint8Array(1024));

    // Concatenate all blocks
    const totalSize = blocks.reduce((sum, b) => sum + b.length, 0);
    const tar = new Uint8Array(totalSize);
    let offset = 0;
    for (const block of blocks) {
        tar.set(block, offset);
        offset += block.length;
    }

    return gzipSync(tar);
}
