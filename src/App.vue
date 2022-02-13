<template>
  <div class="h-screen flex">
    <TheSidebar />
    <div class="router-view-container flex">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

import TheSidebar from "./components/TheSidebar.vue";

export default defineComponent({
  components: { TheSidebar },
  setup() {},
});
</script>

<style scoped>
.router-view-container {
  flex: 0 0 70%;
  max-width: 70%;
}
</style>
