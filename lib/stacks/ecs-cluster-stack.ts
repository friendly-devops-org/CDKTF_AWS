import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from 'stackbase';
import { EcsCluster } from '@cdktf/provider-aws/lib/ecs-cluster';

export class EcsClusterStack extends AwsStackBase {
    public cluster: EcsCluster
    constructor(scope: Construct, id: string, props: BaseStackProps) {
        super(scope, `${props.name}-${id}`, {
            name: props.name,
            project: props.project,
            region: props.region,
        })
         this.cluster = new EcsCluster(this, `${props.name}-ecs-cluster`, {
            name: `${props.name}-${props.project}-cluster`
        });
    }
}
