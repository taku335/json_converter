import React, { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18";
import htm from "https://esm.sh/htm@3";
import { copyText } from "./clipboard.js";
import { getValidation, initialValues } from "./validation.js";

const html = htm.bind(React.createElement);

const App = () => {
  const [values, setValues] = useState(initialValues);
  const [touchedFields, setTouchedFields] = useState({});
  const [errors, setErrors] = useState({});
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [output, setOutput] = useState("ここに結果が表示されます。");
  const [isJsonOutput, setIsJsonOutput] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const copyTimeoutRef = useRef(null);

  const formValid = useMemo(
    () => getValidation(values, { showErrors: false }).valid,
    [values],
  );

  const resetOutputState = (valid, nextTouchedCount) => {
    if (!valid && nextTouchedCount > 0) {
      setOutput("入力内容を確認してください。");
    } else if (valid) {
      setOutput("ここに結果が表示されます。");
    }
    setIsJsonOutput(false);
    setCopyStatus("");
  };

  const applyValidation = (nextValues, nextTouched) => {
    const validation = getValidation(nextValues, {
      allowEmpty: false,
      showErrors: true,
      showUntouchedRequired: showAllErrors,
      touchedFields: nextTouched,
    });
    setErrors(validation.errors);

    const submitValidation = getValidation(nextValues, { showErrors: false });
    resetOutputState(submitValidation.valid, Object.keys(nextTouched).length);
    if (submitValidation.valid && showAllErrors) {
      setShowAllErrors(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    const nextTouched = { ...touchedFields, [name]: true };
    setValues(nextValues);
    setTouchedFields(nextTouched);
    applyValidation(nextValues, nextTouched);
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    const nextTouched = touchedFields[name]
      ? touchedFields
      : { ...touchedFields, [name]: true };
    if (nextTouched !== touchedFields) {
      setTouchedFields(nextTouched);
    }
    applyValidation(values, nextTouched);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowAllErrors(true);
    const validation = getValidation(values, {
      showErrors: true,
      showUntouchedRequired: true,
    });
    setErrors(validation.errors);

    if (!validation.valid) {
      setOutput("入力内容を確認してください。");
      setIsJsonOutput(false);
      setCopyStatus("");
      return;
    }

    setShowAllErrors(false);
    const payload = {
      customer_name: validation.normalized.name,
      winners: Number(validation.normalized.winners),
      from_date: validation.normalized.fromDate,
      to_date: validation.normalized.toDate,
      pool_size: Number(validation.normalized.poolSize),
      open: validation.normalized.open === "true",
    };

    setOutput(JSON.stringify(payload, null, 2));
    setIsJsonOutput(true);
    setCopyStatus("");
  };

  const handleCopy = async () => {
    if (!isJsonOutput) {
      return;
    }

    try {
      await copyText(output);
      setCopyStatus("コピーしました。");
    } catch (error) {
      setCopyStatus("コピーに失敗しました。");
    }

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => {
      setCopyStatus("");
      copyTimeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => () => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
  }, []);

  return html`
    <${React.Fragment}>
      <section className="tile tile-header">
        <h1>JSON Converter</h1>
        <p>各カラムに値を入力して、JSON形式を生成します。</p>
      </section>

      <div className="tile-grid">
        <form
          id="converter-form"
          className="tile tile-form"
          noValidate=${true}
          onSubmit=${handleSubmit}
        >
          <div className="field">
            <div className="field-header">
              <label htmlFor="name">name（日本語文字列・数字可）</label>
            </div>
            <div className="input-shell" data-error=${!!errors.name}>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="例：山田 太郎"
                value=${values.name}
                onChange=${handleChange}
                onBlur=${handleBlur}
              />
              <span className="input-error" aria-live="polite">
                ${errors.name || ""}
              </span>
            </div>
          </div>

          <div className="field">
            <div className="field-header">
              <label htmlFor="winners">プレゼント数（0〜10000の整数）</label>
            </div>
            <div className="input-shell" data-error=${!!errors.winners}>
              <input
                id="winners"
                name="winners"
                type="text"
                inputMode="numeric"
                placeholder="例：0"
                value=${values.winners}
                onChange=${handleChange}
                onBlur=${handleBlur}
              />
              <span className="input-error" aria-live="polite">
                ${errors.winners || ""}
              </span>
            </div>
          </div>

          <div className="field">
            <div className="field-header">
              <label htmlFor="fromDate">開始日（YYYY-MM-DD）</label>
            </div>
            <div className="input-shell" data-error=${!!errors.fromDate}>
              <input
                id="fromDate"
                name="fromDate"
                type="date"
                value=${values.fromDate}
                onChange=${handleChange}
                onBlur=${handleBlur}
              />
              <span className="input-error" aria-live="polite">
                ${errors.fromDate || ""}
              </span>
            </div>
          </div>

          <div className="field">
            <div className="field-header">
              <label htmlFor="toDate">終了日（YYYY-MM-DD）</label>
            </div>
            <div className="input-shell" data-error=${!!errors.toDate}>
              <input
                id="toDate"
                name="toDate"
                type="date"
                value=${values.toDate}
                onChange=${handleChange}
                onBlur=${handleBlur}
              />
              <span className="input-error" aria-live="polite">
                ${errors.toDate || ""}
              </span>
            </div>
          </div>

          <div className="field">
            <div className="field-header">
              <label htmlFor="poolSize">人数枠（1〜10000の整数）</label>
            </div>
            <div className="input-shell" data-error=${!!errors.poolSize}>
              <input
                id="poolSize"
                name="poolSize"
                type="text"
                inputMode="numeric"
                placeholder="例：10000"
                value=${values.poolSize}
                onChange=${handleChange}
                onBlur=${handleBlur}
              />
              <span className="input-error" aria-live="polite">
                ${errors.poolSize || ""}
              </span>
            </div>
          </div>

          <div className="field">
            <div className="field-header">
              <label htmlFor="open">open（オープン: true / クローズ: false）</label>
            </div>
            <div className="input-shell" data-error=${!!errors.open}>
              <select
                id="open"
                name="open"
                value=${values.open}
                onChange=${handleChange}
                onBlur=${handleBlur}
              >
                <option value="">選択してください</option>
                <option value="true">true（オープン）</option>
                <option value="false">false（クローズ）</option>
              </select>
              <span className="input-error" aria-live="polite">
                ${errors.open || ""}
              </span>
            </div>
          </div>

        </form>

        <section className="tile tile-output output">
          <h2>JSON 出力</h2>
          <pre id="json-output">${output}</pre>
          <div className="output-actions">
            <div className="button-row">
              <button
                type="submit"
                form="converter-form"
                disabled=${!formValid}
              >
                生成
              </button>
              <button
                type="button"
                className="copy-button"
                onClick=${handleCopy}
                disabled=${!isJsonOutput}
              >
                コピー
              </button>
            </div>
            <p className="copy-status" id="copy-status" aria-live="polite">
              ${copyStatus}
            </p>
          </div>
        </section>
      </div>
    </${React.Fragment}>
  `;
};

export default App;
