<template>
  <el-card shadow="never">
    <el-table :data="list" style="width: 100%" empty-text="진행 중인 결재가 없습니다.">
      <el-table-column
        prop="approval_code"
        label="결재 코드"
        width="160"
      />

      <el-table-column
        prop="approval_title"
        label="제목"
      />

      <el-table-column label="진행률" width="180">
        <template #default="{ row }">
          <el-progress :percentage="row.progressRate ?? 0" />
        </template>
      </el-table-column>

      <el-table-column label="다음 승인자">
        <template #default="{ row }">
          {{ row.nextApproverName || '완료 대기' }}
        </template>
      </el-table-column>

      <el-table-column label="요청일" width="160">
        <template #default="{ row }">
          {{ formatDate(row.requestDate) }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { getApprovalProgress } from '@/api/approval'

const list = ref([])

const fetchList = async () => {
  try {
    const res = await getApprovalProgress(1, 10)

    // 방어 코드 (백엔드 응답 구조 변화 대비)
    list.value = res?.data?.contents ?? []
  } catch (e) {
    console.error('결재 진행 목록 조회 실패', e)
    list.value = []
  }
}

const formatDate = d => {
  if (!d) return '-'
  return dayjs(d).format('YYYY-MM-DD')
}

onMounted(fetchList)
</script>
