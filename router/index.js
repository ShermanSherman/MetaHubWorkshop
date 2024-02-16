import { createWebHistory, createRouter } from "vue-router";
import Home from "../views/Home.vue";
import Text from "../views/Text.vue";
import TextSource from "../views/TextSource.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/text/:id",
    name: "Text",
    component: Text,
    props: true
  },
  {
    path: "/textsource/:id",
    name: "TextSource",
    component: TextSource,
    props: true
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
