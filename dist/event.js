"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const monitor_1 = tslib_1.__importDefault(require("./monitor"));
class JobEvent {
    constructor(key, _api, options = {}) {
        if (!key)
            throw new Error("You must initialize Event with a key.");
        this._state = { count: 0, errorCount: 0 };
        this.monitor = new monitor_1.default(key);
        this.intervalSeconds = Math.max(options.intervalSeconds || 60, 1);
        this.intervalId = setInterval(this._flush.bind(this), this.intervalSeconds * 1000);
    }
    tick(count = 1) {
        this._state.count += count;
    }
    error(count = 1) {
        this._state.errorCount += 1;
    }
    async stop() {
        clearInterval(this.intervalId);
        this.intervalId = null;
        return this._flush();
    }
    async fail(message = null) {
        this.stop();
        this.monitor.ping({ state: monitor_1.default.State.FAIL, message });
    }
    async _flush() {
        const count = this._state.count;
        const error_count = this._state.errorCount;
        this._state.count = 0;
        this._state.errorCount = 0;
        return this.monitor.ping({ metrics: { error_count, count, duration: this.intervalSeconds } });
    }
}
exports.default = JobEvent;
//# sourceMappingURL=event.js.map