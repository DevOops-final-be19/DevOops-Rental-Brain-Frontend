<template>
  <div class="notification-page">

    <!-- 헤더 -->
    <div class="page-header">
      <div class="title">
        <el-icon><Bell /></el-icon>
        전체 알림
        <span class="badge">{{ totalCount }}</span>
      </div>

      <el-icon class="close" @click="goBack">
        <Close />
      </el-icon>
    </div>

    <!-- 탭 -->
    <el-tabs v-model="activeTab" class="noti-tabs">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.key"
        :label="`${tab.label} (${tab.count})`"
        :name="tab.key"
      />
    </el-tabs>

    <!-- 알림 리스트 -->
    <div class="noti-list">

      <div
        v-for="item in filteredNotifications"
        :key="item.id"
        class="noti-card"
      >
        <div class="icon" :class="item.notice.type">
          <el-icon>
            <component :is="getIcon(item.notice.type)" />
          </el-icon>
        </div>

        <div class="content">
          <div class="title-line">
            <span class="title">{{ item.notice.title }}</span>
            <span class="new" v-if="item.isRead==='N'">NEW</span>
          </div>
          <div class="message">{{ item.notice.message }}</div>
          <div class="time">{{ timeAgo(item.createdAt) }}</div>
        </div>
      </div>
    </div>

    <!-- 푸터 -->
    <div class="footer">
      <span class="read-all" @click.stop="readAll">모두 읽음으로 표시</span>
      <el-button type="primary" round @click.stop="goBack">뒤로 가기</el-button>
    </div>

  </div>
</template>


<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Bell,
  Check,
  Calendar,
  WarningFilled,
  DocumentCopy,
  Close
} from "@element-plus/icons-vue";
import api from "@/api/axios";
import { useAuthStore } from "@/store/auth.store";
import dayjs from "dayjs";

const authStore = useAuthStore();
const router = useRouter();
const activeTab = ref("ALL");
const notifications = ref([]);

onMounted(async()=>{
    const response = await api.get(`/notice/list/${authStore.id}`)
    const data = response.data;
    console.log("notice -",data);
    notifications.value = data;
});

const readAll = async ()=>{
    // const response = await api.post(`/notice/read/${authStore.id}`)
    // const data = response.data;
    // console.log("notice -",data);
    // notifications.value = data;
}

const tabs = computed(() => [
  { key: "ALL", label: "전체", count: notifications.value.length },
  { key: "APPROVAL", label: "결재 승인", count: countBy("APPROVAL") },
  { key: "AS_DUE", label: "연체", count: countBy("AS_DUE") },
  { key: "CONTRACT_EXPIRE", label: "계약 만료", count: countBy("CONTRACT_EXPIRE") },
  { key: "QUOTE_INSERT", label: "견적(상담)", count: countBy("QUOTE_INSERT") }
]);

const totalCount = computed(() => {
    return notifications.value.filter(n => n.isRead === 'N').length;
});

const filteredNotifications = computed(() => {
  if (activeTab.value === "ALL") return notifications.value;
  return notifications.value.filter(n => n.notice.type === activeTab.value);
});

const countBy = (type) =>
  notifications.value.filter(n => n.notice.type === type).length;

const timeAgo = (date) => {
 const now = dayjs();
  const target = dayjs(date);

  const diffSec = now.diff(target, "second");
  const diffMin = now.diff(target, "minute");
  const diffHour = now.diff(target, "hour");
  const diffDay = now.diff(target, "day");
  const diffWeek = now.diff(target, "week");
  const diffMonth = now.diff(target, "month");
  const diffYear = now.diff(target, "year");

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffWeek < 4) return `${diffWeek}주 전`;
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  return `${diffYear}년 전`;
}

const getIcon = (type) => {
  switch (type) {
    case "APPROVAL": return Check;
    case "AS_DUE": return WarningFilled;
    case "CONTRACT_EXPIRE": return Calendar;
    case "QUOTE_INSERT": return DocumentCopy;
    default: return Bell;
  }
};

const goBack = () => {
  router.back();
};
</script>


<style scoped>
.notification-page {
  height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #eef4ff;
}

.page-header .title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
}

.badge {
  background: #ef4444;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.close {
  cursor: pointer;
}

.noti-tabs {
  padding: 0 16px;
}

.noti-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.day-title {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.noti-card {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
}

.icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon.APPROVAL { background: #e6f4ea; color: #22c55e; }
.icon.CONTRACT_EXPIRE { background: #fff7ed; color: #f97316; }
.icon.QUOTE_INSERT { background: #eff6ff; color: #3b82f6; }
.icon.AS_DUE { background: #fee2e2; color: #ef4444; }

.content .title-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content .title {
  font-weight: 600;
}

.new {
  background: #ef4444;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}

.message {
  font-size: 13px;
  color: #555;
  margin: 4px 0;
}

.time {
  font-size: 12px;
  color: #9ca3af;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-top: 1px solid #eee;
  background: #fff;
}

.read-all {
    transition-duration: 0.2s;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
}

.read-all:hover {
    transition-duration: 0.2s;
  color: #4c7ce6;
  font-weight: 600;
  cursor: pointer;
}
</style>

