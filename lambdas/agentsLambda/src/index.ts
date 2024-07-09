import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { PutItemInput } from 'aws-sdk/clients/dynamodb';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Handler = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try{
    let username: string | undefined;
    let agencyCode: string | undefined;

    if(!event.queryStringParameters) throw new Error('Query paramter needed');

    username = event.queryStringParameters.username;
    agencyCode = event.queryStringParameters.agencyCode;

    if(!username || !agencyCode) throw new Error('Missing required parameters');

    const params: PutItemInput = {
      TableName: process.env.AGENTS_TABLE_NAME!,
      Item: {
        username,
        agencyCode,
      },
      ConditionExpression: 'attribute_not_exists(username)',
    };

    await dynamoDb.put(params).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({message: 'Agent created successfully', username, agencyCode}),
    };
  }catch(error){
    console.log('Error in agent creation', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Error creating agent', error: error.message}),
    }
  }
}