import {StringDecoder} from "string_decoder";
import {Transform} from "stream";

export const splitStringStream = (splitter) => {
    const decoder = new StringDecoder('utf8');
    let last = "";
    return new Transform({
        autoDestroy: true,
        readableObjectMode: true,
        transform(chunk, enc, cb) {
            last += decoder.write(chunk);
            const list = last.split(splitter);
            last = list.pop();
            for (let i = 0; i < list.length; i++) {
                this.push(list[i]);
            }
            cb();
        },
        flush(cb) {
            last += decoder.end();
            if (last) {
                this.push(last);
            }
            cb();
        },
    });
}
