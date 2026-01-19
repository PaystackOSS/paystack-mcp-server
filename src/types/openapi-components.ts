import { OpenAPIV3 } from "openapi-types";


export interface Operation {
  // tag: string;
  name: string;
  path: string;
  method: OpenAPIV3.HttpMethods;
  description: string;
  // operationId: string;
  queryParameter: EndpointParam[]
  pathParameter: EndpointParam[]
  requestBody: Body;
  // requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject;
  // responses: OpenAPIV3.ResponsesObject;
}

export type EndpointParam = {
  name: string
  description: string
  required: boolean
  schema: OpenAPIV3.SchemaObject
  example: any
}

export type BodyParam = {
  name: string
  type: string
  description: string
  items?: OpenAPIV3.SchemaObject
  required?: boolean
  example?: any
  children?: BodyParam[]
}

export type Body = {
  properties: BodyParam[]
  examples: Map<string, any>
}

export type RequestParameter = {
  // header: EndpointParam[]
  queryParameter: EndpointParam[]
  pathParameter: EndpointParam[]
}

export type BaseEndpoint = {
  id: string
  name: string
  description: string
  path: string
  method: OpenAPIV3.HttpMethods
  body: Body
}

export type Endpoint = BaseEndpoint & RequestParameter
export type PathsOperations = Record<string, Partial<Operation>>;
export type PropertySchema = OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;

// export type OperationDetails = {
//   path: string;
//   method: HttpMethod;
// }