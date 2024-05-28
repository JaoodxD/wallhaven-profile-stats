import { setTimeout as sleep } from 'node:timers/promises'

const defaultOpts = {
  tryCount: 3,
  retryDelay: 5000
}

export default function retriable (task, opts = {}) {
  opts = Object.assign(defaultOpts, opts)

  return execute

  async function execute (...args) {
    let count = 0
    while (count++ < opts.tryCount) {
      try {
        const result = await task(...args)
        return result
      } catch (err) {
        console.error(err)
        await sleep(opts.retryDelay)
        // silently return undefined
      }
    }
  }
}
