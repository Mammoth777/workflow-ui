# workflow-ui

> 晚点写文档..

## todo

- [ ] 注册插件的函数参数要再想想
- [x] 双击节点, 在节点元素上增加 `node-selected` class
- [x] 插件系统, 暴露jsplumb对象, vue实例, 节点层dom, 插件层dom
- [ ] 单个节点对应一组endpoints

## 事件系统
> emmm, 就用最简单的provide吧, 在顶层Vue示例做个触发器, 注入到每个子组件里, 挺好, 嗯, 是的

- [x] node-created
- [x] node-updated
- [x] node-dblclick
- [x] edge-connected

## Doc
### 实例方法
#### getData
#### setData, initChart
> 两个方法相同
#### createNode
#### deleteItem
#### updateItem
> 节点的task是非响应式的. 这是故意为之的, 因为会有很多需要submit的场景


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
