import fs from 'fs';
export declare const src: string;
export declare const dist: string;
export declare const stringToDOM: (s: string) => HTMLElement[];
/**
 * Import a html file as `HTMLElement[]`
 * @param pathToFile Path relative to `src`
 */
export declare const useHTML: (pathToFile: string) => HTMLElement[];
export declare const useCSS: (path: fs.PathLike) => void;
export declare type Route = [Element[], string];
export declare const useRoutes: (routes: Route[]) => void;
