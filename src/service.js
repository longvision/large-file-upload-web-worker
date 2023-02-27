export default class Service {

  processFile({ query, file, onOcurrenceUpdate, onProgress }) {
    const linesLength = { counter: 0 }
    const progressFn = this.#setupProgress(file.size, onProgress)
    const startedAt = performance.now()
    const elapsed = () => `${((performance.now() - startedAt) / 1000).toFixed(2)} secs`

    const onUpdate = () => {
      return (found) => {
        onOcurrenceUpdate({
          found,
          took: elapsed(),
          linesLength: linesLength.counter
        })

      }
    }

    file.stream()
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(this.#csvToJSON({ linesLength, progressFn }))
      .pipeTo(this.#findOcurrencies({ query, onOcurrenceUpdate: onUpdate() }))
  }

  #csvToJSON({ linesLength, progressFn }) {
    let columns = []
    let ndjsonBuffer = ''
    return new TransformStream({
      transform(chunk, controller) {
        progressFn(chunk.length)

        if (!columns.length) {
          const [firstLine, ...restLines] = chunk.split('\n')
          columns = firstLine.split(',')
          chunk = restLines.join('\n')
          linesLength.counter += 1
        }

        ndjsonBuffer += chunk

        const lines = ndjsonBuffer.split('\n')

        linesLength.counter += lines.length - 1;

        lines.slice(0, -1).forEach(line => controller.enqueue(((values) => {
          return columns.reduce((curr, next, index) => ({
            ...curr,
            [next]: values[index],
          }), {})
        })(line.split(','))))

        ndjsonBuffer = lines[lines.length - 1]
      },
    })
  }

  #findOcurrencies({ query, onOcurrenceUpdate }) {
    const queryKeys = Object.keys(query)
    let found = {}

    return new WritableStream({
      write(jsonLine) {
        for (const keyIndex in queryKeys) {
          const key = queryKeys[keyIndex]
          const queryValue = query[key]
          found[queryValue] = found[queryValue] ?? 0
          if (queryValue.test(jsonLine[key])) {
            found[queryValue]++
            onOcurrenceUpdate(found)
          }
        }
      },
      close: () => onOcurrenceUpdate(found)
    })
  }
  #setupProgress(totalBytes, onProgress) {
    let totalUploaded = 0
    onProgress(0)

    return (chunkLength) => {
      totalUploaded += chunkLength
      const total = 100 / totalBytes * totalUploaded
      onProgress(total)
    }
  }
}