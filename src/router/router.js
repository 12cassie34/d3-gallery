import { createRouter, createWebHashHistory } from 'vue-router'

import BarChartAnimation from '../components/BarChartAnimation.vue';
import BarAndLineChart from '../components/BarAndLineChart.vue';

const routes = [
    { path: '/', component: BarChartAnimation },
    { path: '/bar-Line-chart-with-standard-deviation-area', component: BarAndLineChart },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
export const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})