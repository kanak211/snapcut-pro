/** Tiny in-memory handoff so the landing dropzone can pass files to the tool page. */
let staged: File[] = [];

export function stageFiles(files: File[]) {
  staged = files;
}

export function takeStagedFiles(): File[] {
  const files = staged;
  staged = [];
  return files;
}
