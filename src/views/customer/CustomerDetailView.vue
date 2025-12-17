<template>
  <div class="page-container" v-loading="loading">
    <div class="top-nav">
      <el-button link @click="$router.back()">← 고객 목록으로 돌아가기</el-button>
    </div>
    
    <div class="header-section" v-if="customer">
      <div class="title-box">
        <div>
          <h2 class="company-name" style="color: #000;">
            {{ customer.name }}
            <el-tag effect="dark" size="small" type="info" class="id-tag">{{ customer.customerCode }}</el-tag>
            <el-tag effect="plain" round class="segment-tag" :type="getSegmentColor(customer.segmentName)">
              {{ customer.segmentName }}
            </el-tag>
          </h2>
        </div>
      </div>
      <div class="btn-group">
        <el-button type="warning" @click="openEditModal">정보 수정</el-button>
        
        <el-popconfirm title="정말 이 고객을 삭제하시겠습니까?" @confirm="handleDelete">
          <template #reference>
            <el-button type="danger">고객 삭제</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <el-card shadow="never" class="detail-card">
      <el-tabs v-model="activeTab">
        
        <el-tab-pane label="종합 정보" name="general">
          <div class="info-grid">
            <div class="info-item"><label>기업명</label><div>{{ customer.name }}</div></div>
            <div class="info-item"><label>담당자</label><div>{{ customer.inCharge }}</div></div>
            <div class="info-item"><label>연락처</label><div>{{ formatPhoneNumber(customer.callNum) }} / {{ formatPhoneNumber(customer.phone) }}</div></div>
            <div class="info-item"><label>이메일</label><div>{{ customer.email }}</div></div>
            <div class="info-item"><label>사업자번호</label><div>{{ customer.businessNum }}</div></div>
            <div class="info-item"><label>주소</label><div>{{ customer.addr }}</div></div>
          </div>
          
          <div class="memo-box">
            <label style="font-size: 12px; color: #666; display: block; margin-bottom: 4px;">메모</label>
            {{ customer.memo || '등록된 메모가 없습니다.' }}
          </div>
          
          <h4 class="section-title">고객 활동 히스토리</h4>
          <div class="history-list">
             <div v-for="(item, idx) in customerHistory" :key="idx" class="history-item">
               <div class="content-area">
                 <div class="h-title">
                   {{ item.title }}
                   <span class="h-date">{{ formatDateTime(item.date) }}</span>
                 </div>
                 <div class="h-desc">{{ item.content }}</div>
               </div>
             </div>
             <div v-if="customerHistory.length === 0" class="no-data">히스토리가 없습니다.</div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="문의 내역" name="inquiry">
          <el-table :data="customer.supportList || []" style="width: 100%">
            <el-table-column prop="title" label="제목" />
            <el-table-column prop="status" label="상태" width="120" align="center" />
            <el-table-column prop="createDate" label="접수일" width="180" align="center">
               <template #default="{row}">{{ formatDateTime(row.createDate) }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="계약 내역" name="contract">
          <el-table :data="customer.contractList || []" style="width: 100%">
            <el-table-column prop="name" label="계약명" />
            <el-table-column prop="totalAmount" label="계약 금액" align="right">
               <template #default="{row}">{{ row.totalAmount?.toLocaleString() }}원</template>
            </el-table-column>
            <el-table-column prop="status" label="상태" width="120" align="center" />
            <el-table-column prop="startDate" label="시작일" width="150" align="center">
               <template #default="{row}">{{ formatDate(row.startDate) }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="AS 내역" name="as">
          <el-table :data="customer.asList || []" style="width: 100%">
            <el-table-column prop="title" label="제목" />
            <el-table-column prop="status" label="상태" width="120" align="center" />
            <el-table-column prop="dueDate" label="처리 예정일" width="150" align="center">
               <template #default="{row}">{{ formatDate(row.dueDate) }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

      </el-tabs>
    </el-card>

    <el-dialog v-model="editModalVisible" title="고객 정보 수정" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="기업명"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="담당자"><el-input v-model="editForm.inCharge" /></el-form-item>
        <el-form-item label="전화번호"><el-input v-model="editForm.callNum" placeholder="숫자만 입력" /></el-form-item>
        <el-form-item label="휴대폰"><el-input v-model="editForm.phone" placeholder="숫자만 입력" /></el-form-item>
        <el-form-item label="이메일"><el-input v-model="editForm.email" /></el-form-item>
        <el-form-item label="주소"><el-input v-model="editForm.addr" /></el-form-item>
        <el-form-item label="메모"><el-input v-model="editForm.memo" type="textarea" :rows="4" /></el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editModalVisible = false">취소</el-button>
          <el-button type="primary" @click="handleEditSave">저장</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// API 함수 임포트 (수정된 api/customerlist.js 사용)
import { getCustomerDetail, updateCustomer, deleteCustomer } from '@/api/customerlist'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const customerId = route.params.id

const loading = ref(false)
const customer = ref({})
const activeTab = ref('general')

// 수정 모달 상태
const editModalVisible = ref(false)
const editForm = ref({})

// [Computed] 통합 히스토리 (최신순 정렬)
const customerHistory = computed(() => {
  let list = []
  if(customer.value.supportList) {
    list.push(...customer.value.supportList.map(i => ({ 
      title: '[문의] ' + i.title, 
      content: i.content || '내용 없음', 
      date: i.createDate 
    })))
  }
  if(customer.value.contractList) {
    list.push(...customer.value.contractList.map(i => ({ 
      title: '[계약] ' + i.name, 
      content: (i.totalAmount ? i.totalAmount.toLocaleString() : '0') + '원', 
      date: i.startDate 
    })))
  }
  if(customer.value.asList) {
    list.push(...customer.value.asList.map(i => ({ 
      title: '[AS] ' + i.title, 
      content: i.status, 
      date: i.dueDate 
    })))
  }
  // 날짜 내림차순 정렬
  return list.sort((a,b) => new Date(b.date) - new Date(a.date))
})

// [Method] 상세 정보 조회
const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await getCustomerDetail(customerId)
    customer.value = res.data
  } catch(e) {
    console.error(e)
    ElMessage.error('고객 정보를 불러오지 못했습니다.')
  } finally { 
    loading.value = false 
  }
}

// [Method] 수정 모달 열기
const openEditModal = () => {
  // 현재 데이터를 복사해서 폼에 넣음
  editForm.value = { ...customer.value }
  editModalVisible.value = true
}

// [Method] 수정 저장
const handleEditSave = async () => {
  try {
    const payload = { ...editForm.value }
    
    // 백엔드 전송 전 하이픈(-) 제거 처리
    if(payload.callNum) payload.callNum = payload.callNum.replace(/-/g, '')
    if(payload.phone) payload.phone = payload.phone.replace(/-/g, '')
    if(payload.businessNum) payload.businessNum = payload.businessNum.replace(/-/g, '')

    // API 호출 (내부적으로 /customers/updateCustomer/{id} 로 전송됨)
    await updateCustomer(customerId, payload)
    
    ElMessage.success('정보가 수정되었습니다.')
    editModalVisible.value = false
    fetchDetail() // 상세정보 다시 로드
  } catch(e) {
    console.error(e)
    ElMessage.error('수정에 실패했습니다. 입력값을 확인해주세요.')
  }
}

// [Method] 삭제 처리
const handleDelete = async () => {
  try {
    // API 호출 (내부적으로 /customers/deleteCustomer/{id} 로 전송됨)
    await deleteCustomer(customerId)
    
    ElMessage.success('고객이 삭제되었습니다.')
    router.push('/customers') // 목록으로 이동
  } catch(e) {
    console.error(e)
    ElMessage.error('삭제에 실패했습니다.')
  }
}

// [Util] 포맷팅 함수들
const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD') : '-'
const formatDateTime = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-'

const formatPhoneNumber = (num) => {
  if (!num) return '-'
  const cleaned = ('' + num).replace(/\D/g, '')
  if (cleaned.startsWith('02')) {
    return cleaned.length === 9 
      ? cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3') 
      : cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')
  }
  return cleaned.length === 11 
    ? cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') 
    : cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
}

const getSegmentColor = (seg) => {
  if (!seg) return 'info'
  if (seg.includes('VIP')) return 'warning'
  if (seg.includes('신규')) return 'primary'
  if (seg.includes('위험') || seg.includes('이탈')) return 'danger'
  return 'success'
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.page-container { max-width: 1400px; margin: 0 auto; padding: 20px; }
.top-nav { margin-bottom: 12px; }

/* 헤더 영역 */
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.title-box { display: flex; align-items: center; gap: 16px; }
.company-name { margin: 0; font-size: 24px; font-weight: 700; display: flex; align-items: center; }
.id-tag { margin-left: 12px; }
.segment-tag { margin-left: 8px; }
.btn-group { display: flex; gap: 8px; }

/* 정보 그리드 */
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
.info-item label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.info-item div { font-size: 16px; color: #333; font-weight: 500; }

/* 메모 박스 */
.memo-box { background: #f9fafb; padding: 16px; border-radius: 8px; color: #555; margin-bottom: 30px; white-space: pre-wrap; line-height: 1.5; }

/* 히스토리 리스트 */
.section-title { margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #333; }
.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-item { padding: 16px; border: 1px solid #eee; border-radius: 8px; background: #fff; }
.h-title { font-weight: 600; color: #333; margin-bottom: 4px; display: flex; justify-content: space-between; }
.h-date { font-weight: 400; color: #999; font-size: 13px; }
.h-desc { color: #666; font-size: 14px; }
.no-data { text-align: center; color: #999; padding: 20px; }

.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; }
</style>