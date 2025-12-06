<script setup lang="ts">
import { useDefaultNameSpace } from '../../../shared/utils/namespace'

const props = defineProps<{
  content: string
}>()

const ns = useDefaultNameSpace()
</script>

<template>
  <div :class="[ns.bem('tooltip', 'wrapper')]">
    <div :class="[ns.bem('tooltip', 'trigger')]">
      <slot />
    </div>
    <div :class="[ns.bem('tooltip', 'content')]">
      <slot name="content">
        {{ props.content }}
      </slot>
    </div>
  </div>
</template>

<style lang="scss">
:root {
  --coot-demo-box-tooltip-bg: #000;
  --coot-demo-box-tooltip-color: #fff;
}

.dark:root {
  --coot-demo-box-tooltip-bg: #fff;
  --coot-demo-box-tooltip-color: #000;
}

.#{$defaultPrefix}-tooltip__wrapper {
  position: relative;
  display: inline-block;
}

.#{$defaultPrefix}-tooltip__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.#{$defaultPrefix}-tooltip__content {
  position: absolute;
  top: -4px;
  left: 50%;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  background-color: var(--coot-demo-box-tooltip-bg);
  color: var(--coot-demo-box-tooltip-color);
  transform: translate(-50%, -100%);
  opacity: 0;
  font-size: 12px;
  transition: opacity 0.2s ease-in-out;
}

.#{$defaultPrefix}-tooltip__trigger:hover + .#{$defaultPrefix}-tooltip__content {
  opacity: 1;
}
</style>
