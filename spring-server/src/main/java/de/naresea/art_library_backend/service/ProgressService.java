package de.naresea.art_library_backend.service;

import lombok.Data;
import lombok.Value;

import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

public class ProgressService {

    @Data
    @Value
    public static class ProgressReport {
        int total;
        int success;
        int failed;
        String uuid;
        Date created;
    }

    private static final int MAX_PARALLEL_ELEMS = 12;
    private static final Map<String, ProgressReport> PROGRESS = new ConcurrentHashMap<>();

    public static void reportProgress(int total, int success, int failed, String uuid) {
        if (PROGRESS.size() >= MAX_PARALLEL_ELEMS) {
            cleanupMap();
        }
        var report = new ProgressReport(total, success, failed, uuid, new Date());
        PROGRESS.put(uuid, report);
    }

    public static Optional<ProgressReport> getProgress(String uuid) {
        var report = PROGRESS.get(uuid);
        return report != null ? Optional.of(report) : Optional.empty();
    }

    private static void cleanupMap() {
        PROGRESS.clear();
    }
}
