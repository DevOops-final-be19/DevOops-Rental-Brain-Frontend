<script setup>
    const props = defineProps({
      draft: Object
    })
    
    const emit = defineEmits(['update', 'next', 'prev'])
    
    const saveApprovalLine = () => {
      // TODO: GET /approvals/available-line
    
      emit('update', {
        approvalLine: [
          { step: 1, empId: 10 },
          { step: 2, empId: 20 },
          { step: 3, empId: 30 }
        ]
      })
    
      emit('next')
    }
    </script>
    
    <template>
      <div>
        <h2>Step 4. 결재선 지정</h2>
    
        <pre>{{ draft.approvalLine }}</pre>
    
        <button @click="$emit('prev')">이전</button>
        <button @click="saveApprovalLine">다음</button>
      </div>
    </template>
    