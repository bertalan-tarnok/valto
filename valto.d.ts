export declare const src: string;
export declare const dist: string;
export declare const stringToDOM: (s: string) => HTMLElement[];
/**
 * Import a html file as `HTMLElement[]`
 * @param pathToFile Path relative to `src`
 */
export declare const useHTML: (pathToFile: string) => HTMLElement[];
/**
 * @param pathToFile Path relative to `src`
 */
export declare const useCSS: (pathToFile: string) => string;
export declare type Component = {
    html: HTMLElement[];
    css?: string;
};
export declare type Route = [Component, string];
export declare const useRoutes: (routes: Route[]) => void;
