import axios from 'axios';
import { route as ziggyRoute } from 'ziggy-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Initialize Ziggy route helper
window.route = ziggyRoute;
