import * as cdk from "aws-cdk-lib";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { generateBatch } from "../shared/util";
import { artists } from "../seed/artists";

import * as apig from "aws-cdk-lib/aws-apigateway";


export class RestAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Tables 
    const artistTable = new dynamodb.Table(this, "ArtistsTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Artists",
    });


    // Functions 

    const getArtistByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetArtistByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/getArtistById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: artistTable.tableName,
          REGION: 'eu-west-1',
        },
      }
    );

    const getAllArtistsFn = new lambdanode.NodejsFunction(
      this,
      "GetAllArtistsFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/getAllArtists.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: artistTable.tableName,
          REGION: 'eu-west-1',
        },
      }
    );

    const newArtistFn = new lambdanode.NodejsFunction(this, "AddArtistFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../lambdas/addArtist.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: artistTable.tableName,
        REGION: "eu-west-1",
      },
    });





    new custom.AwsCustomResource(this, "artistsddbInitData", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [artistTable.tableName]: generateBatch(artists),
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of("artistsddbInitData"), //.of(Date.now().toString()),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [artistTable.tableArn],
      }),
    });

    // Permissions 
    artistTable.grantReadData(getArtistByIdFn)
    artistTable.grantReadData(getAllArtistsFn)
    artistTable.grantReadWriteData(newArtistFn)





    const api = new apig.RestApi(this, "RestAPI", {
      description: "demo api",
      deployOptions: {
        stageName: "dev",
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type", "X-Amz-Date"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
        allowOrigins: ["*"],
      },
    });

    const artistsEndpoint = api.root.addResource("artists");
    artistsEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getAllArtistsFn, { proxy: true })
    );

    const artistEndpoint = artistsEndpoint.addResource("{artistId}");
    artistEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getArtistByIdFn, { proxy: true })
    );

    artistsEndpoint.addMethod(
      "POST",
      new apig.LambdaIntegration(newArtistFn, { proxy: true })
    );
  }
}
