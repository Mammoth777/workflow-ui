<template>
  <span>
    <button @click="log" class="log-btn">btn</button>
  </span>
</template>

<script>
export default {
  name: 'Demo',
  props: ['compTitle'],
  methods: {
    log () {
      console.log('当前组件标题: ' + this.compTitle)
    }
  }
}
</script>

<style scoped lang="less">
.log-btn {
  cursor: pointer;
}
</style>
