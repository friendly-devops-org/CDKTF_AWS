import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from 'stackbase';
import { AutoscalingGroup, AutoscalingGroupLaunchTemplate } from '@cdktf/provider-aws/lib/autoscaling-group'
import { AutoscalingPolicy } from '@cdktf/provider-aws/lib/autoscaling-policy'

export interface AutoScalingConfigs extends BaseStackProps & {
    desiredCapacity: number,
    minSize: number,
    maxSize: number,
    launchTemplate: AutoscalingGroupLaunchTemplate,
    vpcZoneIdentifier: string[],
    cpuTargetValue: string,
    memoryTargetValue: string,
    ecsClusterName: string,
}

export class AutoScalingStack extends AwsStackBase {
    public AutoScaling: AutoScalingGroup;
    constructor(scope: Construct, :id: string, props: BaseStackProps) {
        super(scope,  `${props.name}-${id}`, {
            name: props.name,
            project: props.project,
            region: props.region,
        })
        this.autoScaling = new AutoscalingGroup(this, `${props.name}-auto-scaler`, {
            name: `${name}-${project}`,
            desiredCapacity: props.desiredCapacity,
            minSize: props.minSize,
            maxSize: props.maxSize,
            launchTemplate: props.launchTemplate.
            vpcZoneIdentifier: props.vpcZoneIdentifier,

        });

        this.cpuAutoScalingPolicy = new AutoscalingPolicy(this, `${props.name}-auto-scaler`, {
            autoscalingGroupName: autoScaling.name,
            policyType: "TargetTrackingScaling",
            targetTrackingConfiguration: {
                targetValue: props.cpuTargetValue,
                customizedMetricSpecification: {
                   metricName: "CPUReservation",
                   namespace: "AWS/ECS",
                   statistic: "Average", 
                   metricDemension: {
                    name: "ClusterName"
                    value: props.ecsClusterName
                   }
                },
            }

        });

        this.memoryAutoScalingPolicy = new AutoscalingPolicy(this, `${props.name}-auto-scaler`, {
            autoscalingGroupName: autoScaling.name,
            policyType: "TargetTrackingScaling",
            targetTrackingConfiguration: {
                targetValue: props.memoryTargetValue,
                customizedMetricSpecification: {
                   metricName: "MemoryReservation",
                   namespace: "AWS/ECS",
                   statistic: "Average", 
                   metricDemension: {
                    name: "ClusterName"
                    value: props.ecsClusterName
                   }
                },
            }

        });
    }
}
