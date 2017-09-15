import { Delete } from "./delete";
import { Insert } from "./insert";
import { Text } from "./text";
export declare function snapshot(text: Text): Text;
export declare type Operation = Insert | Delete;
export declare function toArray(text: Text): string[];
export declare function operationToArray(data: string[], op: Operation): string[];
export declare function toString(value: string[]): string;
export declare function renderString(text: Text): string;
