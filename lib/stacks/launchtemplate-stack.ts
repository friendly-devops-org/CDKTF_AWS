import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { LaunchTemplate } from '@cdktf/provider-aws/lib/launch-template'
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { readFileSync } from 'fs'

export interface LaunchTemplateConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    imageId: string,
    instanceType: string,
//    iamInstanceProfile: string,
    securityGroupIds: string[],
    userData: string,
}

export class LaunchTemplateStack extends AwsStackBase {
    public launchTemplate: LaunchTemplate;
    private ecsRole: IamRole;
    constructor(scope: Construct, id: string, props: LaunchTemplateConfigs) {
        super(scope,`${props.name}-${id}` , {
            name: props.name,
            project: props.project,
            region: props.region
        })

        this.ecsRole = new IamRole(this, `${props.name}-ecs-role`, {
          name: `${props.name}-ecs-role`,
          inlinePolicy: [
            {
              name: "deploy-ecs",
              policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: ["ecs:*", "ec2:*"],
                    Resource: "*",
                  },
                ],
              }),
            },
          ],
          assumeRolePolicy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
              {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Sid: "",
                Principal: {
                  Service: "ecs.amazonaws.com",
                },
              },
              {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Sid: "",
                Principal: {
                  Service: "ec2.amazonaws.com",
                },
              },
            ],
          }),
        });

        this.launchTemplate = new LaunchTemplate(this,`${props.name}-launch-template`, {
            instanceType: props.instanceType,
            imageId: props.imageId,
            iamInstanceProfile: {
                name: this.ecsRole.name,
            },
            vpcSecurityGroupIds: props.securityGroupIds,
            updateDefaultVersion: true,
            userData: readFileSync(`${props.userData}`,{encoding: 'base64'}),

            tags : {
                Name: `${props.name}-instance`,
            }

        });

    }
}
