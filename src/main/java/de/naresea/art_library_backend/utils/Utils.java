package de.naresea.art_library_backend.utils;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public class Utils {

    public static <T> List<T> flatten(Collection<Collection<T>> input) {
        return input.stream().flatMap(Collection::stream).collect(Collectors.toList());
    }

    public static <T> List<T> flatten(T[][] input) {
        return Arrays.stream(input)
                .map(Arrays::asList)
                .flatMap(Collection::stream)
                .collect(Collectors.toList());
    }

    public static <K,V> Map<K, V> toMap(Collection<V> input, Function<V, K> getKey) {
        return input.stream().collect(Collectors.toMap(getKey, (v) -> v));
    }

    public static <K,V> Map<K,V> toMap(Iterable<V> input, Function<V, K> getKey) {
        var list = new ArrayList<V>();
        input.forEach(list::add);
        return toMap(list, getKey);
    }

    public static <V> List<V> toList(Iterable<V> input) {
        var list = new ArrayList<V>();
        input.forEach(list::add);
        return list;
    }

    public static String capitalize(String input) {
        return input.substring(0, 1).toUpperCase() + input.substring(1);
    }
}
