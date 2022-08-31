import {buildClient} from './client';
import {JobStatus} from './JobStatus';
import {Transform} from 'stream';

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data} = await client.glue.startCrawler(parameters.crawler);
    return data;
};

exports.stop = async ({connection, parameters}) => {
    const client = buildClient(connection);
    await client.glue.stopCrawler(parameters.crawler);
};

exports.getStatus = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data} = await client.glue.getCrawler(parameters.crawler);

    switch (data.Crawler.State) {
        case 'RUNNING':
            return JobStatus.RUNNING;
        case 'READY':
            if (data.Crawler.LastCrawl && data.Crawler.LastCrawl.Status)
                switch (data.Crawler.LastCrawl.Status) {
                    case 'SUCCEEDED':
                        return JobStatus.SUCCEEDED;
                    case 'CANCELLED':
                        return JobStatus.KILLED;
                    case 'FAILED':
                        return JobStatus.FAILED;
                }
        case 'STOPPING':
            return JobStatus.KILLING;
    }
};

exports.getLogs = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data} = await client.glue.getCrawler(parameters.crawler);
    const stream = client.getLogsStream('/aws-glue/crawlers', parameters.crawler);
    const prefix = data.Crawler.LastCrawl.MessagePrefix;
    return stream.pipe(new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(chunk, encoding, next) {
            if (chunk.log.startsWith(`[${prefix}]`)) {
                return next(null, {
                    ...chunk,
                    log: chunk.log.replace(`[${prefix}] `, '')
                });
            }
            next();
        }
    }));
};
