import fs from 'fs';
import path from 'path';

const BOOKS_DIRECTORY = './books_index'; 
const BASE_URL = 'https://library.dicta.org.il/book/';

const findCitation = (bookName, sourceReference, textSnippet) => {
    try {
        const allCitations = loadBookCitations(bookName)
        const matchedCitations = [];
        if (sourceReference) {
            const filteredBySource = allCitations.filter(({ verseDispHeb }) => verseDispHeb.includes(sourceReference));
            matchedCitations.push(...filteredBySource.map(entry => entry.citationInfo));
        }
        if (textSnippet) {
            const filteredByText = allCitations.filter(({ keyWords }) => keyWords.includes(textSnippet));
            matchedCitations.push(...filteredByText.map(entry => entry.citationInfo));
        }
        
       return generateResultsLinks(bookName, matchedCitations);
    }
    catch (err) {return console.error(err)}
}

const loadBookCitations = (bookName) => {
    const allEntries = [];
    const bookFilePath = path.join(BOOKS_DIRECTORY, `${bookName}.json`);
    const bookData = fs.readFileSync(bookFilePath, 'utf8');
    const book = JSON.parse(bookData);
    for (const mainCategory in book.index) {
        for (const subCategory in book.index[mainCategory]) {
            for (const bookTitle in book.index[mainCategory][subCategory]) {
                const entries = book.index[mainCategory][subCategory][bookTitle];
                allEntries.push(...entries);
            }
        }
    }
   
    return allEntries;
}

const generateResultsLinks = (bookName, matchedCitations) => {
    matchedCitations.forEach(citation => {
        const pageLink = `${BASE_URL}${bookName}/${bookName}-${citation.pageNumber}`;
        console.log(`Link to page ${citation.pageNumber}: ${pageLink}`);
    });
}

findCitation('afikeiyam1', 'שמות טז, טז', null);
//findCitation('afikeiyam1', null, 'אִישׁ לְפִי אׇכְלוֹ');