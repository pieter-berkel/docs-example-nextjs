import { customAlphabet } from "nanoid";

const alpabet = "0123456789abcdefghijklmnopqrstuvwxyz";
export const nanoid = customAlphabet(alpabet, 16);
