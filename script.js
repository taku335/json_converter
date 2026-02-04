const form = document.getElementById("converter-form");
const output = document.getElementById("json-output");
const submitButton = form.querySelector('button[type="submit"]');
const forbiddenPattern = /[<>"'&]/;
const environmentDependentPattern = /[\u2460-\u24ff\u2150-\u218f\u3200-\u32ff\u3300-\u33ff\ud83c\udd00-\ud83c\uddff]/u;
const japanesePattern = /^[\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Han}\p{sc=Latin}\s]+$/u;

const touchedFields = new Set();

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

const validateDate = (field, value, { allowEmpty, showErrors = true } = {}) => {
  if (!value) {
    if (!allowEmpty) {
      if (showErrors) {
        showError(field, "日付を入力してください。");
      }
    }
    return allowEmpty;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    if (showErrors) {
      showError(field, "YYYY-MM-DD形式で入力してください。");
    }
    return false;
  }
  return true;
};

const validate = (values, { allowEmpty, showErrors = true } = {}) => {
  let valid = true;

  if (!values.name) {
    if (!allowEmpty) {
      if (showErrors) {
        showError("name", "名前を入力してください。");
      }
      valid = false;
    }
  } else if (forbiddenPattern.test(values.name)) {
    if (showErrors) {
      showError("name", "禁止文字が含まれています。");
    }
    valid = false;
  } else if (environmentDependentPattern.test(values.name)) {
    if (showErrors) {
      showError("name", "環境依存文字は使用できません。");
    }
    valid = false;
  } else if (!japanesePattern.test(values.name)) {
    if (showErrors) {
      showError("name", "日本語の文字のみ入力してください。");
    }
    valid = false;
  }

  if (!values.age) {
    if (!allowEmpty) {
      if (showErrors) {
        showError("age", "年齢を入力してください。");
      }
      valid = false;
    }
  } else if (!/^\d+$/.test(values.age)) {
    if (showErrors) {
      showError("age", "数字のみ入力してください。");
    }
    valid = false;
  }

  if (!values.bool) {
    if (!allowEmpty) {
      if (showErrors) {
        showError("bool", "true か false を選択してください。");
      }
      valid = false;
    }
  }

  if (!validateDate("date", values.date, { allowEmpty, showErrors })) {
    valid = false;
  }

  if (!validateDate("date2", values.date2, { allowEmpty, showErrors })) {
    valid = false;
  }

  return valid;
};

const getValues = () => ({
  name: form.name.value.trim(),
  age: form.age.value.trim(),
  bool: form.bool.value,
  date: form.date.value,
  date2: form.date2.value,
});

const updateSubmitState = () => {
  const values = getValues();
  const valid = validate(values, { showErrors: false });
  submitButton.disabled = !valid;
  if (!valid && touchedFields.size > 0) {
    output.textContent = "入力内容を確認してください。";
  } else if (valid) {
    output.textContent = "ここに結果が表示されます。";
  }
};

const validateOnInput = (field) => {
  const values = getValues();
  clearErrors();
  validate(values, { allowEmpty: !touchedFields.has(field) });
  updateSubmitState();
};

form.addEventListener("input", (event) => {
  if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement)) {
    return;
  }
  touchedFields.add(event.target.name);
  validateOnInput(event.target.name);
});

form.addEventListener("blur", (event) => {
  if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement)) {
    return;
  }
  touchedFields.add(event.target.name);
  validateOnInput(event.target.name);
}, true);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();

  const values = getValues();

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

updateSubmitState();
