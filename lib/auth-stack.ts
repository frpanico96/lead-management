import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dotenv from 'dotenv'
import * as path from 'path';

/* load env variables */
dotenv.config()

export class AuthStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'LeadManagementQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });


    /* load JWT secret */
    const jwtSecret = process.env.JWT_SECRET;

    if(!jwtSecret) throw new Error('JWT_SECRET is not set in environment variables');

    /* Generate Lambda for auth */
    const authFunction = new lambda.Function(this, 'AuthFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '/lambdas','/authLambda','/dist')),
      environment: {
        JWT_SECRET: jwtSecret,
      },
    });

    /* Create API Gateway */
    const authApi = new apigateway.RestApi(this, 'AuthApi', {
      restApiName: 'Auth Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });


    /* Create resource */
    const auth = authApi.root.addResource('auth');

    /* Attach lambda */
    const authIntegration = new apigateway.LambdaIntegration(authFunction);

    /* Add method */
    auth.addMethod('POST', authIntegration);

    /* Output the API Gateway URL */
    new cdk.CfnOutput(this, 'AuthApiUrl', {
      value:  authApi.url,
      description: 'AuthApi Gateway URL',
    })
  }
}
