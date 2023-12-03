import 'solid-devtools/setup';
import { mount, StartClient } from '@solidjs/start/client';

mount(() => <StartClient />, document.getElementById('app'));
