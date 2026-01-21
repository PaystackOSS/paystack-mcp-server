"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAPIParser = void 0;
const SwaggerParser = __importStar(require("@apidevtools/swagger-parser"));
class OpenAPIParser {
    /**
     * The URL of the OpenAPI specification to be parsed.
     * For a start, this only supports local file paths.
     */
    specURL;
    operations = {};
    constructor(specURL) {
        this.specURL = specURL;
    }
    async parse() {
        try {
            const api = (await SwaggerParser.default.parse(this.specURL));
            this.buildOperationsMap(api);
        }
        catch (error) {
            console.error('Error parsing OpenAPI spec:', error);
        }
    }
    parseModel(name, models) {
        const { schemas } = models;
        const model = schemas[name];
        const body = {};
        body.properties = [];
        if (model.properties === undefined) {
            body.properties.push({ ...model });
            return body;
        }
        const { properties, required, example } = model;
        Object.entries(properties).forEach(([key, property]) => {
            let bodyParam = {};
            if ("$ref" in property) {
                const name = property.$ref.split("/").pop();
                // TODO: Consider parsing inner examples if available
                // Maybe just merge to the top example
                const { properties: innerParams } = this.parseModel(name, models);
                bodyParam = {
                    ...innerParams[0]
                };
                bodyParam.name = key;
            }
            else {
                const tempProperty = property;
                bodyParam = {
                    name: key,
                    type: tempProperty.type,
                    description: tempProperty.description ?? "",
                    required: required === undefined
                        ? false
                        : required.includes(key)
                            ? true
                            : false,
                };
            }
            body.properties.push(bodyParam);
        });
        if (example !== undefined) {
            body.examples = example;
        }
        return body;
    }
    parseRequestBody(schema, models) {
        if ("$ref" in schema) {
            const name = schema.$ref.split("/").pop();
            const body = this.parseModel(name, models);
            return body;
        }
        const body = {};
        body.properties = [];
        if ("type" in schema && schema.type === "array") {
            const schemaPath = schema.items;
            const name = schemaPath.$ref.split("/").pop();
            const { properties, examples } = this.parseModel(name, models);
            const parent = {
                name: "",
                type: 'array',
                required: true,
                description: schema.description ?? "",
                children: properties
            };
            body.properties.push(parent);
            body.examples = examples;
            return body;
        }
        if ("type" in schema && schema.type === "object") {
            const [key, path] = Object.entries(schema.properties)[0];
            const schemaPath = path;
            const name = schemaPath.$ref.split("/").pop();
            const { properties, examples } = this.parseModel(name, models);
            const parent = {
                name: key,
                type: 'object',
                required: schema.required ?? false,
                description: schema.description ?? "",
                children: properties
            };
            body.properties.push(parent);
            body.examples = examples;
            return body;
        }
        if ("allOf" in schema) {
            // An object is being used here because the OAS examples are actually of
            // the object type even though they're typed as Map<string, any>
            // Also, map isn't being parsed properly when writing to file
            let mergedExamples = {};
            schema.allOf?.forEach((schema) => {
                const { properties, examples } = this.parseRequestBody(schema, models);
                body.properties.push(...properties);
                if (examples !== undefined) {
                    mergedExamples = { ...mergedExamples, ...examples };
                }
            });
            body.examples = mergedExamples;
            return body;
        }
        return {};
    }
    parseParameters(parameters) {
        let result = {
            // header: [],
            pathParameter: [],
            queryParameter: [],
        };
        parameters.forEach((parameter) => {
            const endpointParam = {
                name: parameter.name,
                description: parameter.description ?? "",
                required: parameter.required ?? false,
                schema: parameter.schema,
                example: parameter.example,
            };
            if (parameter.in === "query") {
                result.queryParameter.push(endpointParam);
            }
            if (parameter.in === "path") {
                result.pathParameter.push(endpointParam);
            }
        });
        return result;
    }
    buildOperationsMap(api) {
        const { components, paths } = api;
        Object.entries(paths).forEach(([route, path]) => {
            if (path === undefined) {
                return;
            }
            const { parameters: pathParameters, ...pathOperations } = path;
            let parameters = pathParameters ?? [];
            Object.entries(pathOperations).forEach(([method, operation]) => {
                const { summary, description, operationId, requestBody, parameters: innerParams, } = operation;
                parameters = innerParams ? [...parameters, ...innerParams] : parameters;
                const partialOperation = {
                    name: summary,
                    path: route,
                    method: method,
                    description,
                };
                if (requestBody !== undefined) {
                    const { content } = requestBody;
                    const mediaType = content["application/json"];
                    const body = mediaType.schema === undefined
                        ? {}
                        : this.parseRequestBody(mediaType.schema, components);
                    partialOperation.requestBody = body;
                }
                if (parameters && parameters !== null && parameters.length > 0) {
                    const { pathParameter, queryParameter } = this.parseParameters(parameters);
                    // partialOperation.header = header;
                    partialOperation.pathParameter = pathParameter;
                    partialOperation.queryParameter = queryParameter;
                }
                this.operations[operationId] = partialOperation;
            });
        });
    }
    getOperationById(operationId) {
        return this.operations[operationId];
    }
    getOperations() {
        return this.operations;
    }
}
exports.OpenAPIParser = OpenAPIParser;
