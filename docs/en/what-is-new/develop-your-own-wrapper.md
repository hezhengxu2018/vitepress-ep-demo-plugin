# Build Your Own Wrapper Container

To make logic reuse easier, most of the plugin features are wrapped inside the `useDemoBox` hook. Import the hook and use it to compose a container that matches your documentation style whenever you need to.

```ts
import { useDemoBox } from 'vitepress-better-demo-plugin'
```

You can refer to the Element Plus inspired container implementation:

```vue
<script lang="ts" setup>
import type { VitepressDemoBoxProps } from '@/types'
import { ElCollapseTransition, ElDivider, ElIcon, ElMessage, ElRadio, ElRadioButton, ElRadioGroup, ElTooltip } from 'element-plus'
import { useDemoBox } from '@/shared/composables/useDemoBox'
import { COMPONENT_TYPE } from '@/shared/constant'
import { i18n } from '@/shared/locales/i18n'
import { useEpNameSpace } from '@/shared/utils/namespace'
import {
  CodeOpenIcon,
  CodeSandboxIcon,
  CopyIcon,
  FoldIcon,
  GithubIcon,
  GitlabIcon,
  StackblitzIcon,
} from './icons/index'

const props = withDefaults(defineProps<VitepressDemoBoxProps>(), {
  title: 'Title',
  description: 'Description',
  visible: true,
  select: COMPONENT_TYPE.VUE,
  order: 'vue,react,html',
  github: '',
  gitlab: '',
  htmlWriteWay: 'write',
  codeHighlights: '',
})

const emit = defineEmits(['mount'])

function onCopySuccess() {
  ElMessage.success(i18n.value.copySuccess)
}

const {
  stackblitz,
  codesandbox,
  isCodeFold,
  setCodeFold,
  type,
  tabs,
  currentFiles,
  activeFile,
  currentCode,
  currentCodeHtml,
  openGithub,
  openGitlab,
  clickCodeCopy,
  htmlContainerRef,
  reactContainerRef,
} = useDemoBox(props, emit, {
  onCopySuccess,
})

const ns = useEpNameSpace()
</script>

<template>
  <div :class="[ns.e('container')]">
    <!-- Preview -->
    <section class="vp-raw" :class="[ns.bem('preview')]" :style="{ background: props.background }">
      <slot v-if="type === 'vue'" name="vue" />
      <div v-else-if="type === 'html'" ref="htmlContainerRef">
        <iframe style="width: 100%; height: auto; border: none" />
      </div>
      <div v-else-if="type === 'react'" ref="reactContainerRef" />
    </section>
    <!-- Description & switchers -->
    <section :class="[ns.bem('description')]">
      <ElDivider v-if="title" :class="[ns.bem('description', 'title')]" content-position="left">
        {{ title }}
      </ElDivider>
      <div
        v-if="description"
        :class="[ns.bem('description', 'content')]"
        v-html="description"
      />
      <div
        v-if="props.description || (!props.title && !props.description)"
        :class="[ns.bem('description', 'split-line')]"
      />
      <div v-if="tabs.length > 1 && visible" :class="[ns.bem('lang-tabs')]">
        <ElRadioGroup v-model="type">
          <ElRadio
            v-for="tab in tabs"
            :key="tab"
            :value="tab"
          >
            {{ tab }}
          </ElRadio>
        </ElRadioGroup>
      </div>
      <div :class="[ns.bem('description', 'handle-btn-op-bar')]">
        <ElTooltip v-if="stackblitz.show" :content="i18n.openInStackblitz">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <StackblitzIcon
              :code="currentCode"
              :type="type"
              :scope="scope || ''"
              :templates="stackblitz.templates || []"
            />
          </ElIcon>
        </ElTooltip>
        <ElTooltip v-if="codesandbox.show" :content="i18n.openInCodeSandbox">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <CodeSandboxIcon
              :code="currentCode"
              :type="type"
              :scope="scope || ''"
              :templates="codesandbox.templates || []"
            />
          </ElIcon>
        </ElTooltip>
        <ElTooltip v-if="github" :content="i18n.openInGithub">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <GithubIcon @click="openGithub" />
          </ElIcon>
        </ElTooltip>
        <ElTooltip v-if="gitlab" :content="i18n.openInGitlab">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <GitlabIcon @click="openGitlab" />
          </ElIcon>
        </ElTooltip>
        <ElTooltip :content="i18n.copyCode">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <CopyIcon @click="clickCodeCopy" />
          </ElIcon>
        </ElTooltip>
        <ElTooltip :content="i18n.expandCode">
          <ElIcon :class="ns.bem('description', 'handle-btn')">
            <CodeOpenIcon @click="setCodeFold(!isCodeFold)" />
          </ElIcon>
        </ElTooltip>
      </div>
    </section>
    <!-- Source code -->
    <section :class="[ns.bem('source')]">
      <ElCollapseTransition>
        <div v-show="!isCodeFold">
          <div v-if="Object.keys(currentFiles).length" :class="[ns.bem('file-tabs')]">
            <ElRadioGroup v-model="activeFile">
              <ElRadioButton
                v-for="file in Object.keys(currentFiles)"
                :key="file"
                size="small"
                :value="file"
              >
                {{ file }}
              </ElRadioButton>
            </ElRadioGroup>
          </div>
          <div v-html="currentCodeHtml" />
        </div>
      </ElCollapseTransition>

      <Transition name="el-fade-in-linear">
        <div
          v-show="!isCodeFold"
          :class="[ns.bem('float-control')]"
          tabindex="0"
          role="button"
          @click="setCodeFold(!isCodeFold)"
        >
          <ElIcon :size="16">
            <FoldIcon />
          </ElIcon>
          <span>{{ i18n.collapseCode }}</span>
        </div>
      </Transition>
    </section>
  </div>
</template>
```

The secondary development APIs are still evolving. Some types or values might not be exported yet, so you may need to implement them yourself. After finishing the container, refer to the multi-theme section to register and start using it.
