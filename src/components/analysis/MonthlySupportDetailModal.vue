<template>
  <div v-if="open" class="backdrop" @click.self="close">
    <div class="modal">
      <div class="modal-head">
        <div class="modal-title">
          {{ month }} · {{ typeLabel }} 상세
        </div>
        <button class="xbtn" @click="close">✕</button>
      </div>

      <div class="modal-sub">
        <span class="pill">{{ totalCount.toLocaleString() }}건</span>
        <span class="hint">행을 클릭하면 상세 내용을 볼 수 있어요.</span>
      </div>

      <div v-if="loading" class="state">불러오는 중...</div>
      <div v-else-if="error" class="state error">{{ error }}</div>
      <div v-else class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th style="width: 110px;">코드</th>
              <th style="width: 120px;">일자</th>
              <th>제목</th>
              <th style="width: 140px;">고객</th>
              <th style="width: 120px;">카테고리</th>

              <th v-if="type === 'FEEDBACK'" style="width: 80px;">별점</th>
              <th v-if="type === 'QUOTE'" style="width: 90px;">처리</th>

              <th style="width: 110px;">상태</th>
              <th style="width: 120px;">담당</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in rows"
              :key="row.id"
              class="tr"
              @click="selectRow(row)"
            >
              <td class="mono">{{ row.code }}</td>
              <td>{{ row.date }}</td>
              <td class="title">{{ row.title }}</td>
              <td>{{ row.customerName }}</td>
              <td>{{ row.categoryName }}</td>

              <td v-if="type === 'FEEDBACK'">{{ row.star ?? "-" }}</td>
              <td v-if="type === 'QUOTE'">{{ row.processingTime != null ? row.processingTime + "m" : "-" }}</td>

              <td>
                <span class="badge" :class="badgeClass(row.status)">
                  {{ row.status ?? "-" }}
                </span>
              </td>
              <td>{{ row.assigneeName ?? "-" }}</td>
            </tr>

            <tr v-if="rows.length === 0">
              <td colspan="9" class="empty">데이터가 없습니다.</td>
            </tr>
          </tbody>
        </table>

        <!-- paging -->
        <div class="paging">
          <button class="pbtn" :disabled="page <= 1" @click="go(page - 1)">이전</button>
          <div class="pnums">
            <button
              v-for="p in pages"
              :key="p"
              class="pnum"
              :class="{ active: p === page }"
              @click="go(p)"
            >
              {{ p }}
            </button>
          </div>
          <button class="pbtn" :disabled="page >= lastPage" @click="go(page + 1)">다음</button>
        </div>

        <!-- simple detail -->
        <div v-if="selectedRow" class="detail">
          <div class="detail-head">
            <div class="detail-title">상세</div>
            <button class="linkbtn" @click="selectedRow = null">닫기</button>
          </div>

          <div class="detail-grid">
            <div class="kv"><div class="k">코드</div><div class="v mono">{{ selectedRow.code }}</div></div>
            <div class="kv"><div class="k">일자</div><div class="v">{{ selectedRow.date }}</div></div>
            <div class="kv"><div class="k">고객</div><div class="v">{{ selectedRow.customerName }}</div></div>
            <div class="kv"><div class="k">카테고리</div><div class="v">{{ selectedRow.categoryName }}</div></div>
            <div class="kv"><div class="k">채널</div><div class="v">{{ selectedRow.channelName }}</div></div>
            <div class="kv"><div class="k">담당</div><div class="v">{{ selectedRow.assigneeName }}</div></div>
            <div class="kv"><div class="k">상태</div><div class="v">{{ selectedRow.status }}</div></div>

            <div v-if="type === 'FEEDBACK'" class="kv">
              <div class="k">별점</div><div class="v">{{ selectedRow.star ?? "-" }}</div>
            </div>

            <div v-if="type === 'QUOTE'" class="kv">
              <div class="k">처리시간</div><div class="v">{{ selectedRow.processingTime != null ? selectedRow.processingTime + "m" : "-" }}</div>
            </div>

            <div class="kv wide">
              <div class="k">내용</div>
              <div class="v pre">{{ selectedRow.content ?? "(내용 없음)" }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { getMonthlyDetail } from "@/api/customeranalysis";

const props = defineProps({
  open: { type: Boolean, default: false },
  month: { type: String, default: "" }, // YYYY-MM
  type: { type: String, default: "SUPPORT" }, // QUOTE|SUPPORT|FEEDBACK|SURVEY
});

const emit = defineEmits(["update:open"]);

const loading = ref(false);
const error = ref("");
const rows = ref([]);
const totalCount = ref(0);

const page = ref(1);
const size = ref(10);

const paging = ref({ currentPage: 1, startPage: 1, endPage: 1 });
const selectedRow = ref(null);

const typeLabel = computed(() => {
  if (props.type === "QUOTE") return "견적상담";
  if (props.type === "SUPPORT") return "문의";
  if (props.type === "FEEDBACK") return "피드백";
  if (props.type === "SURVEY") return "설문조사";
  return props.type;
});

const close = () => emit("update:open", false);

const badgeClass = (status) => {
  if (!status) return "b0";
  const s = String(status).toUpperCase();
  if (s === "C" || s === "DONE" || s === "COMPLETED") return "b1";
  if (s === "P" || s === "PROGRESS" || s === "WAIT") return "b2";
  if (s === "R" || s === "REJECT") return "b3";
  return "b0";
};

const fetchList = async () => {
  if (!props.open) return;
  if (!props.month) return;

  loading.value = true;
  error.value = "";
  selectedRow.value = null;

  try {
    const res = await getMonthlyDetail({
      month: props.month,
      type: props.type,
      page: page.value,
      size: size.value,
    });

    // PageResponseDTO 형태
    rows.value = res.data?.contents ?? [];
    totalCount.value = Number(res.data?.totalCount ?? 0) || 0;
    paging.value = res.data?.paging ?? { currentPage: page.value, startPage: 1, endPage: 1 };
  } catch (e) {
    error.value = e?.message ?? String(e);
    rows.value = [];
    totalCount.value = 0;
    paging.value = { currentPage: page.value, startPage: 1, endPage: 1 };
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.open, props.month, props.type],
  () => {
    page.value = 1;
    fetchList();
  }
);

watch(page, fetchList);

const pages = computed(() => {
  const arr = [];
  for (let i = paging.value.startPage; i <= paging.value.endPage; i++) arr.push(i);
  return arr;
});

const lastPage = computed(() => paging.value.endPage);

const go = (p) => {
  if (p < 1) return;
  page.value = p;
};

const selectRow = (row) => {
  selectedRow.value = row;
};
</script>

<style scoped>
.backdrop {
  position: fixed; inset: 0;
  background: rgba(17, 24, 39, 0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}

.modal {
  width: min(1100px, calc(100vw - 40px));
  max-height: calc(100vh - 60px);
  overflow: auto;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  padding: 14px 14px 16px;
}

.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px;
}
.modal-title {
  font-size: 14px; font-weight: 900; color: #111827;
}
.xbtn {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  padding: 6px 10px;
  cursor: pointer;
  font-weight: 900;
}

.modal-sub {
  display: flex; align-items: center; gap: 10px;
  margin-top: 8px; margin-bottom: 10px;
}
.pill {
  font-size: 12px; font-weight: 900;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #fafafa;
}
.hint { font-size: 12px; font-weight: 800; color: #6b7280; }

.state {
  padding: 18px;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
  text-align: center;
  font-weight: 900;
  color: #6b7280;
}
.state.error { color: #ef4444; }

.table-wrap { display: flex; flex-direction: column; gap: 12px; }

.tbl {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}
.tbl thead th {
  background: #f9fafb;
  font-size: 12px;
  font-weight: 900;
  color: #111827;
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}
.tbl tbody td {
  padding: 10px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 12px;
  font-weight: 700;
  color: #111827;
  vertical-align: top;
}
.tbl tbody tr:last-child td { border-bottom: 0; }

.tr { cursor: pointer; }
.tr:hover { background: #fafafa; }

.title { font-weight: 900; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.empty { text-align: center; padding: 18px; color: #6b7280; font-weight: 900; }

.badge {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid #e5e7eb;
  background: #fff;
}
.badge.b1 { border-color: #bbf7d0; background: #f0fdf4; }
.badge.b2 { border-color: #bfdbfe; background: #eff6ff; }
.badge.b3 { border-color: #fecaca; background: #fef2f2; }
.badge.b0 { background: #fff; }

.paging {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px;
}
.pbtn {
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}
.pbtn:disabled { opacity: 0.5; cursor: not-allowed; }
.pnums { display: flex; gap: 6px; flex-wrap: wrap; }
.pnum {
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}
.pnum.active { background: #111827; color: #fff; border-color: #111827; }

.detail {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
}
.detail-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
}
.detail-title { font-size: 12px; font-weight: 900; color: #111827; }
.linkbtn {
  border: none; background: transparent;
  cursor: pointer;
  font-weight: 900;
  color: #111827;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.kv { border: 1px solid #f3f4f6; border-radius: 10px; padding: 10px; }
.k { font-size: 11px; font-weight: 900; color: #6b7280; }
.v { font-size: 12px; font-weight: 800; color: #111827; margin-top: 4px; }
.kv.wide { grid-column: 1 / -1; }
.pre { white-space: pre-wrap; line-height: 1.35; }
</style>
