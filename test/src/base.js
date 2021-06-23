import { useRoutes } from 'valto';
import { index } from './index/index.js';
import { about } from './about/about.js';

const routes = [
    [index, '/'],
    [about, '/about']
];

useRoutes(routes);