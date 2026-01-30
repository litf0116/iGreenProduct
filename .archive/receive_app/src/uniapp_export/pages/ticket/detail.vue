<template>
  <view class="page-container" v-if="ticket">
    <!-- Ticket Header -->
    <view class="card">
      <view class="header-row">
        <text class="ticket-id">{{ ticket.id }}</text>
        <text :class="['status-badge', ticket.status]">{{ ticket.status }}</text>
      </view>
      <text class="title">{{ ticket.title }}</text>
      <view class="meta-row">
        <text class="meta-item">{{ ticket.type }}</text>
        <text class="meta-item">{{ ticket.priority }}</text>
      </view>
      <text class="location">{{ ticket.location }}</text>
    </view>

    <!-- Workflow Actions -->
    <view class="workflow-section">
      
      <!-- STATUS: OPEN -->
      <view v-if="ticket.status === 'open'" class="workflow-card bg-blue">
        <text class="workflow-title">New Opportunity</text>
        <text class="workflow-desc">This ticket is available. Accept it to start.</text>
        <button class="btn btn-primary" @click="handleGrabOrder">Accept & Assign to Me</button>
      </view>

      <!-- STATUS: ASSIGNED -->
      <view v-if="ticket.status === 'assigned'" class="workflow-card bg-indigo">
        <text class="workflow-title">Ready to Depart?</text>
        <text class="workflow-desc">Confirm when you are leaving for the site.</text>
        <button class="btn btn-primary" @click="handleDepart">Departure Now</button>
      </view>

      <!-- STATUS: DEPARTED -->
      <view v-if="ticket.status === 'departed'" class="workflow-card bg-orange">
        <text class="workflow-title">En Route</text>
        <text class="workflow-desc">You are on the way to the site.</text>
        <button class="btn btn-primary" @click="handleArrive">Arrived at Site</button>
      </view>

      <!-- STATUS: ARRIVED (WORK AREA) -->
      <view v-if="ticket.status === 'arrived'" class="work-area">
        <text class="section-label">Maintenance Tasks</text>
        
        <!-- Preventive Maintenance Steps -->
        <view v-if="ticket.type === 'preventive'" class="steps-list">
          <view v-for="(step, index) in ticket.steps" :key="step.id" class="step-card">
            <text class="step-label">{{ index + 1 }}. {{ step.label }}</text>
            
            <view class="step-actions">
              <view class="status-toggles">
                <view 
                  :class="['toggle-btn', step.status === 'pass' ? 'active-pass' : '']" 
                  @click="updateStep(step.id, { status: 'pass' })">Pass</view>
                <view 
                  :class="['toggle-btn', step.status === 'fail' ? 'active-fail' : '']" 
                  @click="updateStep(step.id, { status: 'fail' })">Fail</view>
                <view 
                  :class="['toggle-btn', step.status === 'na' ? 'active-na' : '']" 
                  @click="updateStep(step.id, { status: 'na' })">N/A</view>
              </view>
            </view>

            <!-- Pass: Photo Evidence -->
            <view v-if="step.status === 'pass'" class="evidence-section">
              <view class="photo-grid">
                <view v-for="(url, idx) in (step.photoUrls || (step.photoUrl ? [step.photoUrl] : []))" :key="idx" class="photo-item">
                  <image :src="url" mode="aspectFill" class="photo"></image>
                </view>
                <view class="add-photo-btn" @click="handleAddPhoto(step.id, 'photo')">
                  <text class="plus-icon">+</text>
                </view>
              </view>
            </view>

            <!-- Fail: Cause & Photos -->
            <view v-if="step.status === 'fail'" class="fail-section">
              <input 
                class="input" 
                placeholder="Describe the cause..." 
                :value="step.cause" 
                @input="(e) => updateStep(step.id, { cause: e.detail.value })"
              />
              
              <text class="sub-label">Before Photos</text>
              <view class="photo-grid">
                <view v-for="(url, idx) in (step.beforePhotoUrls || (step.beforePhotoUrl ? [step.beforePhotoUrl] : []))" :key="idx" class="photo-item">
                  <image :src="url" mode="aspectFill" class="photo"></image>
                </view>
                <view class="add-photo-btn" @click="handleAddPhoto(step.id, 'beforePhoto')">
                  <text class="plus-icon">+</text>
                </view>
              </view>

              <text class="sub-label">After Photos</text>
              <view class="photo-grid">
                <view v-for="(url, idx) in (step.afterPhotoUrls || (step.afterPhotoUrl ? [step.afterPhotoUrl] : []))" :key="idx" class="photo-item">
                  <image :src="url" mode="aspectFill" class="photo"></image>
                </view>
                <view class="add-photo-btn" @click="handleAddPhoto(step.id, 'afterPhoto')">
                  <text class="plus-icon">+</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- Corrective Maintenance -->
        <view v-if="ticket.type === 'corrective'" class="form-section">
            <view class="form-group">
                <text class="label">Root Cause</text>
                <textarea class="textarea" :value="ticket.rootCause" @input="(e) => updateTicket({ rootCause: e.detail.value })" placeholder="Enter root cause" />
            </view>
            <view class="form-group">
                <text class="label">Solution</text>
                <textarea class="textarea" :value="ticket.solution" @input="(e) => updateTicket({ solution: e.detail.value })" placeholder="Enter solution" />
            </view>

            <text class="sub-label">Before Photos</text>
            <view class="photo-grid">
                <view v-for="(url, idx) in (ticket.beforePhotoUrls || (ticket.beforePhotoUrl ? [ticket.beforePhotoUrl] : []))" :key="idx" class="photo-item">
                    <image :src="url" mode="aspectFill" class="photo"></image>
                </view>
                <view class="add-photo-btn" @click="handleAddMainPhoto('beforePhoto')">
                    <text class="plus-icon">+</text>
                </view>
            </view>

            <text class="sub-label">After Photos</text>
            <view class="photo-grid">
                <view v-for="(url, idx) in (ticket.afterPhotoUrls || (ticket.afterPhotoUrl ? [ticket.afterPhotoUrl] : []))" :key="idx" class="photo-item">
                    <image :src="url" mode="aspectFill" class="photo"></image>
                </view>
                <view class="add-photo-btn" @click="handleAddMainPhoto('afterPhoto')">
                    <text class="plus-icon">+</text>
                </view>
            </view>
        </view>

        <!-- Planned Maintenance -->
        <view v-if="ticket.type === 'planned'" class="form-section">
            <view class="form-group">
                <text class="label">Feedback</text>
                <textarea class="textarea" :value="ticket.feedback" @input="(e) => updateTicket({ feedback: e.detail.value })" placeholder="Enter feedback" />
            </view>

            <text class="sub-label">Photos</text>
            <view class="photo-grid">
                <view v-for="(url, idx) in ticket.feedbackPhotoUrls" :key="idx" class="photo-item">
                    <image :src="url" mode="aspectFill" class="photo"></image>
                </view>
                <view class="add-photo-btn" @click="handleAddMainPhoto('feedbackPhoto')">
                    <text class="plus-icon">+</text>
                </view>
            </view>
        </view>

        <!-- Problem Management -->
        <view v-if="ticket.type === 'problem'" class="form-section">
             <view class="form-group">
                <text class="label">Solution / Proposal</text>
                <textarea class="textarea" :value="ticket.solution" @input="(e) => updateTicket({ solution: e.detail.value })" placeholder="Enter solution details" />
            </view>
            
            <!-- Simple Date Picker Simulation -->
            <view class="form-group">
                <text class="label">Est. Resolution Date</text>
                 <picker mode="date" :value="ticket.estimatedResolutionTime" @change="(e) => updateTicket({ estimatedResolutionTime: e.detail.value })">
                    <view class="picker-box">
                        {{ ticket.estimatedResolutionTime || 'Select Date' }}
                    </view>
                </picker>
            </view>

            <text class="sub-label">Photos</text>
            <view class="photo-grid">
                <view v-for="(url, idx) in ticket.problemPhotoUrls" :key="idx" class="photo-item">
                    <image :src="url" mode="aspectFill" class="photo"></image>
                </view>
                <view class="add-photo-btn" @click="handleAddMainPhoto('problemPhoto')">
                    <text class="plus-icon">+</text>
                </view>
            </view>
        </view>

        <button class="btn btn-primary btn-block mt-4" @click="handleFinish">Finish Work</button>
      </view>

      <!-- STATUS: REVIEW -->
      <view v-if="ticket.status === 'review'" class="workflow-card bg-green">
        <text class="workflow-title">Work Completed</text>
        <text class="workflow-desc">Pending confirmation. Review details below.</text>
        <view class="btn-group">
            <button class="btn btn-primary" @click="handleConfirm">Confirm Completion</button>
            <button class="btn btn-outline" @click="handleReject">Reject (Edit)</button>
        </view>
      </view>

      <!-- STATUS: COMPLETED -->
      <view v-if="ticket.status === 'completed'" class="workflow-card bg-gray">
        <text class="workflow-title">Ticket Closed</text>
        <text class="workflow-desc">This ticket has been completed.</text>
      </view>

    </view>
  </view>
  <view v-else class="loading-screen">
    <text>Loading...</text>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../utils/api.js';

const ticket = ref(null);
const ticketId = ref(null);

onMounted(() => {
    // Get ID from pages stack or query
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    // In UniApp, options are passed to onLoad. In script setup, we parse query manually or use onLoad hook if not using setup alone.
    // However, let's use standard URL param parsing if possible or rely on onLoad being called if we used export default
});

// Since we are using <script setup>, we need a way to access onLoad options. 
// Standard Vue 3 way in UniApp:
import { onLoad } from '@dcloudio/uni-app';

onLoad(async (options) => {
    if (options.id) {
        ticketId.value = options.id;
        await loadTicket(options.id);
    }
});

const loadTicket = async (id) => {
    try {
        const tickets = await api.getTickets(0, 50); // In real app, getById
        const found = tickets.find(t => t.id === id);
        if (found) {
            ticket.value = found;
        }
    } catch (e) {
        uni.showToast({ title: 'Failed to load ticket', icon: 'none' });
    }
};

const updateTicketLocal = (updates) => {
    ticket.value = { ...ticket.value, ...updates };
};

const saveTicket = async (updates) => {
    try {
        updateTicketLocal(updates);
        await api.updateTicket(ticket.value.id, updates);
    } catch (e) {
        uni.showToast({ title: 'Save failed', icon: 'none' });
    }
};

const ensureSteps = () => {
   if (ticket.value.type === 'preventive' && (!ticket.value.steps || ticket.value.steps.length === 0)) {
       const newSteps = [
            { id: '1', label: 'Check the MDB cabinet and charging station cabinet for rust, leaks, and the condition of the door handles.', completed: false },
            { id: '2', label: 'Check the fire extinguishers and monitor the equipment to ensure they are functioning properly.', completed: false },
            { id: '3', label: 'Check the ground condition, drainage, and cleaning.', completed: false },
            { id: '4', label: 'Check the charging gun head and charging cable for any damage or scratches. Ensure the cable ends are securely installed.', completed: false },
            { id: '5', label: 'Check if the charging input line is normal.', completed: false },
            { id: '6', label: "Check that all terminals on the charging station's mainboard are securely plugged in and that all cables are loose.", completed: false },
            { id: '7', label: 'Check if the display screen is intact and verify that all parameter settings are correct.', completed: false },
            { id: '8', label: 'Check if the indicator lights on the charging station are functioning properly.', completed: false },
            { id: '9', label: 'Check if the communication functions of the charging station are normal.', completed: false },
            { id: '10', label: 'Check that the emergency stop button is intact and that it functions properly.', completed: false },
            { id: '11', label: 'Check if the charging module is operating normally and if the power indicator light is flashing.', completed: false },
            { id: '12', label: 'Check that the surge protector is in good working order.', completed: false },
            { id: '13', label: 'Check if the dust screen needs cleaning.', completed: false },
            { id: '14', label: 'Check all historical records of the charging station for any abnormal fault data.', completed: false },
            { id: '15', label: 'Check if the communication between the charging station and the backend is normal.', completed: false },
            { id: '16', label: 'Check if the charger contactor is functioning properly and On-site test of charging action', completed: false },
       ];
       saveTicket({ steps: newSteps });
   }
};

const handleGrabOrder = async () => {
    // TODO: Backend Integration - Grab Ticket
    if (ticket.value.type === 'problem') {
        await saveTicket({ 
            status: 'arrived', 
            assignee: 'Current User',
            history: { ...ticket.value.history, arrivedAt: new Date().toISOString() }
        });
    } else {
        await saveTicket({ 
            status: 'assigned', 
            assignee: 'Current User' 
        });
    }
    uni.showToast({ title: 'Ticket Accepted' });
};

const handleDepart = async () => {
    // TODO: Backend Integration - Departure
    await saveTicket({ 
        status: 'departed',
        history: { ...ticket.value.history, departedAt: new Date().toISOString() }
    });
};

const handleArrive = async () => {
    ensureSteps();
    // TODO: Backend Integration - Arrival
    await saveTicket({ 
        status: 'arrived',
        history: { ...ticket.value.history, arrivedAt: new Date().toISOString() }
    });
};

const updateStep = async (stepId, updates) => {
    const updatedSteps = ticket.value.steps.map(s => {
        if (s.id === stepId) {
            const newStep = { ...s, ...updates };
             // Auto-calculate completion
              let isCompleted = false;
              if (newStep.status === 'na') isCompleted = true;
              else if (newStep.status === 'pass') {
                   if (newStep.photoUrl || (newStep.photoUrls && newStep.photoUrls.length > 0)) isCompleted = true;
              } else if (newStep.status === 'fail') {
                   const hasBefore = newStep.beforePhotoUrl || (newStep.beforePhotoUrls && newStep.beforePhotoUrls.length > 0);
                   const hasAfter = newStep.afterPhotoUrl || (newStep.afterPhotoUrls && newStep.afterPhotoUrls.length > 0);
                   if (newStep.cause && hasBefore && hasAfter) isCompleted = true;
              }
              newStep.completed = isCompleted;
              return newStep;
        }
        return s;
    });
    
    // TODO: Backend Integration - Update Step
    await saveTicket({ steps: updatedSteps });
};

const updateTicket = async (updates) => {
    // Generic update for form fields
    await saveTicket(updates);
};

// Mock Photo Upload
const mockUpload = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`https://images.unsplash.com/photo-1581092160562-40aa08e78837?random=${Math.random()}`);
        }, 500);
    });
};

const handleAddPhoto = async (stepId, fieldPrefix) => {
    // TODO: Backend Integration - Upload
    const url = await mockUpload();
    const singularField = `${fieldPrefix}Url`;
    const pluralField = `${fieldPrefix}Urls`;
    
    const step = ticket.value.steps.find(s => s.id === stepId);
    const existingPhotos = step[pluralField] || (step[singularField] ? [step[singularField]] : []);
    const updatedPhotos = [...existingPhotos, url];
    
    await updateStep(stepId, {
        [singularField]: updatedPhotos[0],
        [pluralField]: updatedPhotos
    });
};

const handleAddMainPhoto = async (fieldPrefix) => {
     // TODO: Backend Integration - Upload
    const url = await mockUpload();
    const singularField = `${fieldPrefix}Url`;
    const pluralField = `${fieldPrefix}Urls`;
    
    const existingPhotos = ticket.value[pluralField] || (ticket.value[singularField] ? [ticket.value[singularField]] : []);
    const updatedPhotos = [...existingPhotos, url];
    
    await saveTicket({
        [singularField]: updatedPhotos[0],
        [pluralField]: updatedPhotos
    });
};

const handleFinish = async () => {
    // Validation logic can be added here
    // TODO: Backend Integration - Finish Work
    await saveTicket({ status: 'review' });
};

const handleConfirm = async () => {
    // TODO: Backend Integration - Confirm Completion
    await saveTicket({ 
        status: 'completed',
        history: { ...ticket.value.history, completedAt: new Date().toISOString() }
    });
};

const handleReject = async () => {
    // TODO: Backend Integration - Reject
    await saveTicket({ status: 'arrived' });
};

</script>

<style>
.page-container { padding: 16px; background-color: #f8fafc; min-height: 100vh; }
.card { background: white; padding: 16px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.header-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
.ticket-id { color: #64748b; font-size: 12px; }
.status-badge { padding: 4px 8px; border-radius: 12px; font-size: 10px; text-transform: uppercase; font-weight: bold; }
.status-badge.open { background: #eff6ff; color: #2563eb; }
.status-badge.assigned { background: #eef2ff; color: #4f46e5; }
.status-badge.departed { background: #fff7ed; color: #ea580c; }
.status-badge.arrived { background: #fefce8; color: #ca8a04; }
.status-badge.review { background: #f0fdf4; color: #16a34a; }
.status-badge.completed { background: #f1f5f9; color: #475569; }

.title { font-size: 18px; font-weight: bold; margin-bottom: 8px; display: block; }
.meta-row { display: flex; gap: 8px; margin-bottom: 8px; }
.meta-item { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 10px; color: #475569; }
.location { color: #64748b; font-size: 12px; display: block; }

.workflow-card { padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 16px; }
.workflow-title { font-size: 18px; font-weight: bold; display: block; margin-bottom: 4px; }
.workflow-desc { font-size: 14px; display: block; margin-bottom: 16px; opacity: 0.8; }
.bg-blue { background: #eff6ff; color: #1e3a8a; }
.bg-indigo { background: #eef2ff; color: #312e81; }
.bg-orange { background: #fff7ed; color: #7c2d12; }
.bg-green { background: #f0fdf4; color: #14532d; }
.bg-gray { background: #f8fafc; color: #334155; }

.btn { padding: 12px; border-radius: 8px; font-size: 14px; font-weight: 500; border: none; }
.btn-primary { background: #2563eb; color: white; }
.btn-outline { background: transparent; border: 1px solid #cbd5e1; color: #334155; }
.btn-block { width: 100%; }
.mt-4 { margin-top: 16px; }

.work-area { margin-bottom: 40px; }
.section-label { font-size: 16px; font-weight: 600; margin-bottom: 12px; display: block; }

.step-card { background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e2e8f0; }
.step-label { font-size: 14px; font-weight: 500; margin-bottom: 12px; display: block; }

.status-toggles { display: flex; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 12px; }
.toggle-btn { flex: 1; text-align: center; padding: 8px 0; font-size: 12px; color: #64748b; background: #f8fafc; }
.toggle-btn.active-pass { background: #dcfce7; color: #15803d; font-weight: bold; }
.toggle-btn.active-fail { background: #fee2e2; color: #b91c1c; font-weight: bold; }
.toggle-btn.active-na { background: #f1f5f9; color: #475569; font-weight: bold; }

.photo-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.photo-item { width: 60px; height: 60px; border-radius: 6px; overflow: hidden; }
.photo { width: 100%; height: 100%; }
.add-photo-btn { width: 60px; height: 60px; border-radius: 6px; border: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
.plus-icon { font-size: 24px; }

.input, .textarea { width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-size: 14px; box-sizing: border-box; margin-bottom: 8px; }
.textarea { height: 80px; }
.picker-box { padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; }

.form-group { margin-bottom: 16px; }
.label { font-size: 14px; font-weight: 500; margin-bottom: 6px; display: block; }
.sub-label { font-size: 12px; color: #64748b; margin-top: 8px; display: block; }

.btn-group { display: flex; gap: 8px; justify-content: center; }
.loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; color: #94a3b8; }
</style>
