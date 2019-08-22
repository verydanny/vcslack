export type DataT = {
  token: string
  channels: string
  content: string
  filename: string
  filetype: string
  title: string
}

export type Channel = {
  id: string
  name: string
}

export type Member = {
  id: string
  name: string
  profile: {
    real_name: string
  }
}

export type Group = {
  id: string
  name: string
  topic: {
    value: string
  }
}

export interface ChannelList {
  id?: string
  label?: string
  description?: string
}

export interface Team {
  token: string
  name: string
  channelList: ChannelList[]
}

export interface FileType {
  slackCompatible: string
  actual?: string
}

export type SlackFileTypes = {
  plaintext: FileType
  scss: FileType
  javascriptreact: FileType
  typescriptreact: FileType
  auto: FileType
  text: FileType
  ai: FileType
  apk: FileType
  applescript: FileType
  binary: FileType
  bmp: FileType
  boxnote: FileType
  c: FileType
  csharp: FileType
  cpp: FileType
  css: FileType
  csv: FileType
  clojure: FileType
  coffeescript: FileType
  cfm: FileType
  d: FileType
  dart: FileType
  diff: FileType
  doc: FileType
  docx: FileType
  dockerfile: FileType
  dotx: FileType
  email: FileType
  eps: FileType
  epub: FileType
  erlang: FileType
  fla: FileType
  flv: FileType
  fsharp: FileType
  fortran: FileType
  gdoc: FileType
  gdraw: FileType
  gif: FileType
  go: FileType
  gpres: FileType
  groovy: FileType
  gsheet: FileType
  gzip: FileType
  html: FileType
  handlebars: FileType
  haskell: FileType
  haxe: FileType
  indd: FileType
  java: FileType
  javascript: FileType
  jpg: FileType
  keynote: FileType
  kotlin: FileType
  latex: FileType
  lisp: FileType
  lua: FileType
  m4a: FileType
  markdown: FileType
  matlab: FileType
  mhtml: FileType
  mkv: FileType
  mov: FileType
  mp3: FileType
  mp4: FileType
  mpg: FileType
  mumps: FileType
  numbers: FileType
  nzb: FileType
  objc: FileType
  ocaml: FileType
  odg: FileType
  odi: FileType
  odp: FileType
  ods: FileType
  odt: FileType
  ogg: FileType
  ogv: FileType
  pages: FileType
  pascal: FileType
  pdf: FileType
  perl: FileType
  php: FileType
  pig: FileType
  png: FileType
  post: FileType
  powershell: FileType
  ppt: FileType
  pptx: FileType
  psd: FileType
  puppet: FileType
  python: FileType
  qtz: FileType
  r: FileType
  rtf: FileType
  ruby: FileType
  rust: FileType
  sql: FileType
  sass: FileType
  scala: FileType
  scheme: FileType
  sketch: FileType
  shell: FileType
  smalltalk: FileType
  svg: FileType
  swf: FileType
  swift: FileType
  tar: FileType
  tiff: FileType
  tsv: FileType
  vb: FileType
  vbscript: FileType
  vcard: FileType
  velocity: FileType
  verilog: FileType
  wav: FileType
  webm: FileType
  wmv: FileType
  xls: FileType
  xlsx: FileType
  xlsb: FileType
  xlsm: FileType
  xltx: FileType
  xml: FileType
  yaml: FileType
  zip: FileType
}
