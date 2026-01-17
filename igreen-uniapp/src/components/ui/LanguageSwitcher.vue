<template>
  <view class="language-switcher">
    <view
      class="lang-btn"
      :class="{ active: currentLang === 'en' }"
      @click="setLanguage('en')"
    >
      <text class="lang-text">English</text>
    </view>
    <view
      class="lang-btn"
      :class="{ active: currentLang === 'th' }"
      @click="setLanguage('th')"
    >
      <text class="lang-text">ไทย</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { setLanguage as setI18nLanguage, getLanguage } from '@/utils/i18n';

const currentLang = ref(getLanguage());

watch(() => getLanguage(), (newLang) => {
  currentLang.value = newLang;
});

function setLanguage(lang: 'en' | 'th') {
  setI18nLanguage(lang);
  currentLang.value = lang;
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.language-switcher {
  display: flex;
  background: $gray-100;
  border-radius: $radius-lg;
  padding: $spacing-1;
}

.lang-btn {
  padding: $spacing-2 $spacing-4;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    background: $white;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

    .lang-text {
      color: $gray-900;
      font-weight: $font-medium;
    }
  }
}

.lang-text {
  font-size: $text-sm;
  color: $gray-500;
}
</style>
