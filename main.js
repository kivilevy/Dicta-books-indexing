import fs from 'fs';
import path from 'path';
import { getBookList } from './fetchData.js';
import { indexCitations } from './indexCitations.js';

const BOOKS_DIRECTORY = './books_index';
if (!fs.existsSync(BOOKS_DIRECTORY)) fs.mkdirSync(BOOKS_DIRECTORY);

const generateIndexes = async () => {
    try {
        const allBooks = (await getBookList());
        const newBooks = allBooks.filter(book =>
             !fs.existsSync(path.join(BOOKS_DIRECTORY, `${book.fileName}.json`)));
        for (const book of newBooks){
            book.index = await indexCitations(book.fileName);
            const bookFilePath = path.join(BOOKS_DIRECTORY, `${book.fileName}.json`);
            fs.writeFileSync(bookFilePath, JSON.stringify(book, null, 2), 'utf8');
        }
    }
    catch(err) {console.error(err)}
}

generateIndexes();