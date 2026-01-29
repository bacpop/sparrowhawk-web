import {createApp} from "vue";
import App from "./App.vue";
import PrimeVue from 'primevue/config';
import store from "./store";
import "./assets/app.css";

createApp(App)
    .use(PrimeVue)
    .use(store)
    .mount("#app");