<template>
  <div class="kpi-cards">
    <!-- 1. 만료 임박 계약 -->
    <div class="kpi-card warn">
      <div class="title">만료 임박 계약</div>
      <div class="value">{{ kpi.expiringContractCount }}건</div>
      <div class="desc">D-30 기준</div>
    </div>

    <!-- 2. 결제 연체 -->
    <div class="kpi-card danger">
      <div class="title">결제 연체</div>
      <div class="value">{{ kpi.overdueCount }}건</div>
      <div class="desc">연체 금액 {{ kpi.overdueAmount }}</div>
    </div>

    <!-- 3. 고객 문의 대기 -->
    <div class="kpi-card info">
      <div class="title">문의 대기</div>
      <div class="value">{{ kpi.waitingInquiryCount }}건</div>
      <div class="desc">SLA 초과 {{ kpi.slaOverdueCount }}건</div>
    </div>

    <!-- 4. 이번 달 매출 -->
    <div class="kpi-card primary">
      <div class="title">이번 달 매출</div>
      <div class="value">{{ kpi.mtdRevenue }}</div>
      <div class="desc">MoM {{ kpi.momRate }}%</div>
    </div>
  </div>
</template>

<script setup>
/**
 * 👉 지금은 프론트 목업용
 * 👉 나중에 백엔드 연결 시 API 응답으로 교체
 */
const kpi = {
  expiringContractCount: 12,
  overdueCount: 11,
  overdueAmount: "₩3.2억",
  waitingInquiryCount: 8,
  slaOverdueCount: 3,
  mtdRevenue: "₩17.0억",
  momRate: "+8.3",
};
</script>

<style scoped>
.kpi-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* 공통 카드 */
.kpi-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}

.value {
  margin-top: 10px;
  font-size: 22px;
  font-weight: 800;
  color: #111827;
}

.desc {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

/* 상태별 포인트 컬러 (좌측 라인) */
.warn {
  border-left: 4px solid #f59e0b;
}
.danger {
  border-left: 4px solid #ef4444;
}
.info {
  border-left: 4px solid #3b82f6;
}
.primary {
  border-left: 4px solid #7c3aed;
}

/* 반응형 */
@media (max-width: 1200px) {
  .kpi-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .kpi-cards {
    grid-template-columns: 1fr;
  }
}
</style>
