<template>
<div class="div">
  <div class="container">
    <div class="container2">
      <div class="container3">
        <img class="icon" src="@\assets\Icon-3.svg"/>
      </div>
      <div class="heading-1">
        <div class="div2">렌탈 브레인</div>
      </div>
      <div class="paragraph">
        <div class="div3">렌탈 중개업체 전용 통합 비즈니스 솔루션</div>
      </div>
    </div>
    <div class="container4">
      <div class="container5">
        <div class="heading-2">
          <div class="div4">로그인</div>
        </div>
        <div class="paragraph2">
          <div class="erp-crm">ERP·CRM 통합 관리 시스템</div>
        </div>
      </div>
      <div class="form">
        <div class="container6">
          <div class="label">
            <div class="div5">사원 ID</div>
          </div>
          <div class="container7">
            <div class="email-input">
              <div class="div6">사원ID를 입력하세요</div>
            </div>
            <div class="container8">
              <img class="icon2" src="@\assets\Icon-2.svg" />
            </div>
          </div>
        </div>
        <div class="container6">
          <div class="label">
            <div class="div5">비밀번호</div>
          </div>
          <div class="container7">
            <div class="password-input">
              <div class="div6">비밀번호를 입력하세요</div>
            </div>
            <div class="container8">
              <img class="icon3" src="@\assets\Icon-1.svg" />
            </div>
          </div>
        </div>
        <div class="container9">
          <div class="checkbox"></div>
          <div class="label2">
            <div class="div5">로그인 상태 유지</div>
          </div>
        </div>
        <div class="button">
          <div class="div7">로그인</div>
        </div>
      </div>
    </div>
    <div class="container10">
      <img class="icon4" src="@\assets\Icon.svg" />
      <div class="text">
        <div class="div8">보안 연결로 안전하게 보호됩니다</div>
      </div>
    </div>
    <div class="container11">
      <div class="paragraph3">
        <div class="_2024-all-rights-reserved">
          © 2024 렌탈 브레인. All rights reserved.
        </div>
      </div>
      <div class="paragraph3">
        <div class="b-2-b-erp-crm">B2B 렌탈 전문 ERP·CRM 통합 솔루션</div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
const empId = ref('');
const pwd = ref('');

</script>

<style>
.div,
.div * {
  box-sizing: border-box;
}
.div {
  background: linear-gradient(
      135deg,
      rgba(239, 246, 255, 1) 0%,
      rgba(255, 255, 255, 1) 50%,
      rgba(238, 242, 255, 1) 100%
    ),
    linear-gradient(to left, #ffffff, #ffffff);
  padding: 0px 0.01px 0px 0px;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: center;
  height: 1146px;
  position: relative;
}
.container {
  flex-shrink: 0;
  width: 414.69px;
  height: 645.19px;
  position: relative;
}
.container2 {
  width: 414.69px;
  height: 129.56px;
  position: absolute;
  left: 0px;
  top: 0px;
}
.container3 {
  background: linear-gradient(
    135deg,
    rgba(51, 102, 204, 1) 0%,
    rgba(20, 71, 230, 1) 100%
  );
  border-radius: 14.81px;
  width: 59.24px;
  height: 59.24px;
  position: absolute;
  left: 177.72px;
  top: 0px;
  box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.1),
    0px 10px 15px -3px rgba(0, 0, 0, 0.1);
}
.icon {
  width: 33.31px;
  height: 33.31px;
  position: absolute;
  left: 12.96px;
  top: 12.96px;
  overflow: visible;
}
.heading-1 {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  width: 414.69px;
  height: 29.61px;
  position: absolute;
  left: 0px;
  top: 74.04px;
}
.div2 {
  color: #101828;
  text-align: center;
  font-family: "Arial-Bold", sans-serif;
  font-size: 22.215599060058594px;
  line-height: 29.62px;
  font-weight: 700;
  position: relative;
  flex: 1;
}
.paragraph {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  width: 414.69px;
  height: 18.51px;
  position: absolute;
  left: 0px;
  top: 111.05px;
}
.div3 {
  color: #4a5565;
  text-align: center;
  font-family: "Arial-Regular", sans-serif;
  font-size: 12.959099769592285px;
  line-height: 18.51px;
  font-weight: 400;
  position: relative;
  flex: 1;
}
.container4 {
  background: #ffffff;
  border-radius: 14.81px;
  border-style: solid;
  border-color: #e5e7eb;
  border-width: 0.8px;
  padding: 30.41px 30.41px 0.8px 30.41px;
  display: flex;
  flex-direction: column;
  gap: 22.21px;
  align-items: flex-start;
  justify-content: flex-start;
  width: 414.69px;
  height: 386.05px;
  position: absolute;
  left: 0px;
  top: 159.18px;
  box-shadow: 0px 8px 10px -6px rgba(0, 0, 0, 0.1),
    0px 20px 25px -5px rgba(0, 0, 0, 0.1);
}
.container5 {
  display: flex;
  flex-direction: column;
  gap: 3.7px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 48.13px;
  position: relative;
}
.heading-2 {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 25.91px;
  position: relative;
}
.div4 {
  color: #101828;
  text-align: left;
  font-family: "Arial-Bold", sans-serif;
  font-size: 18.51300048828125px;
  line-height: 25.92px;
  font-weight: 700;
  position: relative;
  flex: 1;
}
.paragraph2 {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 18.51px;
  position: relative;
}
.erp-crm {
  color: #6a7282;
  text-align: left;
  font-family: "Arial-Regular", sans-serif;
  font-size: 12.959099769592285px;
  line-height: 18.51px;
  font-weight: 400;
  position: relative;
  flex: 1;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 18.51px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 254.89px;
  position: relative;
}
.container6 {
  display: flex;
  flex-direction: column;
  gap: 7.4px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 68.21px;
  position: relative;
}
.label {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 18.51px;
  position: relative;
}
.div5 {
  color: #364153;
  text-align: left;
  font-family: "Arial-Regular", sans-serif;
  font-size: 12.959099769592285px;
  line-height: 18.51px;
  font-weight: 400;
  position: relative;
  flex: 1;
}
.container7 {
  align-self: stretch;
  flex-shrink: 0;
  height: 42.3px;
  position: relative;
}
.email-input {
  border-radius: 13.26px;
  border-style: solid;
  border-color: #d1d5dc;
  border-width: 0.8px;
  padding: 11.11px 11.11px 11.11px 37.03px;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  width: 353.86px;
  height: 42.3px;
  position: absolute;
  left: 0px;
  top: 0px;
  overflow: hidden;
}
.div6 {
  color: rgba(10, 10, 10, 0.5);
  text-align: left;
  font-family: "Arial-Regular", sans-serif;
  font-size: 12.959099769592285px;
  font-weight: 400;
  position: relative;
}
.container8 {
  padding: 0px 0px 0px 11.1px;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  width: 29.61px;
  height: 42.3px;
  position: absolute;
  left: 0px;
  top: 0px;
}
.icon2 {
  flex-shrink: 0;
  width: 18.51px;
  height: 18.51px;
  position: relative;
  overflow: visible;
}
.password-input {
  border-radius: 13.26px;
  border-style: solid;
  border-color: #d1d5dc;
  border-width: 0.8px;
  padding: 11.11px 11.11px 11.11px 37.03px;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  width: 353.86px;
  height: 42.3px;
  position: absolute;
  left: 0px;
  top: 0px;
  overflow: hidden;
}
.icon3 {
  flex-shrink: 0;
  width: 18.51px;
  height: 18.51px;
  position: relative;
  overflow: visible;
}
.container9 {
  display: flex;
  flex-direction: row;
  gap: 7.4px;
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 18.51px;
  position: relative;
}
.checkbox {
  flex-shrink: 0;
  width: 14.8px;
  height: 14.8px;
  position: relative;
}
.label2 {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
  width: 99.78px;
  height: 18.51px;
  position: relative;
}
.button {
  background: linear-gradient(
    90deg,
    rgba(51, 102, 204, 1) 0%,
    rgba(20, 71, 230, 1) 100%
  );
  border-radius: 13.26px;
  align-self: stretch;
  flex-shrink: 0;
  height: 44.41px;
  position: relative;
  box-shadow: 0px 2px 4px -2px rgba(0, 0, 0, 0.1),
    0px 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.div7 {
  color: #ffffff;
  text-align: center;
  font-family: "Arial-Regular", sans-serif;
  font-size: 14.810400009155273px;
  line-height: 22.22px;
  font-weight: 400;
  position: absolute;
  left: 156.71px;
  top: 9.9px;
}
.container10 {
  padding: 0px 0.01px 0px 0px;
  display: flex;
  flex-direction: row;
  gap: 7.4px;
  align-items: center;
  justify-content: center;
  width: 414.69px;
  height: 14.81px;
  position: absolute;
  left: 0px;
  top: 567.44px;
}
.icon4 {
  flex-shrink: 0;
  width: 14.8px;
  height: 14.8px;
  position: relative;
  overflow: visible;
}
.text {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
  width: 167.18px;
  height: 14.81px;
  position: relative;
}
.div8 {
  color: #6a7282;
  text-align: center;
  font-family: "Arial-Regular", sans-serif;
  font-size: 11.107799530029297px;
  line-height: 14.81px;
  font-weight: 400;
  position: relative;
  flex: 1;
}
.container11 {
  display: flex;
  flex-direction: column;
  gap: 3.7px;
  align-items: flex-start;
  justify-content: flex-start;
  width: 414.69px;
  height: 33.33px;
  position: absolute;
  left: 0px;
  top: 611.86px;
}
.paragraph3 {
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 14.81px;
  position: relative;
}
._2024-all-rights-reserved {
  color: #99a1af;
  text-align: center;
  font-family: "Arial-Regular", sans-serif;
  font-size: 11.107799530029297px;
  line-height: 14.81px;
  font-weight: 400;
  position: relative;
  flex: 1;
}
.b-2-b-erp-crm {
  color: #99a1af;
  text-align: center;
  font-family: "Arial-Regular", sans-serif;
  font-size: 11.107799530029297px;
  line-height: 14.81px;
  font-weight: 400;
  position: relative;
  flex: 1;
}

</style>
