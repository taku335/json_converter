const form = document.getElementById("converter-form");
const output = document.getElementById("json-output");
const submitButton = form.querySelector('button[type="submit"]');
const copyButton = document.getElementById("copy-json");
const copyStatus = document.getElementById("copy-status");
const forbiddenPattern = /[<>"'&]/;
const environmentDependentPattern = /[\u2460-\u24ff\u2150-\u218f\u3200-\u32ff\u3300-\u33ff\ud83c\udd00-\ud83c\uddff]/u;
const japanesePattern = /^[\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Han}\p{sc=Latin}\p{Nd}\s]+$/u;

const touchedFields = new Set();
let isJsonOutput = false;
let copyTimeoutId = null;

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

const validateDate = (field, value, { allowEmpty, showErrors = true, showUntouchedRequired = true } = {}) => {
  if (!value) {
    if (!allowEmpty && (showUntouchedRequired || touchedFields.has(field))) {
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

const validate = (values, { allowEmpty, showErrors = true, showUntouchedRequired = true } = {}) => {
  let valid = true;

  if (!values.name) {
    if (!allowEmpty && (showUntouchedRequired || touchedFields.has("name"))) {
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
      showError("name", "日本語の文字と数字のみ入力してください。");
    }
    valid = false;
  }

  if (!values.age) {
    if (!allowEmpty && (showUntouchedRequired || touchedFields.has("age"))) {
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
  } else {
    const ageNumber = Number(values.age);
    if (ageNumber < 1 || ageNumber > 10000) {
      if (showErrors) {
        showError("age", "1〜10000の範囲で入力してください。");
      }
      valid = false;
    }
  }

  if (!values.bool) {
    if (!allowEmpty && (showUntouchedRequired || touchedFields.has("bool"))) {
      if (showErrors) {
        showError("bool", "true か false を選択してください。");
      }
      valid = false;
    }
  }

  if (!validateDate("date", values.date, { allowEmpty, showErrors, showUntouchedRequired })) {
    valid = false;
  }

  if (!validateDate("date2", values.date2, { allowEmpty, showErrors, showUntouchedRequired })) {
    valid = false;
  }

  if (values.date && values.date2 && values.date2 < values.date) {
    if (showErrors) {
      showError("date2", "日付1と同じ日付、または日付1より後の日付を入力してください。");
    }
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
    isJsonOutput = false;
    copyStatus.textContent = "";
  } else if (valid) {
    output.textContent = "ここに結果が表示されます。";
    isJsonOutput = false;
    copyStatus.textContent = "";
  }
  copyButton.disabled = !isJsonOutput;
};

const validateOnInput = (field) => {
  const values = getValues();
  clearErrors();
  validate(values, { allowEmpty: false, showUntouchedRequired: false });
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
    isJsonOutput = false;
    copyStatus.textContent = "";
    copyButton.disabled = true;
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
  isJsonOutput = true;
  copyStatus.textContent = "";
  copyButton.disabled = false;
});

updateSubmitState();

const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) {
    throw new Error("Copy failed");
  }
};

copyButton.addEventListener("click", async () => {
  if (!isJsonOutput) {
    return;
  }

  try {
    await copyText(output.textContent);
    copyStatus.textContent = "コピーしました。";
  } catch (error) {
    copyStatus.textContent = "コピーに失敗しました。";
  }

  if (copyTimeoutId) {
    clearTimeout(copyTimeoutId);
  }
  copyTimeoutId = setTimeout(() => {
    copyStatus.textContent = "";
    copyTimeoutId = null;
  }, 2000);
});
