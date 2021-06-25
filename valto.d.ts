import { JSDOM } from 'jsdom';
/**
 * Gets the DOM of the html file
 * @param pathToFile Path relative to `src`
 */
export declare const getDOM: (pathToFile: string) => JSDOM;
/**
 * Gets the `window` of the html file
 * @param pathToFile Path relative to `src`
 */
export declare const getWindow: (pathToFile: string) => import("jsdom").DOMWindow;
/**
 * Gets the `document` of the html file
 * @param pathToFile Path relative to `src`
 */
export declare const getDocument: (pathToFile: string) => Document;
export declare const stringToDOM: (s: string) => Element[];
/**
 * Imports a html file as an `Element`
 * @param pathToFile Path relative to `src`
 */
export declare const useHTML: (pathToFile: string) => HTMLElement;
export declare type Route = [Element, string];
/**
 * Creates the html files for every route in `routes[]`
 * @param baseFilePath Path relative to `src`
 */
export declare const useRoutes: (routes: Route[], baseDOM?: JSDOM) => void;
