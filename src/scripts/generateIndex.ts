import fs from 'node:fs'

const FOLDER_PATH = './src'
const FOLDER_BLACKLIST = ['@types', 'scripts']

function generateIndexContent() {
  const fileNames = fs
    .readdirSync(FOLDER_PATH, {withFileTypes: true})
    .filter(
      item =>
        (item.isDirectory() && !FOLDER_BLACKLIST.includes(item.name)) ||
        (item.isFile() &&
          item.name !== 'index.ts' &&
          item.name.endsWith('.ts') &&
          !item.name.endsWith('.test.ts')),
    )
    .map(file => file.name.replace('.ts', ''))

  return [
    '/* eslint-disable no-barrel-files/no-barrel-files -- must be a barrel file */',
    ...fileNames.map(fileName => {
      return `export * from './${fileName}'`
    }),
    '/* eslint-enable no-barrel-files/no-barrel-files -- must be a barrel file */',
  ].join('\n')
}

function writeIndexFile() {
  const abisIndexContent = generateIndexContent()

  fs.writeFileSync(`${FOLDER_PATH}/index.ts`, abisIndexContent, {
    flag: 'w',
  })
}

writeIndexFile()
