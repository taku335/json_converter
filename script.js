const form = document.getElementById("converter-form");
const output = document.getElementById("json-output");
const forbiddenPattern = /[<>"'&]/;
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

const validate = (values) => {
  let valid = true;

  if (!values.name) {
    showError("name", "名前を入力してください。");
    valid = false;
  } else if (forbiddenPattern.test(values.name)) {
    showError("name", "禁止文字が含まれています。");
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

  if (!values.date) {
    showError("date", "日付を入力してください。");
    valid = false;
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) {
    showError("date", "YYYY-MM-DD形式で入力してください。");
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
  };

  output.textContent = JSON.stringify(payload, null, 2);
});
