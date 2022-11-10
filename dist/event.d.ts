/// <reference types="node" />
import { CronitorApi } from './statuz';
interface EventOption {
    intervalSeconds?: number;
}
declare class JobEvent {
    private _state;
    monitor: any;
    intervalSeconds: number;
    intervalId: NodeJS.Timer;
    static _api: CronitorApi;
    constructor(key: string, _api: CronitorApi, options?: EventOption);
    tick(count?: number): void;
    error(count?: number): void;
    stop(): Promise<any>;
    fail(message?: any): Promise<void>;
    _flush(): Promise<any>;
}
export default JobEvent;
