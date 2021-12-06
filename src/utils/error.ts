/**
 * @throws {Error}
 * @param {string} message
 */
export function error(message: string): never {
  throw new Error("[Dobby] " + message);
}
