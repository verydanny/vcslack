import { SlackFileTypes } from './types/vcslack'

export const defaultTokens = ['your slack token 1', 'your slack token 2']

export const checkTokenPleaseError = `
  VCSlack Error: Could not fetch Slack teams. Please check your token
`

export const legacyTokenError = `
  VCSlack Error: Please add a Slack legacy token before proceeding,
  README: https://github.com/verydanny/vcslack/blob/master/README.md
`

export const legacyTokenHelpfulError = `
  VCSlack Error: You should probably add some Slack tokens!
    1. Go to settings
    2. Search for "vcslack"
    3. Click edit in settings.json
    4. Add VCSlack setting in following format:
      "vcslack.selfToken": [
        "xoxp-358484..."
      ]
  `

export const noOpenDocumentError = `
  VCSlack Error: Can't send snippet with no open code document!
`

export const noSelectionOrDocument = `
  VCSlack Error: Your selection/document appears to be empty
`

export const noChannelId = `
  VCSlack Error: The channel/user you selected seems to be invalid
`

export const filetypeMap: SlackFileTypes = {
  plaintext: {
    slackCompatible: 'text'
  },
  scss: {
    slackCompatible: 'sass'
  },
  javascriptreact: {
    slackCompatible: 'jsx'
  },
  typescriptreact: {
    slackCompatible: 'jsx', // @TODO: Slack has horrible support for TSX, JSX works for now though
    actual: 'tsx'
  },
  auto: {
    slackCompatible: 'auto'
  },
  text: {
    slackCompatible: 'text'
  },
  ai: {
    slackCompatible: 'ai'
  },
  apk: {
    slackCompatible: 'apk'
  },
  applescript: {
    slackCompatible: 'applescript'
  },
  binary: {
    slackCompatible: 'binary'
  },
  bmp: {
    slackCompatible: 'bmp'
  },
  boxnote: {
    slackCompatible: 'boxnote'
  },
  c: {
    slackCompatible: 'c'
  },
  csharp: {
    slackCompatible: 'csharp'
  },
  cpp: {
    slackCompatible: 'cpp'
  },
  css: {
    slackCompatible: 'css'
  },
  csv: {
    slackCompatible: 'csv'
  },
  clojure: {
    slackCompatible: 'clojure'
  },
  coffeescript: {
    slackCompatible: 'coffeescript'
  },
  cfm: {
    slackCompatible: 'cfm'
  },
  d: {
    slackCompatible: 'd'
  },
  dart: {
    slackCompatible: 'dart'
  },
  diff: {
    slackCompatible: 'diff'
  },
  doc: {
    slackCompatible: 'doc'
  },
  docx: {
    slackCompatible: 'docx'
  },
  dockerfile: {
    slackCompatible: 'dockerfile'
  },
  dotx: {
    slackCompatible: 'dotx'
  },
  email: {
    slackCompatible: 'email'
  },
  eps: {
    slackCompatible: 'eps'
  },
  epub: {
    slackCompatible: 'epub'
  },
  erlang: {
    slackCompatible: 'erlang'
  },
  fla: {
    slackCompatible: 'fla'
  },
  flv: {
    slackCompatible: 'flv'
  },
  fsharp: {
    slackCompatible: 'fsharp'
  },
  fortran: {
    slackCompatible: 'fortran'
  },
  gdoc: {
    slackCompatible: 'gdoc'
  },
  gdraw: {
    slackCompatible: 'gdraw'
  },
  gif: {
    slackCompatible: 'gif'
  },
  go: {
    slackCompatible: 'go'
  },
  gpres: {
    slackCompatible: 'gpres'
  },
  groovy: {
    slackCompatible: 'groovy'
  },
  gsheet: {
    slackCompatible: 'gsheet'
  },
  gzip: {
    slackCompatible: 'gzip'
  },
  html: {
    slackCompatible: 'html'
  },
  handlebars: {
    slackCompatible: 'handlebars'
  },
  haskell: {
    slackCompatible: 'haskell'
  },
  haxe: {
    slackCompatible: 'haxe'
  },
  indd: {
    slackCompatible: 'indd'
  },
  java: {
    slackCompatible: 'java'
  },
  javascript: {
    slackCompatible: 'javascript'
  },
  jpg: {
    slackCompatible: 'jpg'
  },
  keynote: {
    slackCompatible: 'keynote'
  },
  kotlin: {
    slackCompatible: 'kotlin'
  },
  latex: {
    slackCompatible: 'latex'
  },
  lisp: {
    slackCompatible: 'lisp'
  },
  lua: {
    slackCompatible: 'lua'
  },
  m4a: {
    slackCompatible: 'm4a'
  },
  markdown: {
    slackCompatible: 'markdown'
  },
  matlab: {
    slackCompatible: 'matlab'
  },
  mhtml: {
    slackCompatible: 'mhtml'
  },
  mkv: {
    slackCompatible: 'mkv'
  },
  mov: {
    slackCompatible: 'mov'
  },
  mp3: {
    slackCompatible: 'mp3'
  },
  mp4: {
    slackCompatible: 'mp4'
  },
  mpg: {
    slackCompatible: 'mpg'
  },
  mumps: {
    slackCompatible: 'mumps'
  },
  numbers: {
    slackCompatible: 'numbers'
  },
  nzb: {
    slackCompatible: 'nzb'
  },
  objc: {
    slackCompatible: 'objc'
  },
  ocaml: {
    slackCompatible: 'ocaml'
  },
  odg: {
    slackCompatible: 'odg'
  },
  odi: {
    slackCompatible: 'odi'
  },
  odp: {
    slackCompatible: 'odp'
  },
  ods: {
    slackCompatible: 'ods'
  },
  odt: {
    slackCompatible: 'odt'
  },
  ogg: {
    slackCompatible: 'ogg'
  },
  ogv: {
    slackCompatible: 'ogv'
  },
  pages: {
    slackCompatible: 'pages'
  },
  pascal: {
    slackCompatible: 'pascal'
  },
  pdf: {
    slackCompatible: 'pdf'
  },
  perl: {
    slackCompatible: 'perl'
  },
  php: {
    slackCompatible: 'php'
  },
  pig: {
    slackCompatible: 'pig'
  },
  png: {
    slackCompatible: 'png'
  },
  post: {
    slackCompatible: 'post'
  },
  powershell: {
    slackCompatible: 'powershell'
  },
  ppt: {
    slackCompatible: 'ppt'
  },
  pptx: {
    slackCompatible: 'pptx'
  },
  psd: {
    slackCompatible: 'psd'
  },
  puppet: {
    slackCompatible: 'puppet'
  },
  python: {
    slackCompatible: 'python'
  },
  qtz: {
    slackCompatible: 'qtz'
  },
  r: {
    slackCompatible: 'r'
  },
  rtf: {
    slackCompatible: 'rtf'
  },
  ruby: {
    slackCompatible: 'ruby'
  },
  rust: {
    slackCompatible: 'rust'
  },
  sql: {
    slackCompatible: 'sql'
  },
  sass: {
    slackCompatible: 'sass'
  },
  scala: {
    slackCompatible: 'scala'
  },
  scheme: {
    slackCompatible: 'scheme'
  },
  sketch: {
    slackCompatible: 'sketch'
  },
  shell: {
    slackCompatible: 'shell'
  },
  smalltalk: {
    slackCompatible: 'smalltalk'
  },
  svg: {
    slackCompatible: 'svg'
  },
  swf: {
    slackCompatible: 'swf'
  },
  swift: {
    slackCompatible: 'swift'
  },
  tar: {
    slackCompatible: 'tar'
  },
  tiff: {
    slackCompatible: 'tiff'
  },
  tsv: {
    slackCompatible: 'tsv'
  },
  vb: {
    slackCompatible: 'vb'
  },
  vbscript: {
    slackCompatible: 'vbscript'
  },
  vcard: {
    slackCompatible: 'vcard'
  },
  velocity: {
    slackCompatible: 'velocity'
  },
  verilog: {
    slackCompatible: 'verilog'
  },
  wav: {
    slackCompatible: 'wav'
  },
  webm: {
    slackCompatible: 'webm'
  },
  wmv: {
    slackCompatible: 'wmv'
  },
  xls: {
    slackCompatible: 'xls'
  },
  xlsx: {
    slackCompatible: 'xlsx'
  },
  xlsb: {
    slackCompatible: 'xlsb'
  },
  xlsm: {
    slackCompatible: 'xlsm'
  },
  xltx: {
    slackCompatible: 'xltx'
  },
  xml: {
    slackCompatible: 'xml'
  },
  yaml: {
    slackCompatible: 'yaml'
  },
  zip: {
    slackCompatible: 'zip'
  }
}
