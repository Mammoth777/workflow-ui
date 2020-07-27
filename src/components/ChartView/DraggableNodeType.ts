import { DirectiveBinding } from 'vue/types/options';

const draggableNodetype = {
  inserted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding; // value 即为nodeType名称
    if (!value || !value.nodeType) {
      throw new Error('v-draggableNodetype需要传入一个对象, 如: { nodeType: "SimpleFlowNode", task: { ...节点类型数据 } }. task(非必传)内容会被深拷贝到节点task中');
    }
    value.task = value.task || {};
    const { nodeType, task } = value;
    el.draggable = true;
    el.ondragstart = (evt: DragEvent) => {
      evt.dataTransfer!.setData('nodeType', nodeType);
      evt.dataTransfer!.setData('task', JSON.stringify(task));
    };
    el.ondragend = (evt) => evt.preventDefault();
    el.ondragover = (evt) => evt.preventDefault();
  }
};

export default draggableNodetype;
