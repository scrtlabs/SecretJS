// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v1.178.0
//   protoc               v3.21.3
// source: cosmos/base/reflection/v1beta1/reflection.proto

/* eslint-disable */
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "cosmos.base.reflection.v1beta1";

/** ListAllInterfacesRequest is the request type of the ListAllInterfaces RPC. */
export interface ListAllInterfacesRequest {
}

/** ListAllInterfacesResponse is the response type of the ListAllInterfaces RPC. */
export interface ListAllInterfacesResponse {
  /** interface_names is an array of all the registered interfaces. */
  interface_names: string[];
}

/**
 * ListImplementationsRequest is the request type of the ListImplementations
 * RPC.
 */
export interface ListImplementationsRequest {
  /** interface_name defines the interface to query the implementations for. */
  interface_name: string;
}

/**
 * ListImplementationsResponse is the response type of the ListImplementations
 * RPC.
 */
export interface ListImplementationsResponse {
  implementation_message_names: string[];
}

function createBaseListAllInterfacesRequest(): ListAllInterfacesRequest {
  return {};
}

export const ListAllInterfacesRequest = {
  encode(_: ListAllInterfacesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListAllInterfacesRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListAllInterfacesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): ListAllInterfacesRequest {
    return {};
  },

  toJSON(_: ListAllInterfacesRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<ListAllInterfacesRequest>): ListAllInterfacesRequest {
    return ListAllInterfacesRequest.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<ListAllInterfacesRequest>): ListAllInterfacesRequest {
    const message = createBaseListAllInterfacesRequest();
    return message;
  },
};

function createBaseListAllInterfacesResponse(): ListAllInterfacesResponse {
  return { interface_names: [] };
}

export const ListAllInterfacesResponse = {
  encode(message: ListAllInterfacesResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.interface_names) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListAllInterfacesResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListAllInterfacesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.interface_names.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListAllInterfacesResponse {
    return {
      interface_names: globalThis.Array.isArray(object?.interface_names)
        ? object.interface_names.map((e: any) => globalThis.String(e))
        : [],
    };
  },

  toJSON(message: ListAllInterfacesResponse): unknown {
    const obj: any = {};
    if (message.interface_names?.length) {
      obj.interface_names = message.interface_names;
    }
    return obj;
  },

  create(base?: DeepPartial<ListAllInterfacesResponse>): ListAllInterfacesResponse {
    return ListAllInterfacesResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ListAllInterfacesResponse>): ListAllInterfacesResponse {
    const message = createBaseListAllInterfacesResponse();
    message.interface_names = object.interface_names?.map((e) => e) || [];
    return message;
  },
};

function createBaseListImplementationsRequest(): ListImplementationsRequest {
  return { interface_name: "" };
}

export const ListImplementationsRequest = {
  encode(message: ListImplementationsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.interface_name !== "") {
      writer.uint32(10).string(message.interface_name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListImplementationsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListImplementationsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.interface_name = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListImplementationsRequest {
    return { interface_name: isSet(object.interface_name) ? globalThis.String(object.interface_name) : "" };
  },

  toJSON(message: ListImplementationsRequest): unknown {
    const obj: any = {};
    if (message.interface_name !== "") {
      obj.interface_name = message.interface_name;
    }
    return obj;
  },

  create(base?: DeepPartial<ListImplementationsRequest>): ListImplementationsRequest {
    return ListImplementationsRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ListImplementationsRequest>): ListImplementationsRequest {
    const message = createBaseListImplementationsRequest();
    message.interface_name = object.interface_name ?? "";
    return message;
  },
};

function createBaseListImplementationsResponse(): ListImplementationsResponse {
  return { implementation_message_names: [] };
}

export const ListImplementationsResponse = {
  encode(message: ListImplementationsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.implementation_message_names) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListImplementationsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListImplementationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.implementation_message_names.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListImplementationsResponse {
    return {
      implementation_message_names: globalThis.Array.isArray(object?.implementation_message_names)
        ? object.implementation_message_names.map((e: any) => globalThis.String(e))
        : [],
    };
  },

  toJSON(message: ListImplementationsResponse): unknown {
    const obj: any = {};
    if (message.implementation_message_names?.length) {
      obj.implementation_message_names = message.implementation_message_names;
    }
    return obj;
  },

  create(base?: DeepPartial<ListImplementationsResponse>): ListImplementationsResponse {
    return ListImplementationsResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ListImplementationsResponse>): ListImplementationsResponse {
    const message = createBaseListImplementationsResponse();
    message.implementation_message_names = object.implementation_message_names?.map((e) => e) || [];
    return message;
  },
};

/** ReflectionService defines a service for interface reflection. */
export interface ReflectionService {
  /**
   * ListAllInterfaces lists all the interfaces registered in the interface
   * registry.
   */
  ListAllInterfaces(request: ListAllInterfacesRequest): Promise<ListAllInterfacesResponse>;
  /**
   * ListImplementations list all the concrete types that implement a given
   * interface.
   */
  ListImplementations(request: ListImplementationsRequest): Promise<ListImplementationsResponse>;
}

export const ReflectionServiceServiceName = "cosmos.base.reflection.v1beta1.ReflectionService";
export class ReflectionServiceClientImpl implements ReflectionService {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || ReflectionServiceServiceName;
    this.rpc = rpc;
    this.ListAllInterfaces = this.ListAllInterfaces.bind(this);
    this.ListImplementations = this.ListImplementations.bind(this);
  }
  ListAllInterfaces(request: ListAllInterfacesRequest): Promise<ListAllInterfacesResponse> {
    const data = ListAllInterfacesRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ListAllInterfaces", data);
    return promise.then((data) => ListAllInterfacesResponse.decode(_m0.Reader.create(data)));
  }

  ListImplementations(request: ListImplementationsRequest): Promise<ListImplementationsResponse> {
    const data = ListImplementationsRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "ListImplementations", data);
    return promise.then((data) => ListImplementationsResponse.decode(_m0.Reader.create(data)));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
