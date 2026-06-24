type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  error?: string;
};

export function Field({ label, value, onChange, onBlur, type = "text", error }: FieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className={error ? "input-error" : ""} type={type} value={value} onBlur={onBlur} onChange={(event) => onChange(event.target.value)} />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
