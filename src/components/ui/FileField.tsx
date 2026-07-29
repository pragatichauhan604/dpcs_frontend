import { ChangeEvent } from "react";

type FileFieldProps = {
  label: string;
  accept?: string;
  error?: string;
  preview?: string;
  onChange: (file?: File) => void;
};

export function FileField({ label, accept, error, preview, onChange }: FileFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0]);
  };

  return (
    <label className="field file-field">
      <span>{label}</span>
      <div className={error ? "file-control input-error" : "file-control"}>
        <input type="file" accept={accept} onChange={handleChange} />
        {preview && <img className="image-preview" src={preview} alt="Selected profile preview" />}
      </div>
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
