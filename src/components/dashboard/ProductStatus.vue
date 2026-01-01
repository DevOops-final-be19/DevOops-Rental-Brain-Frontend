<template>
  <div class="mix-card" v-loading="loadingProduct">
    <!-- KPI 영역: 숫자 중심 -->
    <div class="kpi-area">
      <div class="kpi-title">미가동 자산 추정 매출 기회</div>

      <div class="kpi-value">{{ utilizationKpi.lossText }}</div>

      <div class="kpi-sub">
        가동률 {{ utilizationKpi.rate }}%
        <span class="sep">·</span>
        최대 가능 매출 {{ utilizationKpi.potentialText }}
        <span class="sep">·</span>
        실제 발생 매출 {{ utilizationKpi.actualText }}
      </div>
    </div>

    <div class="divider"></div>

    <!-- Workbench 1행: 액션 + 근거 -->
    <div class="wb-row">
      <div class="wb-left">
        <span class="dot dot-high" aria-hidden="true"></span>

        <div class="wb-text">
          <div class="wb-main">자산 가동률 개선 필요</div>
          <div class="wb-meta">
            근거: 미가동 자산으로 인한 매출 기회 손실 {{ utilizationKpi.lossText }} 감지
          </div>
        </div>
      </div>

      <button class="wb-btn wb-btn--primary" type="button" @click="goLowUtilizationCampaign">
        저가동 자산 캠페인 생성
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getProductNameList } from "@/api/product";

const router = useRouter();

const loadingProduct = ref(false);

// ✅ 응답을 contents 배열로 맞춰 담기
const productRes = ref({ contents: [] });

/** ✅ 억/만원 포맷: 150,000,000 -> 1억 5000만원 */
const formatMoneyEokMan = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "-";

  const EOK = 100_000_000;
  const MAN = 10_000;

  const eok = Math.floor(n / EOK);
  const rest = n % EOK;
  const man = Math.floor(rest / MAN);

  if (eok > 0 && man > 0) return `${eok}억 ${man}만원`;
  if (eok > 0) return `${eok}억`;
  return `${man}만원`;
};

/** ✅ KPI 계산 */
const utilizationKpi = computed(() => {
  const rows = productRes.value?.contents ?? [];

  let totalPotential = 0; // Σ(monthlyPrice × stockAmount)
  let actual = 0;         // Σ(monthlyPrice × rentalAmount)

  for (const p of rows) {
    const price = Number(p.monthlyPrice ?? 0);
    const stock = Number(p.stockAmount ?? 0);
    const rented = Number(p.rentalAmount ?? 0);

    if (!Number.isFinite(price) || !Number.isFinite(stock) || !Number.isFinite(rented)) continue;

    totalPotential += price * stock;
    actual += price * rented;
  }

  const loss = Math.max(0, totalPotential - actual);
  const rate = totalPotential > 0 ? Math.round((actual / totalPotential) * 100) : 0;

  return {
    totalPotential,
    actual,
    loss,
    rate,
    lossText: formatMoneyEokMan(loss),
    potentialText: formatMoneyEokMan(totalPotential),
    actualText: formatMoneyEokMan(actual),
  };
});

/** ✅ 데이터 로드 (product.js 재사용) */
const fetchProductList = async () => {
  loadingProduct.value = true;
  try {
    const { data } = await getProductNameList();
    // data가 {contents: []} 또는 [] 둘 다 대응
    productRes.value.contents = data?.contents ?? data ?? [];
  } catch (e) {
    console.error("제품 현황 조회 실패", e);
  } finally {
    loadingProduct.value = false;
  }
};

const goLowUtilizationCampaign = () => {
  // ✅ 라우트 이름은 프로젝트에 맞게 바꿔줘
  // 캠페인 설정/프로모션/쿠폰 어디든 연결 가능
  router.push({ name: "campaign-setting", query: { type: "LOW_UTILIZATION" } });
};

onMounted(fetchProductList);
</script>

<style scoped>
/* ✅ 카드 외형: 워크벤치(wb-card) 톤에 맞춤 */
.mix-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* KPI 영역 */
.kpi-area {
  padding: 16px 16px 14px;
}

.kpi-title {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.2px;
  margin-bottom: 10px;
}

.kpi-value {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.4px;
  line-height: 1.1;
  margin-bottom: 8px;
}

.kpi-sub {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sep {
  margin: 0 6px;
  color: #cbd5e1;
}

/* Divider */
.divider {
  height: 1px;
  background: #f1f1f1;
}

/* Workbench 1행 */
.wb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 14px;
}

.wb-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.wb-text {
  min-width: 0;
}

.wb-main {
  font-size: 13px;
  font-weight: 750;
  color: #111827;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wb-meta {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(17, 24, 39, 0.55);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Dot */
.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-top: 3px;
  flex: 0 0 auto;
}
.dot-high { background: #ef4444; }

/* Button (워크벤치 톤) */
.wb-btn {
  font-size: 12px;
  font-weight: 750;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 120ms ease, opacity 120ms ease;
}
.wb-btn:hover { opacity: 0.92; }
.wb-btn:active { transform: translateY(1px); }

.wb-btn--primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

/* Responsive */
@media (max-width: 700px) {
  .wb-row {
    align-items: flex-start;
    flex-direction: column;
  }
  .wb-btn { width: 100%; }
  .kpi-sub { white-space: normal; }
}
</style>
