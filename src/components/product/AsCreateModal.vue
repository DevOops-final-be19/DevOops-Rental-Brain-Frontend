<template>
    <el-dialog
    v-model="visible"
    title="점검 일정 추가"
    width="520px"
    destroy-on-close
    align-center >
    <el-form :model="form" label-width="100px">

        <el-form-item label="점검 유형">
            <el-select v-model="form.type" placeholder="선택">
            <el-option label="정기점검" value="R" />
            <el-option label="AS" value="A" />
            </el-select>
        </el-form-item>

        <el-form-item label="담당 기사">
            <el-input v-model="form.engineer" />
        </el-form-item>

        <el-form-item label="예정일">
            <el-date-picker
            v-model="form.dueDate"
            type="datetime"
            style="width: 100%"
            />
        </el-form-item>

        <el-form-item label="기업 ID">
            <el-input v-model="form.customerId" />
        </el-form-item>

        <el-form-item label="자산 ID">
            <el-input v-model="form.itemId" />
        </el-form-item>

        <el-form-item label="내용">
            <el-input
            v-model="form.contents"
            type="textarea"
            rows="3"
            />
        </el-form-item>

    </el-form>

    <template #footer>
        <div class="footer-actions">
            <el-button @click="close">취소</el-button>
            <el-button type="primary" @click="submit">저장</el-button>
        </div>
    </template>
    </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from '@/api/axios'
import { ElMessage } from 'element-plus'

const props = defineProps({
    modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'created'])

const visible = ref(false)

const form = ref({
    type: '',
    engineer: '',
    dueDate: '',
    contents: '',
    itemId: null,
    customerId: null
})

watch(
    () => props.modelValue,
    (v) => (visible.value = v)
)

const close = () => {
    emit('update:modelValue', false)
}

const submit = async () => {
    await axios.post('/as', form.value)
    ElMessage.success('점검 일정이 추가되었습니다')

    emit('created')
    close()
}
</script>

<style scoped>
.footer-actions { display: flex; justify-content: flex-end; gap: 12px; }
</style>
