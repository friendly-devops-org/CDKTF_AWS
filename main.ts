import { App } from 'cdktf';
import { BaseStackProps } from './lib/stacks/stackbase';
import { taskDefinitionStack } from './lib/stacks/taskdefinitions-stack';
import { dbStack, DbConfigs } from './lib/stacks/db-stack';
import { LoadBalancerStack, LbConfigs } from './lib/stacks/loadbalancer-stack';
import { EcsClusterStack } from './lib/stacks/ecs-cluster-stack';
import { EcsServiceStack, EcsServiceConfigs } from './lib/stacks/ecs-service-stack';
//import { InstanceStack, InstanceConfigs } from './lib/stacks/ec2-stack';
import { LaunchTemplateStack, LaunchTemplateConfigs } from './lib/stacks/launchtemplate-stack';
import { AutoScalingStack, AutoScalingConfigs } from './lib/stacks/autoscaling-stack';
import { AppAutoScalingStack, AppAutoScalingConfigs } from './lib/stacks/application-as-stack';
import { sgStack } from './lib/stacks/securitygroup-stack';

const StackProps: BaseStackProps = {
    name: "bmo-test",
    project: "bmo-iac",
    region: "us-east-2"
}

const fileS = require('fs');
function aFile(key: string){
    fileS.appendFileSync('./scripts/cluster.sh',"\necho " + `${key}` +  " >> /etc/ecs/ecs.conf");
}

const app = new App();
const cluster = new EcsClusterStack(app, "ecs-cluster-stack", StackProps);
const sGroup = new sgStack(app, "sg-stack", StackProps);
const db = new dbStack(app, "db-stack", StackProps);

//aFile(cluster.cluster.name);

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
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    imageId: "ami-09da212cf18033880",
    instanceType: "t3.micro",
    iamInstanceProfile: "ecsInstanceRole",
    securityGroupIds: [sGroup.sg.id],
    userData: "./scripts/cluster.sh"
}

const launchTemplate = new LaunchTemplateStack(app, "lt-stack", LTConfig)

const AsgConfig: AutoScalingConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    desiredCapacity: 3,
    minSize: 1,
    maxSize: 3,
    launchTemplate: {
        id: launchTemplate.launchTemplate.id,
        version: "${Latest}",
    },
    vpcZoneIdentifier: [`${process.env.SUBNET}`, `${process.env.SUBNET_2}`],
    cpuTargetValue: 80,
    memoryTargetValue: 80,
    ecsClusterName: cluster.cluster.name,
}

new AutoScalingStack(app, "asg-stack", AsgConfig)

/*const InstanceConfig: InstanceConfigs {
    launchTemplate: {
        id: launchTemplate.launchTemplate.id
        version: "$Latest"
}*/

const taskDefinition = new taskDefinitionStack(app, "td-stack", DbConfig);
const lb = new LoadBalancerStack(app, "lb-stack", LbConfig);

const EcsConfig: EcsServiceConfigs = {
    name: StackProps.name,
    project: StackProps.project,
    region: StackProps.region,
    cluster: cluster.cluster.arn,
    taskDefinition: taskDefinition.td.arn,
    targetGroup: lb.targetGroup.arn,
    securityGroup: sGroup.sg.id,
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
