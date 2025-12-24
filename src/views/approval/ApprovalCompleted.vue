<template>
  <el-card shadow="never">
    <el-table :data="list" style="width: 100%" empty-text="완료된 결재가 없습니다.">
      <el-table-column
        prop="approvalCode"
        label="결재 코드"
        width="160"
      />

      <el-table-column
        prop="approvalTitle"
        label="제목"
      />

      <el-table-column label="결과" width="120">
        <template #default="{ row }">
          <el-tag
            :type="row.resultStatus === 'APPROVED' ? 'success' : 'danger'"
          >
            {{ row.resultStatus === 'APPROVED' ? '승인' : '반려' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="rejectReason"
        label="반려 사유"
      />

      <el-table-column label="처리일" width="160">
        <template #default="{ row }">
          {{ formatDate(row.lastProcessDate) }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { getApprovalCompleted } from '@/api/approval'

const list = ref([])

const fetchList = async () => {
  try {
    const res = await getApprovalCompleted(1, 10)
    list.value = res?.data?.contents ?? []
  } catch (e) {
    console.error('완료된 결재 조회 실패', e)
    list.value = []
  }
}

const formatDate = d => {
  if (!d) return '-'
  return dayjs(d).format('YYYY-MM-DD')
}

onMounted(fetchList)
</script>
