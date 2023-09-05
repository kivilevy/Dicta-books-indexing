import decompress from 'decompress';

const BASE_URL = 'https://files.dicta.org.il';

export const getBookList = async () => {
    const response = await fetch(`${BASE_URL}/books.json`);
    if (!response.ok) throw new Error(`bookList fetch err: ${response.statusText}`);
    const booksData = await response.json();
   
    return booksData.map(book => ({ fileName: book.fileName, textFileURL: book.textFileURL }));
}

export const getPageList = async (bookId) => {
    const response = await fetch(`${BASE_URL}/${bookId}/pages.json`);
    if (!response.ok) throw new Error(`${bookId} pages fetch err: ${response.statusText}`);
    const pages = await response.json();
    
    return pages.map(page => page.fileName);
}

export const getPageFile = async (bookId, pageId) => {
    const response = await fetch(`${BASE_URL}/${bookId}/${pageId}`);
    if (!response.ok) throw new Error(`${bookId} ${pageId} fetch err: ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer())
    const decompressedFiles = await decompress(buffer);
   
    return JSON.parse(decompressedFiles[0].data.toString());
}