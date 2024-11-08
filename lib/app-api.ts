import { Aws } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { generateBatch } from "../shared/util";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as node from "aws-cdk-lib/aws-lambda-nodejs";
import * as custom from "aws-cdk-lib/custom-resources";
import { artists, songs } from "../seed/artists";


type AppApiProps = {
  userPoolId: string;
  userPoolClientId: string;
};

export class AppApi extends Construct {
  constructor(scope: Construct, id: string, props: AppApiProps) {
    super(scope, id);

    // Tables 
    const artistTable = new dynamodb.Table(this, "ArtistsTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Artists",
    });

    const songTable = new dynamodb.Table(this, "SongTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "artistId", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "artist", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Songs",
    });


    songTable.addLocalSecondaryIndex({
      indexName: "roleIx",
      sortKey: { name: "artist", type: dynamodb.AttributeType.STRING },
    });

    const appApi = new apig.RestApi(this, "AppApi", {
      description: "App RestApi",
      endpointTypes: [apig.EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: apig.Cors.ALL_ORIGINS,
      },
    });

    const appCommonFnProps = {
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "handler",
      environment: {
        USER_POOL_ID: props.userPoolId,
        CLIENT_ID: props.userPoolClientId,
        REGION: cdk.Aws.REGION,
      },
    };

    // Functions 

    const getArtistByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetArtistByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambda/lambdas/getArtistById.ts`,
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
        entry: `${__dirname}/../lambda/lambdas/getAllArtists.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: artistTable.tableName,
          REGION: 'eu-west-1',
        },
      }
    );

    const getArtistSongsFn = new lambdanode.NodejsFunction(
      this,
      "GetArtistSongsFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: `${__dirname}/../lambda/lambdas/getArtistSongs.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: songTable.tableName,
          REGION: "eu-west-1",
        },
      }
    );




    const newArtistFn = new lambdanode.NodejsFunction(this, "AddArtistFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../lambda/lambdas/addArtist.ts`,
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
            [songTable.tableName]: generateBatch(songs),
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of("artistsddbInitData"), //.of(Date.now().toString()),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [artistTable.tableArn, songTable.tableArn],
      }),
    });

    // Permissions 
    artistTable.grantReadData(getArtistByIdFn)
    artistTable.grantReadData(getAllArtistsFn)
    artistTable.grantReadWriteData(newArtistFn)

    songTable.grantReadData(getArtistSongsFn);

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


    const artistSongsEndpoint = artistsEndpoint.addResource("song");
    artistSongsEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getArtistSongsFn, { proxy: true })
    );


    const protectedRes = appApi.root.addResource("protected");

    const publicRes = appApi.root.addResource("public");

    const protectedFn = new node.NodejsFunction(this, "ProtectedFn", {
      ...appCommonFnProps,
      entry: "./lambda/protected.ts",
    });

    const publicFn = new node.NodejsFunction(this, "PublicFn", {
      ...appCommonFnProps,
      entry: "./lambda/public.ts",
    });

    const authorizerFn = new node.NodejsFunction(this, "AuthorizerFn", {
      ...appCommonFnProps,
      entry: "./lambda/auth/authorizer.ts",
    });

    const requestAuthorizer = new apig.RequestAuthorizer(
      this,
      "RequestAuthorizer",
      {
        identitySources: [apig.IdentitySource.header("cookie")],
        handler: authorizerFn,
        resultsCacheTtl: cdk.Duration.minutes(0),
      }
    );

    protectedRes.addMethod("GET", new apig.LambdaIntegration(protectedFn), {
      authorizer: requestAuthorizer,
      authorizationType: apig.AuthorizationType.CUSTOM,
    });

    publicRes.addMethod("GET", new apig.LambdaIntegration(publicFn));
  }
}