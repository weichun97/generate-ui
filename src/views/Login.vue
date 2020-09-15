<template>
  <form>
    账号: <input type="text" v-model="param.userName" /><br />
    密码: <input type="password" v-model="param.password" /><br />
    <p><input type="checkbox" v-model="param.rememberMe" />记住我</p>
    <input type="button" @click="login" value="登录" />
  </form>
</template>

<script>
import { $loginApi } from "@/api/index.js";
export default {
  name: "Login",
  data() {
    return {
      param: {
        userName: "",
        password: "",
        rememberMe: ""
      }
    };
  },
  methods: {
    login() {
      console.log(this.param);
      $loginApi.login(this.param)
        .then(res => {
          console.log(res.data);
        })
        .then(error => {
          console.log(error);
        });
    }
  }
};
</script>

<style scoped></style>
