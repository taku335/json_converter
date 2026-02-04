const form = document.getElementById("converter-form");
const output = document.getElementById("json-output");
const forbiddenPattern = /[<>"'&]/;
const environmentDependentPattern = /[\u2460-\u24ff\u2150-\u218f\u3200-\u32ff\u3300-\u33ff\ud83c\udd00-\ud83c\uddff]/u;
const japanesePattern = /^[\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Han}\p{sc=Latin}\s]+$/u;

const showError = (field, message) => {
  const error = document.querySelector(`[data-error-for="${field}"]`);
  if (error) {
    error.textContent = message;
  }
};

const clearErrors = () => {
  document.querySelectorAll(".error").forEach((error) => {
    error.textContent = "";
  });
};

const validateDate = (field, value) => {
  if (!value) {
    showError(field, "日付を入力してください。");
    return false;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    showError(field, "YYYY-MM-DD形式で入力してください。");
    return false;
  }
  return true;
};

const validate = (values) => {
  let valid = true;

  if (!values.name) {
    showError("name", "名前を入力してください。");
    valid = false;
  } else if (forbiddenPattern.test(values.name)) {
    showError("name", "禁止文字が含まれています。");
    valid = false;
  } else if (environmentDependentPattern.test(values.name)) {
    showError("name", "環境依存文字は使用できません。");
    valid = false;
  } else if (!japanesePattern.test(values.name)) {
    showError("name", "日本語の文字のみ入力してください。");
    valid = false;
  }

  if (!values.age) {
    showError("age", "年齢を入力してください。");
    valid = false;
  } else if (!/^\d+$/.test(values.age)) {
    showError("age", "数字のみ入力してください。");
    valid = false;
  }

  if (!values.bool) {
    showError("bool", "true か false を選択してください。");
    valid = false;
  }

  if (!validateDate("date", values.date)) {
    valid = false;
  }

  if (!validateDate("date2", values.date2)) {
    valid = false;
  }

  return valid;
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();

  const values = {
    name: form.name.value.trim(),
    age: form.age.value.trim(),
    bool: form.bool.value,
    date: form.date.value,
    date2: form.date2.value,
  };

  if (!validate(values)) {
    output.textContent = "入力内容を確認してください。";
    return;
  }

  const payload = {
    name: values.name,
    age: Number(values.age),
    bool: values.bool === "true",
    date: values.date,
    date2: values.date2,
  };

  output.textContent = JSON.stringify(payload, null, 2);
});
