<template>
  <view class="container">
    <view class="form-card">
      
      <!-- Title -->
      <view class="form-group">
        <text class="label">Ticket Title</text>
        <input class="input" v-model="form.title" placeholder="Enter title" />
      </view>

      <!-- Description -->
      <view class="form-group">
        <text class="label">Description</text>
        <textarea class="textarea" v-model="form.description" placeholder="Enter description" />
      </view>

      <!-- Template -->
      <view class="form-group">
        <text class="label">Template</text>
        <picker :range="templates" range-key="name" @change="onTemplateChange">
          <view class="picker">
            {{ selectedTemplateName || 'Select Template' }}
          </view>
        </picker>
      </view>

      <!-- Ticket Type -->
      <view class="form-group">
        <text class="label">Ticket Type</text>
        <picker :range="ticketTypes" @change="onTypeChange">
          <view class="picker">
            {{ form.type || 'Select Type' }}
          </view>
        </picker>
      </view>

      <!-- Conditional Fields -->
      
      <!-- Site (Hidden for Problem tickets) -->
      <view class="form-group" v-if="form.type !== 'problem'">
        <text class="label">Site</text>
        <picker :range="sites" range-key="name" @change="onSiteChange">
          <view class="picker">
            {{ form.site || 'Select Site' }}
          </view>
        </picker>
      </view>

      <!-- Problem Type (Shown ONLY for Problem tickets) -->
      <view class="form-group" v-if="form.type === 'problem'">
        <text class="label">Problem Type</text>
        <picker :range="problemTypes" range-key="name" @change="onProblemTypeChange">
          <view class="picker">
            {{ selectedProblemTypeName || 'Select Problem Type' }}
          </view>
        </picker>
      </view>

      <!-- Related Tickets (Shown ONLY for Problem tickets) -->
      <view class="form-group" v-if="form.type === 'problem'">
        <text class="label">Related Corrective Tickets</text>
        <!-- Simple multi-select simulation for UniApp demo -->
        <view class="related-list">
          <view 
            v-for="ticket in correctiveTickets" 
            :key="ticket.id" 
            class="related-item"
            :class="{ selected: form.relatedTicketIds.includes(ticket.id) }"
            @click="toggleRelatedTicket(ticket.id)"
          >
            <text>{{ ticket.id }} - {{ ticket.title }}</text>
            <text v-if="form.relatedTicketIds.includes(ticket.id)">✓</text>
          </view>
        </view>
      </view>

      <!-- Assign To -->
      <view class="form-group">
        <text class="label">Assign To</text>
        <picker :range="groups" range-key="name" @change="onGroupChange">
          <view class="picker">
            {{ selectedGroupName || 'Select Group' }}
          </view>
        </picker>
      </view>

      <!-- Priority -->
      <view class="form-group" v-if="form.type !== 'problem'">
        <text class="label">Priority</text>
        <picker :range="priorities" @change="onPriorityChange">
          <view class="picker">
            {{ form.priority }}
          </view>
        </picker>
      </view>

      <!-- Due Date -->
      <view class="form-group">
        <text class="label">Due Date</text>
        <picker mode="date" :value="form.dueDate" @change="onDateChange">
          <view class="picker">
            {{ form.dueDate }}
          </view>
        </picker>
      </view>

      <button class="btn-submit" @click="handleSubmit">Submit Ticket</button>

    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { mockTemplates, mockSites, mockGroups, mockProblemTypes, mockTickets } from '@/common/mockData.js';

const templates = ref(mockTemplates);
const sites = ref(mockSites);
const groups = ref(mockGroups);
const problemTypes = ref(mockProblemTypes);
const ticketTypes = ['planned', 'preventive', 'corrective', 'problem'];
const priorities = ['P1', 'P2', 'P3', 'P4'];

const form = ref({
  title: '',
  description: '',
  templateId: '',
  type: 'planned',
  site: '',
  assignedTo: '',
  priority: 'P2',
  dueDate: new Date().toISOString().split('T')[0],
  problemType: '',
  relatedTicketIds: []
});

const selectedTemplateName = computed(() => {
  const t = templates.value.find(item => item.id === form.value.templateId);
  return t ? t.name : '';
});

const selectedProblemTypeName = computed(() => {
  const pt = problemTypes.value.find(item => item.id === form.value.problemType);
  return pt ? pt.name : '';
});

const selectedGroupName = computed(() => {
  const g = groups.value.find(item => item.id === form.value.assignedTo);
  return g ? g.name : '';
});

const correctiveTickets = computed(() => {
  return mockTickets.filter(t => t.type === 'corrective');
});

// Event Handlers
const onTemplateChange = (e) => {
  const index = e.detail.value;
  form.value.templateId = templates.value[index].id;
};

const onTypeChange = (e) => {
  const index = e.detail.value;
  form.value.type = ticketTypes[index];
  
  // Reset conditional fields
  if (form.value.type === 'problem') {
    form.value.site = '';
    form.value.priority = 'P2'; // Default or hidden
  } else {
    form.value.problemType = '';
    form.value.relatedTicketIds = [];
  }
};

const onSiteChange = (e) => {
  const index = e.detail.value;
  form.value.site = sites.value[index].name;
};

const onProblemTypeChange = (e) => {
  const index = e.detail.value;
  form.value.problemType = problemTypes.value[index].id;
};

const onGroupChange = (e) => {
  const index = e.detail.value;
  form.value.assignedTo = groups.value[index].id;
};

const onPriorityChange = (e) => {
  const index = e.detail.value;
  form.value.priority = priorities[index];
};

const onDateChange = (e) => {
  form.value.dueDate = e.detail.value;
};

const toggleRelatedTicket = (id) => {
  const index = form.value.relatedTicketIds.indexOf(id);
  if (index === -1) {
    form.value.relatedTicketIds.push(id);
  } else {
    form.value.relatedTicketIds.splice(index, 1);
  }
};

const handleSubmit = () => {
  if (!form.value.title || !form.value.templateId || !form.value.assignedTo) {
    uni.showToast({ title: 'Missing required fields', icon: 'none' });
    return;
  }
  
  if (form.value.type === 'problem' && !form.value.problemType) {
    uni.showToast({ title: 'Please select Problem Type', icon: 'none' });
    return;
  }
  
  // Logic to save ticket would go here
  console.log('Submitting Ticket:', form.value);
  
  uni.showToast({ title: 'Ticket Created', icon: 'success' });
  setTimeout(() => {
    uni.navigateBack();
  }, 1000);
};
</script>

<style>
.container {
  padding: 30rpx;
  background-color: #f8fafc;
  min-height: 100vh;
}

.form-card {
  background-color: white;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}

.form-group {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #334155;
  margin-bottom: 12rpx;
}

.input, .picker {
  height: 80rpx;
  border: 2rpx solid #e2e8f0;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  line-height: 80rpx;
  background-color: #ffffff;
}

.textarea {
  width: 100%;
  height: 200rpx;
  border: 2rpx solid #e2e8f0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.related-list {
  border: 2rpx solid #e2e8f0;
  border-radius: 8rpx;
  max-height: 300rpx;
  overflow-y: scroll;
}

.related-item {
  padding: 20rpx;
  border-bottom: 1rpx solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
}

.related-item.selected {
  background-color: #e0f2fe;
  color: #0369a1;
}

.btn-submit {
  background-color: #0ea5e9;
  color: white;
  font-size: 32rpx;
  margin-top: 40rpx;
}
</style>
