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
            this.executor = Executors.newFixedThreadPool(this.config.getNumImportThreads());
        }
        return this.executor;
    }
}
