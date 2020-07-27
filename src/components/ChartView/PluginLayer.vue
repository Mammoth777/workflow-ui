<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { CreateElement, VNodeChildren } from 'vue';

@Component({})
export default class PluginLayer extends Vue {
  @Prop()
  public plugins!: VNodeChildren[];

  public render(h: CreateElement) {
    return h('div', this.plugins);
  }
}
</script>

<style lang="less">

</style>