<template>
  <div
    class="sidebar-container p-4 flex flex-col h-full bg-slate-700 text-zinc-50"
  >
    <div
      v-for="(item, index) in menuList"
      :key="index"
      class="py-1.5 text-xl border-b border-solid border-sky-50 cursor-pointer"
    >
      <router-link :to="item.route"
        >{{ index + 1 }}. {{ item.name }}</router-link
      >
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  setup() {
    const menuList = ref([
      { name: "Bar Chart with Display Animation", route: "/" },
      {
        name: "Bar, Line Chart with Standard Deviation Area",
        route: "/bar-Line-chart-with-standard-deviation-area",
      },
    ]);

    return { menuList };
  },
});
</script>

<style scoped>
.sidebar-container {
  flex: 0 0 30%;
  max-width: 30%;
}

.router-link-active {
    color: #fcd34d;
}
</style>