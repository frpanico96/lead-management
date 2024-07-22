import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';

const ddbClient = new DynamoDBClient({});

export const handler: Handler = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try{
    let username: string | undefined;
    let agencyCode: string | undefined;

    console.log('Parameters:', event.queryStringParameters);

    if(!event.queryStringParameters) throw new Error('Query paramter needed');

    username = event.queryStringParameters.username;
    agencyCode = event.queryStringParameters.agencyCode;

    console.log('Data:', username, agencyCode);

    if(!username || !agencyCode) throw new Error('Missing required parameters');

    console.log('Data:', username, agencyCode);
    console.log('TableName', process.env.AGENTS_TABLE_NAME);
    
    const command = new PutItemCommand({
      TableName: process.env.AGENTS_TABLE_NAME,
      Item: marshall({username, agencyCode}),
    })

    await ddbClient.send(command)
      .catch(error => {throw new Error(error)});

    return {
      statusCode: 201,
      body: JSON.stringify({message: 'Agent created successfully', username, agencyCode}),
    };
  }catch(error){
    console.error('Error in agent creation', error);
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Error creating agent', error: (error as Error).message}),
    }
  }
}