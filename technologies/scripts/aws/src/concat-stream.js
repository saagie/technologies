const {PassThrough} = require('stream');

export const concatStream = async (options, streamProvider) => {
    const concatenatedStream = new PassThrough(options);
    let currentStream = null;
    const nextStream = async () => {
        currentStream = await streamProvider();
        const pipeStream = async () => {
            if (currentStream === null) {
                concatenatedStream.end();
            } else {
                currentStream.pipe(concatenatedStream, {end: false});
                let streamClosed = false;
                const goNext = async () => {
                    if (streamClosed) {
                        return;
                    }
                    streamClosed = true;
                    await nextStream();
                };
                currentStream.on('end', goNext);
            }
        };
        await pipeStream();
    }
    await nextStream();
    return concatenatedStream;
}
