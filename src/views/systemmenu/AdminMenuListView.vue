<template>
    <div class="admin-auth-page">

        <!-- 상단 타이틀 -->
        <div class="page-title">
            <h2>사용자 관리</h2>
            <span>사용자별 권한을 관리합니다</span>
        </div>

        <div class="content">

            <!-- 좌측: 사용자 목록 -->
            <el-card shadow="never" class="user-list">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <User />
                        </el-icon>
                        사용자 목록
                    </div>
                </template>

                <el-input v-model="keyword" placeholder="이름, 이메일, 부서 검색" clearable class="search" />

                <!-- ✅ 스크롤 영역 -->
                <div class="list scroll">
                    <div v-for="emp in filteredEmployees" :key="emp.id" class="user-item"
                        :class="{ active: emp.id === selectedEmployee?.id }" @click="selectEmployee(emp)">
                        <el-avatar class="avatar">
                            <el-icon>
                                <User />
                            </el-icon>
                        </el-avatar>

                        <div class="meta">
                            <div class="name">{{ emp.name }}</div>
                            <div class="sub">{{ emp.email }}</div>
                            <div class="dept">{{ emp.position.position_name }}</div>
                        </div>
                    </div>
                </div>
            </el-card>

            <!-- 우측: 권한 목록 -->
            <el-card shadow="never" class="auth-panel" v-if="selectedEmployee">

                <!-- ✅ 고정 영역 -->
                <div class="auth-fixed">
                    <div class="emp-header">
                        <!-- 왼쪽 영역 -->
                        <div class="emp-info">
                            <el-avatar size="48">
                                <el-icon>
                                    <User />
                                </el-icon>
                            </el-avatar>

                            <div>
                                <div class="name">{{ selectedEmployee.name }}</div>
                                <div class="sub">
                                    {{ selectedEmployee.email }} · {{ selectedEmployee.dept }}
                                </div>
                            </div>
                        </div>

                        <!-- 오른쪽 영역 -->
                        <div class="actions">
                            <el-button type="primary" :disabled="!isChanged" @click="saveAuth">
                                수정
                            </el-button>

                        </div>
                    </div>


                    <el-alert type="warning" show-icon :closable="false" class="hint">
                        스위치를 변경한 후 <b>수정 버튼</b>을 눌러야 반영됩니다.
                    </el-alert>
                </div>

                <!-- ✅ 스크롤 영역 -->
                <div class="auth-scroll">
                    <div class="auth-list">
                        <div v-for="auth in authList" :key="auth.id" class="auth-item">
                            <div class="info">
                                <div class="title">{{ auth.description }}</div>
                            </div>

                            <el-switch v-model="auth.enabled" active-color="#22c55e" inactive-color="#e5e7eb" />
                        </div>
                    </div>


                </div>

            </el-card>


        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { User } from "@element-plus/icons-vue";
import api from "@/api/axios";

/* ================= 상태 ================= */
const employees = ref([]);
const allAuthList = ref([]);      // ✅ 권한 마스터 (1회 로딩)
const authList = ref([]);         // 화면용 권한 목록
const selectedEmployee = ref(null);
const keyword = ref("");
const originalAuthIds = ref([]);

/* ================= 변경 여부 ================= */
const isChanged = computed(() => {
  if (!selectedEmployee.value) return false;

  const currentIds = authList.value
    .filter(a => a.enabled)
    .map(a => a.id)
    .sort();

  return JSON.stringify(currentIds) !== JSON.stringify(originalAuthIds.value);
});

/* ================= 검색 ================= */
const filteredEmployees = computed(() => {
  if (!keyword.value) return employees.value;
  return employees.value.filter(e =>
    e.name.includes(keyword.value) ||
    e.email.includes(keyword.value) ||
    e.dept.includes(keyword.value)
  );
});

/* ================= 초기 로딩 ================= */
onMounted(async () => {
  const [empRes, authRes] = await Promise.all([
    api.get("/emp/admin/emplist"),
    api.get("/emp/admin/empauthlist")
  ]);

  employees.value = empRes.data;
  allAuthList.value = authRes.data;
});

/* ================= 사원 선택 ================= */
const selectEmployee = (emp) => {
  selectedEmployee.value = emp;

  const ownedAuthIds = emp.empAuth.map(a => a.auth_id);

  authList.value = allAuthList.value.map(auth => ({
    ...auth,
    enabled: ownedAuthIds.includes(auth.id)
  }));

  // 기준 상태 저장
  originalAuthIds.value = [...ownedAuthIds].sort();
};

/* ================= 저장 ================= */
const saveAuth = async () => {
  const enabledAuthIds = authList.value
    .filter(a => a.enabled)
    .map(a => a.id);

  await api.put("/emp/admin/empauth", {
    auth_id: enabledAuthIds,
    emp_id: selectedEmployee.value.id
  });

  originalAuthIds.value = [...enabledAuthIds].sort();
  ElMessage.success("권한이 수정되었습니다");
};
</script>

<style scoped>
.page-title {
    margin-bottom: 20px;
}

.page-title h2 {
    margin: 0;
    font-size: 26px;
}

.page-title span {
    color: #6b7280;
}

.content {
    display: flex;
    gap: 20px;
    height: calc(100vh - 120px);
    /* ✅ 전체 높이 고정 */
}

/* 공통 스크롤 */
.scroll {
    overflow-y: auto;
}

/* 좌측 */
.user-list {
    width: 320px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
}

.search {
    margin-bottom: 12px;
}

.list {
    flex: 1;
    padding-right: 4px;
}

.user-item {
    display: flex;
    gap: 12px;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
}

.user-item.active {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
}

.user-item:hover {
    background: #f1f5f9;
}

.meta .name {
    font-weight: 600;
}

.meta .sub {
    font-size: 12px;
    color: #6b7280;
}

.meta .dept {
    font-size: 12px;
    color: #3b82f6;
}

/* 우측 패널 전체 */
.auth-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: 14px;
}


.auth-panel :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
}

.emp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* ⭐ 좌우 분리 */
    margin-bottom: 12px;
}

.emp-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.emp-header .name {
    font-weight: 700;
}

.emp-header .sub {
    font-size: 13px;
    color: #6b7280;
}

.hint {
    margin-bottom: 12px;
}

/* 🔒 고정 영역 */
.auth-fixed {
    flex-shrink: 0;
}

/* 📜 스크롤 영역 */
.auth-scroll {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
}

.auth-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.auth-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
}

.actions {
    display: flex;
    align-items: center;
}

.actions .el-button {
    height: 36px;
    padding: 0 18px;
}
</style>
