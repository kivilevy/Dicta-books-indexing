import { getPageFile, getPageList } from './fetchData.js';
import { BOOKS_ORDER } from './hebrewBooksOrder.js';

export const indexCitations = async (bookId) => {
    let citationArray = [];  
    const pages = await getPageList(bookId);
    for (const pageId of pages) {
        const page = await getPageFile(bookId, pageId); 
        const pageArray = await setRelevantData(page.data, pageId);
        citationArray = citationArray.concat(pageArray);  
    }
   const sortedCitations = sortCitations(citationArray);  

   return categorizeCitations(sortedCitations);
}

const setRelevantData = async (pageData, pageId) => {
    const matchedId = pageId.match(/(\d+)\.zip/);          
    const pageNumber = matchedId ? matchedId[1] : null;
    const citations = pageData.postProcessedSources.filter(item => item.tool === 'citations');
   
    return citations.map(({ baseStartChar, baseTextLength, sources }) => {
        return sources.map(({ score, verseDispHeb, compBookXmlId, compDisplayText }) => {
            if (compBookXmlId.startsWith('Talmud.Bavli')) 
                compBookXmlId = compBookXmlId.replace('Talmud.Bavli', 'TalmudBavli');
                const matches = compDisplayText.match(/<b>(.*?)<\/b>/g);
                const boldedWords = matches ? matches.map(m => m.replace(/<\/?b>/g, '')).join(' ') : '';            
            return { score, verseDispHeb, compBookXmlId, keyWords: boldedWords, citationInfo: { pageNumber, baseStartChar, baseTextLength }};
        });
    }).flat();
}

const sortCitations = (CitationArray) => {  
    return CitationArray.sort((a, b) => {
        const [ , , bookNameA, chapterA, verseA] = a.compBookXmlId.split('.');
        const [ , , bookNameB, chapterB, verseB] = b.compBookXmlId.split('.');
        const bookIndexA =  BOOKS_ORDER.indexOf(bookNameA);
        const bookIndexB = BOOKS_ORDER.indexOf(bookNameB);
        if (bookIndexA !== bookIndexB) 
            return bookIndexA - bookIndexB;
        if (Number(chapterA) !== Number(chapterB)) 
            return Number(chapterA) - Number(chapterB);
        if (verseA === 'a' || verseA === 'b') 
            return verseA.localeCompare(verseB);
        return Number(verseA) - Number(verseB);
    });
}

const categorizeCitations = (sortedCitations) => { 
    const categorizedCitations = {};
    for (const citation of sortedCitations) {
        const { compBookXmlId } = citation;
        const [mainCategory, subCategory, bookName ] = compBookXmlId.split('.');
        if (!categorizedCitations[mainCategory]) 
            categorizedCitations[mainCategory] = {};
        if (!categorizedCitations[mainCategory][subCategory]) 
            categorizedCitations[mainCategory][subCategory] = {};
        if (!categorizedCitations[mainCategory][subCategory][bookName])
            categorizedCitations[mainCategory][subCategory][bookName] = [];
        categorizedCitations[mainCategory][subCategory][bookName].push(citation);
   }

   return categorizedCitations;
}