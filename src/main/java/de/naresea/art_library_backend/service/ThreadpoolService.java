package de.naresea.art_library_backend.service;

import de.naresea.art_library_backend.config.ArtLibraryConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RequiredArgsConstructor
@Service
public class ThreadpoolService {

    private final ArtLibraryConfig config;
    private ExecutorService executor;

    public ExecutorService getExecutor() {
        if (this.executor == null) {
            if (this.config.isDatabaseConcurrent()) {
                this.executor = Executors.newFixedThreadPool(this.config.getNumImportThreads());
            } else {
                // SQLite 3 can only be written by a single thread
                // -> STE to process uploads sequentially
                this.executor = Executors.newSingleThreadExecutor();
            }
        }
        return this.executor;
    }
}
