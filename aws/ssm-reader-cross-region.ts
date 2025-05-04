import { Construct } from "constructs";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";

interface SSMParamReaderProps {
  readonly paramName: string;
  readonly region: string;
}

/**
 * Custom resource to read SSM parameter values
 * Can be used for cross region SSM parameter access
 *
 * @example Usage
 * const ssmReader = new SSMParamReader(this, "SSMParamReader", {
 *   paramName: "/some/parameter/name",
 *   region: "some-region-zone",
 * });
 *
 * const certificateArn = ssmReader.getParameterValue();
 */
export class SSMParamReader extends AwsCustomResource {
  constructor(scope: Construct, name: string, props: SSMParamReaderProps) {
    const { paramName, region } = props;

    super(scope, name, {
      onUpdate: {
        action: "getParameter",
        service: "SSM",
        parameters: {
          Name: paramName,
        },
        region,
        physicalResourceId: PhysicalResourceId.of(name),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });
  }

  public getParameterValue() {
    return this.getResponseFieldReference("Parameter.Value").toString();
  }
}
