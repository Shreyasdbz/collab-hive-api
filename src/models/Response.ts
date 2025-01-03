export enum ServiceResponseType {
    SUCCESS = 'success',
    UNAUTHORIZED = 'unauthorized',
    FORBIDDEN = 'forbidden',
    BAD_REQUEST = 'bad_request',
    NOT_FOUND = 'not_found',
    INTERNAL_SERVER_ERROR = 'internal_server_error',
}

export type ServiceResponseSuccess<T> = {
    type: ServiceResponseType.SUCCESS;
    data: T;
};

export type ServiceResponseError = {
    type:
        | ServiceResponseType.UNAUTHORIZED
        | ServiceResponseType.BAD_REQUEST
        | ServiceResponseType.FORBIDDEN
        | ServiceResponseType.NOT_FOUND
        | ServiceResponseType.INTERNAL_SERVER_ERROR;
    message: string;
};

export type ServiceResponse<T> =
    | ServiceResponseSuccess<T>
    | ServiceResponseError;
