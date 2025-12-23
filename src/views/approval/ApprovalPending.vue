<template>
  <el-card shadow="never">
    <!-- Table -->
    <el-table
      :data="list"
      v-loading="loading"
      style="width: 100%"
      empty-text="대기 중인 결재가 없습니다."
    >
      <el-table-column
        prop="approvalCode"
        label="결재 코드"
        width="160"
      />

      <el-table-column
        prop="approvalTitle"
        label="제목"
      />

      <el-table-column
        prop="employeeName"
        label="요청자"
        width="120"
      />

      <el-table-column
        prop="positionName"
        label="직위"
        width="140"
      />

      <el-table-column
        label="요청일"
        width="160"
      >
        <template #default="{ row }">
          {{ formatDate(row.requestDate) }}
        </template>
      </el-table-column>

      <el-table-column
        label="관리"
        width="120"
      >
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
          >
            결재 처리
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="pagination-area">
      <el-pagination
        layout="prev, pager, next"
        :total="total"
        :page-size="size"
        v-model:current-page="page"
        @current-change="fetchList"
      />
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { getApprovalPending } from '@/api/approval'

/* pagination */
const page = ref(1)
const size = ref(10)
const total = ref(0)

/* table */
const list = ref([])
const loading = ref(false)

/* api */
const fetchList = async () => {
  loading.value = true
  try {
    // ⚠️ interceptor로 response.data가 이미 벗겨진 상태
    const res = await getApprovalPending(page.value, size.value)
    console.log('pending res:', res)
    list.value = res.contents || []
    total.value = res.totalCount || 0
  } catch (e) {
    console.error('대기 결재 조회 실패', e)
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

/* util */
const formatDate = (d) =>
  d ? dayjs(d).format('YYYY-MM-DD') : '-'

onMounted(fetchList)
</script>

<style scoped>
.pagination-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
