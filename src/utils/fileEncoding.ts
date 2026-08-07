export interface EncodedFile {
  b64: string;
  name: string;
  mime: string | null;
}

export async function fileToBase64(file: File): Promise<EncodedFile> {
  const b64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('File could not be read.'));
        return;
      }
      const separatorIndex = result.indexOf(',');
      resolve(separatorIndex >= 0 ? result.slice(separatorIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  return { b64, name: file.name, mime: file.type || null };
}
