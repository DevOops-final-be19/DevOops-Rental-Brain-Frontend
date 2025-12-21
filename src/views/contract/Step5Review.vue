<script setup>
    const props = defineProps({
      draft: Object
    })
    
    const emit = defineEmits(['prev', 'submit'])
    </script>
    
    <template>
      <div>
        <h2>Step 5. 최종 검토</h2>
    
        <pre style="background:#f5f5f5; padding:10px;">
    {{ draft }}
        </pre>
    
        <button @click="$emit('prev')">이전</button>
        <button @click="$emit('submit')">
          승인 요청
        </button>
      </div>
    </template>
    