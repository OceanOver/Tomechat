// Short, non-secure ids are enough for client-side record keys; crypto-grade
// ids come from `uuid` below.
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

export const shortId = (size = 8): string => {
  let id = '';
  for (let i = 0; i < size; i += 1) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return id;
};

export { v4 as uuid } from 'uuid';
