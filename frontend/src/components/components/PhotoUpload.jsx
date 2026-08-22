import { useRef, useState } from "react";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import { validatePhotoFile } from "../utils/validation";

// Profile photo picker used by the auth screens. The chosen file is read into a
// data URL so it can be previewed and stored on the user record straight away.
export default function PhotoUpload({
  id = "photo-upload",
  label = "Profile photo",
  name = "",
  value = "",
  onChange,
  hint = "PNG or JPG, up to 2 MB.",
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  function handleFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const fileError = validatePhotoFile(file);
    if (fileError) {
      setError(fileError);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <p className="mb-1.5 block text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-4 rounded-lg border border-border bg-surface-muted p-3">
        <Avatar name={name || "Traveller"} photo={value} size="lg" />
        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={handleFile}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              {value ? "Change photo" : "Upload photo"}
            </Button>
            {value ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange("");
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                Remove
              </Button>
            ) : null}
          </div>
          {error ? (
            <p className="mt-1.5 text-xs text-danger">{error}</p>
          ) : (
            <p className="mt-1.5 text-xs text-subtle-foreground">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
