import { build } from 'valto';

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

build({
  src: path.join(__dirname, 'src'),
  out: path.join(__dirname, 'out'),
  pages: path.join(__dirname, 'src', 'pages'),
  static: path.join(__dirname, 'static'),
});
