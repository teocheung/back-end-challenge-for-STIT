
// this file is to set up rules for API's error handling and response format.

module.exports = {
    // function to handle API Error
    APIError: function (code, message) {
        this.code = code || 'internal:unknown_error';
        this.message = message || '';
    },

    // specific rules for the response format, and catch error API error
    restify: (pathPrefix) => {
        pathPrefix = pathPrefix || '/api/';
        return async (ctx, next) => {
            if (ctx.request.path.startsWith(pathPrefix)) {
                console.log(`(in rest.js) Process API ${ctx.request.method} ${ctx.request.url}...`);
                // define a function for ctx to send response to client
                ctx.rest = (data) => {
                    // specific response's content-type
                    ctx.response.type = 'application/json';
                    ctx.response.body = data;
                }
                try {
                    await next();
                } catch (e) {
                    console.log('Process API error...');
                    ctx.response.status = 400;
                    ctx.response.type = 'application/json';
                    ctx.response.body = {
                        code: e.code || 'internal:unknown_error',
                        message: e.message || ''
                    };
                }
            } else {
                await next();
            }
        };
    }
};
