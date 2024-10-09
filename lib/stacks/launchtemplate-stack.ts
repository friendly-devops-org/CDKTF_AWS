import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { EcsServiceConfigs } from './ecs-service-stack';
import { LaunchTemplate } from '@cdktf/provider-aws/lib/launch-template'

export interface LaunchTemplateConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    imageId: string,
    instanceType: string,
    iamInstanceProfile: string,
    securityGroupIds: string[],
    userData: string,
}

export class LaunchTemplateStack extends AwsStackBase {
    public launchTemplate: LaunchTemplate;
    constructor(scope: Construct, id: string, props: LaunchTemplateConfigs) {
        super(scope,`${props.name}-${id}` , {
            name: props.name,
            project: props.project,
            region: props.region
        })
        this.launchTemplate = new LaunchTemplate(this,`${props.name}-launch-template`, {
            id: props.id,
            instanceType: props.instanceType,
            iamInstanceProfile: {
                name: props.iamInstanceProfile,
            },
            securityGroupIds: props.securityGroupIds,
            updateDefaultVersion: true,
            userData: props.userData,

            tags = {
                Name: `${props.name}-instance`,
            }

        })
    }
}
