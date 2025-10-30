declare module 'html-to-docx' {
  interface Options {
    table?: {
      row?: {
        cantSplit?: boolean
      }
    }
    footer?: boolean
    pageNumber?: boolean
  }

  function HTMLtoDOCX(html: string, styles?: any, options?: Options): Promise<Buffer>

  export = HTMLtoDOCX
}


