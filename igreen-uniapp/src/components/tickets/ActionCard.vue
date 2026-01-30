<template>
  <Card class="action-card" :padding="false">
    <view class="action-content">
      <view class="action-icon" :class="iconClass">
        <text class="icon">{{ icon }}</text>
      </view>
      <view class="action-text">
        <text class="action-title">{{ title }}</text>
        <text class="action-subtitle">{{ subtitle }}</text>
      </view>
    </view>
    <view v-if="showButton" class="action-button-wrap">
      <Button
        :variant="buttonVariant"
        size="lg"
        :loading="loading"
        @click="handleAction"
      >
        {{ buttonText }}
      </Button>
    </view>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Card, Button } from '@/components/ui';

export type ActionType = 'accept' | 'depart' | 'arrive' | 'complete' | 'review' | 'completed';

const props = withDefaults(defineProps<{
  type: ActionType;
  title: string;
  subtitle: string;
  showButton?: boolean;
  buttonText?: string;
  loading?: boolean;
}>(), {
  showButton: true,
  buttonText: 'Confirm',
  loading: false,
});

const emit = defineEmits<{
  (e: 'action'): void;
}>();

const iconMap: Record<ActionType, string> = {
  accept: '⚡',
  depart: '🚗',
  arrive: '📍',
  complete: '✅',
  review: '👁',
  completed: '✔',
};

const iconClassMap: Record<ActionType, string> = {
  accept: 'icon-blue',
  depart: 'icon-indigo',
  arrive: 'icon-orange',
  complete: 'icon-green',
  review: 'icon-purple',
  completed: 'icon-green',
};

const buttonVariantMap: Record<ActionType, 'primary' | 'danger'> = {
  accept: 'primary',
  depart: 'primary',
  arrive: 'primary',
  complete: 'primary',
  review: 'secondary',
  danger: 'danger',
};

const icon = computed(() => iconMap[props.type] || '•');
const iconClass = computed(() => iconClassMap[props.type] || 'icon-gray');
const buttonVariant = computed(() => buttonVariantMap[props.type] || 'primary');

function handleAction() {
  emit('action');
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.action-card {
  padding: $spacing-6;
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $spacing-3;
  margin-bottom: $spacing-4;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;

  &.icon-blue { background: rgba($blue-500, 0.1); }
  &.icon-indigo { background: rgba($indigo-500, 0.1); }
  &.icon-orange { background: rgba($orange-500, 0.1); }
  &.icon-green { background: rgba($green-500, 0.1); }
  &.icon-purple { background: rgba($purple-500, 0.1); }
  &.icon-gray { background: rgba($gray-500, 0.1); }

  .icon {
    font-size: 24px;
  }
}

.action-text {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.action-title {
  font-size: $text-lg;
  font-weight: $font-weight-semibold;
  color: $gray-900;
}

.action-subtitle {
  font-size: $text-sm;
  color: $gray-600;
  max-width: 280px;
}

.action-button-wrap {
  width: 100%;

  Button {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }
}
</style>
