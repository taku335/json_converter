export const forbiddenPattern = /[<>"'&]/;
export const environmentDependentPattern = /[\u2460-\u24ff\u2150-\u218f\u3200-\u32ff\u3300-\u33ff\ud83c\udd00-\ud83c\uddff]/u;
export const japanesePattern = /^[\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Han}\p{sc=Latin}\p{Nd}\sー・]+$/u;

export const initialValues = {
  name: "",
  winners: "0",
  fromDate: "",
  toDate: "",
  poolSize: "10000",
  open: "",
};

export const normalizeValues = (values) => ({
  name: values.name.trim(),
  winners: values.winners.trim(),
  fromDate: values.fromDate,
  toDate: values.toDate,
  poolSize: values.poolSize.trim(),
  open: values.open,
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

  const validateRangeNumber = (field, value, { min, max, requiredMessage, rangeMessage }) => {
    if (!value) {
      if (!allowEmpty && shouldValidateRequired(field)) {
        if (showErrors) {
          errors[field] = requiredMessage;
        }
        valid = false;
      }
      return;
    }

    if (!/^\d+$/.test(value)) {
      if (showErrors) {
        errors[field] = "数字のみ入力してください。";
      }
      valid = false;
      return;
    }

    const numberValue = Number(value);
    if (numberValue < min || numberValue > max) {
      if (showErrors) {
        errors[field] = rangeMessage;
      }
      valid = false;
    }
  };

  validateRangeNumber("winners", normalized.winners, {
    min: 0,
    max: 10000,
    requiredMessage: "プレゼント数を入力してください。",
    rangeMessage: "0〜10000の範囲で入力してください。",
  });

  validateRangeNumber("poolSize", normalized.poolSize, {
    min: 1,
    max: 10000,
    requiredMessage: "人数枠を入力してください。",
    rangeMessage: "1〜10000の範囲で入力してください。",
  });

  if (!normalized.open) {
    if (!allowEmpty && shouldValidateRequired("open")) {
      if (showErrors) {
        errors.open = "true か false を選択してください。";
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

  validateDate("fromDate", normalized.fromDate);
  validateDate("toDate", normalized.toDate);

  if (normalized.fromDate && normalized.toDate && normalized.toDate < normalized.fromDate) {
    if (showErrors) {
      errors.toDate = "終了日は開始日と同じ日付、または後の日付を入力してください。";
    }
    valid = false;
  }

  return { valid, errors, normalized };
};
