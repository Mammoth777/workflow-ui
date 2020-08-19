<template>
  <div
    class="default-flow-node"
    :style="{
      color: mainColor,
      borderColor: mainColor
    }"
  >
    <!-- <h4 class="status" v-text="status"></h4> -->
     <div
      class="iconfont"
      :style="{
        color: mainColor
      }"
    >&#xe627;</div>
    <div class="title">
      <span v-text="title"></span>
      <span v-text="status" class="des"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DefaultFlowNode',
  props: {
    title: {
      type: String,
      default: '请输入标题'
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
        执行中: '#6888EA',
        执行成功: '#08c692',
        执行失败: '#fe0001'
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
  border: 1px solid #d0d6dc;
  border-left-width: 8px;
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.3s ease-in;
  text-align: left;
  .iconfont{
    width: 40px;
    display: inline-block;
    font-size: 26px;
    color: #777;
    margin-left:15px;
    text-align: center;
    line-height: 80px;
    vertical-align: middle;
  }
  .title {
    display: inline-block;
    vertical-align: middle;
    color: #4c4c4b;
    text-align: left;
    padding-left: 8px;
    span{
      display: block;
      color: #666;
      font-size: 14px;
      &.des{
        color: #999;
        font-size: 12px;
      }
    }
  }
}
</style>
