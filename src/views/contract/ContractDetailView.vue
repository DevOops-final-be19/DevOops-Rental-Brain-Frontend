<template>
  <div class="page-container" v-loading="loading">

    <!-- ===== Header ===== -->
    <div class="detail-header">
      <div class="header-left">
        <el-button circle plain @click="goList">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>

        <div>
          <h2 class="title">{{ vm.contractName }}</h2>
          <p class="sub">{{ vm.contractCode }}</p>
        </div>
      </div>
    </div>

    <!-- ===== Progress / KPI ===== -->
    <el-card shadow="never" class="summary-card">
      <div class="summary-grid">
        <div>
          <div class="progress-label">계약 진행률</div>
          <el-progress :percentage="vm.progressRate" :stroke-width="12" />
        </div>

        <div class="kpi">
          <p class="kpi-title">월 납부액</p>
          <p class="kpi-value">{{ money(vm.monthlyPayment) }}</p>
        </div>

        <div class="kpi">
          <p class="kpi-title">총 계약 금액</p>
          <p class="kpi-value">{{ money(vm.totalAmount) }}</p>
        </div>

        <div class="kpi danger">
          <p class="kpi-title">연체 건수</p>
          <p class="kpi-value">{{ vm.overdueCount }}건</p>
        </div>
      </div>
    </el-card>

    <!-- ===== Tabs ===== -->
    <el-tabs
      v-model="activeTab"
      type="border-card"
      class="detail-tabs"
      @tab-change="onTabChange"
    >

      <!-- 계약 개요 -->
      <el-tab-pane label="계약 개요" name="overview">
        <el-card shadow="never" class="overview-card">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="계약 코드">{{ vm.contractCode }}</el-descriptions-item>
            <el-descriptions-item label="고객 코드">{{ vm.customerCode }}</el-descriptions-item>
            <el-descriptions-item label="담당자">{{ vm.inCharge }}</el-descriptions-item>
            <el-descriptions-item label="연락처">{{ formatPhone(vm.callNum) }}</el-descriptions-item>
            <el-descriptions-item label="계약 시작일">{{ formatDate(vm.startDate) }}</el-descriptions-item>
            <el-descriptions-item label="계약 기간">{{ vm.contractPeriod }} 개월</el-descriptions-item>
            <el-descriptions-item label="결제 방식">{{ vm.payMethodLabel }}</el-descriptions-item>
            <el-descriptions-item label="렌탈 자산 수">{{ vm.productCount }} 종</el-descriptions-item>
            <el-descriptions-item label="특이 사항" :span="3">
              {{ vm.specialContent || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-tab-pane>

      <!-- 렌탈 자산 -->
      <el-tab-pane label="렌탈 자산" name="items">
        <el-table :data="items" border stripe>
          <el-table-column prop="itemCode" label="자산 코드" width="160" />
          <el-table-column prop="name" label="자산명" />
          <el-table-column prop="latelyInspectDate" label="최근 점검일" width="140" />
        </el-table>
      </el-tab-pane>

      <!-- 결제 내역 -->
      <el-tab-pane label="결제 내역" name="payments">
        <el-table :data="payments" border stripe>
          <el-table-column label="납부 예정일" width="140">
            <template #default="{ row }">{{ formatDate(row.payment_due) }}</template>
          </el-table-column>

          <el-table-column label="실 납부일" width="140">
            <template #default="{ row }">
              {{ row.payment_actual ? formatDate(row.payment_actual) : '-' }}
            </template>
          </el-table-column>

          <el-table-column label="상태" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="paymentStatusTag(row.payment_status)">
                {{ paymentStatusLabel(row.payment_status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="연체 일수" width="120" align="center">
            <span :class="row.overdue_days ? 'overdue' : ''">
              {{ row.overdue_days ?? '-' }}
            </span>
          </el-table-column>
        </el-table>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const activeTab = ref('overview')

/* =========================
   State
========================= */
const vm = ref(initVm())
const items = ref([])
const payments = ref([])

const basicLoaded = ref(false)
const itemsLoaded = ref(false)
const paymentsLoaded = ref(false)

function initVm() {
  return {
    contractName: '',
    contractCode: '',
    contractPeriod: 0,
    startDate: '',
    customerCode: '',
    inCharge: '',
    callNum: '',
    monthlyPayment: 0,
    totalAmount: 0,
    payMethodLabel: '',
    specialContent: '',
    productCount: 0,
    progressRate: 0,
    overdueCount: 0
  }
}

/* =========================
   API
========================= */
async function fetchBasic(contractId) {
  if (!contractId || basicLoaded.value) return

  loading.value = true
  try {
    const res = await api.get(`/contract/${contractId}/basic-info`)
    const b = res.data
    const payMethodMap = { A: '자동이체', B: '계좌이체' }

    vm.value = {
      contractName: b.overview.contractName,
      contractCode: b.overview.contractCode,
      contractPeriod: b.overview.contractPeriod,
      startDate: b.overview.startDate,
      customerCode: b.overview.customerCode,
      inCharge: b.overview.inCharge,
      callNum: b.overview.callNum,
      monthlyPayment: b.overview.monthlyPayment,
      totalAmount: b.overview.totalAmount,
      payMethodLabel: payMethodMap[b.overview.payMethod] ?? '-',
      specialContent: b.overview.specialContent,
      productCount: b.productCount,
      progressRate: b.progress?.progressRate ?? 0,
      overdueCount: b.overdueCount ?? 0
    }

    basicLoaded.value = true
  } finally {
    loading.value = false
  }
}

async function fetchItems() {
  if (itemsLoaded.value) return
  loading.value = true
  try {
    const res = await api.get(`/contract/${route.params.id}/items`)
    items.value = res.data?.contractItemDetail ?? []
    itemsLoaded.value = true
  } finally {
    loading.value = false
  }
}

async function fetchPayments() {
  if (paymentsLoaded.value) return
  loading.value = true
  try {
    const res = await api.get(`/contract/${route.params.id}/payments`)
    payments.value = res.data ?? []
    paymentsLoaded.value = true
  } finally {
    loading.value = false
  }
}

/* =========================
   Tab Handler
========================= */
function onTabChange(tabName) {
  if (tabName === 'items') fetchItems()
  if (tabName === 'payments') fetchPayments()
}

/* =========================
   Lifecycle
========================= */
onMounted(() => {
  fetchBasic(route.params.id)
})

watch(
  () => route.params.id,
  (newId) => {
    vm.value = initVm()
    items.value = []
    payments.value = []
    activeTab.value = 'overview'

    basicLoaded.value = false
    itemsLoaded.value = false
    paymentsLoaded.value = false

    fetchBasic(newId)
  }
)

/* =========================
   Utils
========================= */
const goList = () => router.push({ name: 'contract-list' })
const money = v => (typeof v === 'number' ? v.toLocaleString() + '원' : '-')
const formatDate = v => (v ? String(v).substring(0, 10) : '-')

const formatPhone = v =>
  v
    ? String(v).replace(
        /(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})$/,
        '$1-$2-$3'
      )
    : '-'

const paymentStatusLabel = s => ({ P: '예정', C: '완납', N: '연체' }[s] ?? '-')
const paymentStatusTag = s => ({ P: 'info', C: 'success', N: 'danger' }[s] ?? 'info')
</script>

<style scoped>
.page-container { padding: 24px; max-width: 1600px; margin: 0 auto; }
.detail-header { display: flex; align-items: center; margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.title { font-size: 24px; font-weight: 700; }
.sub { font-size: 13px; color: #888; }
.summary-card { margin-bottom: 24px; }
.summary-grid { display: grid; grid-template-columns: 2fr repeat(3, 1fr); gap: 20px; align-items: center; }
.progress-label { font-size: 14px; margin-bottom: 8px; }
.kpi { text-align: center; }
.kpi-title { font-size: 13px; color: #666; }
.kpi-value { font-size: 20px; font-weight: 700; }
.kpi.danger .kpi-value { color: #d32f2f; }
.detail-tabs { margin-top: 20px; }
.overview-card { padding: 10px; }
.overdue { color: #d32f2f; font-weight: 600; }
</style>
