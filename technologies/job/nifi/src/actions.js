import {Readable} from 'stream';
import {buildClient} from './client';
import {JobStatus} from './JobStatus';

exports.start = async ({connection, parameters}) => {
    const client = buildClient(connection);
    await client.startProcessGroup(parameters.processgroups);
};

exports.stop = async ({connection, parameters}) => {
    const client = buildClient(connection);
    await client.stopProcessGroup(parameters.processgroups);
};

exports.getStatus = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data} = await client.getProcessGroupStatus(parameters.processgroups);
    switch (data.processGroupStatus.aggregateSnapshot.processorStatusSnapshots[0].processorStatusSnapshot.runStatus) {
        case 'Running':
            return JobStatus.RUNNING;
        case 'Stopped':
            return JobStatus.KILLED;
        default:
            return JobStatus.AWAITING;
    }
};

exports.getLogs = async ({connection, parameters}) => {
    const client = buildClient(connection);
    const {data: logs} = await client.getBulletinBoard(parameters.processgroups);
    let logIndex = 0;
    const readable = new Readable();
    readable._read = async () => {
        if (logIndex >= logs.bulletinBoard.bulletins.length) {
            this.push(null);
            return;
        }
        const item = logs.bulletinBoard.bulletins[logIndex];
        logIndex = logIndex + 1;
        // item.bulletin.level === 'ERROR'
        const d = new Date(); // TODO the date of the log depends on the current time ?
        const isodate = (new Date(d.getUTCMonth() + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear() + ' ' + item.bulletin.timestamp)).toISOString();
        this.push(`${isodate} ${item.bulletin.message}\n`);
    };
    return readable;
};
