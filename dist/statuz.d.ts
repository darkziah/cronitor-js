import { AxiosInstance } from "axios";
import Monitor from './monitor';
import Event from './event';
import nodeCron, { type ScheduledTask, type ScheduleOptions } from 'node-cron';
interface CronitorConfig {
    config?: string;
    apiVersion?: string;
    environment?: string;
}
interface CronitorWraps {
    schedule?: (cronExpression: string, func: ((now: Date | "manual") => void) | string, options?: {}) => any;
    job?: (func: ((now: Date | "manual") => void) | string, options?: {}) => any;
    name?: string;
}
export interface CronitorApi {
    key: string;
    version: string;
    env?: string;
    pingUrl: (key: string) => string;
    monitorUrl: (key: string) => string;
    axios: AxiosInstance;
}
declare class Cronitor {
    cronNodeSchedule: {
        schedule(cronExpression: string, func: ((now: Date | "manual") => void) | string, options?: ScheduleOptions): ScheduledTask;
    };
    private _api;
    headers: {
        'User-Agent': string;
        Authorization: string;
    };
    Monitor: typeof Monitor;
    Event: typeof Event;
    constructor(apiKey: string, config?: CronitorConfig);
    generateConfig: () => Promise<never>;
    validateConfig: () => Promise<any>;
    private wrap;
    wraps: (lib: CronitorWraps) => void;
    job: (key: string, schedule: string, cb: Function, options?: ScheduleOptions) => nodeCron.ScheduledTask;
    static newSeries: () => string;
}
export default Cronitor;
