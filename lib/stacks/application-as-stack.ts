import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { AppAutoscalingTarget } from '@cdktf/provider-aws/lib/appautoscaling-target'
import { AppAutoscalingPolicy } from '@cdktf/provider-aws/lib/appautoscaling-policy'

export interface AppAutoScalingConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    minCapacity: number,
    maxCapacity: number,
    cpuTargetValue: number,
    memoryTargetValue: number,
    ecsClusterName: string,
    ecsServiceName: string,
}

export class AppAutoScalingStack extends AwsStackBase {
    constructor(scope: Construct, :id: string, props: BaseStackProps) {
        super(scope,  `${props.name}-${id}`, {
            name: props.name,
            project: props.project,
            region: props.region,
        })
        this.appAutoScaling = new AppAutoscalingTarget(this, `${props.name}-application-auto-scaler`, {
            minCapacity: props.minCapacity,
            maxCapacity: props.maxCapacity,
            resourceId: `service/${props.ecsClusterName}/${props.ecsServiceName}}`,
            scalableDimension: "ecs:service:DesiredCount",
            serviceNamespace: "ecs",

        });

         new AppAutoscalingPolicy(this, `${props.name}-auto-scaler`, {
            name: `${props.name}-${props.project}-cpu-scaling-policy`,
            policyType: "TargetTrackingScaling",
            scalableDimension: appAutoScaling.scalableDimension,
            serviceNamespace: appAutoScaling.serviceNamespace,
            resourceId: appAutoScaling.resourceId,
            targetTrackingScalingPolicyConfiguration: {
                targetValue: props.cpuTargetValue,
                predefinedMetricSpecification: {
                   predefinedMetricType: "ECSServiceAverageCPUUtilization",
                },
            }

        });

         new AppAutoscalingPolicy(this, `${props.name}-auto-scaler`, {
            name: `${props.name}-${props.project}-memory-scaling-policy`,
            policyType: "TargetTrackingScaling",
            scalableDimension: appAutoScaling.scalableDimension,
            serviceNamespace: appAutoScaling.serviceNamespace,
            resourceId: appAutoScaling.resourceId,
            targetTrackingScalingPolicyConfiguration: {
                targetValue: props.memoryTargetValue,
                predefinedMetricSpecification: {
                   predefinedMetricType: "ECSServiceAverageMemoryUtilization",
                },
            }

        });
    }
}
