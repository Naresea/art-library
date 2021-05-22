package de.naresea.art_library_backend.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import de.naresea.art_library_backend.config.ArtLibraryConfig;
import de.naresea.art_library_backend.model.search.SearchDocument;
import de.naresea.art_library_backend.service.model.ElementPage;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.*;
import org.apache.lucene.index.*;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private static final int MAX_RESULTS = 5_000;

    private Analyzer analyzer;
    private IndexWriter writer;
    private DirectoryReader reader;

    public SearchService() {
        try {
            Directory directory = FSDirectory.open(Paths.get(ArtLibraryConfig.getSearchDirectory()));
            this.analyzer = new StandardAnalyzer();
            var indexWriterConfig = new IndexWriterConfig(this.analyzer);
            indexWriterConfig.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
            this.writer = new IndexWriter(directory, indexWriterConfig);
            this.reader = DirectoryReader.open(this.writer, false, false);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private DirectoryReader getReader() {
        try {
            var newReader = DirectoryReader.openIfChanged(this.reader);
            if (newReader != null && newReader != this.reader) {
                this.reader.close();
                this.reader = newReader;
            }
            return this.reader;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void updateIndex(List<SearchDocument> dataset) {
        try {
            this.writer.deleteAll();

            var luceneDocuments = dataset.stream()
                    .map(d -> this.mapSearchDocumentToDocument(d).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            this.writer.addDocuments(luceneDocuments);
            this.writer.commit();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void addDocument(SearchDocument doc) {
        try {
            var luceneDocument = this.mapSearchDocumentToDocument(doc)
                    .orElseThrow(RuntimeException::new);
            this.writer.addDocument(luceneDocument);
            this.writer.commit();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Optional<ElementPage<SearchDocument>> search(String queryString, int page, int size) {
        try {
            var query = new QueryParser("content", this.analyzer).parse(queryString);
            var reader = this.getReader();
            var searcher = new IndexSearcher(reader);
            var topDocs = searcher.search(query, MAX_RESULTS);
            var numHits = (int) topDocs.totalHits.value;
            var totalPages = (numHits / size) + 1;
            var numElements = topDocs.scoreDocs.length;
            var startIdx = Math.max(0, Math.min(numElements - 1, page * size));
            var endIdx =  Math.max(0, Math.min(numElements, startIdx + size));

            var result = Arrays.stream(topDocs.scoreDocs, startIdx, endIdx)
                    .map(scoreDoc -> this.getDocumentForScoreDoc(searcher, scoreDoc).orElse(null))
                    .filter(Objects::nonNull)
                    .map(this::mapDocumentToSearchDocument)
                    .collect(Collectors.toList());

            var resPage = new ElementPage<SearchDocument>();
            resPage.setContent(result);
            resPage.setEmpty(result.isEmpty());
            resPage.setNumber(page);
            resPage.setSize(size);
            resPage.setNumberOfElements(result.size());
            resPage.setTotalPages(totalPages);
            resPage.setFirst(page == 0);
            resPage.setLast(page == totalPages - 1);
            resPage.setTotalElements(numHits);
            return Optional.of(resPage);
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }

    public void updateDocument(SearchDocument doc) {
        this.deleteDocument(doc);
        this.addDocument(doc);
    }

    public void deleteDocument(SearchDocument doc) {
        this.deleteDocument(doc.getId());
    }

    public void deleteDocument(Long id) {
        try {
            var term = new Term("id", id + "");
            this.writer.deleteDocuments(term);
            this.writer.commit();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Optional<Document> getDocumentForScoreDoc(final IndexSearcher searcher, final ScoreDoc scoreDoc) {
        try {
            return Optional.of(searcher.doc(scoreDoc.doc));
        } catch (IOException e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }

    private SearchDocument mapDocumentToSearchDocument(final Document doc) {
        return new SearchDocument(
                Long.parseLong(doc.getField("id").stringValue()),
                doc.getField("title").stringValue(),
                doc.getField("name").stringValue(),
                Arrays.stream(doc.getFields("tags"))
                        .map(IndexableField::stringValue)
                        .collect(Collectors.toList()),
                Arrays.stream(doc.getFields("categories"))
                        .map(IndexableField::stringValue)
                        .collect(Collectors.toList())
        );
    }

    private Optional<Document> mapSearchDocumentToDocument(final SearchDocument doc) {
        try {
            var luceneDocument = new Document();

            luceneDocument.add(new TextField("title", doc.getTitle(), Field.Store.YES));
            luceneDocument.add(new TextField("name", doc.getName(), Field.Store.YES));
            luceneDocument.add(new StringField("id", "" + doc.getId(), Field.Store.YES));
            doc.getTags().forEach(t -> luceneDocument.add(new TextField("tags", t, Field.Store.YES)));
            doc.getCategories().forEach(t -> luceneDocument.add(new TextField("categories", t, Field.Store.YES)));

            var objectMapper = new ObjectMapper();
            var content = objectMapper.writeValueAsString(doc);
            luceneDocument.add(new TextField("content", content, Field.Store.YES));

            return Optional.of(luceneDocument);
        } catch (Exception e) {
            e.printStackTrace();
            return Optional.empty();
        }
    }


}
