import fs from 'fs';
import url from 'node:url'
import log from 'electron-log';
import pdf from 'pdf-parse'

async function getTextExtractor(){
  if(process.env.NODE_ENV === 'test'){
    return (await import('office-text-extractor')).getTextExtractor()
  }else{
    const officeAPI = Function('return import("office-text-extractor")')();
    return (await officeAPI).getTextExtractor();
  }
}
abstract class BaseLoader {

  protected abstract read(filePath: string): Promise<string>;

  private getFileUrl(filePath: string): fs.PathLike {
    const fileUrl = url.pathToFileURL(filePath)
    if(process.platform === 'win32'){
      fileUrl.pathname = `/${filePath}`;

    }
    log.debug(`Convert [${filePath}] into URL(${fileUrl.protocol}:${fileUrl.pathname})`)
    return fileUrl
  }

  async load(filePath: string): Promise<string> {
    return await this.read(filePath);
  }
}

class TextDocumentLoader extends BaseLoader {

  async read(filePath: fs.PathLike): Promise<string> {
    return await fs.promises.readFile(filePath, 'utf-8')
  }
}

class OfficeLoader extends BaseLoader {
  private extractor: any;

  constructor() {
    super();
  }

  async read(filePath: fs.PathLike): Promise<string> {
    if(!this.extractor){
      this.extractor = await getTextExtractor();
    }
    try {
      const data = await this.extractor.extractText({
        input: filePath,
        type: 'file',
      });
      return data;
    } catch (err) {
      console.log(err);
    }
    return '';
  }
}

class PdfLoader extends BaseLoader {
  async read(filePath: fs.PathLike): Promise<string> {
    console.log('pdf loader', filePath)
    // @ts-ignore
    const data = await pdf(filePath)
    return data.text;
  }
}



export async function loadDocument(filePath: string, fileType:string): Promise<string> {
  log.info(`load file from  ${filePath} on ${process.platform}`)
  let Loader: new () => BaseLoader;
  switch (fileType) {
    case 'txt':
      Loader = TextDocumentLoader;
      break;
    case 'md':
      Loader = TextDocumentLoader;
      break;
    case 'csv':
      Loader = TextDocumentLoader;
      break;
    case 'pdf':
      Loader = PdfLoader;
      break;
    case 'docx':
      Loader = OfficeLoader;
      break;
    case 'pptx':
      Loader = OfficeLoader;
      break;
    case 'xlsx':
      Loader = OfficeLoader;
      break;
    default:
      throw new Error(`Miss Loader for: ${fileType}`);
  }
  const loader = new Loader();
  let result = await loader.load(filePath);
  result = result.replace(/ +/g, ' ')
  const paragraphs = result.split(/\r?\n\r?\n/).map(i=>i.replace(/\s+/g, ' ')).filter(i=>i.trim()!=='')
  return paragraphs.join('\r\n\r\n')
}
