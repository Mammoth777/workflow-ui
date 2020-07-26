<template>
  <div
    class="default-flow-node"
    :style="{
      color: mainColor,
      borderTopColor: mainColor
    }"
  >
    <h4 class="status" v-text="status"></h4>
    <div class="title">
      <span v-if="title" v-text="title"></span>
      <span v-else class="placeholder">请设置流程节点标题</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DefaultFlowNode',
  props: {
    title: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: '未开始',
      validator(val) {
        const flag = ['未开始', '执行中', '执行成功', '执行失败'].includes(val);
        return flag;
      },
    },
  },
  computed: {
    mainColor() {
      const map = {
        未开始: '#4c4c4b',
        执行中: '#11b4eb',
        执行成功: '#08c692',
        执行失败: '#fe0001',
      };
      return map[this.status];
    },
  },
};
</script>

<style lang="less" scoped>

.default-flow-node {
  width: 150px;
  height: 80px;
  font-size: 12px;
  border: 2px solid #d0d6dc;
  border-top-width: 8px;
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.3s ease-in;
  &.node-selected {
    box-shadow: 0px 0px 20px 0px #fff5d0;
  }
  .status {
    padding: 5px;
    margin: 0 10px;
    border-bottom: 4px solid;
  }
  .title {
    padding: 10px;
    color: #4c4c4b;
    text-align: left;
    padding-left: 15px;
  }
}
</style>
