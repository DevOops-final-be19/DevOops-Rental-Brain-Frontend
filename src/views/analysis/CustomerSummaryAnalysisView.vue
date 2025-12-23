<template>
  <div class="page-container">
    <!-- 헤더 -->
    <div class="header-row">
      <div class="title-area">
        <h2 class="page-title">고객 요약 분석</h2>
        <p class="page-subtitle">전체 고객 현황을 기반으로 규모, 위험도, 만족도를 종합적으로 분석합니다.</p>
      </div>
    </div>

    <!-- KPI 5개 -->
    <div class="kpi-wrapper">
      <div class="kpi-box">
        <div class="kpi-title">거래중 고객 / 총 고객 수</div>
        <div class="kpi-value">{{ fmt(kpi.tradeCustomerCount) }}개사 / {{ fmt(kpi.totalCustomerCount) }}개사</div>
        <div class="kpi-sub">
          <span class="up">▲ {{ round1(kpi.tradeCustomerMomRate) }}%</span>
          <span class="muted">전월 대비(거래 고객 기준)</span>
        </div>
      </div>

      <div class="kpi-box">
        <div class="kpi-title">평균 거래액</div>
        <div class="kpi-value">{{ fmtManwon(kpi.avgTradeAmount) }}</div>
        <div class="kpi-sub">
          <span class="up">▲ {{ round1(kpi.avgTradeMomRate) }}%</span>
          <span class="muted">전월 대비</span>
        </div>
      </div>

      <div class="kpi-box">
        <div class="kpi-title">평균 만족도</div>
        <div class="kpi-value">{{ round1(kpi.avgStar) }}점</div>
        <div class="kpi-sub">
          <span :class="kpi.avgStarMomDiff >= 0 ? 'up' : 'down'">
            {{ kpi.avgStarMomDiff >= 0 ? '▲' : '▼' }} {{ round1(Math.abs(kpi.avgStarMomDiff)) }}점
          </span>
          <span class="muted">전월 대비</span>
        </div>
      </div>

      <div class="kpi-box">
        <div class="kpi-title">안정 고객 비율</div>
        <div class="kpi-value">{{ round1(kpi.stableCustomerRate) }}%</div>
        <div class="kpi-sub">
          <span class="muted">{{ fmt(kpi.stableCustomerCount) }}/{{ fmt(kpi.tradeCustomerCount) }}개사 안정</span>
        </div>
      </div>
      <div class="kpi-box">
          <div class="kpi-title">이탈 위험률</div>
          <div class="kpi-value danger">{{ round1(kpi.riskRate) }}%</div>
          <div class="kpi-sub">
          <span class="down">▲ {{ round1(kpi.riskMomDiffRate) }}%p</span>
          <span class="muted">이탈 위험 고객 {{ fmt(kpi.riskCustomerCount) }}개사</span>
        </div>
      </div>

    </div>

        <!-- 2열 레이아웃 -->
    <div class="summary-grid">
      <div class="col col-2">
        <SupportMonthlyTrend />
      </div>

      <div class="col col-2">
        <RiskMonthlyRate />
      </div>

      <div class="col col-1">
        <RiskGuideTable /> <!-- 기준표만 분리 -->
      </div>
    </div>

    <!-- 2열 레이아웃 -->
    <div class="grid-2">
      <div class="card">
        <SegmentDistribution
          title="고객 세그먼트 분석"
          :segments="segmentDist.segments"
          :total="segmentDist.totalCustomerCount"
          :showMiniList="false"
        />
      </div>

      <!-- 만족도 분포 + 불만족 TOP -->
      <div class="card">
        <div class="card-title">고객 만족도 분포</div>

        <div class="rating-row">
          <div class="rating-item" v-for="r in ratingRows" :key="r.star">
            <div class="label">⭐ {{ r.star }}점</div>
            <div class="bar">
              <div class="fill" :style="{ width: r.percent + '%' }"></div>
            </div>
            <div class="count">{{ r.count }}개사</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="card-title small">불만족 원인 TOP 3</div>
        <!-- TODO: 이건 백엔드 엔드포인트 있는지 확인 필요 -->
        <div class="top3">
          <div class="top3-item" v-for="(x, idx) in topIssues" :key="idx">
            <span class="name">{{ idx + 1 }}. {{ x.name }}</span>
            <span class="count">{{ x.count }}건</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getCustomerSummaryKpi,
  getMonthlyRiskRate,
  getSatisfactionDist,
  getSegmentDistribution,
} from '@/api/customeranalysis';

// 세그먼트 도넛 차트 컴포넌트
import SegmentDistribution from '@/components/analysis/SegmentDistribution.vue';
import SupportMonthlyTrend from '@/components/analysis/SupportMonthlyTrend.vue';
import RiskMonthlyRate from '@/components/analysis/RiskMonthlyRate.vue';
import RiskGuideTable from '@/components/analysis/RiskGuideTable.vue';

const route = useRoute();
const isActive = (path) => route.path === path;
const loading = ref(false);

// 백엔드 DTO 그대로 받는 구조
const kpi = ref({
  totalCustomerCount: 0,
  tradeCustomerCount: 0,
  tradeCustomerMomRate: 0,
  avgTradeAmount: 0,
  avgTradeMomRate: 0,
  avgStar: 0,
  avgStarMomDiff: 0,
  stableCustomerCount: 0,
  stableCustomerRate: 0,
  riskCustomerCount: 0,
  riskRate: 0,
  riskMomDiffRate: 0,
});

const segmentDist = ref({
  totalCustomerCount: 0,
  segments: [],
});

const satisfaction = ref({
  star5Count: 0, star4Count: 0, star3Count: 0, star2Count: 0, star1Count: 0,
  totalCount: 0,
  star5Percent: 0, star4Percent: 0, star3Percent: 0, star2Percent: 0, star1Percent: 0,
});

const riskMonthly = ref([]);

// TODO: 백엔드 엔드포인트 있으면 교체
const topIssues = ref([
  { name: 'AS 처리 속도', count: 15 },
  { name: '제품 품질', count: 12 },
  { name: '가격 정책', count: 8 },
]);

const ratingRows = computed(() => ([
  { star: 5, count: satisfaction.value.star5Count, percent: satisfaction.value.star5Percent },
  { star: 4, count: satisfaction.value.star4Count, percent: satisfaction.value.star4Percent },
  { star: 3, count: satisfaction.value.star3Count, percent: satisfaction.value.star3Percent },
  { star: 2, count: satisfaction.value.star2Count, percent: satisfaction.value.star2Percent },
  { star: 1, count: satisfaction.value.star1Count, percent: satisfaction.value.star1Percent },
]));

onMounted(async () => {
  await fetchAll();
});

const fetchAll = async () => {
  loading.value = true;
  try {
    const month = getCurrentMonth(); // YYYY-MM
    const { from, to } = last12MonthsRange();

    // ✅ 4개 API 병렬 호출
    const [kpiRes, riskRes, satRes, segRes] = await Promise.all([
      getCustomerSummaryKpi(month),
      getMonthlyRiskRate(from, to),
      getSatisfactionDist(),
      getSegmentDistribution(),
    ]);

    kpi.value = kpiRes.data;
    riskMonthly.value = riskRes.data;
    satisfaction.value = satRes.data;
    segmentDist.value = segRes.data;

  } catch (e) {
    console.error(e);
    ElMessage.error('고객 요약 분석 데이터를 불러오는데 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

// ===== util =====
const getCurrentMonth = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

// 최근 12개월 범위(백엔드: from/to = YYYY-MM)
const last12MonthsRange = () => {
  const now = new Date();
  const toY = now.getFullYear();
  const toM = now.getMonth() + 1;

  const fromDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const fromY = fromDate.getFullYear();
  const fromM = fromDate.getMonth() + 1;

  const from = `${fromY}-${String(fromM).padStart(2, '0')}`;
  const to = `${toY}-${String(toM).padStart(2, '0')}`;
  return { from, to };
};

const fmt = (n) => (Number(n) || 0).toLocaleString();
const fmtManwon = (n) => {
  const v = Number(n) || 0;

  // 값이 크면(보통 원 단위) 만원으로 변환해서 표시
  const inManwon = v >= 100000 ? (v / 10000) : v;

  return `${inManwon.toLocaleString(undefined, { maximumFractionDigits: 1 })}만원`;
};
const round1 = (n) => (Number(n) || 0).toFixed(1);
</script>

<style scoped>

.page-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 헤더 */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.title-area {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.page-subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 13px;
}

/* 탭 */
.tab-row {
  display: flex;
  gap: 16px;
  padding: 10px 0 16px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.tab {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px 4px;
  color: #6b7280;
  font-weight: 700;
}

.tab.active {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
}

/* KPI (QuoteListView 스타일) */
.kpi-wrapper {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.kpi-box {
  flex: 1;
  background: #fff;
  padding: 24px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.kpi-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  display: block;
  font-weight: 500;
}

.kpi-value {
  font-size: 25px;
  font-weight: 800;
  color: #333;
}

.kpi-value.danger {
  color: #ef4444;
}

.kpi-sub {
  margin-top: 8px;
  font-size: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.up { color: #16a34a; font-weight: 800; }
.down { color: #ef4444; font-weight: 800; }
.muted { color: #9ca3af; }

/* 2열 카드 영역 */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

/* 카드들 묶는 그리드 */
.grid-3 {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr; /* 너가 원한 2:2:1 */
  column-gap: 16px;
  row-gap: 16px;      /* ✅ 세로 간격 고정 */
  align-items: stretch; /* ✅ 같은 row에서 높이 맞추기 */
}

.card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);

  display: flex;
  flex-direction: column;
  min-height: 360px;  /* ✅ 같은 줄 카드 높이 맞추는 핵심 */
}
.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.card-title.small {
  font-size: 13px;
  margin-top: 10px;
}

/* placeholder(차트 자리) */
.chart-placeholder {
  height: 220px;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: #fafafa;
}

.hint {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 700;
}

/* debug chips */
.debug-row {
  width: 100%;
  padding: 0 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.chip {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  border: 1px solid #e0e7ff;
}

/* 만족도 분포 */
.rating-row { display: flex; flex-direction: column; gap: 10px; }

.rating-item { display: flex; align-items: center; gap: 10px; }
.rating-item .label { width: 70px; font-size: 12px; color: #374151; font-weight: 800; }
.rating-item .bar {
  flex: 1;
  height: 10px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #eee;
}
.rating-item .fill { height: 100%; background: #60a5fa; }
.rating-item .count { width: 70px; text-align: right; font-size: 12px; color: #6b7280; font-weight: 800; }

.divider { height: 1px; background: #eee; margin: 14px 0; }

/* TOP3 */
.top3 { display: flex; flex-direction: column; gap: 8px; }
.top3-item { display: flex; justify-content: space-between; font-size: 12px; }
.top3-item .name { font-weight: 800; color: #333; }
.top3-item .count { color: #ef4444; font-weight: 900; }

/* 기준표 */
.guide-table { width: 100%; border-collapse: collapse; }
.guide-table th, .guide-table td { border: 1px solid #e5e7eb; padding: 10px 12px; font-size: 12px; }
.guide-table th { background: #f9fafb; text-align: left; color: #374151; font-weight: 900; }

.badge { display: inline-block; padding: 3px 8px; border-radius: 999px; font-weight: 900; font-size: 11px; }
.badge.ok { background: #dcfce7; color: #166534; }
.badge.warn { background: #fef3c7; color: #92400e; }
.badge.alert { background: #ffedd5; color: #9a3412; }
.badge.danger { background: #fee2e2; color: #991b1b; }

/* 반응형 */
@media (max-width: 1200px) {
  .kpi-wrapper { flex-wrap: wrap; }
  .kpi-box { flex: 1 1 calc(50% - 15px); }
  .grid-2 { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .kpi-box { flex: 1 1 100%; }
}

.summary-grid {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr; /* ⭐ 2:2:1 */
  gap: 16px;
  align-items: stretch;
}

.col {
  display: flex;
  flex-direction: column;
}
</style>