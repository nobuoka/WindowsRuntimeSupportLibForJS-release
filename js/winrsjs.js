/*
Copyright 2015 Yu Nobuoka

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
var WinRSJS;
(function (WinRSJS) {
    WinRSJS.log = function () {
    };
})(WinRSJS || (WinRSJS = {}));
var WinRSJS;
(function (WinRSJS) {
    var HResults;
    (function (HResults) {
        //#region HResult values
        // HResult values, which are evaluated as an signed 32-bit integer.
        HResults.INET_E_CANNOT_CONNECT = (0x800C0004 | 0);
        HResults.INET_E_RESOURCE_NOT_FOUND = (0x800C0005 | 0);
        //#endregion HResult values
        /**
         * Converts an HResult value which was evaluated as an signed 32-bit integer to an eight-digit hexadecimal string.
         * Capital letters are used for alphabets in the hexadecimal string.
         */
        function convertHResultStyleFromInt32To8DigitHexStr(int32HResult) {
            // Evaluates `int32HResult` as an unsigned 32-bit integer, then convert it to a hexadecimal string,
            // because `int32HResult` is a HResult value, which was evaluated as an signed 32-bit integer.
            var hresultHexStr = (int32HResult < 0 ? ((int32HResult & 0x7FFFFFFF) + 0x80000000) : int32HResult).toString(16);
            // Made an eight-digit number, it may be padded by zero.
            return ("0000000" + hresultHexStr).substring(hresultHexStr.length - 1).toUpperCase();
        }
        HResults.convertHResultStyleFromInt32To8DigitHexStr = convertHResultStyleFromInt32To8DigitHexStr;
    })(HResults = WinRSJS.HResults || (WinRSJS.HResults = {}));
})(WinRSJS || (WinRSJS = {}));
var WinRSJS;
(function (WinRSJS) {
    var HttpUtils;
    (function (HttpUtils) {
        var Http = Windows.Web.Http;
        var Uri = Windows.Foundation.Uri;
        function readContentAsync(content) {
            return content.readAsBufferAsync().then(function (buffer) {
                return {
                    type: content.headers.contentType,
                    data: buffer,
                };
            });
        }
        HttpUtils.readContentAsync = readContentAsync;
        function postWwwFormUrlEncodedContent(uriStr, data) {
            var reqMethod = Http.HttpMethod.post;
            var uri = new Uri(uriStr);
            var httpClient = new Http.HttpClient();
            var req = new Http.HttpRequestMessage(reqMethod, uri);
            req.content = __constructRequestContent(data);
            var res;
            var p = httpClient.sendRequestAsync(req).then(function (r) {
                res = r;
                if (r.statusCode === Http.HttpStatusCode.ok) {
                    return readContentAsync(r.content);
                }
                else {
                    return readContentAsync(r.content).then(function (content) {
                        var err = Object.create(Error, {
                            statusCode: { value: r.statusCode },
                        });
                        err.name = "HttpError";
                        err.message = "Failed to request post message. (status code: " + r.statusCode + ")";
                        err.content = content;
                        throw err;
                    });
                }
            }, (function (e) {
                var err = Object.create(Error, {
                    sourceError: { value: e },
                });
                err.name = "ClientError";
                err.message = "Failed to connect.";
                throw err;
            }));
            // finally
            p.then(null, function () {
            }).then(function () {
                if (res)
                    res.close();
                req.close();
                httpClient.close();
            });
            return p;
        }
        HttpUtils.postWwwFormUrlEncodedContent = postWwwFormUrlEncodedContent;
        function __constructRequestContent(reqBodyObj) {
            var map = WinRSJS.Collections.createMap("System.String", "System.String");
            Object.keys(reqBodyObj).forEach(function (k) {
                map.insert(k, reqBodyObj[k]);
            });
            return new Http.HttpFormUrlEncodedContent(map);
        }
    })(HttpUtils = WinRSJS.HttpUtils || (WinRSJS.HttpUtils = {}));
})(WinRSJS || (WinRSJS = {}));
var WinRSJS;
(function (WinRSJS) {
    var GoogleAnalytics;
    (function (GoogleAnalytics) {
        var ScreenInfoAccessors = (function () {
            function ScreenInfoAccessors() {
            }
            ScreenInfoAccessors.prototype.getScreenHeight = function () {
                return screen.height;
            };
            ScreenInfoAccessors.prototype.getScreenWidth = function () {
                return screen.width;
            };
            ScreenInfoAccessors.prototype.getViewportHeight = function () {
                return document.documentElement.clientHeight;
            };
            ScreenInfoAccessors.prototype.getViewportWidth = function () {
                return document.documentElement.clientWidth;
            };
            return ScreenInfoAccessors;
        })();
        GoogleAnalytics.ScreenInfoAccessors = ScreenInfoAccessors;
        var GAClient = (function () {
            function GAClient(trackingId, appName, appVersion, clientId) {
                this._isAvailable = true;
                this._collectUri = "http://www.google-analytics.com/collect";
                this._trackingId = trackingId;
                this._appName = appName;
                this._appVersion = appVersion;
                this._clientId = clientId;
                this.postWwwFormUrlEncodedContent = WinRSJS.HttpUtils.postWwwFormUrlEncodedContent;
                this.screeenInfoAccessors = new ScreenInfoAccessors();
            }
            GAClient.prototype.updateAvailability = function (isAvailable) {
                this._isAvailable = isAvailable;
                WinRSJS.log("update availability: " + this._isAvailable, "analytics", "debug");
            };
            GAClient.prototype.updateClientId = function (clientId) {
                this._clientId = clientId;
            };
            GAClient.prototype.sendAppview = function (screenName, opts) {
                if (!opts)
                    opts = {};
                var data = {
                    v: "1",
                    tid: this._trackingId,
                    cid: this._clientId,
                    t: "appview",
                    an: this._appName,
                    av: this._appVersion,
                    cd: screenName,
                    sr: this.__getScreenResolution(),
                    vp: this.__getViewportSize(),
                };
                if (opts.newSession)
                    data["sc"] = "start";
                this.__sendData(data);
            };
            GAClient.prototype.sendEvent = function (category, action, label, value) {
                var data = {
                    v: "1",
                    tid: this._trackingId,
                    cid: this._clientId,
                    t: "event",
                    an: this._appName,
                    av: this._appVersion,
                };
                if (category)
                    data["ec"] = category;
                if (action)
                    data["ea"] = action;
                if (label)
                    data["el"] = label;
                if (value !== undefined) {
                    // Event value must be non-negative integer.
                    // See: https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#ev
                    if (value >= 0) {
                        data["ev"] = String(Math.floor(value));
                    }
                }
                this.__sendData(data);
            };
            GAClient.prototype.__sendData = function (data) {
                if (!this._isAvailable) {
                    WinRSJS.log("Not sending data because of being disabled", "analytics", "info");
                    return;
                }
                this.postWwwFormUrlEncodedContent(this._collectUri, data).then(function (res) {
                    WinRSJS.log("Success on sending data", "analytics", "debug");
                }, function (err) {
                    if (err.name === "HttpError") {
                        var httpError = err;
                        WinRSJS.log("Error on sending data (status code: " + httpError.statusCode + ")", "analytics", "error");
                    }
                    else if (err.name === "ClientError") {
                        var clientError = err;
                        // See: https://msdn.microsoft.com/ja-jp/library/windows/apps/dn263211.aspx
                        var sourceError = clientError.sourceError;
                        var hresult = sourceError.number;
                        var hresultHexStr = "0x" + WinRSJS.HResults.convertHResultStyleFromInt32To8DigitHexStr(hresult);
                        if (hresult === WinRSJS.HResults.INET_E_RESOURCE_NOT_FOUND || hresult === WinRSJS.HResults.INET_E_CANNOT_CONNECT) {
                            WinRSJS.log("Cannot connect to the server", "analytics", "error");
                        }
                        else {
                            WinRSJS.log("Failed to connect: " + hresultHexStr, "analytics", "error");
                        }
                    }
                    else {
                        WinRSJS.log("Unknown error: " + err, "analytics", "error");
                    }
                });
            };
            GAClient.prototype.__getScreenResolution = function () {
                return this.screeenInfoAccessors.getScreenWidth() + "x" + this.screeenInfoAccessors.getScreenHeight();
            };
            GAClient.prototype.__getViewportSize = function () {
                return this.screeenInfoAccessors.getViewportWidth() + "x" + this.screeenInfoAccessors.getViewportHeight();
            };
            return GAClient;
        })();
        GoogleAnalytics.GAClient = GAClient;
    })(GoogleAnalytics = WinRSJS.GoogleAnalytics || (WinRSJS.GoogleAnalytics = {}));
})(WinRSJS || (WinRSJS = {}));
