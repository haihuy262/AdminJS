import { AdminJSOptions } from 'adminjs';

import componentLoader from './component-loader.js';
import Product from './product.entity.js';
const options: AdminJSOptions = {
  componentLoader,
  rootPath: '/admin',
  resources: [Product],
  databases: [],
};

export default options;
