<template>
  <view class="input-container">
    <view class="input-wrapper">
      <view v-if="$slots.prefix" class="input-prefix">
        <slot name="prefix"></slot>
      </view>
      <input
        class="input-field"
        :class="{ 'has-prefix': $slots.prefix, 'has-suffix': $slots.suffix }"
        :type="type"
        :password="password"
        :placeholder="placeholder"
        :value="modelValue || ''"
        :disabled="disabled"
        :maxlength="maxlength"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <view v-if="$slots.suffix" class="input-suffix">
        <slot name="suffix"></slot>
      </view>
    </view>
    <text v-if="error" class="input-error">{{ error }}</text>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string;
  type?: string;
  password?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxlength?: number;
  error?: string;
}>(), {
  modelValue: '',
  type: 'text',
  password: false,
  disabled: false,
  maxlength: -1,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'blur', event: any): void;
  (e: 'focus', event: any): void;
}>();

function onInput(e: any) {
  const value = e.detail?.value || '';
  console.log('Input onInput:', value);
  emit('update:modelValue', value);
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  height: 44px;
  padding: $spacing-3 $spacing-4;
  background: #f3f3f5;  // bg-input-background - matches iGreenApp
  border: 1px solid $gray-200;  // slate-200 - matches iGreenApp
  border-radius: $radius-md;
  font-size: $text-base;
  color: $foreground;

  &:focus {
    outline: none;
    border-color: $teal-600;  // teal-600
    box-shadow: 0 0 0 3px oklch(60% 0.118 184.7 / 15%);  // teal-600 ring with opacity
  }

  &:disabled {
    background: $muted;
    color: $muted-foreground;
  }

  &::placeholder {
    color: $muted-foreground;
  }

  &.has-prefix {
    padding-left: 40px;
  }

  &.has-suffix {
    padding-right: 40px;
  }
}

.input-prefix {
  position: absolute;
  left: $spacing-3;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 100%;
}

.input-suffix {
  position: absolute;
  right: $spacing-3;
  z-index: 1;
}

.input-error {
  display: block;
  margin-top: $spacing-1;
  font-size: $text-xs;
  color: $destructive;
}
</style>
