<script setup>
  import { ref, computed, onMounted } from 'vue'
  
  /* =========================
     props / emits
  ========================= */
  const props = defineProps({
    draft: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['prev', 'next', 'update'])
  
  /* =========================
     결제 정보 상태
  ========================= */
  const paymentMethod = ref('AUTO') // AUTO | ACCOUNT
  const memo = ref('')
  
  /* =========================
     Step2 데이터 기반 계산
  ========================= */
  
  /* 월 납부액 (선택된 상품 기준) */
  const monthlyPayment = computed(() => {
    if (!props.draft.assets) return 0
    return props.draft.assets.reduce(
      (sum, item) => sum + item.monthlyTotal,
      0
    )
  })
  
  /* 계약 기간 */
  const contractDuration = computed(() => {
    return props.draft.contract?.duration || 0
  })
  
  /* 계약 총액 */
  const totalAmount = computed(() => {
    return monthlyPayment.value * contractDuration.value
  })
  
  /* 결제일 (계약 시작일 기준) */
  const paymentDay = computed(() => {
    const start = props.draft.contract?.startDate
    if (!start) return ''
    return new Date(start).getDate()
  })
  
  /* =========================
     다음 단계
  ========================= */
  function goNext() {
    emit('update', {
      payment: {
        monthlyPayment: monthlyPayment.value,
        totalAmount: totalAmount.value,
        paymentDay: paymentDay.value,
        paymentMethod: paymentMethod.value,
        memo: memo.value
      }
    })
  
    emit('next')
  }
  
  /* =========================
     util
  ========================= */
  const formatPrice = v => v.toLocaleString() + '원'
  </script>
  
  <template>
    <div class="step-container">
      <h2 class="title">결제 정보 설정</h2>
  
      <!-- 금액 정보 -->
      <section class="card">
        <h3 class="section-title">결제 금액</h3>
  
        <div class="price-grid">
          <div class="price-item">
            <label>월 납부액</label>
            <strong>{{ formatPrice(monthlyPayment) }}</strong>
          </div>
  
          <div class="price-item">
            <label>계약 기간</label>
            <strong>{{ contractDuration }} 개월</strong>
          </div>
  
          <div class="price-item">
            <label>계약 총액</label>
            <strong>{{ formatPrice(totalAmount) }}</strong>
          </div>
  
          <div class="price-item">
            <label>결제일</label>
            <strong>매월 {{ paymentDay }}일</strong>
          </div>
        </div>
      </section>
  
      <!-- 결제 방법 -->
      <section class="card">
        <h3 class="section-title">결제 방법</h3>
  
        <div class="radio-group">
          <label class="radio-item">
            <input
              type="radio"
              value="AUTO"
              v-model="paymentMethod"
            />
            자동이체
          </label>
  
          <label class="radio-item">
            <input
              type="radio"
              value="ACCOUNT"
              v-model="paymentMethod"
            />
            계좌이체
          </label>
        </div>
      </section>
  
      <!-- 특약 사항 -->
      <section class="card">
        <h3 class="section-title">특약 사항</h3>
  
        <textarea
          v-model="memo"
          rows="4"
          placeholder="특약 사항 또는 참고 메모를 입력하세요."
        />
      </section>
  
      <!-- 하단 버튼 -->
      <div class="footer">
        <button class="secondary-btn" @click="$emit('prev')">
          이전
        </button>
        <button class="primary-btn" @click="goNext">
          다음
        </button>
      </div>
    </div>
  </template>
  
  <style scoped>
  .step-container {
    padding: 32px 48px;
  }
  
  .title {
    font-size: 22px;
    margin-bottom: 20px;
  }
  
  .card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .section-title {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .price-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .price-item label {
    font-size: 13px;
    color: #666;
  }
  
  .price-item strong {
    display: block;
    font-size: 18px;
    margin-top: 4px;
  }
  
  .radio-group {
    display: flex;
    gap: 24px;
  }
  
  .radio-item {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #e0e4f0;
    border-radius: 6px;
    resize: vertical;
  }
  
  .footer {
    display: flex;
    justify-content: space-between;
  }
  
  .primary-btn {
    background: #248eff;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
  }
  
  .secondary-btn {
    background: #eee;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
  }
  </style>
  