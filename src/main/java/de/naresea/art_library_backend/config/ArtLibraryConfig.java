package de.naresea.art_library_backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;

@ConfigurationProperties(prefix = "art-library")
@Service
@Getter
@Setter
public class ArtLibraryConfig {

    String tmpDirectory;

    String searchDirectory;

    boolean isDatabaseConcurrent;

    int numImportThreads;

    /*
    public static String getTempDirectory() {
        var fromEnv = System.getenv("ART_LIBRARY_TMP_DIRECTORY");
        var fromProperties = System.getProperty("tmpDirectory");
        var fromDefault = "./tmp";
        return fromProperties != null
                ? fromProperties
                : fromEnv != null
                    ? fromEnv
                    : fromDefault;
    }

    public static String getSearchDirectory() {
        var fromEnv = System.getenv("ART_LIBRARY_SEARCH_DIRECTORY");
        var fromProperties = System.getProperty("searchDirectory");
        var fromDefault = "./search";
        return fromProperties != null
                ? fromProperties
                : fromEnv != null
                ? fromEnv
                : fromDefault;
    }
    */
}
