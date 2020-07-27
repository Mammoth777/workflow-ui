import { VNode } from 'vue/types/umd';
import { jsPlumbInstance } from 'jsplumb';
import ZoomControl from './ZoomControl.vue';

export default function(
  workSpace: HTMLElement,
  chartViewVm: Vue,
  jsplumbInstance: jsPlumbInstance
): VNode | void {
  const h = chartViewVm.$createElement;
  const drawLayerDom = chartViewVm.$refs.drawLayer as HTMLElement;
  const vnode =  h(ZoomControl, {
    props: {
      drawLayerDom,
      jsplumbInstance
    }
  });
  return vnode;
}
