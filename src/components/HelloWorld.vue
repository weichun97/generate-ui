<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  created() {
    axios
      .post(
        "/api/pc/mapMonitor/operation/listGpsVehicle",
        JSON.stringify({
          page: "1",
          size: "5"
        }),
        {
          headers: {
            token: "640d1b40044a8474eef0a07346861a1a"
          }
        }
      )
      .then(response => {
        if (response.data.code === 200) {
          for (let i = 0; i < response.data.data.length; i++) {
            console.log(response.data)
          }
        }
      })
      .then(() => {
        console.log(this.graphics);
      });
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
