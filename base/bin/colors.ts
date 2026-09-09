/** Whether the terminal is one that wants escape codes in it. */
const colors = !!process.stdout.isTTY && !process.env.NO_COLOR;

const paint = (code: string, text: string) =>
  colors ? `\x1b[${code}m${text}\x1b[0m` : text;

export const green = (text: string) => paint("32", text);
export const red = (text: string) => paint("31", text);
export const dim = (text: string) => paint("2", text);
