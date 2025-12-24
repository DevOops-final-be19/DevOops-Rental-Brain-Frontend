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
        label="결재"
        width="180"
      >
        <template #default="{ row }">
          <el-button
            size="small"
            type="success"
            @click="openApproveModal(row)"
          >
            승인
          </el-button>
        
          <el-button
            size="small"
            type="danger"
            @click="openRejectModal(row)"
          >
            반려
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
import { approveApproval, rejectApproval } from '@/api/approval'

/* pagination */
const page = ref(1)
const size = ref(10)
const total = ref(0)

/* table */
const list = ref([])
const loading = ref(false)

const approveVisible = ref(false)
const selectedApproval = ref(null)

/* api */
const fetchList = async () => {
  loading.value = true
  try {
    // interceptor로 response.data가 이미 벗겨진 상태
    const res = await getApprovalPending(page.value, size.value)
    console.log('pending res:', res)

    const data = res.contents ? res : res.data

    list.value = data.contents ?? []
    total.value = data.totalCount ?? 0
  } catch (e) {
    console.error('대기 결재 조회 실패', e)
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const confirmApprove = async () => {
  try {
    await approveApproval(selectedApproval.value.approvalCode)
    ElMessage.success('승인 처리되었습니다.')
    approveVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error('승인 처리 실패')
  }
}

const openApproveModal = (row) => {
  selectedApproval.value = row
  approveVisible.value = true
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
