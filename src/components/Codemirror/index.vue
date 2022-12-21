<template>
  <codemirror
    v-bind="$attrs"
    :value.sync="value"
    :options="option"
    @cursorActivity="onCmCursorActivity"
    @ready="onCmReady"
    @focus="onCmFocus"
    @blur="onCmBlur"
    @input="onCmInput"
    @scroll="onCmScroll"
  />
</template>

<script>
import { codemirror } from 'vue-codemirror'

// 语言
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/css/css.js'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/clike/clike.js'
import 'codemirror/mode/htmlmixed/htmlmixed.js'

// 搜索
import 'codemirror/addon/search/search.js'
import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/edit/matchbrackets.js'

export default {
  name: 'Codemirror',
  components: {
    codemirror
  },
  props: {
    code: {
      type: String,
      default: null
    },
    option: {
      type: Object,
      default() {
        return {
          modes: 'text/x-java',
          matchBrackets: true,
          viewportMargin: 20,
          connect: 'align',
          foldGutter: true,
          lineNumbers: true
        }
      }

    }
  },
  data() {
    return {
      codemirror: null
    }
  },
  computed: {
    value: {
      get() {
        return this.code
      },
      set(val) {
        this.$emit('update:code', val)
      }
    }
  },
  methods: {
    onCmCursorActivity(a, b, c) {
    },
    onCmReady(a, b, c) {
      this.codemirror = a
    },
    onCmFocus(a, b, c) {
    },
    onCmBlur(a, b, c) {
    },
    onCmInput(code) {
      this.value = code
    },
    onCmScroll() {
    }
  }
}
</script>
