import { Construct } from 'constructs';
import * as cdktf from 'cdktf';
import { App } from 'cdktf';
import { taskDefinitionStack } from 'lib/stacks/taskdefinition-stack';
import { dbStack, DbConfig } from 'lib/stacks/db-stack';
import { EcsClusterStack } from 'lib/stacks/ecs-cluster-stack';
import { EcsServiceStack, EcsServiceConfigs } from 'lib/stacks/ecs-service-stack';
//import { InstanceStack, InstanceConfigs } from 'lib/stacks/ec2-stack';
import { LaunchTemplateStack, LaunchTemplateConfigs } from 'lib/stacks/ec2-stack';
import { AutoScalingStack, AutoScalingConfigs } from 'lib/stacks/autoscaling-stack';
import { sgStack } from 'lib/stacks/securitygroup-stack';
//import { RemoteBackend } from 'cdktf'; // uncomment this line to use Terraform Cloud
//import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
//import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
//import { EcsService } from '@cdktf/provider-aws/lib/ecs-service';
//import { EcsTaskDefinition} from '@cdktf/provider-aws/lib/ecs-task-definition';
//import { CloudwatchLogGroup} from '@cdktf/provider-aws/lib/cloudwatch-log-group';
//import { EcsCluster } from '@cdktf/provider-aws/lib/ecs-cluster';
//import { Alb } from '@cdktf/provider-aws/lib/alb';
//import { AlbTargetGroup } from '@cdktf/provider-aws/lib/alb-target-group';
//import { AlbListener } from '@cdktf/provider-aws/lib/alb-listener';
//import { SecurityGroup } from '@cdktf/provider-aws/lib/security-group';
//import { DbInstance } from '@cdktf/provider-aws/lib/db-instance';

/*
interface BaseStackProps {
    name: string,
    project: string,
    region: string,
}
*/

/*
interface DbConfigs extends BaseStackProps {
    dbAddress: string,
    dbName: string,
}
*/

/*
interface LbConfigs extends BaseStackProps {
    securityGroup: string,
}
*/

/*
interface EcsServiceConfigs extends BaseStackProps {
    cluster: string,
    taskDefinition: string,
    targetGroup: string,
    securityGroup: string,
}
*/

const StackProps: BaseStackProps = {
    name: "bmo-test",
    project: "bmo-iac",
    region: "us-east-2"
}

const app = new App();
const cluster = new EcsClusterStack(app, "ecs-cluster-stack", StackProps);
const sGroup = new sgStack(app, "sg-stack", StackProps);
const db = new dbStack(app, "db-stack", StackProps);

const DbConfig: DbConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    dbAddress: db.db.address,
    dbName: db.db.dbName,
}

const LbConfig: LbConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    securityGroup: sGroup.sg.id,
}

const LTConfig: LaunchTemplateConfigs = {
    imageId: "ami-09da212cf18033880",
    instanceType: "t3.micro",
    iamInstanceProfile: "ecsInstanceRole",
    securityGroupIds: [sGroup.sg.id],
    userData: `#!/bin/bash
                echo ${cluster.cluster.name} >> /etc/ecs/ecs.config`,
}

const launchTemplate = new LaunchTemplateStack(app, "lt-stack", LTConfig)

const AsgConfig: AutoScalingConfigs = {
    desiredCapacity: 3,
    minSize: 1,
    maxSize: 3
    launchTemplate: {
        id: launchTemplate.launchTemplate.id
        version: "${Latest}"
    },
    vpcZoneIdentifier: [],
    cpuTargetValue: "80",
    memoryTargetValue: "80",
    ecsClusterName: cluster.cluster.name,
}

/*const InstanceConfig: InstanceConfigs {
    launchTemplate: {
        id: launchTemplate.launchTemplate.id
        version: "$Latest"
}*/

const taskDefinition = new taskDefinitionStack(app, "td-stack", DbConfig);
const lb = new loadBalancerStack(app, "lb-stack", LbConfig);

const EcsConfig: EcsServiceConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    cluster: cluster.cluster.arn,
    taskDefinition: taskDefinition.td.arn,
    targetGroup: lb.targetGroup.arn,
    securityGroup: sGroup.sg.id
    desiredCount: 3,
}

const ecs = new EcsServiceStack(app, "ecs-service-stack", EcsConfig);

const AppAsConfig : AppAutoScalingConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    minCapacity: 1,
    maxCapacity: 4,
    cpuTargetValue: 70,
    memoryTargetValue: 70,
    ecsClusterName: cluster.cluster.name,
    ecsServiceName: ecs.ecs.name
}

new AppAutoScalingStack(app, "ecs-autoscaling-stack", AppAsConfig)

// To deploy using Terraform Cloud comment out the above line
// And uncomment the below block of lines

/*const stack = new EcsServiceStack(app, "ecs-service-stack", EcsConfig);
new RemoteBackend(stack, {
  hostname: "app.terraform.io",
  organization: process.env.CDKTF_ECS_TFC_ORGANIZATION || "",
  workspaces: {
    name: "ecs-microservices-cdktf"
  }
}); */

app.synth();
