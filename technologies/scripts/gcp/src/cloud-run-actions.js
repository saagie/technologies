import {buildClient} from './client';
import {JobStatus} from './JobStatus';

const start = async (client, parameters, containerSpec) => {
    let serviceData = {
        apiVersion: 'serving.knative.dev/v1',
        kind: 'Service',
        metadata: {
            name: parameters.serviceName,
            namespace: parameters.project,
        },
        spec: {
            template: {
                spec: {
                    containers: [containerSpec],
                },
            }
        }
    };
    if (parameters.maxScale) {
        serviceData = {
            ...serviceData,
            spec: {
                ...serviceData.spec,
                template: {
                    ...serviceData.spec.template,
                    metadata: {
                        annotations: {
                            'autoscaling.knative.dev/maxScale': parameters.maxScale,
                        }
                    }
                }
            }
        }
    }
    const {data} = await client.cloudRun.run(parameters.region, parameters.project, serviceData);
    return data;
};

exports.startCopy = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    const {data: serviceData} = client.cloudRun.get(parameters.service);
    return start(client, parameters, {
        ...serviceData.spec.template.spec.containers[0],
        ports: [{containerPort: parameters.containerPort || 8080}]
    });
}

exports.startNew = async ({connection, parameters}) => {
    const client = await buildClient(connection);
    return start(client, parameters, {
        image: parameters.containerImageUrl,
        env: [],
        ports: [{containerPort: parameters.containerPort || 8080}]
    });
}

exports.stop = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    await client.cloudRun.delete(parameters.region, payload?.metadata?.selfLink);
};

const STATUS_MAPPING = {
    'True': JobStatus.SUCCEEDED,
    'False': JobStatus.FAILED,
    'Unknown': JobStatus.AWAITING,
};

exports.getStatus = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    const {data: {status}} = await client.cloudRun.get(parameters.region, payload?.metadata?.selfLink);
    const {conditions} = status;
    const readyCondition = conditions.find(condition => condition.type === 'Ready');
    if (readyCondition) {
        return STATUS_MAPPING[readyCondition.status] || JobStatus.AWAITING;
    }
    return JobStatus.AWAITING;
};

exports.getLogs = async ({connection, parameters, payload}) => {
    const client = await buildClient(connection);
    return await client.getLogs({
        filter: `resource.type="cloud_run_revision" resource.labels.service_name="${payload?.metadata?.name}" resource.labels.location="${parameters.region}"`,
        orderBy: "timestamp desc",
        resourceNames: [`projects/${parameters.project}`]
    });
};
