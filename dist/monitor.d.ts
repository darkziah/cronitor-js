import { CronitorApi } from "./statuz";
interface MonitorParams {
    host?: string;
    series?: string;
    message?: string;
    state?: string;
    env?: string;
    metrics?: string;
}
declare class Monitor {
    _api: CronitorApi;
    private key;
    static _api: CronitorApi;
    constructor(key: string);
    static get State(): {
        RUN: string;
        COMPLETE: string;
        FAIL: string;
        OK: string;
    };
    data(): Promise<void>;
    pause(hours: any): Promise<void>;
    unpause(): Promise<void>;
    ok(params: any): Promise<boolean>;
    delete(): Promise<boolean>;
    ping(params?: {}): Promise<boolean>;
    _cleanParams(params?: MonitorParams): {
        type: string;
        state: string;
        message: string;
        metric: any;
        series: string;
        host: string;
        stamp: number;
        env: string;
    };
}
export default Monitor;
