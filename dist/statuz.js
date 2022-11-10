"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const monitor_1 = tslib_1.__importDefault(require("./monitor"));
const event_1 = tslib_1.__importDefault(require("./event"));
const node_cron_1 = tslib_1.__importDefault(require("node-cron"));
const CONFIG_KEYS = ['api_key', 'api_version', 'environment'];
const MONITOR_TYPES = ['job', 'heartbeat', 'check'];
const YAML_KEYS = [...CONFIG_KEYS, ...MONITOR_TYPES.map(t => `${t}s`)];
const C = {
    monitor: monitor_1.default
};
class Cronitor {
    constructor(apiKey, config = {}) {
        this.Monitor = monitor_1.default;
        this.Event = event_1.default;
        this.generateConfig = async function () {
            throw new Error("generateConfig not implemented. Contact support@cronitor.io and we will help.");
        };
        this.validateConfig = async function () {
            return this.applyConfig(true);
        };
        this.wrap = function (key, callback) {
            let monitor = new this.Monitor(key);
            monitor._api = this._api;
            return async function () {
                const series = Cronitor.newSeries();
                await monitor.ping({ state: monitor_1.default.State.RUN, series });
                try {
                    let out = await Promise.resolve(callback());
                    let message = typeof out == 'string' ? out.slice(-1600) : null;
                    await monitor.ping({ state: monitor_1.default.State.COMPLETE, message, series });
                    return out;
                }
                catch (e) {
                    await monitor.ping({ state: monitor_1.default.State.FAIL, message: e, series });
                }
            };
        };
        this.wraps = function (lib) {
            // https://github.com/node-cron/node-cron
            this.cronNodeSchedule = lib;
            // if (!!lib.schedule) {
            //     this.schedule = function (key, schedule, cb, options) {
            //         const job = this.wrap(key, cb)
            //         return lib.schedule(schedule, job, options)
            //     }
            // } else if (!!lib.job) { // https://github.com/kelektiv/node-cron
            //     this.job = function (key, schedule, cb) {
            //         const wrapped = this.wrap(key, cb)
            //         return lib.job(schedule, wrapped)
            //     }
            //     this.schedule = function (key, schedule, cb) {
            //         const job = this.job(key, schedule, cb)
            //         job.start()
            //     }
            // } else {
            //     throw new Errors.ConfigError(`Unsupported library ${lib.name}`)
            // }
        };
        this.job = function (key, schedule, cb, options) {
            const job = this.wrap(key, cb);
            return node_cron_1.default.schedule(schedule, job);
        };
        this.headers = {
            'User-Agent': 'cronitor-js',
            'Authorization': `Bearer ${apiKey}`
        };
        this._api = {
            key: apiKey,
            version: '1',
            env: config.environment || null,
            pingUrl: (key) => `http://localhost:5010/ping/${apiKey}/${key}`,
            monitorUrl: (key) => `http://localhost:5010/monitor/${apiKey}/${key}`,
            axios: axios_1.default.create({
                baseURL: '',
                timeout: 5000,
                headers: this.headers,
            })
        };
        this.Event = event_1.default;
        this.Monitor = monitor_1.default;
        this.Event._api = this._api;
        this.Monitor._api = this._api;
    }
}
Cronitor.newSeries = function () {
    return Math.abs((Math.random() * 0xFFFFFFFF << 0)).toString(16).padStart(8, '0');
};
exports.default = Cronitor;
// module.exports = Cronitor
// // expose constructor as a named property to enable mocking with Sinon.JS
// module.exports.Cronitor = Cronitor
// module.exports.default = Cronitor
//# sourceMappingURL=statuz.js.map