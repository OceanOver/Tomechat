// Drain an error stream so the connection can be released; body is intentionally discarded.
export const debugStream = async (stream: ReadableStream) => {
  const reader = stream.getReader();
  let done = false;
  while (!done) {
    const chunk = await reader.read();
    done = chunk.done;
  }
};
