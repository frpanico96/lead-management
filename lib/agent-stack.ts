import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';

import * as path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class AgentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps){
    super(scope, id, props);

    /* Create table */
    const agentsTable = new dynamodb.Table(this, 'AgentsTable', {
      tableName: 'Agents',
      partitionKey: {name: 'username', type: dynamodb.AttributeType.STRING},
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });


    /* Create Lambda */
    const agentsFunction = new NodejsFunction(this, 'AgentsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '..', 'lambdas', 'agentsLambda', 'src', 'index.ts'),
      environment: {
        AGENTS_TABLE_NAME: agentsTable.tableName,
      },
    });


    /* Give Permissions */
    agentsTable.grantReadWriteData(agentsFunction);

    /* Create api gateway */
    const agentsApi = new apigateway.RestApi(this, 'AgentsApi', {
      restApiName: 'AgentsApi',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      }
    });

    /* Add resource */
    const agentResource = agentsApi.root.addResource('agents');

    /* Attach lambda */
    const agentIntegration = new apigateway.LambdaIntegration(agentsFunction, {
      timeout: cdk.Duration.seconds(29),
      requestTemplates: {
        "application/json": JSON.stringify({
          statusCode: 200,
          body: "$input.json('$')",
          queryStringParameters: "$input.params()",
        }),
      }
    });

    /* Add method */
    agentResource.addMethod('POST', agentIntegration, {
      requestParameters: {
        "method.request.querystring.username": false,
        "method.request.querystring.agencyCode": false,
      }
    });

    /* Output URL */
    new cdk.CfnOutput(this, 'AgentsApiUrl', {
      value: agentsApi.url,
      description: 'Agents API Gateway'
    })


  }
}