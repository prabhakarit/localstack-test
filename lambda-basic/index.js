exports.handler = async (event, context) => {
    try {
        var response  = {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Hello World for lambda test from LocalStack'
            }),
            headers: {
                'X-Custom-Header': 'ASDF'
            }
        };
        return response;
    } catch (err) {
        console.log(err);
    }
};
