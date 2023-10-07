import PQueue from 'p-queue'

const DEFAULT = {
  INTERVAL: 0,
  INTERVAL_CAP: 0,
  LOG_EXECUTION_TIME: false
}

export default function rateLimiter (fn, opts = {}) {
  const interval = opts.interval ?? DEFAULT.INTERVAL
  const intervalCap = opts.intervalCap ?? DEFAULT.INTERVAL_CAP
  const logExecTime = opts.logExecTime ?? DEFAULT.LOG_EXECUTION_TIME
  let callId = 0

  const queue = new PQueue({ interval, intervalCap })

  return execute

  async function execute (...args) {
    const id = callId++
    if (logExecTime) console.time(id)
    const result = await queue.add(() => fn(...args))
    if (logExecTime) console.timeEnd(id)
    return result
  }
}
