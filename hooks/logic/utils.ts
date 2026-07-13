const useLogicUtils = () => {

    const pcmToWav  = (base64PCM: string, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): string => {

        const binaryStr = atob(base64PCM);
        const pcmBytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            pcmBytes[i] = binaryStr.charCodeAt(i);
        }

        const dataSize = pcmBytes.length;
        const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
        const blockAlign = numChannels * (bitsPerSample / 8);
        const wavBuffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(wavBuffer);

        const writeStr = (offset: any, str: string) => {
            for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
            }
        };

        // WAV Header
        writeStr(0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);       // file size - 8
        writeStr(8, 'WAVE');
        writeStr(12, 'fmt ');
        view.setUint32(16, 16, true);                  // PCM chunk size
        view.setUint16(20, 1, true);                   // PCM format = 1
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);
        writeStr(36, 'data');
        view.setUint32(40, dataSize, true);

        // Copy PCM data after the header
        const wavBytes = new Uint8Array(wavBuffer);
        wavBytes.set(pcmBytes, 44);

        // Convert back to base64 for FileSystem
        let binary = '';
        for (let i = 0; i < wavBytes.length; i++) {
            binary += String.fromCharCode(wavBytes[i]);
        }
        return btoa(binary);
    }

    return {
        pcmToWav
    }
}

export { useLogicUtils }