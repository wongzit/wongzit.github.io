import { parseGaussian } from './parser.js';
self.onmessage = ({ data }) => {
  try {
    self.postMessage({ id: data.id, result: parseGaussian(data.text, data.filename) });
  } catch (error) {
    self.postMessage({ id: data.id, error: error.message || 'Unable to read this output.' });
  }
};
