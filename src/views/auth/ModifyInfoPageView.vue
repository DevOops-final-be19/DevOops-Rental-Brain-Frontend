<template>
  <div class="my-profile">

    <!-- 헤더 -->
    <div class="header">
      <el-button text @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        뒤로 가기
      </el-button>

      <div class="actions">
        <el-button @click="router.back()">취소</el-button>
        <el-button type="primary" @click="onSave">저장</el-button>
      </div>
    </div>

    <!-- 타이틀 -->
    <div class="title">
      <h2>내 정보 수정</h2>
      <span>개인 정보를 수정할 수 있습니다</span>
    </div>

    <!-- 프로필 카드 -->
    <el-card shadow="never" class="profile-card">
      <div class="profile-box">
        <el-avatar :size="72" class="avatar">
          <el-icon><User /></el-icon>
        </el-avatar>

        <div class="profile-meta">
          <div class="name">{{ form.name }}</div>
          <div class="tags">
            <el-tag type="success" size="small">{{ form.dept }}</el-tag>
            <el-tag type="info" size="small">{{ form.position.position_name }}</el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 수정 폼 -->
    <el-card shadow="never" class="info-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        label-position="left"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="사번번호">
              <el-input v-model="form.employeeCode" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="부서">
              <el-input v-model="form.dept" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="이름" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="직급">
              <el-input
                :model-value="form.position?.position_name"
                disabled
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="연락처" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="입사일">
              <el-date-picker
                v-model="form.hire_date"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                disabled
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="이메일" prop="email">
              <el-input v-model="form.email" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="생년월일">
              <el-date-picker
                v-model="form.birthday"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="주소">
              <el-input v-model="form.addr" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="성별">
              <el-radio-group v-model="form.gender">
                <el-radio label="남성">남성</el-radio>
                <el-radio label="여성">여성</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 안내 -->
    <el-alert
      type="warning"
      show-icon
      :closable="false"
      class="notice"
    >
      사번번호, 부서, 직급, 입사일은 관리자만 변경할 수 있습니다.
    </el-alert>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import api from "@/api/axios";
import { useAuthStore } from "@/store/auth.store";

const router = useRouter();
const formRef = ref();
const authStore = useAuthStore();

const form = ref({
  employeeCode: "",
  name: "",
  phone: "",
  email: "",
  addr: "",
  dept: "",
  gender: "",
  birthday: "",
  hire_date: "",
  position: {},
});

const rules = {
  name: [{ required: true, message: "이름을 입력하세요", trigger: "blur" }],
  phone: [{ required: true, message: "연락처를 입력하세요", trigger: "blur" }],
  email: [
    { required: true, message: "이메일을 입력하세요", trigger: "blur" },
    { type: "email", message: "이메일 형식이 아닙니다", trigger: "blur" },
  ],
};

onMounted(async () => {
  const res = await api.get("/emp/mypage");
  form.value = res.data;
});

const onSave = async () => {
  await formRef.value.validate();

  await api.put("/emp/mypage", {
    empId: authStore.empId,
    name: form.value.name,
    phone: form.value.phone,
    email: form.value.email,
    addr: form.value.addr,
  });

  ElMessage.success("정보가 수정되었습니다");
  router.back();
};
</script>

<style scoped>
.my-profile {
  padding: 28px;
  background: #f6f8fb;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 10px;
}

.title {
  margin: 16px 0 24px;
}

.title h2 {
  margin: 0;
  font-size: 26px;
}

.title span {
  color: #6b7280;
}

.profile-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  border-radius: 14px;
}

.profile-box {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  background: #2563eb;
  color: #fff;
}

.profile-meta .name {
  font-size: 20px;
  font-weight: 700;
}

.info-card {
  margin-bottom: 20px;
  border-radius: 14px;
}

.notice {
  border-radius: 12px;
}
</style>
