<template>
  <div class="page-container">
    <div class="header-row">
      <h2>고객 목록</h2>
      <el-button type="primary" :icon="Plus" @click="openRegisterModal">신규 기업 등록</el-button>
    </div>
    <p class="subtitle">B2B 기업 고객 통합 관리 · 세그먼트별 분류</p>

    <div class="filter-row">
      <el-input
        v-model="searchKeyword"
        placeholder="기업명, 담당자, 연락처, 사업자번호로 검색..."
        prefix-icon="Search"
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <div class="filter-group">
        <el-button :icon="Filter" @click="openFilterModal">필터</el-button>
        <el-button type="primary" plain @click="openSegmentCriteriaModal">세그먼트 기준표</el-button>
      </div>
    </div>

    <div class="kpi-row">
      <div class="kpi-card">
        <div class="icon-box blue"><el-icon><OfficeBuilding /></el-icon></div>
        <div>
          <div class="label">총 거래 기업</div>
          <div class="value">{{ kpiData.totalCount }}개사</div>
          <div class="sub-text blue-text">B2B 전용</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="icon-box green"><el-icon><Trophy /></el-icon></div>
        <div>
          <div class="label">VIP 고객</div>
          <div class="value">{{ kpiData.vipCount }}개사</div>
          <div class="sub-text green-text">전체의 {{ kpiData.vipRate ? kpiData.vipRate.toFixed(1) : 0 }}%</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="icon-box red"><el-icon><Warning /></el-icon></div>
        <div>
          <div class="label">이탈위험 고객</div>
          <div class="value">{{ kpiData.riskCount }}개사</div>
          <div class="sub-text red-text">즉시 조치 필요</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="icon-box gray"><el-icon><CircleCloseFilled /></el-icon></div>
        <div>
          <div class="label">블랙리스트</div>
          <div class="value">{{ kpiData.blacklistCount }}개사</div>
          <div class="sub-text red-text">거래 제한</div>
        </div>
      </div>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table :data="customers" style="width: 100%" v-loading="loading">
        <el-table-column prop="customerCode" label="ID" width="140" />
        <el-table-column label="기업명" min-width="180">
          <template #default="scope">
            <span style="font-weight: 600; cursor: pointer" @click="goDetail(scope.row.id)">
              {{ scope.row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="inCharge" label="담당자" width="120" />
        <el-table-column prop="dept" label="부서/직책" width="150" />
        <el-table-column prop="callNum" label="연락처" width="140">
           <template #default="scope">
             {{ formatPhoneNumber(scope.row.callNum) }}
           </template>
        </el-table-column>
        <el-table-column label="첫 계약일" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.firstContractDate) }}
          </template>
        </el-table-column>
        <el-table-column label="세그먼트" width="140">
          <template #default="scope">
            <el-tag :type="getSegmentColor(scope.row.segmentName)" effect="light">
              {{ scope.row.segmentName || '미지정' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="액션" width="100" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="goDetail(scope.row.id)">상세</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalCount"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="filterModalVisible" title="필터 설정" width="400px">
      <el-form label-position="top">
        <el-form-item label="고객 세그먼트">
          <el-checkbox-group v-model="filterSegments">
            <el-checkbox label="VIP 고객" value="VIP 고객" />
            <el-checkbox label="일반 고객" value="일반 고객" />
            <el-checkbox label="신규 고객" value="신규 고객" />
            <el-checkbox label="이탈 위험 고객" value="이탈 위험 고객" />
            <el-checkbox label="블랙리스트 고객" value="블랙리스트 고객" />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetFilters">초기화</el-button>
          <el-button type="primary" @click="applyFilters">적용</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="segmentCriteriaVisible" title="세그먼트 분류 기준표" width="600px">
      <el-table :data="segmentCriteriaData" border style="width: 100%">
        <el-table-column label="등급" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getSegmentColor(scope.row.grade)" effect="dark" style="font-weight: bold; width: 80px;">
              {{ scope.row.grade }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column property="criteria" label="선정 기준" />
      </el-table>
      <template #footer>
        <el-button @click="segmentCriteriaVisible = false">닫기</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="registerModalVisible" title="신규 기업 등록" width="600px">
      <el-form :model="registerForm" label-width="140px">
        <el-form-item label="기업명" required>
          <el-input v-model="registerForm.name" />
        </el-form-item>
        <el-form-item label="사업자등록번호">
          <el-input v-model="registerForm.businessNum" placeholder="하이픈 없이 입력" />
        </el-form-item>
        <el-form-item label="담당자명">
          <el-input v-model="registerForm.inCharge" />
        </el-form-item>
        <el-form-item label="전화번호">
          <el-input v-model="registerForm.callNum" placeholder="하이픈 없이 입력" />
        </el-form-item>
        <el-form-item label="휴대폰번호">
          <el-input v-model="registerForm.phone" placeholder="하이픈 없이 입력" />
        </el-form-item>
        <el-form-item label="이메일">
          <el-input v-model="registerForm.email" />
        </el-form-item>
        <el-form-item label="주소">
          <el-input v-model="registerForm.addr" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="registerModalVisible = false">취소</el-button>
          <el-button type="primary" @click="handleRegister">등록</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, Filter, OfficeBuilding, Trophy, Warning, CircleCloseFilled } from '@element-plus/icons-vue'
import { getCustomerList, createCustomer, getCustomerKpi } from '@/api/customerlist'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const router = useRouter()
const customers = ref([])
const totalCount = ref(0)
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// KPI 데이터
const kpiData = ref({ totalCount: 0, vipCount: 0, vipRate: 0, riskCount: 0, blacklistCount: 0 })

// 필터 관련
const filterModalVisible = ref(false)
const filterSegments = ref([])

// 등록 모달 관련
const registerModalVisible = ref(false)
const registerForm = ref({ name: '', businessNum: '', inCharge: '', callNum: '', phone: '', email: '', addr: '' })

// 세그먼트 기준표
const segmentCriteriaVisible = ref(false)
const segmentCriteriaData = [
  { grade: 'VIP 고객', criteria: '연 매출 1억 이상 또는 3년 이상 장기 계약' },
  { grade: '일반 고객', criteria: '활성 계약 보유 및 연체 없음' },
  { grade: '신규 고객', criteria: '최초 계약 후 3개월 이내' },
  { grade: '이탈 위험 고객', criteria: '최근 사용량 저조 또는 연체 발생' },
  { grade: '블랙리스트 고객', criteria: '악성 미납 또는 계약 위반' },
]

// --- Methods ---

// 데이터 조회 (검색, 필터, 페이징 포함)
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      // 백엔드 Criteria 필드명에 맞춤 (pageNum, amount)
      pageNum: currentPage.value,
      amount: pageSize.value,
      keyword: searchKeyword.value,
      segments: filterSegments.value // 배열은 api/customerlist.js에서 직렬화됨
    }
    const res = await getCustomerList(params)
    // PageResponseDTO { contents, totalCount, paging } 구조
    customers.value = res.data.contents
    totalCount.value = res.data.totalCount
  } catch (err) {
    console.error(err)
    ElMessage.error('데이터 로드에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// KPI 조회
const fetchKpi = async () => {
  try {
    const res = await getCustomerKpi()
    kpiData.value = res.data
  } catch (err) {
    console.error('KPI Load Error:', err)
  }
}

// 검색 핸들러
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 필터 적용
const applyFilters = () => {
  filterModalVisible.value = false
  currentPage.value = 1
  fetchData()
}

// 필터 초기화
const resetFilters = () => {
  filterSegments.value = []
}

// 페이지 변경
const handlePageChange = (val) => {
  currentPage.value = val
  fetchData()
}

// 신규 등록
const handleRegister = async () => {
  try {
    const form = { ...registerForm.value }
    // 하이픈 제거
    if (form.businessNum) form.businessNum = form.businessNum.replace(/-/g, '')
    if (form.callNum) form.callNum = form.callNum.replace(/-/g, '')
    if (form.phone) form.phone = form.phone.replace(/-/g, '')

    await createCustomer(form)
    
    ElMessage.success('성공적으로 등록되었습니다.')
    registerModalVisible.value = false
    
    // 폼 초기화
    registerForm.value = { name: '', businessNum: '', inCharge: '', callNum: '', phone: '', email: '', addr: '' }
    
    // 목록 및 KPI 갱신
    currentPage.value = 1
    fetchData()
    fetchKpi()
  } catch (err) {
    console.error(err)
    ElMessage.error('등록에 실패했습니다.')
  }
}

// 상세 페이지 이동
const goDetail = (id) => {
  router.push(`/customers/${id}`)
}

// 모달 열기
const openFilterModal = () => { filterModalVisible.value = true }
const openSegmentCriteriaModal = () => { segmentCriteriaVisible.value = true }
const openRegisterModal = () => { registerModalVisible.value = true }

// 유틸리티 함수
const formatDate = (dateStr) => dateStr ? dayjs(dateStr).format('YYYY-MM-DD') : '-'
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
const getSegmentColor = (segmentName) => {
  if (!segmentName) return 'info'
  if (segmentName.includes('VIP')) return 'warning'
  if (segmentName.includes('신규')) return 'primary'
  if (segmentName.includes('위험') || segmentName.includes('이탈')) return 'danger'
  if (segmentName.includes('블랙')) return 'info'
  return 'success'
}

// 초기 로드
onMounted(() => {
  fetchData()
  fetchKpi()
})
</script>

<style scoped>
.page-container { max-width: 1600px; margin: 0 auto; padding: 20px; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
h2 { font-size: 24px; font-weight: 700; color: #111; margin: 0; }
.subtitle { color: #666; font-size: 14px; margin-bottom: 24px; }

/* 필터 영역 */
.filter-row { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 12px; }
.search-input { width: 400px; }
.filter-group { display: flex; gap: 8px; }

/* KPI 카드 */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
.kpi-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee; display: flex; align-items: center; gap: 16px; }
.icon-box { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.icon-box.blue { background: #eef2ff; color: #4f46e5; }
.icon-box.green { background: #ecfdf5; color: #10b981; }
.icon-box.red { background: #fef2f2; color: #ef4444; }
.icon-box.gray { background: #f3f4f6; color: #4b5563; }
.label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
.value { font-size: 20px; font-weight: 700; color: #111; margin-bottom: 2px; }
.sub-text { font-size: 12px; font-weight: 500; }
.blue-text { color: #4f46e5; }
.green-text { color: #10b981; }
.red-text { color: #ef4444; }

/* 테이블 및 페이지네이션 */
.table-card { border-radius: 8px; }
.pagination-row { display: flex; justify-content: flex-end; margin-top: 20px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; }
</style>