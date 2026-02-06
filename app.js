import React, { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18";
import htm from "https://esm.sh/htm@3";
import { copyText } from "./clipboard.js";
import { getValidation, initialValues } from "./validation.js";

const html = htm.bind(React.createElement);

const App = () => {
  const [values, setValues] = useState(initialValues);
  const [touchedFields, setTouchedFields] = useState({});
  const [errors, setErrors] = useState({});
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
      showUntouchedRequired: false,
      touchedFields: nextTouched,
    });
    setErrors(validation.errors);

    const submitValidation = getValidation(nextValues, { showErrors: false });
    resetOutputState(submitValidation.valid, Object.keys(nextTouched).length);
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
    const validation = getValidation(values, { showErrors: true });
    setErrors(validation.errors);

    if (!validation.valid) {
      setOutput("入力内容を確認してください。");
      setIsJsonOutput(false);
      setCopyStatus("");
      return;
    }

    const payload = {
      name: validation.normalized.name,
      age: Number(validation.normalized.age),
      bool: validation.normalized.bool === "true",
      date: validation.normalized.date,
      date2: validation.normalized.date2,
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
              <div className="field-meta">
                <small className="hint">
                  禁止文字: &lt; &gt; " ' &amp; / 環境依存文字（① ㈱ ㍉ Ⅰ など）
                </small>
                <span className="error" data-error-for="name" aria-live="polite">
                  ${errors.name || ""}
                </span>
              </div>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="例：山田 太郎"
              value=${values.name}
              onChange=${handleChange}
              onBlur=${handleBlur}
            />
          </div>

          <div className="field">
            <div className="field-header">
              <label htmlFor="age">age（1〜10000の数字）</label>
              <div className="field-meta">
                <span className="error" data-error-for="age" aria-live="polite">
                  ${errors.age || ""}
                </span>
              </div>
            </div>
            <input
              id="age"
              name="age"
              type="text"
              inputMode="numeric"
              placeholder="例：30"
              value=${values.age}
              onChange=${handleChange}
              onBlur=${handleBlur}
            />
          </div>

          <div className="field">
            <div className="field-header">
              <label htmlFor="bool">bool（true / false）</label>
              <div className="field-meta">
                <span className="error" data-error-for="bool" aria-live="polite">
                  ${errors.bool || ""}
                </span>
              </div>
            </div>
            <select
              id="bool"
              name="bool"
              value=${values.bool}
              onChange=${handleChange}
              onBlur=${handleBlur}
            >
              <option value="">選択してください</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>

          <div className="field">
            <div className="field-header">
              <label htmlFor="date">日付1（YYYY-MM-DD）</label>
              <div className="field-meta">
                <span className="error" data-error-for="date" aria-live="polite">
                  ${errors.date || ""}
                </span>
              </div>
            </div>
            <input
              id="date"
              name="date"
              type="date"
              value=${values.date}
              onChange=${handleChange}
              onBlur=${handleBlur}
            />
          </div>

          <div className="field">
            <div className="field-header">
              <label htmlFor="date2">日付2（YYYY-MM-DD）</label>
              <div className="field-meta">
                <span className="error" data-error-for="date2" aria-live="polite">
                  ${errors.date2 || ""}
                </span>
              </div>
            </div>
            <input
              id="date2"
              name="date2"
              type="date"
              value=${values.date2}
              onChange=${handleChange}
              onBlur=${handleBlur}
            />
          </div>

        </form>

        <section className="tile tile-output output">
          <h2>JSON 出力</h2>
          <pre id="json-output">${output}</pre>
          <div className="output-actions">
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
