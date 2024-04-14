// @refresh reload

import { mount, StartClient } from '@solidjs/start/client';

import '@nou/config/global.css';

mount(() => <StartClient />, document.getElementById('app')!);
