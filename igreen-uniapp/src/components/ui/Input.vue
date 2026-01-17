<template>
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
      :value="modelValue"
      :disabled="disabled"
      :maxlength="maxlength"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <view v-if="$slots.suffix" class="input-suffix">
      <slot name="suffix"></slot>
    </view>
  </view>
  <text v-if="error" class="input-error">{{ error }}</text>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string;
  type?: string;
  password?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxlength?: number;
  error?: string;
}>(), {
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

function handleInput(e: any) {
  emit('update:modelValue', e.detail.value);
}

function handleBlur(e: any) {
  emit('blur', e);
}

function handleFocus(e: any) {
  emit('focus', e);
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
  background: $white;
  border: 1px solid $gray-200;
  border-radius: $radius-md;
  font-size: $text-base;
  color: $gray-900;

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  }

  &:disabled {
    background: $gray-100;
    color: $gray-500;
  }

  &::placeholder {
    color: $gray-400;
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
  color: $error-color;
}
</style>
