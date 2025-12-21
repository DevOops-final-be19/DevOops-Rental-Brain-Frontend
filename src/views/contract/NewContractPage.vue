<script setup>
  import { ref } from 'vue'
  
  import Step1Customer from './Step1Customer.vue'
  import Step2ContractProduct from './Step2ContractProduct.vue'
  import Step3Payment from './Step3Payment.vue'
  import Step4Approval from './Step4Approval.vue'
  import Step5Review from './Step5Review.vue'
  
  /* 현재 단계 */
  const currentStep = ref(1)
  
  /* 계약 임시 데이터 */
  const draft = ref({
    customerId: null,
    contract: {
      name: '',
      startDate: '',
      endDate: '',
      duration: null
    },
    assets: [],
    payment: null,
    approvalLine: []
  })
  
  /* draft 병합 업데이트 */
  const updateDraft = (payload) => {
    draft.value = {
      ...draft.value,
      ...payload
    }
  }
  
  /* 단계 이동 */
  const nextStep = () => {
    if (currentStep.value < 5) currentStep.value++
  }
  
  const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--
  }
  
  /* 계약 생성 */
  const submitContract = async () => {
    // TODO: POST /contracts
    console.log('최종 계약 생성 요청', draft.value)
  }
  </script>
  
  <template>
    <!-- 🔹 상위 레이아웃 컨테이너 -->
    <div class="contract-create-page">
      <div class="page-container">
        <!-- Step 1 -->
        <Step1Customer
          v-if="currentStep === 1"
          :draft="draft"
          @next="nextStep"
          @update="updateDraft"
        />
  
        <!-- Step 2 -->
        <Step2ContractProduct
          v-if="currentStep === 2"
          :draft="draft"
          @next="nextStep"
          @prev="prevStep"
          @update="updateDraft"
        />
  
        <!-- Step 3 -->
        <Step3Payment
          v-if="currentStep === 3"
          :draft="draft"
          @next="nextStep"
          @prev="prevStep"
          @update="updateDraft"
        />
  
        <!-- Step 4 -->
        <Step4Approval
          v-if="currentStep === 4"
          :draft="draft"
          @next="nextStep"
          @prev="prevStep"
          @update="updateDraft"
        />
  
        <!-- Step 5 -->
        <Step5Review
          v-if="currentStep === 5"
          :draft="draft"
          @prev="prevStep"
          @submit="submitContract"
        />
      </div>
    </div>
  </template>
  
  <style scoped>
  /* 페이지 배경 */
  .contract-create-page {
    background: #f5f7fb;
    min-height: 100vh;
  }
  
  /* ⭐ 핵심: 좌우 여백 + 최대 너비 */
  .page-container {
    max-width: 1280px;      /* 너무 넓지 않게 */
    margin: 0 auto;         /* 가운데 정렬 */
    padding: 24px 32px;     /* 좌우 여백 */
  }
  
  /* 반응형 (태블릿/모바일) */
  @media (max-width: 768px) {
    .page-container {
      padding: 16px 20px;
    }
  }
  </style>
  