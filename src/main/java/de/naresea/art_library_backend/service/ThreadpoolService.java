package de.naresea.art_library_backend.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class ThreadpoolService {

    private final ExecutorService exeutor = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors() - 1);

    public ExecutorService getExecutor() {
        return this.exeutor;
    }
}
