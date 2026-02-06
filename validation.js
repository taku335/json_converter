export const forbiddenPattern = /[<>"'&]/;
export const environmentDependentPattern = /[\u2460-\u24ff\u2150-\u218f\u3200-\u32ff\u3300-\u33ff\ud83c\udd00-\ud83c\uddff]/u;
export const japanesePattern = /^[\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Han}\p{sc=Latin}\p{Nd}\s]+$/u;

export const initialValues = {
  name: "",
  age: "",
  bool: "",
  date: "",
  date2: "",
};

export const normalizeValues = (values) => ({
  name: values.name.trim(),
  age: values.age.trim(),
  bool: values.bool,
  date: values.date,
  date2: values.date2,
});

export const getValidation = (
  values,
  {
    allowEmpty = false,
    showErrors = true,
    showUntouchedRequired = true,
    touchedFields = {},
  } = {},
) => {
  const normalized = normalizeValues(values);
  const errors = {};
  let valid = true;

  const shouldValidateRequired = (field) => showUntouchedRequired || touchedFields[field];

  if (!normalized.name) {
    if (!allowEmpty && shouldValidateRequired("name")) {
      if (showErrors) {
        errors.name = "名前を入力してください。";
      }
      valid = false;
    }
  } else if (forbiddenPattern.test(normalized.name)) {
    if (showErrors) {
      errors.name = "禁止文字が含まれています。";
    }
    valid = false;
  } else if (environmentDependentPattern.test(normalized.name)) {
    if (showErrors) {
      errors.name = "環境依存文字は使用できません。";
    }
    valid = false;
  } else if (!japanesePattern.test(normalized.name)) {
    if (showErrors) {
      errors.name = "日本語の文字と数字のみ入力してください。";
    }
    valid = false;
  }

  if (!normalized.age) {
    if (!allowEmpty && shouldValidateRequired("age")) {
      if (showErrors) {
        errors.age = "年齢を入力してください。";
      }
      valid = false;
    }
  } else if (!/^\d+$/.test(normalized.age)) {
    if (showErrors) {
      errors.age = "数字のみ入力してください。";
    }
    valid = false;
  } else {
    const ageNumber = Number(normalized.age);
    if (ageNumber < 1 || ageNumber > 10000) {
      if (showErrors) {
        errors.age = "1〜10000の範囲で入力してください。";
      }
      valid = false;
    }
  }

  if (!normalized.bool) {
    if (!allowEmpty && shouldValidateRequired("bool")) {
      if (showErrors) {
        errors.bool = "true か false を選択してください。";
      }
      valid = false;
    }
  }

  const validateDate = (field, value) => {
    if (!value) {
      if (!allowEmpty && shouldValidateRequired(field)) {
        if (showErrors) {
          errors[field] = "日付を入力してください。";
        }
        valid = false;
      }
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      if (showErrors) {
        errors[field] = "YYYY-MM-DD形式で入力してください。";
      }
      valid = false;
    }
  };

  validateDate("date", normalized.date);
  validateDate("date2", normalized.date2);

  if (normalized.date && normalized.date2 && normalized.date2 < normalized.date) {
    if (showErrors) {
      errors.date2 = "日付1と同じ日付、または日付1より後の日付を入力してください。";
    }
    valid = false;
  }

  return { valid, errors, normalized };
};
