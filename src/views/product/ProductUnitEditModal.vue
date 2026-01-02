<template>
  <div class="edit-backdrop" @click.self="emitClose">
    <div class="edit-modal">
      <div class="edit-header">
        <h3>개별 제품 정보 수정</h3>
        <button class="icon-btn" @click="emitClose">✕</button>
      </div>

      <form class="edit-body" @submit.prevent="handleSubmit">
        <!-- 기본 정보 -->
        <div class="form-row two-col">
          <div>
            <label>매출</label>
            <input v-model.number="form.sales" type="number" min="0" />
          </div>
          <div>
            <label>수리비</label>
            <input v-model.number="form.repairCost" type="number" min="0" />
          </div>
        </div>

        <div class="form-row two-col">
          <div>
            <label>상태</label>
            <select v-model="form.status">
              <option value="S">렌탈 중</option>
              <option value="P">대여 가능</option>
              <option value="R">점검</option>
              <option value="O">연체</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <label>최근 점검일</label>
          <input
            v-model="inspectDateInput"
            type="date"
          />
          <p class="hint">YYYY-MM-DD 형식으로 입력하면 LocalDateTime으로 변환해서 전송됩니다.</p>
        </div>
      </form>

      <div class="edit-footer">
        <button class="secondary-btn" @click="emitClose">
          취소
        </button>
        <button class="primary-btn" @click="handleSubmit">
          저장
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import api from '@/api/axios';

const props = defineProps({
  itemId: {
    type: [Number, String],
    required: true,
  },
  // 선택된 개별 제품 데이터 (상세 모달에서 넘겨줌)
  unit: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "updated"]);

const form = ref({
  status: "P",
  lastInspectDate: null,
  sales: null,
  repairCost: null,
});

const inspectDateInput = ref("");

// 초기값 세팅
function initForm() {
  form.value.status = props.unit.status || "P";
  form.value.sales = props.unit.sales ?? null;
  form.value.repairCost = props.unit.repairCost ?? null;

  // unit.lastInspectDate(문자열/Date) -> date input용 YYYY-MM-DD
  if (props.unit.lastInspectDate) {
    inspectDateInput.value = toDateInput(props.unit.lastInspectDate);
  } else {
    inspectDateInput.value = "";
  }
}

// LocalDateTime으로 보낼 문자열 만들기 (YYYY-MM-DDT00:00:00 형태)
function buildLocalDateTime(dateStr) {
  if (!dateStr) return null;
  return `${dateStr}T00:00:00`;
}

function toDateInput(dateTime) {
  if (!dateTime) return "";
  if (typeof dateTime === "string") {
    return dateTime.split("T")[0].split(" ")[0];
  }
  const d = new Date(dateTime);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emitClose() {
  emit("close");
}

// 저장 버튼
async function handleSubmit() {
  try {
    const payload = {
      status: form.value.status,
      lastInspectDate: buildLocalDateTime(inspectDateInput.value),
      sales: form.value.sales,
      repairCost: form.value.repairCost,
    };

    await api.put(`/item/update/${props.itemId}`, payload);
    emit("updated");
    emitClose();
  } catch (err) {
    console.error("개별 제품 수정 실패", err);
  }
}

onMounted(async () => {
  initForm();
});

// unit이 바뀌면 폼 다시 세팅 (다른 행 클릭해서 재사용할 경우 대비)
watch(
  () => props.unit,
  () => {
    initForm();
  },
  { deep: true }
);
</script>

<style scoped>
.edit-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.edit-modal {
  width: 520px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.edit-header {
  padding: 16px 20px;
  border-bottom: 1px solid #edf0f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-header h3 {
  margin: 0;
  font-size: 18px;
}

.icon-btn {
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}

.edit-body {
  padding: 16px 20px 8px;
  overflow-y: auto;
}

label {
  font-size: 13px;
  margin-bottom: 4px;
  color: #4b5563;
}

.form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.form-row.two-col {
  flex-direction: row;
  gap: 12px;
}

.form-row.two-col > div {
  flex: 1;
  display: flex;
  flex-direction: column;
}

input,
select {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 8px 10px;
  font-size: 13px;
}

.hint {
  margin-top: 4px;
  font-size: 11px;
  color: #9ca3af;
}

.edit-footer {
  padding: 12px 20px 16px;
  border-top: 1px solid #edf0f7;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.primary-btn {
  background: #248efff2;
  color: #fff;
  border-radius: 8px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}

.secondary-btn {
  background: #f3f4f6;
  color: #374151;
  border-radius: 8px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}
</style>