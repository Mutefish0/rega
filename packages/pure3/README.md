# Pure3

pure nodes based on three.js

## Three.js 源码解读

- bindGroup 以及 bindings 的划分

说明：一级节点为一个 BindGroup，叶子节点为在该 BindGroup 下的一个 Binding。注意：相同 binding 下的 unfiorms 会共享同一个 Binding Buffer。

```javascript

- object
  - vertex stage
    - sampler1
    - sampler2
    - texture1
    - texture2
    - uniforms
  - fragment stage
    - sampler1
    - sampler2
    - texture1
    - texture2
    - uniforms
- render
  - vertex stage
    - sampler1
    - sampler2
    - texture1
    - texture2
    - uniforms
  - fragment stage
    - sampler1
    - sampler2
    - texture1
    - texture2
    - uniforms
- frame
  - vertex stage
    - sampler1
    - sampler2
    - texture1
    - texture2
    - uniforms
  - fragment stage
    - sampler1
    - sampler2
    - texture1
    - texture2
    - uniforms
```

## 最佳实践

需要根据更新频率来分 BindGroup。因为不是所有的平台或驱动能够优化 Resource 的更新，如果某个 BindGroup 中有一个资源更新频率大，即使其他所有资源都是静态的，也会影响到整个 BindGroup 的性能。

https://toji.dev/webgpu-best-practices/bind-groups.html#bind-group-reuse
