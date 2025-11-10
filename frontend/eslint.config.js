import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginReactJsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    languageOptions: {
      globals: globals.browser, // Cho phép các biến toàn cục của trình duyệt
      parserOptions: {
        ecmaFeatures: { jsx: true }, // Cho phép phân tích JSX
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    settings: {
      react: {
        version: 'detect' // Tự phát hiện phiên bản React
      }
    }
  },
  pluginJs.configs.recommended, // Quy tắc cơ bản của ESLint
  pluginReactConfig, // Quy tắc của React
  pluginReactJsxRuntime, // Dành cho React 17+ (không cần 'import React')
  {
    // Cấu hình cho React Hooks
    plugins: {
      'react-hooks': pluginReactHooks
    },
    rules: pluginReactHooks.configs.recommended.rules
  },
  {
    // Cấu hình cho React Refresh (Vite)
    plugins: {
      'react-refresh': pluginReactRefresh
    },
    rules: {
      'react-refresh/only-export-components': 'warn'
    }
  },
  {
    // Tùy chỉnh: Tắt các quy tắc không cần thiết
    rules: {
      "react/prop-types": "off", // Tắt bắt buộc 'prop-types'
      "react/display-name": "off" // Tắt bắt buộc 'display-name'
    }
  },
  {
    // Bỏ qua thư mục build
    ignores: ["dist/"]
  }
];