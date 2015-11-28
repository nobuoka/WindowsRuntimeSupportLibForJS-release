declare module WinRSJS {
    module Collections {
        function createMap(keyType: string, valType: string): Windows.Foundation.Collections.IMap<any, any>;
    }
    module Guid {
        function newGuid(): string;
    }
    module WindowsRuntimeBuffer {
        function create(capacity: number): Windows.Storage.Streams.IBuffer;
    }
}
declare module WinRSJS {
    var log: {
        (msg: string, tags: string, type: string): void;
    };
}
declare module WinRSJS.HResults {
    var INET_E_CANNOT_CONNECT: number;
    var INET_E_RESOURCE_NOT_FOUND: number;
    /**
     * Converts an HResult value which was evaluated as an signed 32-bit integer to an eight-digit hexadecimal string.
     * Capital letters are used for alphabets in the hexadecimal string.
     */
    function convertHResultStyleFromInt32To8DigitHexStr(int32HResult: number): string;
}
declare module WinRSJS.HttpUtils {
    interface HttpContent {
        type: Windows.Web.Http.Headers.HttpMediaTypeHeaderValue;
        data: Windows.Storage.Streams.IBuffer;
    }
    interface HttpError extends Error {
        statusCode: number;
        content: HttpContent;
    }
    interface ClientError extends Error {
        sourceError: Error;
    }
    function readContentAsync(content: Windows.Web.Http.IHttpContent): Windows.Foundation.IPromise<HttpContent>;
    function postWwwFormUrlEncodedContent(uriStr: string, data: {
        [key: string]: string;
    }): Windows.Foundation.IPromise<HttpContent>;
}
declare module WinRSJS.GoogleAnalytics {
    class ScreenInfoAccessors {
        getScreenHeight(): number;
        getScreenWidth(): number;
        getViewportHeight(): number;
        getViewportWidth(): number;
    }
    class GAClient {
        private _trackingId;
        private _appName;
        private _appVersion;
        private _clientId;
        private _isAvailable;
        private _collectUri;
        postWwwFormUrlEncodedContent: {
            (uriStr: string, data: {
                [key: string]: string;
            }): Windows.Foundation.IPromise<WinRSJS.HttpUtils.HttpContent>;
        };
        screeenInfoAccessors: ScreenInfoAccessors;
        constructor(trackingId: string, appName: string, appVersion: string, clientId: string);
        updateAvailability(isAvailable: boolean): void;
        updateClientId(clientId: string): void;
        sendAppview(screenName: string, opts?: {
            newSession?: boolean;
        }): void;
        sendEvent(category: string, action: string, label?: string, value?: number): void;
        private __sendData(data);
        private __getScreenResolution();
        private __getViewportSize();
    }
}
