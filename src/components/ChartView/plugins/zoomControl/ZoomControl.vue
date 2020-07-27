<template>
  <div class="zoom-control">
    <i class="iconfont iconminus" :class="['icon', { disabled: minusDisabled }]" @click="change(-defaultIncrement)"></i>
    <span class="zoom-rate">{{zoomRate}}%</span>
    <i class="iconfont iconadd" :class="['icon', { disabled: addDisabled }]" @click="change(+defaultIncrement)"></i>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component } from "vue-property-decorator";
import '../../../../assets/iconfont.css';
import { jsPlumbInstance } from 'jsplumb';

@Component
export default class ZoomControl extends Vue {
  @Prop()
  private jsplumbInstance!: jsPlumbInstance;
  @Prop()
  private drawLayerDom!: HTMLElement;

  private defaultIncrement = 10; // 默认增量
  private zoomRate = 100; // 缩放比例 默认100
      // 放大缩小按钮禁用
  private addDisabled = false;
  private minusDisabled = false;

  private change(delta: number) {
    let zoomRate = this.zoomRate + delta;
    if (zoomRate < 50) {
      zoomRate = 50;
      this.minusDisabled = true;
    } else if (zoomRate > 200) {
      zoomRate = 200;
      this.addDisabled = true;
    } else {
      this.addDisabled = false;
      this.minusDisabled = false;
    }
    this.zoomRate = zoomRate;
    // this.$emit('zoom-change', zoomRate / 100);
    const zoom = zoomRate / 100;
    this.drawLayerDom.style.transform = `scale(${zoom})`;
    this.jsplumbInstance.setZoom(zoom);
  }
}
</script>

<style lang="less" scoped>
.zoom-control {
  position: absolute;
  user-select: none;
  display: flex;
  align-items: center;
  right: 10px;
  top: 10px;
  background-color: #f8f8f888;
  padding: 5px;
  z-index: 10;
  .icon {
    cursor: pointer;
    margin: 0 5px;
    &.disabled {
      cursor: not-allowed;
      color: #ccc;
    }
  }
  .zoom-rate {
    display: inline-block;
    width: 3em;
  }
}
</style>