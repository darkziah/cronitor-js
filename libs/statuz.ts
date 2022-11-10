import axios, { AxiosInstance } from "axios"
import Monitor from './monitor'
import Event from './event'
import nodeCron, { type ScheduledTask, type ScheduleOptions } from 'node-cron';

const CONFIG_KEYS = ['api_key', 'api_version', 'environment']
const MONITOR_TYPES = ['job', 'heartbeat', 'check']
const YAML_KEYS = [...CONFIG_KEYS, ...MONITOR_TYPES.map(t => `${t}s`)]

interface CronitorConfig {
    config?: string
    apiVersion?: string
    environment?: string
}

interface CronitorWraps {
    schedule?: (cronExpression: string, func: ((now: Date | "manual") => void) | string, options?: {}) => any
    job?: (func: ((now: Date | "manual") => void) | string, options?: {}) => any
    name?: string
}

export interface CronitorApi {
    key: string
    version: string
    env?: string
    pingUrl: (key: string) => string
    monitorUrl: (key: string) => string
    axios: AxiosInstance
}

const C = {
    monitor: Monitor
}


class Cronitor {

    public cronNodeSchedule: {
        schedule(cronExpression: string, func: ((now: Date | "manual") => void) | string, options?: ScheduleOptions): ScheduledTask
    }

    private _api: CronitorApi
    headers: { 'User-Agent': string; Authorization: string }

    public Monitor = Monitor
    public Event = Event

    constructor(apiKey: string, config: CronitorConfig = {}) {

        this.headers = {
            'User-Agent': 'cronitor-js',
            'Authorization': `Bearer ${apiKey}`
        }

        this._api = {
            key: apiKey,
            version: '1',
            env: config.environment || null,
            pingUrl: (key) => `http://localhost:5010/ping/${apiKey}/${key}`,
            monitorUrl: (key) => `http://localhost:5010/monitor/${apiKey}/${key}`,
            axios: axios.create({
                baseURL: '',
                timeout: 5000,
                headers: this.headers,
            })
        }

        this.Event = Event
        this.Monitor = Monitor
        this.Event._api = this._api
        this.Monitor._api = this._api


    }




    public generateConfig = async function () {
        throw new Error("generateConfig not implemented. Contact support@cronitor.io and we will help.")
    }

    public validateConfig = async function () {
        return this.applyConfig(true)
    }

    private wrap = function (key: string, callback: Function) {
        let monitor = new this.Monitor(key)
        monitor._api = this._api
        

        return async function () {
            const series = Cronitor.newSeries()

            await monitor.ping({ state: Monitor.State.RUN, series })
            try {
                let out = await Promise.resolve(callback())
                let message = typeof out == 'string' ? out.slice(-1600) : null
                await monitor.ping({ state: Monitor.State.COMPLETE, message, series })
                return out
            } catch (e) {
                await monitor.ping({ state: Monitor.State.FAIL, message: e, series })
            }
        }
    }

    public wraps = function (lib: CronitorWraps) {
        // https://github.com/node-cron/node-cron

        this.cronNodeSchedule = lib

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

    }

    public job = function (key: string, schedule: string, cb: Function, options?: ScheduleOptions) {

        const job = this.wrap(key, cb)
        return nodeCron.schedule(schedule, job)

    }

    static newSeries = function () {
        return Math.abs((Math.random() * 0xFFFFFFFF << 0)).toString(16).padStart(8, '0')
    }
}

export default Cronitor

// module.exports = Cronitor
// // expose constructor as a named property to enable mocking with Sinon.JS
// module.exports.Cronitor = Cronitor
// module.exports.default = Cronitor
