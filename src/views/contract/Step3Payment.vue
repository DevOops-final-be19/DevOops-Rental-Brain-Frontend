<script setup>
    const props = defineProps({
      draft: Object
    })
    
    const emit = defineEmits(['update', 'next', 'prev'])
    
    const savePayment = () => {
      // TODO:
      // GET /promotions
      // GET /coupons
      // POST /contracts/calculate/discount
    
      emit('update', {
        payment: {
          monthlyFee: 720,
          totalAmount: 17280,
          paymentMethod: 'AUTO_TRANSFER',
          paymentDay: 1,
          promotionId: 'PROMO-001',
          couponId: 'COUPON-002'
        }
      })
    
      emit('next')
    }
    </script>
    
    <template>
      <div>
        <h2>Step 3. 결제 조건</h2>
    
        <pre>{{ draft.payment }}</pre>
    
        <button @click="$emit('prev')">이전</button>
        <button @click="savePayment">다음</button>
      </div>
    </template>
    