<template>
  <div class="mix-card" v-loading="loadingProduct">
    <!-- Header -->
    <div class="mix-head">
      <div class="mix-title">고객 확보가 필요한 매출</div>
      <div class="mix-desc">
        장비가 놀고 있어요 · 채울 고객을 만들면 매출이 늘어납니다
      </div>
    </div>

    <!-- KPI -->
    <div class="mix-kpi">
      <div class="mix-value">{{ utilizationKpi.lossText }}</div>

      <div class="mix-sub">
        가동률 {{ utilizationKpi.rate }}%
        <span class="sep">·</span>
        최대 가능 {{ utilizationKpi.potentialText }}
        <span class="sep">·</span>
        현재 {{ utilizationKpi.actualText }}
      </div>
    </div>

    <div class="mix-divider"></div>

    <!-- CRM Workbench row -->
    <div class="wb-row">
      <div class="wb-left">
        <span class="dot dot-high" aria-hidden="true"></span>

        <div class="wb-text">
          <div class="wb-main">신규/휴면 고객 캠페인 추천</div>
          <div class="wb-sub">
            놀고 있는 자산이 많아 “고객 확보”가 필요합니다
          </div>
          <div class="wb-meta">
            근거: 미가동으로 {{ utilizationKpi.lossText }} 기회 발생
          </div>
        </div>
      </div>

      <button
        class="wb-btn wb-btn--primary"
        type="button"
        @click.stop="goCampaign"
      >
        캠페인 만들기
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
const productRes = ref({ contents: [] });

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

const utilizationKpi = computed(() => {
  const rows = productRes.value?.contents ?? [];

  let totalPotential = 0;
  let actual = 0;

  for (const p of rows) {
    const price = Number(p.monthlyPrice ?? 0);
    const stock = Number(p.stockAmount ?? 0);
    const rented = Number(p.rentalAmount ?? 0);

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

const fetchProductList = async () => {
  loadingProduct.value = true;
  try {
    const { data } = await getProductNameList();
    productRes.value.contents = data?.contents ?? data ?? [];
  } catch (e) {
    console.error("제품 현황 조회 실패", e);
  } finally {
    loadingProduct.value = false;
  }
};

onMounted(fetchProductList);

/** CRM 액션으로 이동 */
const goCampaign = () => {
  router.push({
    name: "campaign-setting",
    query: { type: "FILL_IDLE_ASSET" }, // 라벨만
  });
};
</script>

<style scoped>
/* 카드 전체 */
.mix-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.mix-head {
  padding: 16px 16px 10px;
}

.mix-title {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.2px;
}

.mix-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.35;
}

.mix-kpi {
  padding: 0 16px 14px;
}

.mix-value {
  font-size: 34px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.5px;
  line-height: 1.05;
  margin-bottom: 8px;
}

.mix-sub {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sep {
  margin: 0 6px;
  color: #cbd5e1;
}

.mix-divider {
  height: 1px;
  background: #f1f1f1;
}

/* Workbench row */
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

.wb-text { min-width: 0; }

.wb-main {
  font-size: 13px;
  font-weight: 750;
  color: #111827;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wb-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
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

/* Buttons */
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

@media (max-width: 700px) {
  .wb-row {
    align-items: flex-start;
    flex-direction: column;
  }
  .wb-btn { width: 100%; }
  .mix-sub,
  .wb-main,
  .wb-sub,
  .wb-meta {
    white-space: normal;
  }
}
</style>
