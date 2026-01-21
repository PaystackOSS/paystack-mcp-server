import * as SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPIV3 } from 'openapi-types';
import { Oas } from './types';

export class OpenAPIParser {
  /**
   * The URL of the OpenAPI specification to be parsed.
   * For a start, this only supports local file paths.
   */
  private specURL: string;
  private operations: Oas.PathsOperations = {};

  constructor(specURL: string) {
    this.specURL = specURL;
  }

  async parse() {
    try {
      const api = (await SwaggerParser.default.parse(
        this.specURL
      )) as OpenAPIV3.Document;
      this.buildOperationsMap(api);
    } catch (error) {
      console.error('Error parsing OpenAPI spec:', error);
    }
  }

  private parseModel(
    name: string,
    models: OpenAPIV3.ComponentsObject,
  ): Oas.Body {
    const { schemas } = models!
    const model = schemas![name] as OpenAPIV3.SchemaObject;
    const body = {} as Oas.Body;
    body.properties = []

    if (model.properties === undefined) {
      body.properties.push({ ...model as Oas.BodyParam })
      return body
    }

    const { properties, required, example } = model;

    Object.entries(properties).forEach(([key, property]) => {
      let bodyParam = {} as Oas.BodyParam

      if ("$ref" in property) {
        const name = property.$ref.split("/").pop()!;
        // TODO: Consider parsing inner examples if available
        // Maybe just merge to the top example
        const { properties: innerParams } = this.parseModel(name, models)

        bodyParam = {
          ...innerParams[0]
        }
        bodyParam.name = key
      } else {
        const tempProperty = property as OpenAPIV3.SchemaObject
        bodyParam = {
          name: key,
          type: tempProperty.type!,
          description: tempProperty.description ?? "",
          required:
            required === undefined
              ? false
              : required.includes(key)
                ? true
                : false,
        };
      }

      body.properties.push(bodyParam);
    });

    if (example !== undefined) {
      body.examples = example as Map<string, any>
    }
    return body;
  }

  private parseRequestBody(
    schema: Oas.PropertySchema,
    models: OpenAPIV3.ComponentsObject,
  ): Oas.Body {

    if ("$ref" in schema) {
      const name = schema.$ref.split("/").pop()!;
      const body = this.parseModel(name, models);

      return body;
    }
    const body = {} as Oas.Body
    body.properties = []

    if ("type" in schema && schema.type === "array") {
      const schemaPath = schema.items as OpenAPIV3.ReferenceObject;
      const name = schemaPath.$ref.split("/").pop()

      const { properties, examples } = this.parseModel(name!, models)
      const parent = {
        name: "",
        type: 'array',
        required: true,
        description: schema.description ?? "",
        children: properties
      } as Oas.BodyParam

      body.properties.push(parent)
      body.examples = examples

      return body;
    }

    if ("type" in schema && schema.type === "object") {
      const [key, path] = Object.entries(schema.properties!)[0];
      const schemaPath = path as OpenAPIV3.ReferenceObject
      const name = schemaPath.$ref.split("/").pop()!;
      const { properties, examples } = this.parseModel(name, models)
      const parent = {
        name: key,
        type: 'object',
        required: schema.required ?? false,
        description: schema.description ?? "",
        children: properties
      } as Oas.BodyParam

      body.properties.push(parent)
      body.examples = examples

      return body;
    }

    if ("allOf" in schema) {
      // An object is being used here because the OAS examples are actually of
      // the object type even though they're typed as Map<string, any>
      // Also, map isn't being parsed properly when writing to file
      let mergedExamples = {}

      schema.allOf?.forEach((schema) => {
        const { properties, examples } = this.parseRequestBody(schema, models)
        body.properties.push(...properties)

        if (examples !== undefined) {
          mergedExamples = { ...mergedExamples, ...examples }
        }
      });

      body.examples = mergedExamples as Map<string, any>

      return body
    }

    return {} as Oas.Body;
  }

  private parseParameters(
    parameters: OpenAPIV3.ParameterObject[]
  ): Oas.RequestParameter {
    let result: Oas.RequestParameter = {
      // header: [],
      pathParameter: [],
      queryParameter: [],
    };

    parameters.forEach((parameter) => {
      const endpointParam: Oas.EndpointParam = {
        name: parameter.name,
        description: parameter.description ?? "",
        required: parameter.required ?? false,
        schema: parameter.schema as OpenAPIV3.SchemaObject,
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

  private buildOperationsMap(api: OpenAPIV3.Document) {
    const { components, paths } = api;

    Object.entries(paths).forEach(([route, path]) => {
      if (path === undefined) {
        return;
      }

      const { parameters: pathParameters, ...pathOperations } = path;
      let parameters = pathParameters ?? [];

      Object.entries(pathOperations).forEach(([method, operation]) => {
        const {
          summary,
          description,
          operationId,
          requestBody,
          parameters: innerParams,
        } = operation as OpenAPIV3.OperationObject;

        parameters = innerParams ? [...parameters, ...innerParams] : parameters;

        const partialOperation: Partial<Oas.Operation> = {
          name: summary,
          path: route,
          method: method as OpenAPIV3.HttpMethods,
          description,
        };

        if (requestBody !== undefined) {
          const { content } = requestBody as OpenAPIV3.RequestBodyObject;
          const mediaType = content["application/json"];

          const body =
            mediaType.schema === undefined
              ? {} as Oas.Body
              : this.parseRequestBody(mediaType.schema, components!);

          partialOperation.requestBody = body
        }

        if (parameters && parameters !== null && parameters.length > 0) {
          const { pathParameter, queryParameter } =
            this.parseParameters(parameters as OpenAPIV3.ParameterObject[]);

          // partialOperation.header = header;
          partialOperation.pathParameter = pathParameter;
          partialOperation.queryParameter = queryParameter;
        }

        this.operations[operationId!] = partialOperation
      });
    });
  }


  getOperationById(operationId: string): Partial<Oas.Operation> | undefined {
     return this.operations[operationId];
  }

  getOperations(): Record<string, Partial<Oas.Operation>> {
    return this.operations;
  }
}