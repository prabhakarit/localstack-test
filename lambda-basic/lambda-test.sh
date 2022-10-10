#!/bin/sh

API_NAME=api
REGION=ap-south-1
STAGE=test
export AWS_ACCESS_KEY_ID=dummy
export AWS_SECRET_ACCESS_KEY=dummy
export AWS_DEFAULT_REGION=ap-south-1
export AWS_PROFILE=localstack
export LOCALSTACK_URL=http://localhost:4566/
alias aws="aws --endpoint-url $LOCALSTACK_URL"

function fail() {
    echo $2
    exit $1
}

aws lambda create-function \
    --function-name ${API_NAME} \
    --runtime nodejs12.x \
    --handler index.handler \
    --memory-size 128 \
    --zip-file fileb://api-handler.zip \
    --role arn:aws:iam::123456:role/irrelevant

[ $? == 0 ] || fail 1 "Failed: AWS / lambda / create-function"

LAMBDA_ARN=$(aws lambda list-functions --query "Functions[?FunctionName==\`${API_NAME}\`].FunctionArn" --output text)

aws apigateway create-rest-api \
    --name ${API_NAME}

[ $? == 0 ] || fail 2 "Failed: AWS / apigateway / create-rest-api"

API_ID=$(aws apigateway get-rest-apis --query "items[?name==\`${API_NAME}\`].id" --output text)
PARENT_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id ${API_ID} --query 'items[?path==`/`].id' --output text)

aws apigateway create-resource \
    --rest-api-id ${API_ID} \
    --parent-id ${PARENT_RESOURCE_ID} \
    --path-part "restapis"

[ $? == 0 ] || fail 3 "Failed: AWS / apigateway / create-resource"

RESOURCE_ID=$(aws apigateway get-resources --rest-api-id ${API_ID} --query 'items[?path==`/restapis`].id' --output text)

aws apigateway put-method \
    --rest-api-id ${API_ID} \
    --resource-id ${RESOURCE_ID} \
    --http-method GET \
    --request-parameters "method.request.path.restapis=true" \
    --authorization-type "NONE" \

[ $? == 0 ] || fail 4 "Failed: AWS / apigateway / put-method"

aws apigateway put-integration \
    --rest-api-id ${API_ID} \
    --resource-id ${RESOURCE_ID} \
    --http-method GET \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations \
    --passthrough-behavior WHEN_NO_MATCH \

[ $? == 0 ] || fail 5 "Failed: AWS / apigateway / put-integration"

aws apigateway create-deployment \
    --rest-api-id ${API_ID} \
    --stage-name ${STAGE} \

[ $? == 0 ] || fail 6 "Failed: AWS / apigateway / create-deployment"

ENDPOINT=http://localhost:4566/restapis/${API_ID}/${STAGE}/_user_request_/restapis

echo "API available at: ${ENDPOINT}"

echo "Testing GET:"
curl -i ${ENDPOINT}

#echo "Testing POST:"
#curl -iX POST ${ENDPOINT}