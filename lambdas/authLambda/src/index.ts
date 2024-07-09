import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import {sign} from 'jsonwebtoken';

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try{
    /* Step 1: Use fake user then a MongoDb will be used to register agents */
    const agent = {username: "agent1"};

    const payload = {
      username: agent.username,
    };

    const secret = process.env.JWT_SECRET;
    if(!secret) throw new Error('JWT_SECRET is not set');
    
    /* Generate token that expires in one hour */
    const token = sign(payload, secret, {expiresIn: Math.floor(Date.now()/1000) + 1 * (60 * 60)});

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({username: agent.username, token}),
    }

  } catch(error) {
    console.log('Error in auth handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({error: 'Internal server error'}),
    }
  }



  


}

