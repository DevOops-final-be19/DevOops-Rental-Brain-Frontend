<template>
    <div class="max-w-[1400px] mx-auto">
  
      <!-- 로딩 -->
      <div v-if="!vm" class="loading">
        계약 정보를 불러오는 중입니다...
      </div>
  
      <!-- =========================
           Contract Detail
      ========================= -->
      <div v-else class="contract-detail-page">
  
        <!-- Header -->
        <div class="header">
          <button class="back-btn" @click="goBack">
            ← 계약 목록으로 돌아가기
          </button>
  
          <div class="header-main">
            <div>
              <h1>{{ vm.contractName }}</h1>
              <p class="contract-code">{{ vm.contractCode }}</p>
            </div>
          </div>
        </div>
  
        <!-- Progress -->
        <div class="progress-card">
          <div class="progress-header">
            <div>
              <p class="progress-label">계약 진행률</p>
              <p class="progress-sub">
                총 {{ vm.period.contractPeriod }}개월
              </p>
            </div>
            <div class="progress-rate">
              {{ vm.period.progressRate }}%
            </div>
          </div>
  
          <div class="progress-bar">
            <div
              class="progress-bar-fill"
              :style="{ width: vm.period.progressRate + '%' }"
            />
          </div>
        </div>
  
        <!-- KPI -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <p class="kpi-title">월 납부액</p>
            <p class="kpi-value">{{ money(vm.payment.monthlyPayment) }}</p>
          </div>
  
          <div class="kpi-card">
            <p class="kpi-title">총 계약 금액</p>
            <p class="kpi-value">{{ money(vm.payment.totalAmount) }}</p>
          </div>
  
          <div class="kpi-card">
            <p class="kpi-title">결제 방식</p>
            <p class="kpi-value">{{ vm.payment.payMethodLabel }}</p>
          </div>
  
          <div class="kpi-card kpi-danger">
            <p class="kpi-title">연체 건수</p>
            <p class="kpi-value">{{ vm.payment.overdueCount }}건</p>
          </div>
        </div>
  
        <!-- =========================
             Rental Items
        ========================= -->
        <div class="section">
          <h3 class="section-title">렌탈 자산</h3>
  
          <div class="asset-list">
            <div
              v-for="item in vm.items.detail"
              :key="item.itemId"
              class="asset-card"
            >
              <div class="asset-icon">📦</div>
  
              <div class="asset-info">
                <p class="asset-name">{{ item.name }}</p>
                <p class="asset-meta">자산 코드: {{ item.itemCode }}</p>
                <p class="asset-meta">
                  최근 점검일: {{ item.latelyInspectDate }}
                </p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- =========================
             Payments
        ========================= -->
        <div class="section">
          <h3 class="section-title">결제 내역</h3>
  
          <table class="payment-table">
            <thead>
              <tr>
                <th>납부 예정일</th>
                <th>실 납부일</th>
                <th>상태</th>
                <th>연체</th>
              </tr>
            </thead>
  
            <tbody>
              <tr v-for="p in vm.payments" :key="p.id">
                <td>{{ date(p.dueDate) }}</td>
                <td>{{ p.actualDate ? date(p.actualDate) : '-' }}</td>
                <td>
                  <span :class="['pay-badge', p.status]">
                    {{ paymentStatusLabel(p.status) }}
                  </span>
                </td>
                <td>
                  <span
                    :class="p.overdueDays > 0 ? 'overdue-text' : 'normal-text'"
                  >
                    {{ p.overdueDays ?? '-' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import api from '@/api/axios'
  
  const router = useRouter()
  const route = useRoute()
  
  const vm = ref(null)
  
  onMounted(async () => {
    const contractId = route.params.id
  
    const [basic, items, payments] = await Promise.all([
      api.get(`/contract/${contractId}/basic-info`),
      api.get(`/contract/${contractId}/items`),
      api.get(`/contract/${contractId}/payments`)
    ])
  
    vm.value = toVM(basic.data, items.data, payments.data)
  })
  
  function toVM(basic, items, payments) {
    const payMethodMap = {
      A: '자동이체',
      B: '계좌이체',
      C: '카드결제',
    }
  
    return {
      contractName: basic.overview.contractName,
      contractCode: basic.overview.contractCode,
  
      period: {
        contractPeriod: basic.overview.contractPeriod,
        progressRate: basic.progress.progressRate,
      },
  
      payment: {
        monthlyPayment: basic.overview.monthlyPayment,
        totalAmount: basic.overview.totalAmount,
        payMethodLabel: payMethodMap[basic.overview.payMethod],
        overdueCount: basic.overdueCount,
      },
  
      items: {
        detail: items.contractItemDetail,
        summary: items.contractItemSummary,
      },
  
      payments: payments.map(p => ({
        id: p.id,
        dueDate: p.payment_due,
        actualDate: p.payment_actual,
        status: p.payment_status,
        overdueDays: p.overdue_days,
      })),
    }
  }
  
  function money(v) {
    return v.toLocaleString() + '원'
  }
  
  function date(v) {
    return v.split('T')[0]
  }
  
  function paymentStatusLabel(status) {
    return { C: '완납', N: '연체', P: '예정' }[status]
  }
  
  function goBack() {
    router.push({ name: 'contract-list' })
  }
  </script>
  
  <style scoped>
  /* =========================
     Layout
  ========================= */
  .contract-detail-page {
    padding: 32px 24px;
    font-family: "Inter", "Noto Sans KR", sans-serif;
    color: #111827;
  }
  
  .loading {
    padding: 40px;
    text-align: center;
    color: #6b7280;
  }
  
  /* =========================
     Header
  ========================= */
  .header {
    margin-bottom: 32px;
  }
  
  .back-btn {
    background: none;
    border: none;
    font-size: 13px;
    color: #6b7280;
    cursor: pointer;
    margin-bottom: 12px;
  }
  
  .back-btn:hover {
    color: #111827;
  }
  
  .header-main h1 {
    font-size: 28px;
    font-weight: 600;
  }
  
  .contract-code {
    font-size: 13px;
    color: #6b7280;
  }
  
  /* =========================
     Progress
  ========================= */
  .progress-card {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 14px;
    padding: 24px;
    margin-bottom: 32px;
  }
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  
  .progress-label {
    font-size: 13px;
    color: #1e40af;
  }
  
  .progress-sub {
    font-size: 16px;
    font-weight: 500;
  }
  
  .progress-rate {
    font-size: 32px;
    font-weight: 600;
    color: #1e3a8a;
  }
  
  .progress-bar {
    width: 100%;
    height: 10px;
    background: #bfdbfe;
    border-radius: 999px;
  }
  
  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #2563eb);
  }
  
  /* =========================
     KPI
  ========================= */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 40px;
  }
  
  .kpi-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 20px;
  }
  
  .kpi-title {
    font-size: 13px;
    color: #6b7280;
  }
  
  .kpi-value {
    font-size: 22px;
    font-weight: 600;
  }
  
  .kpi-danger {
    background: #fef2f2;
    border-color: #fecaca;
  }
  
  .kpi-danger .kpi-value {
    color: #b91c1c;
  }
  
  /* =========================
     Section
  ========================= */
  .section {
    margin-bottom: 40px;
  }
  
  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  
  /* =========================
     Assets
  ========================= */
  .asset-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .asset-card {
    display: flex;
    gap: 16px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px 20px;
  }
  
  .asset-icon {
    width: 44px;
    height: 44px;
    background: #e0f2fe;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .asset-name {
    font-weight: 600;
  }
  
  .asset-meta {
    font-size: 13px;
    color: #6b7280;
  }
  
  /* =========================
     Payments
  ========================= */
  .payment-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .payment-table th {
    background: #f9fafb;
    font-size: 13px;
    color: #6b7280;
    padding: 12px;
    text-align: left;
  }
  
  .payment-table td {
    padding: 14px 12px;
    font-size: 14px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .pay-badge {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .pay-badge.C {
    background: #dcfce7;
    color: #15803d;
  }
  
  .pay-badge.N {
    background: #fee2e2;
    color: #b91c1c;
  }
  
  .pay-badge.P {
    background: #f3f4f6;
    color: #374151;
  }
  
  .overdue-text {
    color: #b91c1c;
    font-weight: 600;
  }
  </style>
  