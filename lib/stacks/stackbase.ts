import { Construct } from 'constructs';
import * as cdktf from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
//import * fs from 'fs';


export interface BaseStackProps {
    name: string,
    project: string,
    region: string,
}

export class AwsStackBase extends cdktf.TerraformStack {
    public _provider: cdktf.TerraformProvider;

    constructor(scope: Construct, id: string, baseProps: BaseStackProps) {
        super(scope, `${baseProps.name}-${id}`);
        this._provider = new AwsProvider(this, 'aws', {
            region: baseProps.region,
        })
        const bucketName =`${process.env.STATE_BUCKET}`

        new cdktf.S3Backend(this, {
            bucket: bucketName,
            key: `${baseProps.project}/${baseProps.name}`,
            region: `${baseProps.region}`
        });

/*        get provider(): cdktf.TerraformProvider {
            return this._provider;
        }*/
    }
}
