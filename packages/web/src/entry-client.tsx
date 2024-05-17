// @refresh reload
import '@nou/config/global.css';

import { mount, StartClient } from '@solidjs/start/client';

mount(() => <StartClient />, document.getElementById('app')!);
