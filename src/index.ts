import 'module-alias/register';
import { configs } from './config/server.config';
import { InitServer } from './app';

const app = new InitServer();
app.setup(configs);
app.start();
