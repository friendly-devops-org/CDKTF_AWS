import { Construct } from 'constructs';
import { AwsStackBase, BaseStackProps } from './stackbase';
import { EfsFileSystem } from '@cdktf/provider-aws/lib/efs-file-system'
import { EfsAccessPoint } from '@cdktf/provider-aws/lib/efs-access-point'
import { KmsKey } from '@cdktf/provider-aws/lib/kms-key'

export interface EfsConfigs extends BaseStackProps {
    name: string,
    project: string,
    region: string,
    securityGroup: string,
}

export class efsStack extends EfsFileSystem {
    public efsAp: EfsAccessPoint
    public efs: EfsFileSystem
    constructor(scope: Construct, id: string, props: EfsConfigs) {
        super(scope,  `${props.name}-${id}`, {
            name: `${props.name}`,
            project: `${props.project}`,
            region: `${props.region}`,
            subnetId: `${props.subnetId}`,
            securityGroup: `${props.securityGroup}`,
        })
        const kmsKey = new KmsKey(this, `${props.name}-kms-key`, {
            description: "Encryption key for the efs filesystem",
            id: `${props.name}-efs-kms-key`
        })
        const efs = new EfsFileSystem(this, `${props.name}-efs`, {
            creationToken: `${props.name}-${props.project}-efs`,
            encrypted: true, 
            kmsKeyId: kmsKey.id,


            tags: {
                Name: `${props.name}-${props.project}-efs`,
            }
        })
        this.efsAp = new EfsAccessPoint (this, `${props.name}-efsMT`, {
            fileSystemId: efs.id
        })
    }
}
